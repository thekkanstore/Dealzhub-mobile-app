import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAppSelector} from '../../redux/hooks';
import {IStoreRequestBody} from '../../config/models/store';
import {
  createNewUserStore,
  getStoreBasedOnUserIdData,
  updateUserStore,
  addCategoriesToStore,
  getStoreById,
} from '../../services/firestore/storeFirestoreService';
import {errorHandler} from '../../utils/common/toastUtils';

export const useCreateNewUserStore = () => {
  const user = useAppSelector(state => state.user.user);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createNewUserStore'],
    mutationFn: async (payload: IStoreRequestBody) => {
      try {
        const data = await createNewUserStore({...payload, userId: user?.user.id ?? ''});
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getStoreDetails']});
    },
    onError: error => {
      errorHandler(error);
    },
  });
};
export const useUpdateUserStore = () => {
  const user = useAppSelector(state => state.user.user);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateUserStore'],
    mutationFn: async (payload: IStoreRequestBody) => {
      try {
        const data = await updateUserStore(user?.user.id ?? '', payload);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getStoreDetails']});
    },
    onError: error => {
      errorHandler(error);
    },
  });
};

export const useGetStoreDetails = (storeId = '') => {
  const user = useAppSelector(state => state.user.user);
  return useQuery({
    queryKey: ['getStoreDetails', storeId],
    queryFn: async () => {
      try {
        const data = storeId
          ? await getStoreById(storeId)
          : await getStoreBasedOnUserIdData(user?.user.id ?? '');
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  });
};

export const useAddCategoriesToStore = () => {
  const user = useAppSelector(state => state.user.user);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addCategoriesToStore'],
    mutationFn: async (categories: string[]) => {
      try {
        const data = await addCategoriesToStore(user?.user.id ?? '', categories);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getStoreDetails']});
    },
    onError: error => {
      errorHandler(error);
    },
  });
};
