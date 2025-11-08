import {useQuery} from '@tanstack/react-query';
import {getAppConfig} from '../../services/firestore/adminFirestoreService';
import {updateAppConfig} from '../../redux/sessionStatesSlice';

export const useGetAppConfig = () => {
  return useQuery({
    queryKey: ['getAppConfig'],
    queryFn: async () => {
      try {
        const data = await getAppConfig();
        updateAppConfig(data);
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  });
};
