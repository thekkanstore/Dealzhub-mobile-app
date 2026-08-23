import {IProduct} from '../../config/models/product';
import {IStoreTable} from '../../config/models/store';
import {toSnakeCase} from '../common/stringsUtils';

export const productDetailsInitalValues = (
  storeDetails?: IStoreTable | null,
  productDetails?: IProduct | null,
) => {
  const oldImage = productDetails?.image
    ? [
        {
          name: `${productDetails?.name}.jpg`,
          apiUri: productDetails?.image,
        },
      ]
    : [];
  const newImages =
    productDetails?.images?.map(image => ({
      name: `${productDetails?.name}.jpg`,
      apiUri: image,
    })) ?? [];
  const images = newImages?.length ? newImages : oldImage;

  const imagePath = productDetails
    ? (productDetails?.imagePath ??
      `${toSnakeCase(productDetails?.store?.storeName ?? productDetails?.storeId ?? '')}/${toSnakeCase(productDetails?.name ?? '')}`)
    : '';
  return {
    name: productDetails?.name ?? '',
    description: productDetails?.description ?? '',
    actualPrice: productDetails?.actualPrice ?? '',
    discountPrice: productDetails?.discountPrice ?? '',
    category: null,
    images,
    status: productDetails?.status ?? 'instock',
    isSecondHand: productDetails?.isSecondHand ?? false,
    isActive: productDetails?.isActive ?? true,
    isSoldOut: productDetails?.isSoldOut ?? false,
    isOutOfStock: productDetails?.isOutOfStock ?? false,
    storeId: productDetails?.store?.id ?? storeDetails?.id,
    store: productDetails?.store ?? storeDetails,
    userId: productDetails?.store?.userId ?? storeDetails?.userId,
    imagePath,
    subcategoryIds: productDetails?.subcategoryIds ?? [],
  };
};
