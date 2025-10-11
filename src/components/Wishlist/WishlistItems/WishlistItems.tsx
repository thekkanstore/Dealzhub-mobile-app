import React, {useCallback} from 'react';
import {FlatList, View, Text, StyleSheet, ActivityIndicator, ListRenderItem} from 'react-native';
import {NavigationProp, ParamListBase, useNavigation} from '@react-navigation/native';
import {IProductTable} from '../../../config/models/product';
import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import ProductCard from '../../Products/ProductCard/ProductCard';
import {useGetFavoritesProductList} from '../../../react-queries/user/userQueries';
import {navigationStrings} from '../../../navigation/navigationStrings';
import TKNoProductFound from '../../Common/TKNoProductFound/TKNoProductFound';
import {strings} from '../../../utils/language/langauageUtils';

const WishlistItems = () => {
  const {data: favorites, isPending, error} = useGetFavoritesProductList();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handleOnPressItem = useCallback(
    (item: IProductTable) => {
      navigation.navigate(navigationStrings.VENDOR_TAB as any, {
        screen: navigationStrings.PRODUCT_DETAILS,
        params: {
          isStackChange: true,
          product: item,
        },
      });
    },
    [navigation],
  );
  const renderProduct: ListRenderItem<IProductTable | null> = useCallback(
    ({item}) => <ProductCard product={item!} onPress={() => handleOnPressItem(item!)} />,
    [],
  );

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryButtonBackgroundColor} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites ?? []}
      renderItem={renderProduct}
      keyExtractor={(item, index) => `${item?.id}-${index}`}
      onEndReachedThreshold={0.1}
      numColumns={2}
      ListEmptyComponent={
        <TKNoProductFound
          title={
            error ? strings('labels.failedToLoadProducts') : strings('labels.sorryNoResultFound')
          }
        />
      }
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

export default WishlistItems;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: fontScale(16),
    color: colors.secondaryTextColor,
    fontFamily: fontFamily.medium,
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
  loader: {
    marginVertical: verticalScale(10),
  },
  endText: {
    fontSize: fontScale(12),
    color: colors.secondaryTextColor,
    fontFamily: fontFamily.regular,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.semiBold,
    color: colors.primaryTextColor,
    marginBottom: verticalScale(4),
  },
  productDescription: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.regular,
    color: colors.secondaryTextColor,
    marginBottom: verticalScale(8),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  actualPrice: {
    fontSize: fontScale(16),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
    marginRight: moderateScale(8),
  },
  discountPrice: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.medium,
    color: '#FF6B6B',
    textDecorationLine: 'line-through',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
    marginRight: moderateScale(8),
  },
  inStockBadge: {
    backgroundColor: '#E8F5E8',
  },
  outOfStockBadge: {
    backgroundColor: '#FFE8E8',
  },
  statusText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
  },
  inStockText: {
    color: '#4CAF50',
  },
  outOfStockText: {
    color: '#F44336',
  },
  secondHandBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
    backgroundColor: '#FFF3E0',
  },
  secondHandText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: '#FF9800',
  },
});
