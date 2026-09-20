import {DistrictList} from '../../config/common/constants';
import {IStoreTable} from '../../config/models/store';

export const storeDetailsInitialValues = (storeDetails?: IStoreTable) => {
  const city = DistrictList.find(item => item.value === storeDetails?.city);

  return {
    storeName: storeDetails?.storeName ?? '',
    email: storeDetails?.email ?? '',
    phoneNumber: storeDetails?.phoneNumber ?? '',
    address: storeDetails?.address ?? '',
    city: city ?? '',
    state: 'Kerala',
    isActive: storeDetails?.isActive ?? true,
    vendorStatus: storeDetails?.vendorStatus ?? 'pending',
    bio: storeDetails?.bio ?? '',
  };
};
