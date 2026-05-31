import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type ReactElement,
} from 'react'

import {
  createDappleRenderer,
  type DappleErrorHandler,
  type DappleLoadHandler,
  type DappleLoadStartHandler,
  type DapplePlaceholder,
  type DappleRenderHandler,
  type DappleRenderer,
  type DappleResizeHandler,
  type DappleResourcesReadyHandler,
  type DappleSettings,
  type DappleSource,
} from './index'

export type DappleCanvasHandle = {
  renderer: DappleRenderer | null
}

export type DappleCanvasProps = {
  className?: string
  onError?: DappleErrorHandler
  onLoad?: DappleLoadHandler
  onLoadStart?: DappleLoadStartHandler
  onReady?: () => void
  onRender?: DappleRenderHandler
  onResize?: DappleResizeHandler
  onResourcesReady?: DappleResourcesReadyHandler
  placeholder?: DapplePlaceholder | false
  settings?: Partial<DappleSettings>
  source?: DappleSource
  style?: CSSProperties
}

type DappleCanvasCallbacks = Pick<
  DappleCanvasProps,
  | 'onError'
  | 'onLoad'
  | 'onLoadStart'
  | 'onReady'
  | 'onRender'
  | 'onResize'
  | 'onResourcesReady'
>

export const DappleCanvas = forwardRef<DappleCanvasHandle, DappleCanvasProps>(
  (
    {
      className,
      onError,
      onLoad,
      onLoadStart,
      onReady,
      onRender,
      onResize,
      onResourcesReady,
      placeholder,
      settings,
      source,
      style,
    },
    ref,
  ): ReactElement => {
    const mountRef = useRef<HTMLDivElement>(null)
    const rendererRef = useRef<DappleRenderer | null>(null)
    const callbacksRef = useRef<DappleCanvasCallbacks>({})

    callbacksRef.current = {
      onError,
      onLoad,
      onLoadStart,
      onReady,
      onRender,
      onResize,
      onResourcesReady,
    }

    useImperativeHandle(
      ref,
      () => ({
        get renderer() {
          return rendererRef.current
        },
      }),
      [],
    )

    useEffect(() => {
      const mount = mountRef.current

      if (!mount) {
        return
      }

      const renderer = createDappleRenderer(mount, {
        onError: (error, event) => callbacksRef.current.onError?.(error, event),
        onLoad: event => {
          callbacksRef.current.onLoad?.(event)
          callbacksRef.current.onReady?.()
        },
        onLoadStart: event => callbacksRef.current.onLoadStart?.(event),
        onRender: event => callbacksRef.current.onRender?.(event),
        onResize: event => callbacksRef.current.onResize?.(event),
        onResourcesReady: event => callbacksRef.current.onResourcesReady?.(event),
        placeholder,
        settings,
      })

      rendererRef.current = renderer

      return () => {
        renderer.dispose()
        rendererRef.current = null
      }
    }, [])

    useEffect(() => {
      rendererRef.current?.update(settings ?? {})
    }, [settings])

    useEffect(() => {
      rendererRef.current?.renderPlaceholder(placeholder)
    }, [placeholder])

    useEffect(() => {
      const renderer = rendererRef.current

      if (!renderer) {
        return
      }

      if (!source) {
        renderer.clear()
        renderer.renderPlaceholder(placeholder)
        return
      }

      void renderer.load(source)
    }, [placeholder, source])

    return (
      <div
        className={className}
        ref={mountRef}
        style={{
          height: '100%',
          minHeight: 0,
          width: '100%',
          ...style,
        }}
      />
    )
  },
)

DappleCanvas.displayName = 'DappleCanvas'
