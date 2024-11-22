import { forwardRef, useCallback, useRef } from 'react'

import { useMergeRefs } from '../hooks/useMergeRefs'

type Props = {
  children?: React.ReactElement | ReadonlyArray<React.ReactElement>
}

export const Dialog = forwardRef<HTMLDialogElement, Props>(({ children }, ref) => {
  const dialog = useRef<HTMLDialogElement>(null)
  const content = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    const isOutside =
      content.current !== null && e.target instanceof Node && !content.current.contains(e.target)

    if (isOutside) {
      dialog.current?.close()
    }
  }, [])

  return (
    <dialog
      ref={useMergeRefs(ref, dialog)}
      onClick={handleClick}
      className="bg-transparent backdrop:bg-black/70"
    >
      <div ref={content} className="contents">
        {children}
      </div>
    </dialog>
  )
})
