import {useMutation, useInfiniteQuery} from '@tanstack/react-query';
import {errorHandler} from '../../utils/common/toastUtils';
import {IProductRequestBody} from '../../config/models/product';
import {
  createNewProduct,
  getProductsByStore,
} from '../../services/firestore/productFirestoreService';
import {useAddCategoriesToStore} from '../store/storeQueries';

export const useAddNewProduct = () => {
  const {mutateAsync} = useAddCategoriesToStore();
  return useMutation({
    mutationKey: ['createNewProduct'],
    mutationFn: async (payload: IProductRequestBody) => {
      try {
        const data = await createNewProduct({...payload});
        await mutateAsync([payload.categoryId]);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
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
