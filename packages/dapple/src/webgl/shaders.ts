export const passThroughVertexShader = `
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const SOURCE_TONE_SHADER = `
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 viewportSize;
  uniform float zoom;
  uniform float contrast;
  uniform float imageFit;
  uniform float highlightRolloff;
  uniform float shadowBoost;

  vec2 imageUvFromViewport(in vec2 viewportUv) {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;
    vec2 uv = viewportUv;

    if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;

      if (imageFit > 0.5) {
        uv.x = (uv.x - 0.5) * scale + 0.5;
      } else {
        uv.y = (uv.y - 0.5) / scale + 0.5;
      }
    } else {
      float scale = imageAspect / viewAspect;

      if (imageFit > 0.5) {
        uv.y = (uv.y - 0.5) * scale + 0.5;
      } else {
        uv.x = (uv.x - 0.5) / scale + 0.5;
      }
    }

    return (uv - 0.5) / zoom + 0.5;
  }

  float luminance(in vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  float shapedTone(in vec3 color) {
    float toneValue = luminance(color);

    toneValue = clamp((toneValue - 0.5) * contrast + 0.5, 0.0, 1.0);
    toneValue += clamp(shadowBoost, 0.0, 1.0)
      * toneValue
      * (1.0 - toneValue)
      * (1.0 - smoothstep(0.32, 0.82, toneValue));
    toneValue = mix(
      toneValue,
      pow(toneValue, 1.0 + clamp(highlightRolloff, 0.0, 1.0) * 1.35),
      clamp(highlightRolloff, 0.0, 1.0)
    );

    return clamp(toneValue, 0.0, 1.0);
  }

  vec2 readSourceTone(in vec2 viewportUv) {
    vec2 imageUv = imageUvFromViewport(viewportUv);
    float inBounds = step(0.0, imageUv.x) * step(imageUv.x, 1.0)
                   * step(0.0, imageUv.y) * step(imageUv.y, 1.0);
    vec4 color = texture2D(tImage, clamp(imageUv, 0.0, 1.0));
    float toneValue = shapedTone(color.rgb);

    return vec2(toneValue, color.a * inBounds);
  }

`

const DOT_MASK_SHADER = `
  uniform vec2 effectResolution;
  uniform float tile;
  uniform float power;
  uniform float dotScale;
  uniform float dotGamma;
  uniform float dotMinRadius;
  uniform float dotSampleMode;
  uniform float dotSoftness;
  uniform float lineSoftness;
  uniform float lineStrength;
  uniform float lineWidth;
  uniform float applyToDarkAreas;
  uniform vec3 dotColor;

  vec2 readTone(in vec2 viewportUv) {
    vec2 toneSample = readSourceTone(viewportUv);

    if (applyToDarkAreas > 0.5) {
      toneSample.x = 1.0 - toneSample.x;
    }

    return toneSample;
  }

  float dotMask(in vec2 p, in float radius, in float softness) {
    float signedDistance = length(p - vec2(0.5)) - radius;

    return 1.0 - smoothstep(0.0, softness, signedDistance);
  }

  float lineDistance(in vec2 p, in float radius, in float thickness) {
    vec2 segmentStart = vec2(0.5 - radius, 0.5);
    vec2 segmentEnd = vec2(0.5 + radius, 0.5);
    vec2 pa = p - segmentStart;
    vec2 ba = segmentEnd - segmentStart;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);

    return length(pa - ba * h) - thickness * radius;
  }

  float dappleAlpha(in vec2 viewportUv) {
    vec2 fragCoord = viewportUv * viewportSize;
    float dappleSize = max(tile, 1.0);
    vec2 cellIndex = floor(fragCoord / dappleSize);
    vec2 sampleUv = clamp(
      (cellIndex + 0.5) * dappleSize / viewportSize,
      vec2(0.0),
      vec2(1.0)
    );
    vec2 cellUv = fract(fragCoord / dappleSize);
    vec2 toneSample = readTone(sampleUv);

    if (dotSampleMode > 0.5) {
      vec2 sampleStep = vec2(dappleSize * 0.35) / viewportSize;
      vec2 leftSample = readTone(sampleUv + vec2(-sampleStep.x, 0.0));
      vec2 rightSample = readTone(sampleUv + vec2(sampleStep.x, 0.0));
      vec2 topSample = readTone(sampleUv + vec2(0.0, sampleStep.y));
      vec2 bottomSample = readTone(sampleUv + vec2(0.0, -sampleStep.y));
      float averageTone = (
        toneSample.x +
        leftSample.x +
        rightSample.x +
        topSample.x +
        bottomSample.x
      ) * 0.2;
      float detailTone = max(
        toneSample.x,
        max(
          max(leftSample.x, rightSample.x),
          max(topSample.x, bottomSample.x)
        )
      );

      toneSample.x = mix(averageTone, detailTone, 0.28);
      toneSample.y = max(
        toneSample.y,
        max(
          max(leftSample.y, rightSample.y),
          max(topSample.y, bottomSample.y)
        )
      );
    }

    if (toneSample.y < 0.01) {
      return 0.0;
    }

    float toneValue = pow(clamp(toneSample.x, 0.0, 1.0), clamp(dotGamma, 0.1, 3.0));
    float radius = clamp(
      toneValue + clamp(power, -1.5, 1.5) * 0.2357022604,
      0.0,
      1.0
    );
    float dotRadius = radius * clamp(dotScale, 0.05, 1.6) * 0.45;
    dotRadius = dotRadius > 0.0001
      ? max(dotRadius, clamp(dotMinRadius, 0.0, 0.45))
      : 0.0;

    return radius > 0.0001
      ? dotMask(cellUv, dotRadius, clamp(dotSoftness, 0.001, 0.12))
        * toneSample.y
      : 0.0;
  }

  float scanlineAlpha(in vec2 viewportUv) {
    vec2 fragCoord = viewportUv * viewportSize;
    float dappleSize = max(tile, 1.0);
    vec2 cellIndex = floor(fragCoord / dappleSize);
    vec2 sampleUv = clamp(
      (cellIndex + 0.5) * dappleSize / viewportSize,
      vec2(0.0),
      vec2(1.0)
    );
    vec2 cellUv = fract(fragCoord / dappleSize);
    vec2 toneSample = readTone(sampleUv);

    if (toneSample.y < 0.01) {
      return 0.0;
    }

    float toneValue = pow(clamp(toneSample.x, 0.0, 1.0), clamp(dotGamma, 0.1, 3.0));
    float radius = clamp(
      toneValue + clamp(power, -1.5, 1.5) * 0.2357022604,
      0.0,
      1.0
    ) * 0.93;

    if (radius <= 0.0001) {
      return 0.0;
    }

    float signedDistance = lineDistance(cellUv, radius, clamp(lineWidth, 0.05, 1.4));
    float alpha = 1.0 - smoothstep(0.0, clamp(lineSoftness, 0.001, 0.12), signedDistance);

    return alpha * clamp(lineStrength, 0.0, 2.0) * toneSample.y;
  }
