import { useDraggable } from '@dnd-kit/core'
import type { Merge } from 'type-fest'

import type { BaseAttendeeTileProps } from '../../../../../components/AttendeeTile'
import { AttendeeTile } from '../../../../../components/AttendeeTile'
import { AttendeeId } from '../../../../../models/pocketBase/tables/Attendee'

type Props = Merge<
  BaseAttendeeTileProps,
  {
    disabled: boolean
  }
>

export const DraggableAttendeeTile: React.FC<Props> = ({ disabled, ...props }) => {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: AttendeeId.unwrap(props.attendee.id),
    data: props.attendee,
  })

  if (disabled) return <AttendeeTile {...props} />

  return (
    <AttendeeTile
      ref={setNodeRef}
      {...props}
      props={{
        style: {
          visibility: isDragging ? 'hidden' : undefined,
        },
        ...listeners,
        ...attributes,
      }}
    />
  )
}
