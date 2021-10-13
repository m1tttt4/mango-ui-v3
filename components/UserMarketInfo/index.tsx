import { PerpMarket } from '@blockworks-foundation/mango-client'
import useMangoStore from '~/stores/useMangoStore'
import MarketBalances from '~/components/MarketBalances'
import MarketPosition from '~/components/MarketPosition'

const UserMarketInfo = () => {
  const selectedMarket = useMangoStore((s) => s.selectedMarket.current)
  return selectedMarket instanceof PerpMarket ? (
    <MarketPosition />
  ) : (
    <MarketBalances />
  )
}

export default UserMarketInfo
