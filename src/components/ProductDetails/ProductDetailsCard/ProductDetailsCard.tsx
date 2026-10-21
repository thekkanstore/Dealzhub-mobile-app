import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useGetSubCategories} from '../../../react-queries/categories/subcategoryQuery';
import {IProductTable} from '../../../config/models/product';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import {strings} from '../../../utils/language/langauageUtils';
import {TKArrowIcon} from '../../Common/Icons/TKArrowIcon';
import {stylesUtils} from '../../../utils/styles/styles';
import {VendorService} from '../../../services/vendor/vendorService';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {updateIsFromProductDetails} from '../../../redux/productSlice';

import {WeightOption} from '../../../utils/measurement/measurementUtils';
import {TKPlusIcon} from '../../Common/Icons/TKPlusIcon';
import {TKMinusIcon} from '../../Common/Icons/TKMinusIcon';
import {useGetUserDetails} from '../../../react-queries/user/userQueries';

interface Props {
  productDetails: IProductTable;
  navigation: VendorScreenNavigationProp;
  isVendor?: boolean;
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
  selectedWeight?: WeightOption | null;
  onSelectWeight?: (weight: WeightOption) => void;
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
  scaledDiscountPrice?: number;
  scaledActualPrice?: number;
  weightOptions?: WeightOption[];
  isWeightOrVolume?: boolean;
}
const ProductDetailsCard: React.FC<Props> = ({
  productDetails,
  navigation,
  isVendor,
  selectedSize,
  onSelectSize,
  selectedWeight,
  onSelectWeight,
  quantity = 1,
  onQuantityChange,
  scaledDiscountPrice,
  scaledActualPrice,
  weightOptions = [],
  isWeightOrVolume = false,
}) => {
  const {data: subCategories = []} = useGetSubCategories(
    productDetails.storeId || productDetails.store?.id || '',
    productDetails.categoryId || '',
  );

  const selectedSubcategoryNames = React.useMemo(() => {
    if (!productDetails.subcategoryIds?.length) return '';
    return productDetails.subcategoryIds
      .map(id => subCategories.find(sub => sub.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [productDetails.subcategoryIds, subCategories]);

  const {data: userDetails} = useGetUserDetails();
  const cartCountForProduct = React.useMemo(() => {
    if (!userDetails?.storeCarts) return 0;
    let count = 0;
    Object.values(userDetails.storeCarts).forEach((items: any) => {
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

  const handleOnClickVendor = () => {
    updateIsFromProductDetails(true);
    setTimeout(() => {
      navigation.navigate(navigationStrings.VENDOR, {
        isFromProductDetails: true,
        storeId: productDetails.store.id,
      });
    }, 300);
  };

  const discountPriceToShow = scaledDiscountPrice ?? (parseFloat(productDetails.discountPrice as any) || 0) * quantity;
  const actualPriceToShow = scaledActualPrice ?? (parseFloat(productDetails.actualPrice as any) || 0) * quantity;
  const unitLabel = selectedWeight?.label || (productDetails.unit && productDetails.unit.toLowerCase() !== 'pcs' ? `${productDetails.unitValue || 1} ${productDetails.unit}` : null);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>{productDetails.name}</Text>
        </View>
        <View style={styles.priceContainer}>
          {actualPriceToShow > discountPriceToShow && (
            <Text style={styles.actualPrice}>₹ {actualPriceToShow}</Text>
          )}
          <Text style={styles.headerText}>₹ {discountPriceToShow}</Text>
        </View>
      </View>

      {/* Unit Badge and Per-item calculation */}
      <View style={styles.priceMetaRow}>
        {unitLabel && (
          <View style={styles.unitBadge}>
            <Text style={styles.unitBadgeText}>{unitLabel}</Text>
          </View>
        )}
        {quantity > 1 && (
          <Text style={styles.eachPriceText}>
            ₹{(discountPriceToShow / quantity).toFixed(2)} each × {quantity}
          </Text>
        )}
      </View>

      <Text style={styles.descriptionText}>{productDetails.description}</Text>

      {/* Size Selection Chips */}
      {productDetails.sizes && productDetails.sizes.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>SELECT SIZE</Text>
            {selectedSize ? (
              <Text style={styles.sectionSelectedText}>Selected: {selectedSize}</Text>
            ) : null}
          </View>
          <View style={styles.chipsContainer}>
            {productDetails.sizes.map((s: string) => {
              const isSelected = selectedSize === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => onSelectSize?.(s)}
                  style={[styles.chip, isSelected && styles.selectedChip]}>
                  <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Weight / Volume Selection Chips */}
      {isWeightOrVolume && weightOptions.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>SELECT WEIGHT / PACKAGE</Text>
            {selectedWeight ? (
              <Text style={styles.sectionSelectedText}>{selectedWeight.label}</Text>
            ) : null}
          </View>
          <View style={styles.chipsContainer}>
            {weightOptions.map((opt: WeightOption) => {
              const isSelected = selectedWeight?.label === opt.label;
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => onSelectWeight?.(opt)}
                  style={[styles.chip, isSelected && styles.selectedChip]}>
                  <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Quantity Counter */}
      {!isVendor && onQuantityChange && (
        <View style={styles.quantityContainer}>
          <View style={styles.quantityLabelRow}>
            <Text style={styles.quantityLabel}>QUANTITY</Text>
            {cartCountForProduct > 0 && (
              <View style={styles.inCartPill}>
                <Text style={styles.inCartPillText}>{cartCountForProduct} in Cart</Text>
              </View>
            )}
          </View>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              style={[styles.qtyButton, quantity <= 1 && styles.qtyButtonDisabled]}>
              <TKMinusIcon width={14} height={14} color={quantity <= 1 ? colors.greyTextColor : colors.primaryTextColor} />
            </TouchableOpacity>
            <Text style={styles.quantityNumber}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => onQuantityChange(quantity + 1)}
              style={styles.qtyButton}>
              <TKPlusIcon width={14} height={14} color={colors.primaryTextColor} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <>
        <Text style={styles.subHeaderText}>{strings('labels.categoryDetails')}</Text>
        <View style={styles.subContainer}>
          <Text style={styles.descriptionText}>{strings('labels.name')} :</Text>
          <Text style={styles.descriptionText}>{productDetails?.category?.name ?? ''}</Text>
        </View>
        <TKRenderIf isRender={!!selectedSubcategoryNames}>
          <View style={styles.subContainer}>
            <Text style={styles.descriptionText}>{strings('labels.subCategories')} :</Text>
            <Text style={styles.descriptionText}>{selectedSubcategoryNames}</Text>
          </View>
        </TKRenderIf>
      </>

      <TKRenderIf isRender={!isVendor && !!productDetails?.store}>
        <TouchableOpacity onPress={handleOnClickVendor} style={styles.vendorContainer}>
          <View style={styles.vendorHeaderContainer}>
            <Text style={styles.vendorHeaderText}>{productDetails?.store?.storeName}</Text>
            <View style={styles.backButton}>
              <TKArrowIcon width={14} height={14} color={colors.primaryTextColor} />
            </View>
          </View>
          <Text style={styles.vendorDescriptionText}>
            {VendorService.getStoreAddressInfo(productDetails.store)}
          </Text>
        </TouchableOpacity>
      </TKRenderIf>
    </View>
  );
};

export default ProductDetailsCard;

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(5),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 0.6,
  },
  priceContainer: {
    flex: 0.4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(10),
  },
  actualPrice: {
    fontSize: fontScale(14),
    color: colors.greyTextColor,
    fontFamily: fontFamily.medium,
    textDecorationLine: 'line-through',
    textAlign: 'center',
  },
  headerText: {
    fontSize: fontScale(18),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
    // width: '60%',
  },
  descriptionText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
  },
  subHeaderText: {
    marginTop: moderateScale(10),
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    gap: moderateScale(10),
  },
  vendorContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(10),
    borderColor: colors.neutralButtonBackgroundColor,
    ...stylesUtils.darkShadow({
      elevation: 0.73,
    }),
  },
  vendorHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    gap: moderateScale(10),
  },
  vendorHeaderText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
  },
  backButton: {
    padding: moderateScale(10),
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    borderRadius: moderateScale(20),
  },
  vendorDescriptionText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
  },
  priceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginTop: moderateScale(4),
    marginBottom: moderateScale(6),
  },
  unitBadge: {
    backgroundColor: '#E5EEE9',
    borderColor: '#528E6B',
    borderWidth: 1,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(6),
  },
  unitBadgeText: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
    color: '#345c45',
  },
  eachPriceText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: colors.greyTextColor,
  },
  sectionContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.neutralButtonBackgroundColor,
    padding: moderateScale(12),
    marginVertical: moderateScale(6),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  sectionTitle: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
    color: colors.greyTextColor,
    letterSpacing: 0.5,
  },
  sectionSelectedText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.bold,
    color: colors.primaryButtonBackgroundColor,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
  },
  chip: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: colors.neutralButtonBackgroundColor,
    backgroundColor: '#F7F7F7',
  },
  selectedChip: {
    borderColor: colors.primaryButtonBackgroundColor,
    backgroundColor: colors.primaryButtonBackgroundColor,
  },
  chipText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.neutralButtonBackgroundColor,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    marginVertical: moderateScale(6),
  },
  quantityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  quantityLabel: {
    fontSize: fontScale(11),
    fontFamily: fontFamily.bold,
    color: colors.greyTextColor,
    letterSpacing: 0.5,
  },
  inCartPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  inCartPillText: {
    fontSize: fontScale(10),
    fontFamily: fontFamily.bold,
    color: '#065F46',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  qtyButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.neutralButtonBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonDisabled: {
    opacity: 0.4,
  },
  quantityNumber: {
    fontSize: fontScale(15),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
    minWidth: moderateScale(20),
    textAlign: 'center',
  },
});
