import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';

import { colors } from '../../../config/styles/colors';
import { fontScale, moderateScale } from '../../../config/styles/responsiveSize';
import { IProductTable } from '../../../config/models/product';
import TKButton from '../../Common/TKButton/TKButton';
import { strings } from '../../../utils/language/langauageUtils';
import { TKHeartIcon } from '../../Common/Icons/TKHeartIcon';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';
import { TKTrashIcon } from '../../Common/Icons/TKTrashIcon';
import { fontFamily } from '../../../config/styles/fontFamily';
import TKItemCard from '../../Common/TKItemCard/TKItemCard';
import {
  useMoveCartToWishlist,
  useUpdateCartItemsList,
} from '../../../react-queries/user/userQueries';

interface CartIemProp {
  product: IProductTable;
  onPress?: () => void;
}
const CartIemCard: React.FC<CartIemProp> = ({ product, onPress }) => {
  const { mutate: deleteCartItem, isPending: deleteCartItemLoader } = useUpdateCartItemsList();
  const { mutate: moveToWishlist, isPending: moveToWishlistLoader } = useMoveCartToWishlist();
  const handleMoveToWishlist = () => {
    moveToWishlist({ id: product.id });
  };
  const handleRemoveFromCart = () => {
    deleteCartItem({ id: product.id, updateStatus: 'remove' });
  };
  const MoveToWishListTitle = ({ isFavorite = true }) => (
    <View style={styles.titleContainer}>
      <Text style={styles.buttonText}>
        {isFavorite ? strings('button.moveToWishlist') : strings('button.remove')}
      </Text>
      <TKRenderIf isRender={isFavorite && !moveToWishlistLoader}>
        <TKHeartIcon color={colors.iconShadeColor} width={16} height={16} />
      </TKRenderIf>
      <TKRenderIf isRender={!isFavorite && !deleteCartItemLoader}>
        <TKTrashIcon color={colors.iconShadeColor} width={16} height={16} />
      </TKRenderIf>
    </View>
  );
  return (
    <Pressable onPress={onPress}>
      <TKItemCard style={styles.container}>
      <FastImage
        style={styles.productImage}
        source={{ uri: product?.images?.[0] ?? '', priority: FastImage.priority.normal }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.detailsContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.headerText}>₹ {product.actualPrice}</Text>
        </View>
        <Text numberOfLines={2} style={styles.descriptionText}>{product.description}</Text>
        <View style={styles.buttonContainer}>
          <TKButton
            style={styles.iconButtonContainer}
            title={<MoveToWishListTitle />}
            type={'secondary'}
            onPress={handleMoveToWishlist}
            isLoading={moveToWishlistLoader}
          />
          <TKButton
            style={styles.iconButtonContainer}
            title={<MoveToWishListTitle isFavorite={false} />}
            type={'secondary'}
            onPress={handleRemoveFromCart}
            isLoading={deleteCartItemLoader}
          />
        </View>
      </View>
      </TKItemCard>
    </Pressable>
  );
};

export default CartIemCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: moderateScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: moderateScale(16),
    paddingVertical: moderateScale(10),
    gap: moderateScale(8),
    marginHorizontal: moderateScale(3)
  },
  productImage: {
    height: moderateScale(100),
    width: moderateScale(80),
    borderRadius: moderateScale(20),
  },
  detailsContainer: {
    flex: 1,
    gap: moderateScale(8),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(6),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(2),
  },
  buttonText: {
    fontFamily: fontFamily.regular,
    fontSize: fontScale(12),
    color: colors.primaryTextColor,
    flexShrink: 1,
  },
  descriptionText: {
    fontSize: fontScale(12),
    color: '#254030',
    fontFamily: fontFamily.regular,
  },
  iconButtonContainer: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(5),
    flex: 1,
  },
  headerText: {
    fontSize: fontScale(16),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
  },
});
