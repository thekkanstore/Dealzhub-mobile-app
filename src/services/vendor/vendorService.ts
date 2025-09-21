import {IStoreTable} from '../../config/models/store';

export class VendorService {
  static getStoreAddressInfo(storeDetails: IStoreTable) {
    return `${storeDetails.storeName}, ${storeDetails.address}, ${storeDetails.city}, ${storeDetails.state}\n${storeDetails.email}, ${storeDetails.phoneNumber}`;
  }
}
