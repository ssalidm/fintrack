import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthenticatedRequest } from '../../auth/hooks/useAuthenticatedRequest'
import type {
  ArchiveCategoryRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../api/types'
import { categoryQueryKeys } from './useCategories'

interface UpdateCategoryVariables {
  categoryId: string
  request: UpdateCategoryRequest
}

interface ArchiveCategoryVariables {
  categoryId: string
  request: ArchiveCategoryRequest
}

export function useCreateCategory() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCategoryRequest) => {
      const response = await request<Category>('/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      })

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      })
    },
  })
}

export function useUpdateCategory() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         categoryId,
                         request: payload,
                       }: UpdateCategoryVariables) => {
      const response = await request<Category>(
        `/categories/${categoryId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      })
    },
  })
}

export function useArchiveCategory() {
  const request = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
                         categoryId,
                         request: payload,
                       }: ArchiveCategoryVariables) => {
      const response = await request<Category>(
        `/categories/${categoryId}/archive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        },
      )

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      })
    },
  })
}
