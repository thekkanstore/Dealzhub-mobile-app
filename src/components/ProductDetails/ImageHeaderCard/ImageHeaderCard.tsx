import {
  BackHandler,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import React, {useEffect, useMemo, useRef} from 'react';
import {IProductTable} from '../../../config/models/product';
import FastImage from 'react-native-fast-image';
import {fontScale, moderateScale, width} from '../../../config/styles/responsiveSize';
import {TKArrowIcon} from '../../Common/Icons/TKArrowIcon';
import {colors} from '../../../config/styles/colors';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import Favorite from '../Favorite/Favourite';
import {useGetUserDetails} from '../../../react-queries/user/userQueries';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';
import {fontFamily} from '../../../config/styles/fontFamily';

type ProductImageItem = string | {uri?: string};

interface Props {
  productDetails: IProductTable;
  navigation: VendorScreenNavigationProp;
  isStackChange?: boolean;
  isVendor?: boolean;
}
const ImageHeaderCard: React.FC<Props> = ({
  productDetails,
  navigation,
  isStackChange,
  isVendor,
}) => {
  const handleBackPress = () => {
    if (isStackChange) {
      navigation.popToTop();
    }
    navigation.goBack();
  };
  const {data: userDetails} = useGetUserDetails(true);
  const isFavorites = !!userDetails?.favorites?.includes(productDetails.id);

  const flatListRef = useRef<FlatList<ProductImageItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {
    useNativeDriver: false,
  });

  const productImages = useMemo(() => {
    if (productDetails?.images && productDetails.images.length > 0) {
      return productDetails.images;
    }
    if (productDetails?.image) {
      return [productDetails.image];
    }
    return [];
  }, [productDetails.images, productDetails.image]);

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const renderStatus = () => {
    if (!productDetails?.isOutOfStock && !productDetails?.isSoldOut) {
      return null;
    }
    if (productDetails?.isSoldOut) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Sold Out</Text>
        </View>
      );
    }
    if (productDetails?.isOutOfStock) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Out of Stock</Text>
        </View>
      );
    }
    return null;
  };
  const renderItem: ListRenderItem<ProductImageItem> = ({item}) => {
    const imageUri = typeof item === 'string' ? item : (item?.uri ?? '');
    const hasValidUri = imageUri.trim().length > 0;
    return (
      <View style={styles.productImageContainer}>
        <View
          style={
            productDetails?.isSoldOut || productDetails?.isOutOfStock
              ? styles.productImageContainerDisabled
              : {}
          }>
          {hasValidUri ? (
            <FastImage
              style={styles.productImage}
              source={{
                uri: imageUri,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <View style={styles.productImage} />
          )}
        </View>
        {renderStatus()}
      </View>
    );
  };

  return (
    <View>
      <FlatList<ProductImageItem>
        ref={flatListRef}
        data={productImages}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          typeof item === 'string' ? item : (item?.uri ?? String(index))
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      <View style={styles.bottomContent}>
        <View style={styles.dotsContainer}>
          {productImages.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [moderateScale(8), moderateScale(30), moderateScale(8)],
              extrapolate: 'clamp',
            });
            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [
                colors.neutralButtonBackgroundColor,
                colors.primaryButtonBackgroundColor,
                colors.neutralButtonBackgroundColor,
              ],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View key={index} style={[styles.dot, {width: dotWidth, backgroundColor}]} />
            );
          })}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <TKArrowIcon width={16} height={16} color={colors.primaryTextColor} direction="left" />
        </Pressable>
        <TKRenderIf isRender={!isVendor}>
          <Favorite
            containerStyle={styles.backButton}
            productId={productDetails.id}
            isFavorite={isFavorites}
          />
        </TKRenderIf>
      </View>
    </View>
  );
};

export default ImageHeaderCard;

const styles = StyleSheet.create({
  productImageContainer: {
    flex: 1,
    width: width,
    padding: moderateScale(16),
    backgroundColor: colors.backgroundContainerLight,
  },
  productImage: {
    width: '100%',
    height: moderateScale(275),
    backgroundColor: colors.backgroundContainerLight,
  },
  backButton: {
    padding: moderateScale(10),
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    borderRadius: moderateScale(20),
  },
  buttonContainer: {
    position: 'absolute',
    top: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  productImageContainerDisabled: {
    opacity: 0.3,
  },
  statusContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -moderateScale(60)}, {translateY: -moderateScale(12)}],
    zIndex: 100,
    width: moderateScale(120),
    paddingVertical: moderateScale(4),
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
  bottomContent: {
    position: 'absolute',
    bottom: moderateScale(10),
    width: '100%',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
  },
  dot: {
    height: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: colors.neutralButtonBackgroundColor,
  },
});
