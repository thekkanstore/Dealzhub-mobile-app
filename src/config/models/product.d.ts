import {ImageSourcePropType} from 'react-native/types_generated/index';
import {IStoreTable} from './store';
import {ICategoryTable} from './category';

export interface IProductTable {
  id: string;
  storeId: string;
  store: IStoreTable;
  userId: string;
  name: string;
  nameLower: string;
  description: string;
  image: string | null;
  actualPrice: string;
  discountPrice: string;
  // stockAccount: number;
  status: 'instock' | 'outofstock';
  categoryId: string;
  category: ICategoryTable;
  isSecondHand: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends IProductTable {
  store: IStoreTable;
  category: ICategoryTable;
}

export interface IProductFormValue
  extends Omit<IProductTable, 'id' | 'createdAt' | 'updatedAt' | 'image' | 'categoryId'> {
  city: any;
  state: string | undefined;
  category: {
    value: ICategoryTable;
    name: string;
  };
  image: ImageSourcePropType;
}

export interface IProductRequestBody
  extends Omit<IProductTable, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IGetProductsParams {
  storeId?: string;
  categoryId?: string;
  limit?: number;
  lastDoc?: any;
  isActive?: boolean;
}

export interface IGetProductsResponse {
  products: IProductTable[];
  lastDoc: any;
  hasMore: boolean;
  total: number;
}

export interface IGetProductsWithDetailsResponse {
  products: IProduct[];
  lastDoc: any;
  hasMore: boolean;
  total: number;
}

export interface IProductCreateResponse {
  success: true;
  data: IProduct;
  productId: string;
  message: string;
}

export interface IProductUpdateResponse extends IProductCreateResponse {}
