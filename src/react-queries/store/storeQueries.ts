import {useMutation} from '@tanstack/react-query';
import {useAppSelector} from '../../redux/hooks';
import {IStoreRequestBody} from '../../config/models/store';
import {createNewUserStore} from '../../services/firestore/storeFirestoreService';
import {errorHandler} from '../../utils/common/toastUtils';

export const useCreateNewUserStore = () => {
  const user = useAppSelector(state => state.user.user);
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
    onError: error => {
      errorHandler(error);
    },
  });
};
