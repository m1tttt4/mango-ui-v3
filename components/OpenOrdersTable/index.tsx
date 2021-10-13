import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useOpenOrders } from '~/hooks/useOpenOrders'
import Button from '~/components/Button'
import Loading from '~/components/Loading'
import useMangoStore from '~/stores/useMangoStore'
import { notify } from '~/utils/notifications'
import SideBadge from '~/components/SideBadge'
import { Order, Market } from '@project-serum/serum/lib/market'
import { PerpOrder, PerpMarket } from '@blockworks-foundation/mango-client'
import { formatUsdValue } from '~/utils/formatters'
import { Table, Td, Th, TrBody, TrHead } from '~/components/TableElements'
import { useViewport } from '~/hooks/useViewport'
import { breakpoints } from '~/components/TradePageGrid'
import { Row } from '~/components/TableElements'
import { PerpTriggerOrder } from '~/@types/types'

const DesktopTable = ({ openOrders, cancelledOrderId, handleCancelOrder }) => {
  return (
    <Table>
      <thead>
        <TrHead>
          <Th>Market</Th>
          <Th>Side</Th>
          <Th>Size</Th>
          <Th>Price</Th>
          <Th>Value</Th>
          <Th>Condition</Th>
          <Th>
            <span className={`sr-only`}>Edit</span>
          </Th>
        </TrHead>
      </thead>
      <tbody>
        {openOrders.map(({ order, market }, index) => {
          return (
            <TrBody index={index} key={`${order.orderId}${order.side}`}>
              <Td>
                <div className="flex items-center">
                  <img
                    alt=""
                    width="20"
                    height="20"
                    src={`/assets/icons/${market.config.baseSymbol.toLowerCase()}.svg`}
                    className={`mr-2.5`}
                  />
                  <div>{market.config.name}</div>
                </div>
              </Td>
              <Td>
                <SideBadge side={order.side} />
              </Td>
              <Td>{order.size}</Td>
              <Td>{formatUsdValue(order.price)}</Td>
              <Td>{formatUsdValue(order.price * order.size)}</Td>
              <Td>
                {order.perpTrigger &&
                  `${order.orderType} ${
                    order.triggerCondition
                  } ${order.triggerPrice.toString()}`}
              </Td>
              <Td>
                <div className={`flex justify-end`}>
                  <Button
                    onClick={() => handleCancelOrder(order, market.account)}
                    className="ml-3 text-xs pt-0 pb-0 h-8 pl-3 pr-3"
                  >
                    {cancelledOrderId + '' === order.orderId + '' ? (
                      <Loading />
                    ) : (
                      <span>Cancel</span>
                    )}
                  </Button>
                </div>
              </Td>
            </TrBody>
          )
        })}
      </tbody>
    </Table>
  )
}

const MobileTable = ({ openOrders, cancelledOrderId, handleCancelOrder }) => {
  return (
    <>
      {openOrders.map(({ market, order }, index) => (
        <Row key={`${order.orderId}${order.side}`} index={index}>
          <div className="col-span-12 flex items-center justify-between text-fgd-1 text-left">
            <div className="flex items-center">
              <img
                alt=""
                width="20"
                height="20"
                src={`/assets/icons/${market.config.baseSymbol.toLowerCase()}.svg`}
                className={`mr-2.5`}
              />
              <div>
                <div className="mb-0.5">{market.config.name}</div>
                <div className="text-th-fgd-3 text-xs">
                  <span
                    className={`mr-1
                                ${
                                  order.side === 'buy'
                                    ? 'text-th-green'
                                    : 'text-th-red'
                                }
                              `}
                  >
                    {order.side.toUpperCase()}
                  </span>
                  {order.perpTrigger
                    ? `${order.size} ${order.triggerCondition} ${order.triggerPrice}`
                    : `${order.size} at ${formatUsdValue(order.price)}`}
                </div>
              </div>
            </div>
            <Button
              onClick={() => handleCancelOrder(order, market.account)}
              className="ml-3 text-xs pt-0 pb-0 h-8 pl-3 pr-3"
            >
              {cancelledOrderId + '' === order.orderId + '' ? (
                <Loading />
              ) : (
                <span>Cancel</span>
              )}
            </Button>
          </div>
        </Row>
      ))}
    </>
  )
}

const OpenOrdersTable = () => {
  const { asPath } = useRouter()
  const openOrders = useOpenOrders()
  const [cancelId, setCancelId] = useState(null)
  const actions = useMangoStore((s) => s.actions)
  const { width } = useViewport()
  const isMobile = width ? width < breakpoints.md : false

  const handleCancelOrder = async (
    order: Order | PerpOrder | PerpTriggerOrder,
    market: Market | PerpMarket
  ) => {
    const wallet = useMangoStore.getState().wallet.current
    const selectedMangoGroup =
      useMangoStore.getState().selectedMangoGroup.current
    const selectedMangoAccount =
      useMangoStore.getState().selectedMangoAccount.current
    const mangoClient = useMangoStore.getState().connection.client
    setCancelId(order.orderId)
    let txid
    try {
      if (!selectedMangoGroup || !selectedMangoAccount) return
      if (market instanceof Market) {
        txid = await mangoClient.cancelSpotOrder(
          selectedMangoGroup,
          selectedMangoAccount,
          wallet,
          market,
          order as Order
        )
      } else if (market instanceof PerpMarket) {
        // TODO: this is not ideal
        if (order['triggerCondition']) {
          txid = await mangoClient.removeAdvancedOrder(
            selectedMangoGroup,
            selectedMangoAccount,
            wallet,
            (order as PerpTriggerOrder).orderId
          )
        } else {
          txid = await mangoClient.cancelPerpOrder(
            selectedMangoGroup,
            selectedMangoAccount,
            wallet,
            market,
            order as PerpOrder,
            false
          )
        }
      }
      notify({ title: 'Successfully cancelled order', txid })
    } catch (e) {
      notify({
        title: 'Error cancelling order',
        description: e.message,
        txid: e.txid,
        type: 'error',
      })
      console.log('error', `${e}`)
    } finally {
      // await sleep(600)
      actions.reloadMangoAccount()
      setCancelId(null)
    }
  }

  const tableProps = {
    openOrders,
    cancelledOrderId: cancelId,
    handleCancelOrder,
  }

  return (
    <div className={`flex flex-col py-2 sm:pb-4 sm:pt-4`}>
      <div className={`-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8`}>
        <div className={`align-middle inline-block min-w-full sm:px-6 lg:px-8`}>
          {openOrders && openOrders.length > 0 ? (
            !isMobile ? (
              <DesktopTable {...tableProps} />
            ) : (
              <MobileTable {...tableProps} />
            )
          ) : (
            <div
              className={`w-full text-center py-6 bg-th-bkg-1 text-th-fgd-3 rounded-md`}
            >
              No open orders
              {asPath === '/account' ? (
                <Link href={'/'}>
                  <a
                    className={`inline-flex ml-2 py-0
        `}
                  >
                    Make a trade
                  </a>
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OpenOrdersTable