import { cx } from '../../utils/cx'
import './emptyMatch.css'

type Props = {
  isFirst: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

export const EmptyMatch: React.FC<Props> = ({ isFirst, onClick }) => (
  <li className={cx('empty-match pb-0.5 first:pb-0', ['first-empty-match', isFirst])}>
    <button type="button" onClick={onClick} className=" grid w-full grid-cols-2 gap-0.5 text-start">
      <span className={spanClassName}>-</span>
      <span className={cx(spanClassName, 'text-end')}>-</span>
    </button>
  </li>
)

const spanClassName = 'bg-grey1 px-2 py-1 text-white/50 transition-all duration-300'
