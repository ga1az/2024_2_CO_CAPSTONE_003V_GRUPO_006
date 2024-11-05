import { useQuery } from '@tanstack/react-query'
import { getTableData } from './actions'
import { getStoreData } from '@/app/(store)/store/_lib/actions'

export function useTable(storeId: string, identifier: string) {
  return useQuery({
    queryKey: ['table', storeId, identifier],
    queryFn: () => getTableData(storeId, identifier)
  })
}

export function useStore(storeId: string) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => getStoreData(storeId)
  })
}
