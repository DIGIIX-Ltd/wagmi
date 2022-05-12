import {
  FetchEnsResolverArgs,
  FetchEnsResolverResult,
  fetchEnsResolver,
} from '@wagmi/core'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useChainId, useDeferResult, useQuery } from '../utils'
import { noopQueryResult } from '../utils/useQuery'

export type UseEnsResolverArgs = Partial<FetchEnsResolverArgs>

export type UseEnsResolverConfig = QueryConfig<FetchEnsResolverResult, Error>

export const queryKey = ({
  chainId,
  name,
}: {
  chainId?: number
  name?: string
}) => [{ entity: 'ensResolver', chainId, name }] as const

const queryFn = ({
  queryKey: [{ chainId, name }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!name) throw new Error('name is required')
  return fetchEnsResolver({ chainId, name })
}

export function useEnsResolver({
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
}: UseEnsResolverArgs & UseEnsResolverConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })

  const ensResolverQueryResult = useQuery(
    queryKey({ chainId, name }),
    queryFn,
    {
      cacheTime,
      enabled: Boolean(enabled && chainId && name),
      initialData,
      staleTime,
      suspense,
      onError,
      onSettled,
      onSuccess,
    },
  )

  return useDeferResult(ensResolverQueryResult, noopQueryResult, {
    enabled: !initialData,
  })
}
