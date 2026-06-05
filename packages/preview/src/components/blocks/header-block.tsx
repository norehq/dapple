import { HugeiconsIcon } from '@hugeicons/react'
import { FilterResetIcon, ReloadIcon } from '@hugeicons/core-free-icons'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'

type HeaderBlockProps = {
  isLoading: boolean
  onReload: () => void
  onReset: () => void
}

export const HeaderBlock = ({
  isLoading,
  onReload,
  onReset,
}: HeaderBlockProps): ReactElement => (
  <div className="flex min-h-18 flex-col items-start justify-between gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
    <div className="min-w-0">
      <a
        className="mb-1 inline-flex text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        href="https://github.com/unix/dapple"
        rel="noreferrer"
        target="_blank">
        @unix/dapple
      </a>
      <h1 className="text-balance text-lg/tight font-medium tracking-normal sm:text-xl/tight">
        Transform images into crisp, expressive dot-and-scanline artwork.
      </h1>
    </div>
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center">
      <Button
        className="w-full sm:w-auto"
        onClick={onReset}
        type="button"
        variant="outline">
        <HugeiconsIcon icon={FilterResetIcon} />
        Reset
      </Button>
      <Button
        className="w-full sm:w-auto"
        onClick={onReload}
        type="button"
        variant="secondary">
        <HugeiconsIcon icon={ReloadIcon} />
        {isLoading ? 'Loading' : 'Reload'}
      </Button>
    </div>
  </div>
)
