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
  updateCartItemQuantity,
  clearStoreCart,
  updateUserStoreCarts,
  updateNotificationStatus,
} from '../../services/firestore/userFirestoreService';
import {IUserTable} from '../../config/models/users';
import {useAppSelector} from '../../redux/hooks';
import {CartItemsLimit, FavoritesLimit} from '../../config/common/constants';
import {getProductById} from '../../services/firestore/productFirestoreService';
import {
  getLocalStoreCarts,
  saveLocalStoreCarts,
  addLocalCartItem,
  updateLocalCartQuantity,
  clearLocalStoreCart,
  removeLocalCartItem,
  mergeLocalCartsWithCloud,
} from '../../utils/cart/cartCacheUtils';

const useGetUserDetails = (enabled = true) => {
  const user = useAppSelector(state => state.user.user);
  const userId = user?.user?.id;

  return useQuery({
    queryKey: ['getUserDetails', userId || 'guest'],
    queryFn: async () => {
      try {
        if (!userId) {
          // Guest mode: load cart items from local cache (AsyncStorage)
          const localCarts = await getLocalStoreCarts();
          const allItems = Object.values(localCarts).flat();
          const cartItemIds = Array.from(
            new Set(allItems.map((i: any) => i.productId || i.id).filter(Boolean)),
          );
          const guestData: IUserTable = {
            id: 'guest',
            name: 'Guest',
            email: '',
            phoneNumber: '',
            address: '',
            city: '',
            state: '',
            role: ['user'],
            favorites: [],
            cartItems: cartItemIds as string[],
            storeCarts: localCarts as any,
          };
          return guestData;
        }

        // Logged-in mode: fetch user document from Firestore
        let data = await getUserData(userId);
        if (!data) {
          return null;
        }

        // Merge any existing local cache store carts with cloud carts upon login/fetch
        try {
          const localCarts = await getLocalStoreCarts();
          if (localCarts && Object.keys(localCarts).length > 0) {
            const {mergedCarts, hasChanges} = mergeLocalCartsWithCloud(
              (data as any).storeCarts || {},
              localCarts,
            );
            if (hasChanges) {
              await updateUserStoreCarts(userId, mergedCarts);
              const flatIds = Object.values(mergedCarts).flatMap((items: any) =>
                Array.isArray(items) ? items.map((i: any) => i.productId || i.id).filter(Boolean) : [],
              );
              data = {
                ...data,
                storeCarts: mergedCarts,
                cartItems: Array.from(new Set(flatIds)) as string[],
              };
            } else {
              await saveLocalStoreCarts((data as any).storeCarts || {});
            }
          } else if ((data as any).storeCarts) {
            await saveLocalStoreCarts((data as any).storeCarts);
          }
        } catch (mergeErr) {
          console.warn('Error merging local cart with cloud in useGetUserDetails:', mergeErr);
        }

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

export interface UpdateCartParams {
  id: string;
  updateStatus: 'add' | 'remove';
  quantity?: number;
  selectedSize?: string | null;
  selectedWeight?: string | null;
  unitPrice?: number;
  productData?: any;
}

export const useUpdateCartItemsList = () => {
  const user = useAppSelector(state => state.user.user);
  const userId = user?.user?.id;
  const userDetails = useGetUserDetails();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateCartItemsList'],
    mutationFn: async ({
      id,
      updateStatus,
      quantity,
      selectedSize,
      selectedWeight,
      unitPrice,
      productData,
    }: UpdateCartParams) => {
      try {
        if (updateStatus === 'remove') {
          if (userId) {
            const data = await removeFromCart(userId, id);
            showSuccessToast('Item Removed from the Cart');
            return data;
          } else {
            const updatedCarts = await removeLocalCartItem(id);
            showSuccessToast('Item Removed from the Cart');
            return {success: true, storeCarts: updatedCarts};
          }
        }

        if ((userDetails.data?.cartItems?.length || 0) >= CartItemsLimit) {
          showErrorToast('You cannot add more than 20 items to cart');
          return;
        }

        if (userId) {
          const data = await addToCart(userId, id, {
            quantity,
            selectedSize,
            selectedWeight,
            unitPrice,
            productData,
          });
          showSuccessToast('Cart updated successfully');
          return data;
        } else {
          const updatedCarts = await addLocalCartItem(id, {
            quantity,
            selectedSize,
            selectedWeight,
            unitPrice,
            productData,
          });
          showSuccessToast('Cart updated successfully');
          return {success: true, storeCarts: updatedCarts};
        }
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

export const useUpdateCartQuantity = () => {
  const user = useAppSelector(state => state.user.user);
  const userId = user?.user?.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateCartQuantity'],
    mutationFn: async ({
      storeId,
      itemMatch,
      newQuantity,
    }: {
      storeId: string;
      itemMatch: {id: string; selectedSize?: string | null; selectedWeight?: string | null};
      newQuantity: number;
    }) => {
      if (userId) {
        const data = await updateCartItemQuantity(
          userId,
          storeId,
          itemMatch,
          newQuantity,
        );
        return data;
      } else {
        const updatedCarts = await updateLocalCartQuantity(
          storeId,
          itemMatch,
          newQuantity,
        );
        return {success: true, storeCarts: updatedCarts};
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

export const useClearStoreCart = () => {
  const user = useAppSelector(state => state.user.user);
  const userId = user?.user?.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['clearStoreCart'],
    mutationFn: async ({storeId}: {storeId: string}) => {
      if (userId) {
        const data = await clearStoreCart(userId, storeId);
        showSuccessToast('Store cart cleared');
        return data;
      } else {
        const updatedCarts = await clearLocalStoreCart(storeId);
        showSuccessToast('Store cart cleared');
        return {success: true, storeCarts: updatedCarts};
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
        if (!user?.user?.id) {
          showErrorToast('Please login to move items to wishlist');
          return;
        }
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
