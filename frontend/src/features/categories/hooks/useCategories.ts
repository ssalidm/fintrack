import { useQuery } from '@tanstack/react-query'
import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import type {
  Category,
  CategoryStatus,
  CategoryType,
} from '../api/types'

export const categoryQueryKeys = {
  all: ['categories'] as const,
  list: (
    type?: CategoryType,
    status: CategoryStatus = 'ACTIVE',
  ) => ['categories', 'list', type ?? 'ALL', status] as const,
}

export function useCategories(
  type?: CategoryType,
  status: CategoryStatus = 'ACTIVE',
) {
  const request = useAuthenticatedRequest()

  return useQuery({
    queryKey: categoryQueryKeys.list(type, status),
    queryFn: async ({ signal }) => {
      const parameters = new URLSearchParams({
        status,
      })

      if (type) {
        parameters.set('type', type)
      }

      const response = await request<Category[]>(
        `/categories?${parameters.toString()}`,
        { signal },
      )

      return response.data
    },
  })
}
