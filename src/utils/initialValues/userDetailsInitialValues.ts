import {DistrictList} from '../../config/common/constants';
import {IUserTable} from '../../config/models/users';

export const userDetailsInitialValues = (user?: Partial<IUserTable> | null | any): IUserTable => {
  const city = DistrictList.find(item => item.value === user?.city);
  return {
    id: user?.id ?? '',
    name: user?.name ?? '',
    email: user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    address: user?.address ?? '',
    city: city ?? '',
    state: 'Kerala',
    isAgreeTermsAndCondition: user?.isAgreeTermsAndCondition ?? false,
    photo: user?.photo ?? '',
  };
};
