import * as React from 'react'

import { MountedContext } from '../../context'

export function useDeferResult<TValue, TFallbackValue>(
  value: TValue,
  fallbackValue: TFallbackValue,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const mounted = React.useContext(MountedContext)
  if (enabled && !mounted) return fallbackValue as unknown as TValue
  return value
}
