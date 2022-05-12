import {
  FetchEnsAddressArgs,
  FetchEnsAddressResult,
  fetchEnsAddress,
} from '@wagmi/core'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useChainId, useDeferResult, useQuery } from '../utils'
import { noopQueryResult } from '../utils/useQuery'

export type UseEnsAddressArgs = Partial<FetchEnsAddressArgs>

export type UseEnsAddressConfig = QueryConfig<FetchEnsAddressResult, Error>

export const queryKey = ({
  chainId,
  name,
}: {
  chainId?: number
  name?: string
}) => [{ entity: 'ensAddress', chainId, name }] as const

const queryFn = ({
  queryKey: [{ chainId, name }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!name) throw new Error('name is required')
  return fetchEnsAddress({ chainId, name })
}

export function useEnsAddress({
  cacheTime,
  chainId: chainId_,
  enabled = true,
  initialData,
  name,
  staleTime = 1_000 * 60 * 60 * 24, // 24 hours
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseEnsAddressArgs & UseEnsAddressConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })

  const ensAddressQueryResult = useQuery(queryKey({ chainId, name }), queryFn, {
    cacheTime,
    enabled: Boolean(enabled && chainId && name),
    initialData,
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess,
  })

  return useDeferResult(ensAddressQueryResult, noopQueryResult, {
    enabled: !initialData,
  })
}
