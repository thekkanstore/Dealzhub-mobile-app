import React from 'react';
import {IProductTable} from '../../../config/models/product';
import {StyleSheet, Text, View} from 'react-native';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import FastImage from 'react-native-fast-image';

interface ProductItemProps {
  product: IProductTable;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductItemProps> = ({product, onPress}) => {
  return (
    <View style={styles.productCard} onTouchEnd={onPress}>
      <FastImage
        style={styles.productImage}
        source={{uri: product.image ?? '', priority: FastImage.priority.normal}}
        resizeMode={FastImage.resizeMode.contain}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.actualPrice}>₹ {product.actualPrice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productImage: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(14),
  },
  productInfo: {
    gap: verticalScale(2),
    marginTop: verticalScale(4),
  },
  productCard: {
    width: moderateScale(170),
    backgroundColor: colors.primaryBackgroundColor,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
    gap: verticalScale(2),
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
  actualPrice: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
  },
});

export default ProductCard;
