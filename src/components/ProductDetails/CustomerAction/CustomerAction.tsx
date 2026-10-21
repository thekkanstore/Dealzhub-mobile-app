import React, {useMemo} from 'react';
import {Linking, StyleSheet, Alert, View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TKButton from '../../Common/TKButton/TKButton';
import {TKCartIcon} from '../../Common/Icons/TKCartIcon';
import {strings} from '../../../utils/language/langauageUtils';
import {IProduct} from '../../../config/models/product';
import {
  useGetUserDetails,
  useUpdateCartItemsList,
} from '../../../react-queries/user/userQueries';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {navigationStrings} from '../../../navigation/navigationStrings';

interface Props {
  productDetails: IProduct;
  quantity?: number;
  selectedSize?: string;
  selectedWeight?: string;
  unitPrice?: number;
  scaledDiscountPrice?: number;
}

const CustomerAction: React.FC<Props> = ({
  productDetails,
  quantity = 1,
  selectedSize,
  selectedWeight,
  unitPrice,
  scaledDiscountPrice,
}) => {
  const navigation = useNavigation();
  const {mutate: addToCart, isPending: isAddToCartLoader} = useUpdateCartItemsList();
  const {data: userDetails} = useGetUserDetails();

  const storeId = productDetails?.storeId || productDetails?.store?.id || 'default_store';
  const currentStoreItems = (userDetails as any)?.storeCarts?.[storeId] || [];

  // Find exact matching variant in cart
  const currentVariantItem = useMemo(() => {
    return currentStoreItems.find((item: any) => {
      const matchId = item.id === productDetails?.id || item.productId === productDetails?.id;
      const matchSize = (item.selectedSize || null) === (selectedSize || null);
      const matchWeight = (item.selectedWeight || null) === (selectedWeight || null);
      return matchId && matchSize && matchWeight;
    });
  }, [currentStoreItems, productDetails?.id, selectedSize, selectedWeight]);

  const currentVariantCount =
    currentVariantItem?.quantity || currentVariantItem?.cartQuantity || 0;

  // Total count of all variants of this product in cart
  const totalProductCount = useMemo(() => {
    let count = 0;
    Object.values((userDetails as any)?.storeCarts || {}).forEach((items: any) => {
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          if (item.id === productDetails?.id || item.productId === productDetails?.id) {
            count += item.quantity || item.cartQuantity || 1;
          }
        });
      }
    });
    return count;
  }, [userDetails?.storeCarts, productDetails?.id]);

  const handleAddToCart = () => {
    addToCart({
      id: productDetails.id,
      updateStatus: 'add',
      quantity,
      selectedSize,
      selectedWeight,
      unitPrice,
      productData: productDetails,
    });
  };

  const executeBuyNow = () => {
    const sizeStr = selectedSize ? `\n📏 *Size:* ${selectedSize}` : '';
    const weightStr = selectedWeight ? `\n⚖️ *Weight:* ${selectedWeight}` : '';
    const qtyStr = `\n🔢 *Quantity:* ${quantity}`;
    const totalAmount =
      scaledDiscountPrice ??
      (parseFloat(productDetails.discountPrice || productDetails.price || '0') || 0) * quantity;
    const priceStr = `\n💵 *Total Price:* ₹${totalAmount}`;

    const message = `Hi! I would like to order *${productDetails.name}* from DealzHub:${sizeStr}${weightStr}${qtyStr}${priceStr}\n\nPlease confirm availability and payment details. Thank you!`;
    const rawPhone = String(
      productDetails.store?.phoneNumber || (productDetails.store as any)?.phone || '',
    );
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${formattedPhone}`;
    Linking.openURL(url)
      .then(() => {})
      .catch(() => Alert.alert('Error', 'Make sure WhatsApp installed on your device'));
  };

  const handleBuyNow = () => {
    executeBuyNow();
  };

  const isSoldOutOrOut = productDetails?.isSoldOut || productDetails?.isOutOfStock;

  return (
    <View style={styles.wrapper}>
      {totalProductCount > 0 && (
        <TouchableOpacity
          style={styles.cartInfoBanner}
          onPress={() => (navigation as any)?.navigate(navigationStrings.CART_TAB as any)}
          activeOpacity={0.8}>
          <View style={styles.cartInfoLeft}>
            <TKCartIcon width={16} height={16} color="#065F46" />
            <Text style={styles.cartInfoText}>
              <Text style={styles.cartInfoHighlight}>
                {totalProductCount} {totalProductCount === 1 ? 'item' : 'items'}
              </Text>{' '}
              in your cart
            </Text>
          </View>
          <View style={styles.cartInfoRight}>
            <Text style={styles.cartInfoLink}>View Cart →</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.buttonsRow}>
        <TKButton
          title={currentVariantCount > 0 ? 'Added to Cart (+)' : strings('button.addToCart')}
          type={'secondary'}
          style={styles.button}
          buttonTextStyle={styles.actionButtonText}
          onPress={handleAddToCart}
          isDisabled={isSoldOutOrOut}
          isLoading={isAddToCartLoader}
        />

        <TKButton
          title={strings('button.buyNow')}
          type={'primary'}
          style={styles.button}
          buttonTextStyle={styles.actionButtonText}
          onPress={handleBuyNow}
          isDisabled={isSoldOutOrOut}
        />
      </View>
    </View>
  );
};

export default CustomerAction;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  cartInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(6),
    paddingHorizontal: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cartInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  cartInfoText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.regular,
    color: '#065F46',
  },
  cartInfoHighlight: {
    fontFamily: fontFamily.bold,
    color: '#065F46',
  },
  cartInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartInfoLink: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.bold,
    color: '#059669',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  button: {
    flex: 1,
    paddingHorizontal: moderateScale(8),
  },
  actionButtonText: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.bold,
  },
});
