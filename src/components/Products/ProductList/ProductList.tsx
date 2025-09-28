import React, {useCallback} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import {useGetProductsList} from '../../../react-queries/product/productQueries';
import {IProductTable} from '../../../config/models/product';
import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKRenderIf from '../../Common/TKRenderIf/TKRenderIf';
import ProductCard from '../ProductCard/ProductCard';
import TKNoProductFound from '../../Common/TKNoProductFound/TKNoProductFound';
import {strings} from '../../../utils/language/langauageUtils';

interface ProductListProps {
  storeId?: string;
  categoryId?: string;
  limit?: number;
  onProductPress?: (product: IProductTable) => void;
  isActive?: boolean;
  isVendor?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const ProductList: React.FC<ProductListProps> = ({
  storeId,
  categoryId,
  limit = 10,
  onProductPress,
  ListHeaderComponent,
  ListFooterComponent,
  isActive,
  isVendor,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useGetProductsList({storeId, categoryId, limit, isActive});

  // Flatten all pages into a single array
  const products = data?.pages.flatMap(page => page.products) || [];

  const renderProduct: ListRenderItem<IProductTable> = useCallback(
    ({item}) => (
      <ProductCard product={item} onPress={() => onProductPress?.(item)} isVendor={isVendor} />
    ),
    [onProductPress],
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <TKRenderIf isRender={isFetchingNextPage}>
        <ActivityIndicator
          size="small"
          color={colors.primaryButtonBackgroundColor}
          style={styles.loader}
        />
      </TKRenderIf>
      <TKRenderIf isRender={!hasNextPage && products.length > 0}>
        <Text style={styles.endText}>No more products</Text>
      </TKRenderIf>
      {ListFooterComponent && typeof ListFooterComponent === 'function' && <ListFooterComponent />}
      {ListFooterComponent && typeof ListFooterComponent !== 'function' && ListFooterComponent}
    </View>
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryButtonBackgroundColor} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <TKNoProductFound
          title={
            error ? strings('labels.failedToLoadProducts') : strings('labels.sorryNoResultFound')
          }
        />
      }
      numColumns={2}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          colors={[colors.primaryButtonBackgroundColor]}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      // style={{flex: 1, backgroundColor: 'red'}}
    />
  );
};

export default ProductList;

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