`

export const dotsFragmentShader = `
  ${SOURCE_TONE_SHADER}
  ${DOT_MASK_SHADER}

  void main() {
    vec2 viewportUv = gl_FragCoord.xy / max(effectResolution, vec2(1.0));
    float alpha = dappleAlpha(viewportUv);

    gl_FragColor = vec4(dotColor, alpha);
  }
`

export const hybridFragmentShader = `
  ${SOURCE_TONE_SHADER}
  ${DOT_MASK_SHADER}

  void main() {
    vec2 viewportUv = gl_FragCoord.xy / max(effectResolution, vec2(1.0));
    float alpha = clamp(
      max(dappleAlpha(viewportUv) * 0.84, scanlineAlpha(viewportUv) * 1.05),
      0.0,
      1.0
    );

    gl_FragColor = vec4(dotColor, alpha);
  }
`

export const linesFragmentShader = `
  ${SOURCE_TONE_SHADER}
  ${DOT_MASK_SHADER}

  void main() {
    vec2 viewportUv = gl_FragCoord.xy / max(effectResolution, vec2(1.0));
    float alpha = scanlineAlpha(viewportUv);

    gl_FragColor = vec4(dotColor, alpha);
  }
`

export const presentationFragmentShader = `
  precision highp float;

  uniform vec3 presentationBackgroundColor;
  uniform vec2 presentationSize;
  uniform sampler2D tScene;

  void main() {
    vec2 uv = gl_FragCoord.xy / max(presentationSize, vec2(1.0));
    vec4 color = texture2D(tScene, uv);

    gl_FragColor = vec4(mix(presentationBackgroundColor, color.rgb, color.a), 1.0);
  }
`
