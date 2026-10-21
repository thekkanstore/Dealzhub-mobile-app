import React from 'react';
import {StyleSheet, Text, View, Pressable, TouchableOpacity} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKItemCard from '../../Common/TKItemCard/TKItemCard';
import {TKTrashIcon} from '../../Common/Icons/TKTrashIcon';
import {TKMinusIcon} from '../../Common/Icons/TKMinusIcon';
import {TKPlusIcon} from '../../Common/Icons/TKPlusIcon';
import {IProductTable} from '../../../config/models/product';

export interface ICartItem {
  id: string;
  productId?: string;
  name: string;
  image?: string | null;
  images?: string[] | null;
  actualPrice?: string | number;
  discountPrice?: string | number;
  unitPrice?: number;
  quantity?: number;
  cartQuantity?: number;
  selectedSize?: string | null;
  selectedWeight?: string | null;
  unit?: string | null;
  unitValue?: number | null;
  storeId?: string;
  store?: any;
  itemTotalPrice?: number;
  description?: string;
}

interface CartIemProp {
  product?: IProductTable;
  item?: ICartItem;
  storeId?: string;
  onPress?: () => void;
  onQuantityChange?: (newQuantity: number) => void;
  onRemove?: () => void;
  isUpdatingQuantity?: boolean;
}

const CartIemCard: React.FC<CartIemProp> = ({
  product,
  item,
  onPress,
  onQuantityChange,
  onRemove,
  isUpdatingQuantity = false,
}) => {
  const currentItem = item || (product as any);
  if (!currentItem) return null;

  const rawImages = currentItem.images || (product?.images ?? null);
  const imageUrl =
    (Array.isArray(rawImages) && rawImages.length > 0 ? rawImages[0] : currentItem.image) ||
    'https://dealzhub.co.in/appLogo@2x.png';

  const qty = currentItem.quantity || currentItem.cartQuantity || 1;
  const unitPrice =
    currentItem.unitPrice !== undefined
      ? currentItem.unitPrice
      : parseFloat(currentItem.discountPrice || currentItem.actualPrice || '0') || 0;
  const itemTotalPrice =
    currentItem.itemTotalPrice !== undefined
      ? currentItem.itemTotalPrice
      : Math.round(unitPrice * qty * 100) / 100;

  return (
    <TKItemCard style={styles.card}>
      <Pressable onPress={onPress} style={styles.contentRow}>
        {/* Product Image */}
        <FastImage
          style={styles.productImage}
          source={{
            uri: imageUrl,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          {/* Title & Remove Row */}
          <View style={styles.titleRow}>
            <Text numberOfLines={2} style={styles.productTitle}>
              {currentItem.name}
            </Text>
            {onRemove && (
              <TouchableOpacity
                onPress={onRemove}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                style={styles.deleteButton}
                activeOpacity={0.7}>
                <TKTrashIcon width={16} height={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Badges Row (Size & Weight) */}
          <View style={styles.badgesRow}>
            {currentItem.selectedSize ? (
              <View style={styles.sizeBadge}>
                <Text style={styles.sizeBadgeText}>Size: {currentItem.selectedSize}</Text>
              </View>
            ) : null}

            {currentItem.selectedWeight ? (
              <View style={styles.weightBadge}>
                <Text style={styles.weightBadgeText}>{currentItem.selectedWeight}</Text>
              </View>
            ) : null}

            {!currentItem.selectedWeight && currentItem.unit && currentItem.unit.toLowerCase() !== 'pcs' ? (
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>
                  {currentItem.unitValue && currentItem.unitValue !== 1 ? `${currentItem.unitValue} ` : ''}
                  {currentItem.unit}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Stepper & Price Row */}
          <View style={styles.actionRow}>
            {onQuantityChange ? (
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() => onQuantityChange(qty - 1)}
                  disabled={isUpdatingQuantity}
                  style={styles.stepperButton}
                  activeOpacity={0.6}>
                  <TKMinusIcon width={12} height={12} color="#4B5563" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{qty}</Text>

                <TouchableOpacity
                  onPress={() => onQuantityChange(qty + 1)}
                  disabled={isUpdatingQuantity}
                  style={styles.stepperButton}
                  activeOpacity={0.6}>
                  <TKPlusIcon width={12} height={12} color="#4B5563" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.quantityStaticText}>Qty: {qty}</Text>
            )}

            <View style={styles.priceContainer}>
              <Text style={styles.totalPriceText}>₹{itemTotalPrice.toLocaleString()}</Text>
              {qty > 1 && (
                <Text style={styles.unitPriceText}>₹{unitPrice.toLocaleString()} each</Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </TKItemCard>
  );
};

export default CartIemCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(10),
    marginVertical: verticalScale(4),
    marginHorizontal: moderateScale(4),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  productImage: {
    width: moderateScale(82),
    height: moderateScale(82),
    borderRadius: moderateScale(12),
    backgroundColor: '#F3F4F6',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: moderateScale(82),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: moderateScale(6),
  },
  productTitle: {
    flex: 1,
    fontSize: fontScale(14),
    fontFamily: fontFamily.semiBold,
    color: colors.primaryTextColor,
    lineHeight: fontScale(18),
  },
  deleteButton: {
    padding: moderateScale(4),
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(6),
    marginVertical: verticalScale(4),
  },
  sizeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: moderateScale(7),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sizeBadgeText: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.medium,
    color: '#374151',
  },
  weightBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: moderateScale(7),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  weightBadgeText: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.semiBold,
    color: '#065F46',
  },
  unitBadge: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: moderateScale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(5),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unitBadgeText: {
    fontSize: fontScale(10),
    fontFamily: fontFamily.regular,
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: moderateScale(3),
    paddingVertical: verticalScale(2),
  },
  stepperButton: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  quantityText: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.bold,
    color: '#111827',
    minWidth: moderateScale(24),
    textAlign: 'center',
  },
  quantityStaticText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceText: {
    fontSize: fontScale(15),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  unitPriceText: {
    fontSize: fontScale(10),
    fontFamily: fontFamily.regular,
    color: '#9CA3AF',
  },
});
