import { useEffect, useState } from 'react'
import useMangoStore from '~/stores/useMangoStore'
import { useOpenOrders } from '~/hooks/useOpenOrders'
// import usePerpPositions from '~/hooks/usePerpPositions'
import OpenOrdersTable from '~/components/OpenOrdersTable'
import BalancesTable from '~/components/BalancesTable'
import PositionsTable from '~/components/PerpPositionsTable'
import TradeHistoryTable from '~/components/TradeHistoryTable'
// import FeeDiscountsTable from '~/components/FeeDiscountsTable'
import ManualRefresh from '~/components/ManualRefresh'
import Tabs from '~/components/Tabs'

const TABS = [
  'Balances',
  'Orders',
  'Positions',
  // 'Fees',
  'Trade History',
]

const UserInfoTabs = ({ activeTab, setActiveTab }) => {
  const openOrders = useOpenOrders()
  // const perpPositions = usePerpPositions()
  const connected = useMangoStore((s) => s.connection.current)
  const mangoAccount = useMangoStore((s) => s.selectedMangoAccount.current)
  const handleTabChange = (tabName) => {
    setActiveTab(tabName)
  }

  return (
    <div className="relative">
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        showCount={
          openOrders && openOrders.length > 0
            ? [{ tabName: 'Orders', count: openOrders.length }]
            : null
        }
        tabs={TABS}
      />
      {connected && mangoAccount ? (
        <div className="absolute right-0 top-0">
          <ManualRefresh />
        </div>
      ) : null}
    </div>
  )
}

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'Orders':
      return <OpenOrdersTable />
    case 'Balances':
      return <BalancesTable />
    case 'Trade History':
      return <TradeHistoryTable numTrades={100} />
    case 'Positions':
      return <PositionsTable />
    // case 'Fees':
    //   return <FeeDiscountsTable /> // now displayed in trade form. may add back when MRSRM deposits are supported
    default:
      return <BalancesTable />
  }
}

const UserInfo = () => {
  const marketConfig = useMangoStore((s) => s.selectedMarket.config)
  const isPerpMarket = marketConfig.kind === 'perp'
  const connected = useMangoStore((s) => s.wallet.connected)
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => {
    isPerpMarket ? setActiveTab(TABS[2]) : setActiveTab(TABS[0])
  }, [isPerpMarket])

  return (
    <div className={!connected ? 'filter blur-sm' : null}>
      <UserInfoTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent activeTab={activeTab} />
    </div>
  )
}

export default UserInfo
