import {useMutation, useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';
import {errorHandler} from '../../utils/common/toastUtils';
import {
  IProductCreateResponse,
  IProductRequestBody,
  IProductUpdateResponse,
} from '../../config/models/product';
import {
  createNewProduct,
  getProductsByStore,
  getProductById,
  updateProductDetails,
  updateProductStatus,
} from '../../services/firestore/productFirestoreService';
import {useAddCategoriesToStore} from '../store/storeQueries';
import {getStoreById} from '../../services/firestore/storeFirestoreService';
import {getCategoryById} from '../../services/firestore/categoryFirestoreService';

export const useAddNewProduct = () => {
  const {mutateAsync} = useAddCategoriesToStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createNewProduct'],
    mutationFn: async (payload: IProductRequestBody) => {
      try {
        const data = await createNewProduct({...payload});
        await mutateAsync([payload.categoryId]);
        return data as IProductCreateResponse;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: ['getProductsByStore']});
      queryClient.invalidateQueries({queryKey: ['getProductById', data.productId]});
    },
    onError: error => {
      errorHandler(error);
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateProduct'],
    mutationFn: async (payload: {id: string; isActive: boolean}) => {
      try {
        const data = await updateProductStatus(payload?.id, payload.isActive);
        return data as IProductUpdateResponse;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: ['getProductsByStore']});
      queryClient.invalidateQueries({queryKey: ['getProductById', data.productId]});
    },
    onError: error => {
      errorHandler(error);
    },
  });
};
export const useUpdateProduct = () => {
  const {mutateAsync} = useAddCategoriesToStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateProduct'],
    mutationFn: async (payload: IProductRequestBody & {id: string}) => {
      try {
        const data = await updateProductDetails(payload?.id, {...payload});
        await mutateAsync([payload.categoryId]);
        return data as IProductUpdateResponse;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: ['getProductsByStore']});
      queryClient.invalidateQueries({queryKey: ['getProductById', data.productId]});
    },
    onError: error => {
      errorHandler(error);
    },
  });
};

interface IGetProductsParams {
  storeId: string;
  categoryId?: string;
  limit?: number;
}

export const useGetProductsByStore = ({storeId, categoryId, limit = 10}: IGetProductsParams) => {
  const query = useInfiniteQuery({
    queryKey: ['getProductsByStore', storeId, categoryId],
    queryFn: async ({pageParam}) => {
      try {
        const data = await getProductsByStore({
          storeId,
          categoryId,
          limit,
          lastDoc: pageParam,
        });
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },
    initialPageParam: undefined,
  });

  // Handle errors separately
  if (query.error) {
    errorHandler(query.error);
  }

  return query;
};

export const useGetProductById = (productId: string) => {
  return useQuery({
    queryKey: ['getProductById', productId],
    queryFn: async () => {
      try {
        const data = await getProductById(productId);
        if (data) {
          const [storeData, categoriesData] = await Promise.all([
            getStoreById(data.storeId),
            getCategoryById(data.categoryId),
          ]);
          if (storeData) {
            data.store = storeData;
          }
          if (categoriesData) {
            data.category = categoriesData;
          }
        }
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    enabled: !!productId,
  });
};

// export const useUpdateUserStore = () => {
//   const user = useAppSelector(state => state.user.user);
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationKey: ['updateUserStore'],
//     mutationFn: async (payload: IStoreRequestBody) => {
//       try {
//         const data = await updateUserStore(user?.user.id ?? '', payload);
//         return data;
//       } catch (error) {
//         return Promise.reject(error);
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({queryKey: ['getStoreDetails']});
//     },
//     onError: error => {
//       errorHandler(error);
//     },
//   });
// };

// export const useGetStoreDetails = () => {
//   const user = useAppSelector(state => state.user.user);
//   return useQuery({
//     queryKey: ['getStoreDetails'],
//     queryFn: async () => {
//       try {
//         const data = await getStoreData(user?.user.id ?? '');
//         return data;
//       } catch (error) {
//         return Promise.reject(error);
//       }
//     },
//   });
// };
