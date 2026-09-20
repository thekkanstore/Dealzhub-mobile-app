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
  const isPaymentPending = storeDetails?.paymentStatus === 'pending' || storeDetails?.paymentStatus === 'FAILED' || (isPendingStatus && storeDetails?.paymentStatus !== 'PAID');

  let subscriptionEndDate: Date | null = null;
  if (storeDetails?.subscriptionEndDate) {
    // @ts-ignore
    subscriptionEndDate = storeDetails.subscriptionEndDate.toDate
      ? // @ts-ignore
        storeDetails.subscriptionEndDate.toDate()
      : new Date(storeDetails.subscriptionEndDate);
  }
  const isExpired = subscriptionEndDate ? new Date() > subscriptionEndDate : false;

  const formattedAddress = [storeDetails?.address, storeDetails?.city, storeDetails?.state]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.container}>
      {/* Store Bio */}
      {!!storeDetails?.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{storeDetails.bio}</Text>
        </View>
      )}

      {/* Store Metadata Card */}
      <View style={styles.infoCard}>
        {!!formattedAddress && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText} numberOfLines={2}>
              {formattedAddress}
            </Text>
          </View>
        )}

        {!!(storeDetails?.email || storeDetails?.phoneNumber) && (
          <View style={styles.contactContainer}>
            {!!storeDetails?.email && (
              <View style={styles.contactItem}>
                <Text style={styles.infoIcon}>✉️</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {storeDetails.email}
                </Text>
              </View>
            )}
            {!!storeDetails?.phoneNumber && (
              <View style={styles.contactItem}>
                <Text style={styles.infoIcon}>📞</Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  {storeDetails.phoneNumber}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <TKRenderIf isRender={!isFromProductDetails}>
        <View style={styles.buttonContainer}>
          <TKButton
            title={strings('button.edit')}
            type={'secondary'}
            style={isPendingStatus || isPaymentPending || isExpired ? styles.fullWidthButton : styles.button}
            onPress={handleEditStore}
          />
          <TKRenderIf isRender={!isPendingStatus && !isPaymentPending && !isExpired}>
            <TKButton
              title={strings('button.addProduct')}
              style={styles.button}
              onPress={handleAddProduct}
            />
          </TKRenderIf>
        </View>

        {isPaymentPending && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Payment Pending. Tap Edit Store to complete payment.</Text>
          </View>
        )}

        {isExpired && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Subscription Expired. Tap Edit Store to renew your plan.</Text>
          </View>
        )}

        <TKRenderIf isRender={isPendingStatus && !isPaymentPending && !isExpired}>
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
    gap: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
  },
  bioContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(10),
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryButtonBackgroundColor || '#064E3B',
  },
  bioText: {
    color: '#374151',
    fontFamily: fontFamily.regular,
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    gap: moderateScale(8),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
  },
  infoIcon: {
    fontSize: fontScale(14),
    marginTop: moderateScale(1),
  },
  infoText: {
    flex: 1,
    color: '#4B5563',
    fontFamily: fontFamily.medium,
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
  },
  contactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(12),
    paddingTop: moderateScale(4),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    minWidth: '45%',
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
  warningBox: {
    backgroundColor: '#FEE2E2',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  warningText: {
    color: '#991B1B',
    fontFamily: fontFamily.semiBold,
    fontSize: fontScale(13),
    textAlign: 'center',
  },
});
