import { FetchEnsNameArgs, FetchEnsNameResult, fetchEnsName } from '@wagmi/core'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useChainId, useDeferResult, useQuery } from '../utils'
import { noopQueryResult } from '../utils/useQuery'

export type UseEnsNameArgs = Partial<FetchEnsNameArgs>

export type UseEnsNameConfig = QueryConfig<FetchEnsNameResult, Error>

export const queryKey = ({
  address,
  chainId,
}: {
  address?: string
  chainId?: number
}) => [{ entity: 'ensName', address, chainId }] as const

const queryFn = ({
  queryKey: [{ address }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!address) throw new Error('address is required')
  return fetchEnsName({ address })
}

export function useEnsName({
  address,
  cacheTime,
  chainId: chainId_,
  enabled = true,
  initialData,
  staleTime = 1_000 * 60 * 60 * 24, // 24 hours
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseEnsNameArgs & UseEnsNameConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })

  const ensNameQueryResult = useQuery(queryKey({ address, chainId }), queryFn, {
    cacheTime,
    enabled: Boolean(enabled && address && chainId),
    initialData,
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess,
  })

  return useDeferResult(ensNameQueryResult, noopQueryResult, {
    enabled: !initialData,
  })
}
