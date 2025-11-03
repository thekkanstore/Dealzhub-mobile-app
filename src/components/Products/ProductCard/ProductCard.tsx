import React from 'react';
import {Pressable} from 'react-native-gesture-handler';
import {StyleSheet, Text, View} from 'react-native';
import {IProductTable} from '../../../config/models/product';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import FastImage from 'react-native-fast-image';
import Favorite from '../../ProductDetails/Favorite/Favourite';
import {useGetUserDetails} from '../../../react-queries/user/userQueries';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';

interface ProductItemProps {
  product: IProductTable;
  onPress?: () => void;
  isVendor?: boolean;
}

const ProductCard: React.FC<ProductItemProps> = ({product, onPress, isVendor}) => {
  const {data: userDetails} = useGetUserDetails(true);
  const renderStatus = () => {
    if (!product?.isOutOfStock && !product?.isSoldOut) {
      return null;
    }
    if (product?.isSoldOut) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Sold Out</Text>
        </View>
      );
    }
    if (product?.isOutOfStock) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Out of Stock</Text>
        </View>
      );
    }
    return null;
  };
  return (
    <View>
      <Pressable
        style={[
          styles.productCard,
          product?.isOutOfStock || product?.isSoldOut ? styles.productCardDisabled : {},
        ]}
        onPress={onPress}>
        <View>
          <TKRenderIf isRender={!isVendor}>
            <Favorite
              productId={product?.id}
              isFavorite={userDetails?.favorites?.includes(product?.id) ?? false}
              containerStyle={styles.favoriteIcon}
            />
          </TKRenderIf>
          <FastImage
            style={styles.productImage}
            source={{
              uri: product?.image ?? product?.images?.[0] ?? '',
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product?.name}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product?.description}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.actualPrice}>₹ {product?.actualPrice}</Text>
            <Text style={styles.discountPrice}>₹ {product?.discountPrice}</Text>
          </View>
        </View>
      </Pressable>
      {renderStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  productImage: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(14),
    alignSelf: 'center',
  },
  productInfo: {
    gap: verticalScale(2),
    marginTop: verticalScale(4),
  },
  productCard: {
    width: moderateScale(170),
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
    gap: verticalScale(2),
  },
  productCardDisabled: {
    opacity: 0.5,
  },
  statusContainer: {
    position: 'absolute',
    top: '30%',
    left: moderateScale(30),
    zIndex: 100,
    width: moderateScale(120),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    backgroundColor: colors.neutralButtonBackgroundColor,
    borderWidth: 2,
    borderColor: colors.errorTextColor,
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: colors.errorTextColor,
  },
  productName: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
    marginBottom: verticalScale(8),
  },
  productDescription: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.regular,
    color: colors.primaryTextColor,
    marginBottom: verticalScale(8),
  },
  discountPrice: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
  actualPrice: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.regular,
    color: colors.disabledTextColor,
    textDecorationLine: 'line-through',
  },
  favoriteIcon: {
    position: 'absolute',
    top: verticalScale(8),
    right: moderateScale(2),
    zIndex: 100,
    padding: moderateScale(3),
    // backgroundColor: colors.tertiaryButtonBackgroundColor,
    borderRadius: moderateScale(20),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
});

export default ProductCard;
