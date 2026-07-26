import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import authService from '../../../services/auth/authService';
import TKConfirmModal from '../../Common/TKConfirmModal/TKConfirmModal';

import TKItemCard from '../../Common/TKItemCard/TKItemCard';
import {strings} from '../../../utils/language/langauageUtils';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {TKSettingsIcon} from '../../Common/Icons/TKSettingsIcon';
import {fontFamily} from '../../../config/styles/fontFamily';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {HomeScreenNavigationProp} from '../../../navigation/rootparamstypes';
import CustomerSupportCard from '../CustomerSupportCard/CustomerSupportCard';

const screenNames = [
  // {
  //   id: 1,
  //   icon: TKViewHistoryIcon,
  //   name: strings('labels.viewOrderHistory'),
  //   routeName: '',
  // },
  // {
  //   id: 2,
  //   icon: TKCartUnselectedIcon,
  //   name: strings('labels.viewCart'),
  //   routeName: '',
  // },
  // {
  //   id: 3,
  //   icon: TKHeartUnselectedIcon,
  //   name: strings('labels.viewWishlist'),
  //   routeName: '',
  // },
  {
    id: 4,
    icon: TKSettingsIcon,
    name: strings('labels.settings'),
    routeName: navigationStrings.SETTINGS,
  },
  {
    id: 5,
    icon: TKSettingsIcon, // using the same icon as a placeholder, can be replaced
    name: 'Delete Account',
    routeName: 'DELETE_ACCOUNT',
    textColor: '#FF3B30',
  },
];

interface ScreenName {
  id: number;
  icon: React.FC<any>;
  name: string;
  routeName: string;
  textColor?: string;
}
const ProfileOptions = () => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const handleNavigate = (item: ScreenName) => {
    if (item.routeName === 'DELETE_ACCOUNT') {
      setIsDeleteModalVisible(true);
      return;
    }
    navigation.navigate(item.routeName as any);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalVisible(false);
    authService.deleteAccount();
  };
  const renderItem = ({item}: {item: ScreenName}) => {
    const Icon = item.icon;
    return (
      <Pressable onPress={() => handleNavigate(item)}>
        <TKItemCard style={style.itemContainer}>
          <View style={style.iconContainer}>
            <Icon
              width={moderateScale(20)}
              height={moderateScale(20)}
              color={colors.greyTextColor}
            />
          </View>
          <Text style={[style.itemText, item.textColor ? {color: item.textColor} : {}]}>{item.name}</Text>
        </TKItemCard>
      </Pressable>
    );
  };
  return (
    <>
      <FlatList
        data={screenNames}
        renderItem={renderItem}
        style={style.container}
        ListFooterComponent={<CustomerSupportCard />}
      />
      <TKConfirmModal
        isVisible={isDeleteModalVisible}
        title="Delete Account"
        bodyText="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
        confirmButtonText="Delete"
        confirmButtonAction={handleDeleteConfirm}
        cancelButtonText="Cancel"
        cancelButtonAction={() => setIsDeleteModalVisible(false)}
      />
    </>
  );
};

export default ProfileOptions;

const style = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryBackgroundColor,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
  },
  itemContainer: {
    marginBottom: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  iconContainer: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(20),
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: colors.primaryTextColor,
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
  },
});
