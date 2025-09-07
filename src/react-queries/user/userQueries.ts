import {useMutation, useQuery} from '@tanstack/react-query';
import {errorHandler} from '../../utils/common/toastUtils';
import {
  checkUserExists,
  createNewUser,
  getUserData,
  updateUserRoles,
  addUserRole,
  removeUserRole,
} from '../../services/firestore/userFirestoreService';
import {IUserTable} from '../../config/models/users';
import {useAppSelector} from '../../redux/hooks';

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
export const useCreateUser = () => {
  return useMutation({
    mutationKey: ['userCreationMutation'],
    mutationFn: async (payload: IUserTable) => {
      try {
        const data = await createNewUser(payload);
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

export {useGetUserDetails};
