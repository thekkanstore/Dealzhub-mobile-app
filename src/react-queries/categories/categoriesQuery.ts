import {useQuery} from '@tanstack/react-query';
import {getAllCategories} from '../../services/firestore/categoryFirestoreService';

export const useGetCategoriesList = () => {
  return useQuery({
    queryKey: ['getAllCategories'],
    queryFn: async () => {
      try {
        const data = await getAllCategories();
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  });
};
