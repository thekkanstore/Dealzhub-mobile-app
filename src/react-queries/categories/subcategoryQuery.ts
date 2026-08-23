import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {errorHandler} from '../../utils/common/toastUtils';
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../../services/firestore/subCategoryFirestoreService';

// Fetch store sub-categories under a category
export const useGetSubCategories = (storeId: string, categoryId: string) => {
  return useQuery({
    queryKey: ['getSubCategories', storeId, categoryId],
    queryFn: () => getSubCategories(storeId, categoryId),
    enabled: !!storeId && !!categoryId,
  });
};

// Create sub-category mutation
export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createSubCategory'],
    mutationFn: async (payload: {name: string; storeId: string; categoryId: string}) => {
      return await createSubCategory(payload.name, payload.storeId, payload.categoryId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['getSubCategories', variables.storeId, variables.categoryId],
      });
    },
    onError: error => {
      errorHandler(error);
    },
  });
};

// Update sub-category mutation
export const useUpdateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateSubCategory'],
    mutationFn: async (payload: {id: string; name: string; storeId: string; categoryId: string}) => {
      await updateSubCategory(payload.id, payload.name);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['getSubCategories', variables.storeId, variables.categoryId],
      });
    },
    onError: error => {
      errorHandler(error);
    },
  });
};

// Soft delete sub-category mutation
export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteSubCategory'],
    mutationFn: async (payload: {id: string; storeId: string; categoryId: string}) => {
      await deleteSubCategory(payload.id);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['getSubCategories', variables.storeId, variables.categoryId],
      });
    },
    onError: error => {
      errorHandler(error);
    },
  });
};
