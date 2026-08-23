export interface IStoreTable {
  id: string;
  userId: string;
  isActive: boolean;
  storeName: string;
  email: string;
  phoneNumber: number | string;
  address: string;
  categories?: string[];
  city: string;
  state: string;
  vendorStatus: TVendorStatus;
  createdAt?: FieldValue;
  updatedAt?: FieldValue;
}
export type TVendorStatus = 'pending' | 'approved' | 'rejected' | 'inactive' | 'private';
export interface IStoreRequestBody
  extends Omit<IStoreTable, 'id' | 'userId' | 'created_at' | 'updated_at'> {}
