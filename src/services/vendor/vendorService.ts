import {IStoreTable} from '../../config/models/store';
import {colors} from '../../config/styles/colors';

export class VendorService {
  static getStoreAddressInfo(storeDetails: IStoreTable) {
    if (!storeDetails) return '';
    return `${storeDetails.storeName}, ${storeDetails.address}, ${storeDetails.city}, ${storeDetails.state}\n${storeDetails.email}, ${storeDetails.phoneNumber}`;
  }

  static getStoreStatusColors(storeDetails: IStoreTable) {
    if (!storeDetails) return '';
    switch (storeDetails.vendorStatus) {
      case 'pending':
        return colors.pendingText;
      case 'approved':
        return colors.successText;
      case 'rejected':
        return colors.errorTextColor;
      case 'private':
        return colors.primaryButtonBackgroundColor;
      case 'inactive':
        return colors.errorTextColor;
      default:
        return '';
    }
  }
}
