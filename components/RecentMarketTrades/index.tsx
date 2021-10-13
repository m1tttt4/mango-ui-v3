import { useCallback, useEffect, useState } from 'react'
import { ChartTradeType } from '~/@types/types'
import useInterval from '~/hooks/useInterval'
import ChartApi from '~/utils/chartDataConnector'
import { ElementTitle } from '~/components/styles'
import { getDecimalCount, isEqual } from '~/utils/formatters'
import useMangoStore from '~/stores/useMangoStore'
import { useViewport } from '~/hooks/useViewport'
import { breakpoints } from '~/components/TradePageGrid'
import { ExpandableRow } from '~/components/TableElements'

export default function RecentMarketTrades() {
  const mangoConfig = useMangoStore((s) => s.selectedMangoGroup.config)
  const marketConfig = useMangoStore((s) => s.selectedMarket.config)
  const market = useMangoStore((s) => s.selectedMarket.current)
  const { width } = useViewport()
  const isMobile = width ? width < breakpoints.sm : false
  const [trades, setTrades] = useState([])

  const fetchTradesForChart = useCallback(async () => {
    if (!marketConfig) return

    const newTrades = await ChartApi.getRecentTrades(
      marketConfig.publicKey.toString()
    )
    if (!newTrades) return null
    if (newTrades.length && trades.length === 0) {
      setTrades(newTrades)
    } else if (
      newTrades?.length &&
      !isEqual(newTrades[0], trades[0], Object.keys(newTrades[0]))
    ) {
      setTrades(newTrades)
    }
  }, [marketConfig, trades])

  useEffect(() => {
    fetchTradesForChart()
  }, [fetchTradesForChart])

  useInterval(async () => {
    fetchTradesForChart()
  }, 5000)

  return !isMobile ? (
    <>
      <ElementTitle>Recent Trades</ElementTitle>
      <div className={`grid grid-cols-3 text-th-fgd-4 mb-2 text-xs`}>
        <div>Price ({mangoConfig.quoteSymbol}) </div>
        <div className={`text-right`}>Size ({marketConfig.baseSymbol})</div>
        <div className={`text-right`}>Time</div>
      </div>
      {!!trades.length && (
        <div>
          {trades.map((trade: ChartTradeType, i: number) => (
            <div key={i} className={`leading-7 grid grid-cols-3`}>
              <div
                className={`${
                  trade.side === 'buy' ? `text-th-green` : `text-th-red`
                }`}
              >
                {market?.tickSize && !isNaN(trade.price)
                  ? Number(trade.price).toFixed(
                      getDecimalCount(market.tickSize)
                    )
                  : ''}
              </div>
              <div className={`text-right`}>
                {market?.minOrderSize && !isNaN(trade.size)
                  ? Number(trade.size).toFixed(
                      getDecimalCount(market.minOrderSize)
                    )
                  : ''}
              </div>
              <div className={`text-right text-th-fgd-4`}>
                {trade.time && new Date(trade.time).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  ) : (
    <ExpandableRow
      buttonTemplate={
        <div className="col-span-11 text-left">
          <div className="mb-0.5 text-fgd-1">Recent Trades</div>
        </div>
      }
      index={0}
      panelTemplate={
        !!trades.length && (
          <div className="col-span-2">
            {trades.map((trade: ChartTradeType, i: number) => (
              <div key={i} className={`leading-5 grid grid-cols-3 text-xs`}>
                <div
                  className={`${
                    trade.side === 'buy' ? `text-th-green` : `text-th-red`
                  }`}
                >
                  {market?.tickSize && !isNaN(trade.price)
                    ? Number(trade.price).toFixed(
                        getDecimalCount(market.tickSize)
                      )
                    : ''}
                </div>
                <div className={`text-right`}>
                  {market?.minOrderSize && !isNaN(trade.size)
                    ? Number(trade.size).toFixed(
                        getDecimalCount(market.minOrderSize)
                      )
                    : ''}
                </div>
                <div className={`text-right text-th-fgd-4`}>
                  {trade.time && new Date(trade.time).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )
      }
      rounded
    />
  )
}