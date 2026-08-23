import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface ISubCategory {
  id: string;
  name: string;
  nameLower: string;
  categoryId: string;
  storeId: string;
  isActive: boolean;
  createdAt?: FirebaseFirestoreTypes.FieldValue | Date;
  updatedAt?: FirebaseFirestoreTypes.FieldValue | Date;
}
