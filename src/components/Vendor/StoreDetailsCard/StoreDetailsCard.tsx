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
import {VendorService} from '../../../services/vendor/vendorService';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';

interface Props {
  storeDetails: IStoreTable;
  navigation: VendorScreenNavigationProp;
  isFromProductDetails?: boolean;
}
const StoreDetailsCard: React.FC<Props> = ({
  storeDetails,
  navigation,
  isFromProductDetails = false,
}) => {
  const handleEditStore = () => {
    navigation.navigate(navigationStrings.REGISTER_USER_STACK, {
      screen: navigationStrings.STORE_DETAILS,
      params: {isEdit: true},
    });
  };
  const handleAddProduct = () => {
    navigation.navigate(navigationStrings.PRODUCT_UPDATE);
  };
  const isPendingStatus = storeDetails?.vendorStatus?.toLowerCase() === 'pending';

  return (
    <View style={styles.container}>
      <Text style={styles.detailText}>{VendorService.getStoreAddressInfo(storeDetails)}</Text>
      <TKRenderIf isRender={!isFromProductDetails}>
        <View style={styles.buttonContainer}>
          <TKButton
            title={strings('button.edit')}
            type={'secondary'}
            style={isPendingStatus ? styles.fullWidthButton : styles.button}
            onPress={handleEditStore}
          />
          <TKRenderIf isRender={!isPendingStatus}>
            <TKButton
              title={strings('button.addProduct')}
              style={styles.button}
              onPress={handleAddProduct}
            />
          </TKRenderIf>
        </View>
        <TKRenderIf isRender={isPendingStatus}>
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingText}>Wait for approval to add product</Text>
          </View>
        </TKRenderIf>
      </TKRenderIf>
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
  fullWidthButton: {
    width: '100%',
  },
  pendingContainer: {
    backgroundColor: '#FEF3C7',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingText: {
    color: '#92400E',
    fontFamily: fontFamily.medium,
    fontSize: fontScale(13),
    textAlign: 'center',
  },
});
