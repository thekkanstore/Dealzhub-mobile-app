import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {IStoreTable} from '../../../config/models/store';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {navigationStrings} from '../../../navigation/navigationStrings';

interface Props {
  storeDetails: IStoreTable;
  navigation: VendorScreenNavigationProp;
}
const StoreDetailsCard: React.FC<Props> = ({storeDetails, navigation}) => {
  const handleEditStore = () => {
    navigation.navigate(navigationStrings.REGISTER_USER_STACK, {
      screen: navigationStrings.STORE_DETAILS,
      params: {isEdit: true},
    });
  };
  const handleAddProduct = () => {
    navigation.navigate(navigationStrings.PRODUCT_UPDATE);
  };
  return (
    <View style={styles.container}>
      <Text
        style={
          styles.detailText
        }>{`${storeDetails.storeName}, ${storeDetails.address}, ${storeDetails.city}, ${storeDetails.state}\n${storeDetails.email}, ${storeDetails.phoneNumber}`}</Text>
      <View style={styles.buttonContainer}>
        <TKButton
          title={strings('button.edit')}
          type={'secondary'}
          style={styles.button}
          onPress={handleEditStore}
        />
        <TKButton
          title={strings('button.addProduct')}
          style={styles.button}
          onPress={handleAddProduct}
        />
      </View>
    </View>
  );
};

export default StoreDetailsCard;

const styles = StyleSheet.create({
  container: {
    gap: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
  },
  detailText: {
    color: colors.quaternaryTextColor,
    fontFamily: fontFamily.regular,
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
  },
});
