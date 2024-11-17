import { useDraggable } from '@dnd-kit/core'

import type { BaseAttendeeTileProps } from '../../../../../components/AttendeeTile'
import { AttendeeTile } from '../../../../../components/AttendeeTile'
import { AttendeeId } from '../../../../../models/pocketBase/tables/Attendee'

export const DraggableAttendeeTile: React.FC<BaseAttendeeTileProps> = props => {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: AttendeeId.unwrap(props.attendee.id),
    data: props.attendee,
  })

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
