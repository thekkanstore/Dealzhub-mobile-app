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
  created_at?: Date;
  updated_at?: Date;
}

export interface IStoreRequestBody
  extends Omit<IStoreTable, 'id' | 'userId' | 'created_at' | 'updated_at'> {}
