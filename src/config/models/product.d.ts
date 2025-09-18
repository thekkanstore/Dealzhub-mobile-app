import {ImageSourcePropType} from 'react-native/types_generated/index';

export interface IProductTable {
  id: number;
  storeId: number;
  userId: string;
  name: string;
  description: string;
  image: string | null;
  actualPrice: string;
  discountPrice: string;
  // stockAccount: number;
  status: 'instock' | 'outofstock';
  categoryId: string;
  isSecondHand: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductFormValue
  extends Omit<IProductTable, 'id' | 'createdAt' | 'updatedAt' | 'image' | 'categoryId'> {
  city: any;
  state: string | undefined;
  category: {
    value: string;
    name: string;
  };
  image: ImageSourcePropType;
}

export interface IProductRequestBody
  extends Omit<IProductTable, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IGetProductsParams {
  storeId: string;
  categoryId?: string;
  limit?: number;
  lastDoc?: any;
}

export interface IGetProductsResponse {
  products: IProductTable[];
  lastDoc: any;
  hasMore: boolean;
  total: number;
}
