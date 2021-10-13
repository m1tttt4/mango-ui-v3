import { TemplateIcon } from '@heroicons/react/outline'
import { defaultLayouts, GRID_LAYOUT_KEY } from '~/components/TradePageGrid'
import useLocalStorageState from '~/hooks/useLocalStorageState'
import Tooltip from '~/components/Tooltip'
import { IconButton } from '~/components/Button'

const ResetLayout = ({ className = '' }) => {
  const [, setSavedLayouts] = useLocalStorageState(
    GRID_LAYOUT_KEY,
    defaultLayouts
  )

  const handleResetLayout = () => {
    setSavedLayouts(defaultLayouts)
  }

  return (
    <div className={`inline-flex relative ${className}`}>
      <Tooltip content="Reset Layout" className="text-xs py-1">
        <IconButton onClick={handleResetLayout}>
          <TemplateIcon className="w-4 h-4" />
        </IconButton>
      </Tooltip>
    </div>
  )
}

export default ResetLayout
