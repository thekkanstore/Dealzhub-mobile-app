export interface IStoreTable {
  id: string;
  userId: string;
  isActive: boolean;
  storeName: string;
  email: string;
  phoneNumber: number | string;
  address: string;
  categories?: string[];
  city: any;
  state: string;
  vendorStatus: TVendorStatus;
  paymentStatus?: string;
  paymentOrderId?: string;
  subscriptionPlan?: string;
  subscriptionAmount?: number;
  subscriptionStartDate?: any;
  subscriptionEndDate?: any;
  logoUrl?: string;
  logo?: string;
  slug?: string;
  storeUrl?: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
}
export type TVendorStatus = 'pending' | 'approved' | 'rejected' | 'inactive' | 'private';
export interface IStoreRequestBody
  extends Omit<IStoreTable, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  id?: string;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
}
