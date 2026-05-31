import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'

import { createDappleFieldStyle, type DappleFieldOptions } from './field'

export type DappleFieldProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'color'
> &
  DappleFieldOptions

export const DappleField = forwardRef<HTMLDivElement, DappleFieldProps>(
  (
    {
      backgroundColor,
      cells,
      className,
      color,
      jitter,
      rows,
      seed,
      size,
      style,
      ...props
    },
    ref,
  ) => {
    const fieldStyle = createDappleFieldStyle({
      backgroundColor,
      cells,
      color,
      jitter,
      rows,
      seed,
      size,
    })

    return (
      <div
        {...props}
        aria-hidden="true"
        className={className}
        ref={ref}
        style={
          {
            inset: 0,
            pointerEvents: 'none',
            position: 'absolute',
            zIndex: 1,
            ...fieldStyle,
            ...style,
          } satisfies CSSProperties
        }
      />
    )
  },
)

DappleField.displayName = 'DappleField'
