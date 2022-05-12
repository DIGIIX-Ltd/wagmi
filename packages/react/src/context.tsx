import * as React from 'react'
import { providers } from 'ethers'
import {
  WagmiClient,
  ClientConfig as WagmiClientConfig,
  createClient as createWagmiClient,
} from '@wagmi/core'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Persister, persistQueryClient } from 'react-query/persistQueryClient'
import { createWebStoragePersister } from 'react-query/createWebStoragePersister'

import { deserialize, serialize } from './utils'

export const MountedContext = React.createContext(false)

export type DecoratedWagmiClient<
  TProvider extends providers.BaseProvider = providers.BaseProvider,
  TWebSocketProvider extends providers.WebSocketProvider = providers.WebSocketProvider,
> = WagmiClient<TProvider, TWebSocketProvider> & { queryClient: QueryClient }
export const Context = React.createContext<
  | DecoratedWagmiClient<providers.BaseProvider, providers.WebSocketProvider>
  | undefined
>(undefined)

export type ClientConfig<
  TProvider extends providers.BaseProvider = providers.BaseProvider,
  TWebSocketProvider extends providers.WebSocketProvider = providers.WebSocketProvider,
> = WagmiClientConfig<TProvider, TWebSocketProvider> & {
  queryClient?: QueryClient
  persister?: Persister
}
export function createClient<
  TProvider extends providers.BaseProvider,
  TWebSocketProvider extends providers.WebSocketProvider,
>({
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1_000 * 60 * 60 * 24, // 24 hours
        networkMode: 'offlineFirst',
        refetchOnWindowFocus: false,
        retry: 0,
      },
      mutations: {
        networkMode: 'offlineFirst',
      },
    },
  }),
  persister = typeof window !== 'undefined'
    ? createWebStoragePersister({
        key: 'wagmi.cache',
        storage: window.localStorage,
        serialize,
        deserialize,
      })
    : undefined,
  ...config
}: ClientConfig<TProvider, TWebSocketProvider> = {}) {
  const client = createWagmiClient<TProvider, TWebSocketProvider>(config)
  if (persister)
    persistQueryClient({
      queryClient,
      persister,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => query.cacheTime !== 0,
      },
    })
  return Object.assign(client, { queryClient })
}

export type ProviderProps<
  TProvider extends providers.BaseProvider = providers.BaseProvider,
  TWebSocketProvider extends providers.WebSocketProvider = providers.WebSocketProvider,
> = {
  /** React-decorated WagmiClient instance */
  client?: DecoratedWagmiClient<TProvider, TWebSocketProvider>
  /** Defers returning result from hooks until the client has mounted */
  deferResult?: boolean
}
export function Provider<
  TProvider extends providers.BaseProvider,
  TWebSocketProvider extends providers.WebSocketProvider,
>({
  children,
  client = createClient<TProvider, TWebSocketProvider>(),
  deferResult,
}: React.PropsWithChildren<ProviderProps<TProvider, TWebSocketProvider>>) {
  const [mounted, setMounted] = React.useState(!deferResult)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => (!mounted ? setMounted(true) : undefined), [])

  // Attempt to connect on mount
  React.useEffect(() => {
    ;(async () => {
      if (!client.config.autoConnect) return
      await client.autoConnect()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MountedContext.Provider value={mounted}>
      <Context.Provider value={client as unknown as DecoratedWagmiClient}>
        <QueryClientProvider client={client.queryClient}>
          {children}
        </QueryClientProvider>
      </Context.Provider>
    </MountedContext.Provider>
  )
}

export function useClient<
  TProvider extends providers.BaseProvider,
  TWebSocketProvider extends providers.WebSocketProvider = providers.WebSocketProvider,
>() {
  const client = React.useContext(Context) as unknown as DecoratedWagmiClient<
    TProvider,
    TWebSocketProvider
  >
  if (!client) throw Error('Must be used within WagmiProvider')
  return client
}
