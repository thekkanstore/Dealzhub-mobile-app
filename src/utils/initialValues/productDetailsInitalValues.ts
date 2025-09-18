import {IStoreTable} from '../../config/models/store';

export const productDetailsInitalValues = (storeDetails?: IStoreTable | null) => {
  return {
    name: '',
    description: '',
    actualPrice: '',
    discountPrice: '',
    category: null,
    image: null,
    status: 'instock',
    isSecondHand: false,
    isActive: true,
    storeId: storeDetails?.id,
    userId: storeDetails?.userId,
  };
};
