import {IProduct} from '../../config/models/product';
import {IStoreTable} from '../../config/models/store';

export const productDetailsInitalValues = (
  storeDetails?: IStoreTable | null,
  productDetails?: IProduct | null,
) => {
  return {
    name: productDetails?.name ?? '',
    description: productDetails?.description ?? '',
    actualPrice: productDetails?.actualPrice ?? '',
    discountPrice: productDetails?.discountPrice ?? '',
    category: null,
    image: productDetails?.image
      ? {
          name: `${productDetails?.name}.jpg`,
          apiUri: productDetails?.image,
        }
      : null,
    status: productDetails?.status ?? 'instock',
    isSecondHand: productDetails?.isSecondHand ?? false,
    isActive: productDetails?.isActive ?? true,
    isSoldOut: productDetails?.isSoldOut ?? false,
    isOutOfStock: productDetails?.isOutOfStock ?? false,
    storeId: productDetails?.store?.id ?? storeDetails?.id,
    store: productDetails?.store ?? storeDetails,
    userId: productDetails?.store?.userId ?? storeDetails?.userId,
  };
};
