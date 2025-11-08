import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import messaging from '@react-native-firebase/messaging';
import {errorHandler, showErrorToast, showSuccessToast} from '../../utils/common/toastUtils';
import {
  checkUserExists,
  createNewUser,
  getUserData,
  updateUserRoles,
  addUserRole,
  removeUserRole,
  addToFavorite,
  removeFromFavorite,
  removeFromCart,
  addToCart,
  updateNotificationStatus,
} from '../../services/firestore/userFirestoreService';
import {IUserTable} from '../../config/models/users';
import {useAppSelector} from '../../redux/hooks';
import {CartItemsLimit, FavoritesLimit} from '../../config/common/constants';
import {getProductById} from '../../services/firestore/productFirestoreService';

const useGetUserDetails = (enabled = false) => {
  const user = useAppSelector(state => state.user.user);

  return useQuery({
    queryKey: ['getUserDetails', user?.user.id],
    queryFn: async () => {
      try {
        const data = await getUserData(user?.user.id ?? '');
        return data as IUserTable;
      } catch (error) {
        errorHandler(error as Error);
        return Promise.reject(error);
      }
    },
    retry: 2,
    enabled: enabled,
  });
};

export const useGetUserExistence = () => {
  return useMutation({
    mutationKey: ['userExistenceMutation'],
    mutationFn: async (id: string) => {
      try {
        const data = await checkUserExists(id);
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
export const useCreateUser = (isUpdate = false) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['userCreationMutation'],
    mutationFn: async (payload: IUserTable) => {
      try {
        const data = await createNewUser(payload, isUpdate);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onError: error => {
      errorHandler(error);
    },
    onSuccess: data => {
      showSuccessToast(data.message ?? '');
      queryClient.invalidateQueries({queryKey: ['getUserDetails']});
    },
  });
};
export const useUpdateUserRoles = () => {
  const user = useAppSelector(state => state.user.user);
  return useMutation({
    mutationKey: ['updateUserRoles'],
    mutationFn: async (roles: Array<string>) => {
      try {
        const data = await updateUserRoles(user?.user.id ?? '', roles);
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

export const useAddUserRole = () => {
  return useMutation({
    mutationKey: ['addUserRole'],
    mutationFn: async ({userId, newRole}: {userId: string; newRole: string}) => {
      try {
        const data = await addUserRole(userId, newRole);
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

export const useRemoveUserRole = () => {
  return useMutation({
    mutationKey: ['removeUserRole'],
    mutationFn: async ({userId, roleToRemove}: {userId: string; roleToRemove: string}) => {
      try {
        const data = await removeUserRole(userId, roleToRemove);
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

export const useUpdateFavoritesList = () => {
  const user = useAppSelector(state => state.user.user);
  const userDetails = useGetUserDetails();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateCartItemsList'],
    mutationFn: async ({id, updateStatus}: {id: string; updateStatus: 'add' | 'remove'}) => {
      try {
        if (updateStatus === 'remove') {
          const data = await removeFromFavorite(user?.user.id ?? '', id);
          return data;
        }
        if ((userDetails.data?.favorites?.length || 0) >= FavoritesLimit) {
          return Promise.reject({
            success: false,
            message: 'Maximum number of favorites reached',
          });
        }
        const data = await addToFavorite(user?.user.id ?? '', id);
        showSuccessToast('Favorite updated successfully');
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onError: error => {
      errorHandler(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getUserDetails']});
    },
  });
};

export const useGetFavoritesProductList = () => {
  const userDetails = useGetUserDetails();
  return useQuery({
    queryKey: ['getUserFavoritesProducts', userDetails.data?.favorites?.length],
    queryFn: async () => {
      try {
        if (!userDetails.data?.favorites?.length) {
          return [];
        }
        const promises = userDetails.data.favorites.map(id => getProductById(id));
        const data = await Promise.all(promises);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    refetchOnMount: true,
  });
};

export const useUpdateCartItemsList = () => {
  const user = useAppSelector(state => state.user.user);
  const userDetails = useGetUserDetails();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateCartItemsList'],
    mutationFn: async ({id, updateStatus}: {id: string; updateStatus: 'add' | 'remove'}) => {
      try {
        if (updateStatus === 'remove') {
          const data = await removeFromCart(user?.user.id ?? '', id);
          showSuccessToast('Item Removed from the Cart');
          return data;
        }
        if ((userDetails.data?.cartItems?.length || 0) >= CartItemsLimit) {
          showErrorToast('You can not add more than 20 favorites');
          return;
        }
        const data = await addToCart(user?.user.id ?? '', id);
        showSuccessToast('Favorite Added successfully');
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onError: error => {
      errorHandler(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getUserDetails']});
    },
  });
};

export const useGetCartItemsProductList = () => {
  const userDetails = useGetUserDetails();
  return useQuery({
    queryKey: ['getCartItemsList', userDetails.data?.cartItems?.length],
    queryFn: async () => {
      try {
        if (!userDetails.data?.cartItems?.length) {
          return [];
        }
        const promises = userDetails.data.cartItems.map(id => getProductById(id));
        const data = await Promise.all(promises);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    refetchOnMount: true,
  });
};

export const useMoveCartToWishlist = () => {
  const user = useAppSelector(state => state.user.user);
  const userDetails = useGetUserDetails();
  const queryClient = useQueryClient();
  const {mutateAsync: updateFavoriteStatus} = useUpdateFavoritesList();
  return useMutation({
    mutationKey: ['moveCartToWishlist'],
    mutationFn: async ({id}: {id: string}) => {
      try {
        const isFavorite = userDetails.data?.favorites?.some(item => item === id);
        if (!isFavorite) {
          await updateFavoriteStatus({id: id, updateStatus: 'add'});
        }
        const data = await removeFromCart(user?.user.id ?? '', id);
        showSuccessToast('Item Removed from the Cart');
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onError: error => {
      errorHandler(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getUserDetails']});
    },
  });
};
export {useGetUserDetails};

export const useUpdateNotificationStatus = () => {
  const user = useAppSelector(state => state.user.user);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateUserRoles'],
    mutationFn: async (enableNotification: boolean) => {
      try {
        const token = enableNotification ? await messaging().getToken() : null;
        const data = await updateNotificationStatus(user?.user.id ?? '', token);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['getUserDetails']});
    },
    onError: error => {
      errorHandler(error);
    },
  });
};
