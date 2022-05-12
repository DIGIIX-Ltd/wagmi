import * as React from 'react'
import { GetAccountResult, getAccount, watchAccount } from '@wagmi/core'
import { useQueryClient } from 'react-query'

import { QueryConfig } from '../../types'
import { useDeferResult, useQuery } from '../utils'
import { noopQueryResult } from '../utils/useQuery'

export type UseAccountConfig = Pick<
  QueryConfig<GetAccountResult, Error>,
  'initialData' | 'suspense' | 'onError' | 'onSettled' | 'onSuccess'
>

export const queryKey = () => [{ entity: 'account' }] as const

const queryFn = () => {
  const result = getAccount()
  if (result.address) return result
  return null
}

export function useAccount({
  initialData,
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseAccountConfig = {}) {
  const queryClient = useQueryClient()

  const accountQueryResult = useQuery(queryKey(), queryFn, {
    initialData,
    staleTime: 0,
    suspense,
    onError,
    onSettled,
    onSuccess,
  })

  React.useEffect(() => {
    const unwatch = watchAccount((data) => {
      queryClient.setQueryData(queryKey(), data?.address ? data : null)
    })
    return unwatch
  }, [queryClient])

  return useDeferResult(accountQueryResult, noopQueryResult, {
    enabled: !initialData,
  })
}
