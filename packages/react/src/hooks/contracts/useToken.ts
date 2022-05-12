import { FetchTokenArgs, FetchTokenResult, fetchToken } from '@wagmi/core'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useChainId, useDeferResult, useQuery } from '../utils'
import { noopQueryResult } from '../utils/useQuery'

export type UseTokenArgs = Partial<FetchTokenArgs>

export type UseTokenConfig = QueryConfig<FetchTokenResult, Error>

export const queryKey = ({
  address,
  chainId,
  formatUnits,
}: Partial<FetchTokenArgs> & {
  chainId?: number
}) => [{ entity: 'token', address, chainId, formatUnits }] as const

const queryFn = ({
  queryKey: [{ address, chainId, formatUnits }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!address) throw new Error('address is required')
  return fetchToken({ address, chainId, formatUnits })
}

export function useToken({
  address,
  chainId: chainId_,
  formatUnits = 'ether',
  cacheTime,
  enabled = true,
  initialData,
  staleTime = 1_000 * 60 * 60 * 24, // 24 hours
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseTokenArgs & UseTokenConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })

  const tokenQueryResult = useQuery(
    queryKey({ address, chainId, formatUnits }),
    queryFn,
    {
      cacheTime,
      enabled: Boolean(enabled && address),
      initialData,
      staleTime,
      suspense,
      onError,
      onSettled,
      onSuccess,
    },
  )

  return useDeferResult(tokenQueryResult, noopQueryResult, {
    enabled: !initialData,
  })
}
