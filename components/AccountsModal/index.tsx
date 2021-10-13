import React, { FunctionComponent, useEffect, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useMangoStore, { LAST_ACCOUNT_KEY } from '~/stores/useMangoStore'
import {
  MangoAccount,
  MangoCache,
  MangoGroup,
  // ZERO_I80F48,
} from '@blockworks-foundation/mango-client'
import { abbreviateAddress, formatUsdValue } from '~/utils/formatters'
import useLocalStorageState from '~/hooks/useLocalStorageState'
import Modal from '~/components/Modal'
import { ElementTitle } from '~/components/styles'
import Button, { LinkButton } from '~/components/Button'
import NewAccount from '~/components/NewAccount'

interface AccountsModalProps {
  onClose: () => void
  isOpen: boolean
}

const AccountsModal: FunctionComponent<AccountsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showNewAccountForm, setShowNewAccountForm] = useState(false)
  const [newAccPublicKey, setNewAccPublicKey] = useState(null)
  const mangoAccounts = useMangoStore((s) => s.mangoAccounts)
  const selectedMangoAccount = useMangoStore(
    (s) => s.selectedMangoAccount.current
  )
  const mangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const mangoCache = useMangoStore((s) => s.selectedMangoGroup.cache)
  const setMangoStore = useMangoStore((s) => s.set)
  const actions = useMangoStore((s) => s.actions)
  const [, setLastAccountViewed] = useLocalStorageState(LAST_ACCOUNT_KEY)

  const handleMangoAccountChange = (mangoAccount: MangoAccount) => {
    setLastAccountViewed(mangoAccount.publicKey.toString())
    setMangoStore((state) => {
      state.selectedMangoAccount.current = mangoAccount
    })

    actions.fetchTradeHistory()
    onClose()
  }

  useEffect(() => {
    if (newAccPublicKey) {
      setMangoStore((state) => {
        state.selectedMangoAccount.current = mangoAccounts.find(
          (ma) => ma.publicKey.toString() === newAccPublicKey
        )
      })
    }
  }, [mangoAccounts, newAccPublicKey])

  const handleNewAccountCreation = (newAccPublicKey) => {
    if (newAccPublicKey) {
      setNewAccPublicKey(newAccPublicKey)
    }
    setShowNewAccountForm(false)
  }

  const handleShowNewAccountForm = () => {
    setNewAccPublicKey(null)
    setShowNewAccountForm(true)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {mangoAccounts.length > 0 ? (
        !showNewAccountForm ? (
          <>
            <Modal.Header>
              <ElementTitle noMarignBottom>Mango Accounts</ElementTitle>
            </Modal.Header>
            <div className="flex items-center justify-between pb-3 text-th-fgd-1">
              <div className="font-semibold">
                {mangoAccounts.length > 1
                  ? 'Select an account'
                  : 'Your Account'}
              </div>
              <Button
                className="text-xs flex items-center justify-center pt-0 pb-0 h-8 pl-3 pr-3"
                onClick={() => handleShowNewAccountForm()}
              >
                <div className="flex items-center">
                  <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                  New
                </div>
              </Button>
            </div>
            <RadioGroup
              value={selectedMangoAccount}
              onChange={(acc) => handleMangoAccountChange(acc)}
            >
              <RadioGroup.Label className="sr-only">
                Select a Mango Account
              </RadioGroup.Label>
              <div className="space-y-2">
                {mangoAccounts.map((account) => (
                  <RadioGroup.Option
                    key={account.publicKey.toString()}
                    value={account}
                    className={({ checked }) =>
                      `${
                        checked
                          ? 'bg-th-bkg-3 ring-1 ring-th-green ring-inset'
                          : 'bg-th-bkg-1'
                      }
                      relative rounded-md w-full px-3 py-3 cursor-pointer default-transition flex hover:bg-th-bkg-3 focus:outline-none`
                    }
                  >
                    {({ checked }) => (
                      <>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <RadioGroup.Label className="cursor-pointer flex items-center text-th-fgd-1">
                                <div>
                                  <div className="pb-0.5">
                                    {account?.name ||
                                      abbreviateAddress(account.publicKey)}
                                  </div>
                                  {mangoGroup ? (
                                    <div className="text-th-fgd-3 text-xs">
                                      <AccountInfo
                                        mangoGroup={mangoGroup}
                                        mangoAccount={account}
                                        mangoCache={mangoCache}
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </RadioGroup.Label>
                            </div>
                          </div>
                          {checked && (
                            <div className="flex-shrink-0 text-th-green">
                              <CheckCircleIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </>
        ) : (
          <>
            <NewAccount onAccountCreation={handleNewAccountCreation} />
            <LinkButton
              className="flex justify-center mt-4 text-th-fgd-3 w-full"
              onClick={() => setShowNewAccountForm(false)}
            >
              Cancel
            </LinkButton>
          </>
        )
      ) : (
        <NewAccount onAccountCreation={handleNewAccountCreation} />
      )}
    </Modal>
  )
}

const AccountInfo = ({
  mangoGroup,
  mangoAccount,
  mangoCache,
}: {
  mangoGroup: MangoGroup
  mangoAccount: MangoAccount
  mangoCache: MangoCache
}) => {
  const accountEquity = mangoAccount.computeValue(mangoGroup, mangoCache)

  const leverage = mangoAccount.getLeverage(mangoGroup, mangoCache).toFixed(2)

  return (
    <div className="text-th-fgd-3 text-xs">
      {formatUsdValue(accountEquity)}
      <span className="px-1.5 text-th-fgd-4">|</span>
      <span
        className={
          parseFloat(leverage) > 4
            ? 'text-th-red'
            : parseFloat(leverage) > 2
            ? 'text-th-orange'
            : 'text-th-green'
        }
      >
        {leverage}x
      </span>
    </div>
  )
}

export default React.memo(AccountsModal)
