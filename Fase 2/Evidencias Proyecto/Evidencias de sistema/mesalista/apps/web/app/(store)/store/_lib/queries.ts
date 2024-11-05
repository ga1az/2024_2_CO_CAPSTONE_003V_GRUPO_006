import { useQuery } from '@tanstack/react-query'
import { getStoreData } from './actions'

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreData(slug)
  })
}
