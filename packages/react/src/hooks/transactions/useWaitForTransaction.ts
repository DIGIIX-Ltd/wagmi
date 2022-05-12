import {
  WaitForTransactionArgs,
  WaitForTransactionResult,
  waitForTransaction,
} from '@wagmi/core'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useChainId, useDeferResult, useQuery } from '../utils'
import { noopQueryResult } from '../utils/useQuery'

export type UseWaitForTransactionArgs = Partial<WaitForTransactionArgs>

export type UseWaitForTransactionConfig = QueryConfig<
  WaitForTransactionResult,
  Error
>

export const queryKey = ({
  confirmations,
  chainId,
  hash,
  timeout,
  wait,
}: Partial<WaitForTransactionArgs>) =>
  [
    {
      entity: 'waitForTransaction',
      confirmations,
      chainId,
      hash,
      timeout,
      wait,
    },
  ] as const

const queryFn = ({
  queryKey: [{ chainId, confirmations, hash, timeout, wait }],
}: QueryFunctionArgs<typeof queryKey>) => {
  return waitForTransaction({ chainId, confirmations, hash, timeout, wait })
}

export function useWaitForTransaction({
  chainId: chainId_,
  confirmations,
  hash,
  timeout,
  wait,
  cacheTime,
  enabled = true,
  initialData,
  staleTime,
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseWaitForTransactionArgs & UseWaitForTransactionConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })

  const waitForTransactionQueryResult = useQuery(
    queryKey({ chainId, confirmations, hash, timeout, wait }),
    queryFn,
    {
      cacheTime,
      enabled: Boolean(enabled && (hash || wait)),
      initialData,
      staleTime,
      suspense,
      onError,
      onSettled,
      onSuccess,
    },
  )

  return useDeferResult(waitForTransactionQueryResult, noopQueryResult, {
    enabled: !initialData,
  })
}
