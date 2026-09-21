import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import Svg, {Rect} from 'react-native-svg';
import {useGetSubCategories} from '../../../react-queries/categories/subcategoryQuery';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {colors} from '../../../config/styles/colors';
import ProductList from '../../Products/ProductList/ProductList';
import {CategoryListHeaderTabs} from '../../../config/common/constants';
import {VendorScreenNavigationProp} from '../../../navigation/rootparamstypes';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {IProductTable} from '../../../config/models/product';
import {navigationStrings} from '../../../navigation/navigationStrings';

export interface HeaderTabItem {
  id?: string;
  title?: string;
  image?: string | null;
  key?: string;
}

interface Props {
  headerTabItems: HeaderTabItem[];
  storeDetails: any;
  isFromProductDetails?: boolean;
  renderStoreDetailsCard?: () => React.ReactNode;
}

const GridIcon = ({color = '#528E6B'}: {color?: string}) => (
  <Svg width={moderateScale(22)} height={moderateScale(22)} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
  </Svg>
);

const CategoryHeaderTabBar: React.FC<Props> = ({
  headerTabItems,
  storeDetails,
  isFromProductDetails,
  renderStoreDetailsCard,
}) => {
  const [activeTab, setActiveTab] = useState(headerTabItems[0]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const navigation = useNavigation<VendorScreenNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const productListRef = useRef<any>(null);

  useEffect(() => {
    if (headerTabItems && headerTabItems.length > 0) {
      const exists = headerTabItems.some(item => item?.id === activeTab?.id);
      if (!exists) {
        setActiveTab(headerTabItems[0]);
      }
    }
  }, [headerTabItems]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerCardHeight, setHeaderCardHeight] = useState(0);
  const [categoryBarHeight, setCategoryBarHeight] = useState(0);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, Math.max(headerCardHeight, 1)],
    outputRange: [0, -Math.max(headerCardHeight, 1)],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const activeIndex = headerTabItems.findIndex(item => item.id === activeTab.id);
    if (activeIndex !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: activeIndex,
          viewPosition: 0.5,
          animated: true,
        });
      }, 100);
    }
  }, [activeTab, headerTabItems]);

  const handleTabPress = (selectedData: HeaderTabItem) => {
    setActiveTab(selectedData);
    setSelectedSubCategoryId(null); // Reset sub-category filter on category tab change
    const activeIndex = headerTabItems.findIndex(item => item.id === selectedData.id);
    if (activeIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: activeIndex,
        viewPosition: 0.5,
        animated: true,
      });
    }
    if (productListRef.current) {
      // @ts-ignore
      const currentY = scrollY._value || 0;
      if (currentY > headerCardHeight && headerCardHeight > 0) {
        productListRef.current.scrollToOffset({
          offset: headerCardHeight,
          animated: false,
        });
      }
    }
  };

  const headerTabItem = ({item}: {item: HeaderTabItem}) => {
    const isActive = activeTab?.id === item?.id;
    return (
      <TouchableOpacity
        onPress={() => handleTabPress(item)}
        activeOpacity={0.8}
        style={[
          styles.categoryCard,
          isActive ? styles.categoryCardActive : styles.categoryCardInactive,
        ]}>
        {item.image ? (
          <View style={styles.imageWrapper}>
            <FastImage
              source={{uri: item.image, priority: FastImage.priority.normal}}
              style={styles.categoryImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
        ) : (
          <View
            style={[
              styles.iconWrapper,
              isActive && {backgroundColor: '#D1E7DD', borderColor: '#528E6B'},
            ]}>
            <GridIcon color={isActive ? colors.primaryTextColor : '#528E6B'} />
          </View>
        )}

        <View style={styles.categoryTitleContainer}>
          <Text
            style={[styles.categoryTitle, isActive && styles.categoryTitleActive]}
            numberOfLines={2}
            ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleOnPressItem = (item: IProductTable) => {
    navigation.navigate(navigationStrings.PRODUCT_DETAILS, {
      isVendor: !isFromProductDetails,
      product: item,
    });
  };

  const showSubCategories = activeTab?.id !== CategoryListHeaderTabs.ALL_PRODUCTS;
  const {data: subCategories = [], refetch} = useGetSubCategories(
    storeDetails?.id || '',
    showSubCategories ? activeTab?.id || '' : '',
  );

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const renderSubCategoriesFilter = () => {
    if (!showSubCategories || subCategories.length === 0) return null;
    return (
      <View style={styles.subCategoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subCategoriesContent}
          bounces={false}>
          <TouchableOpacity
            onPress={() => setSelectedSubCategoryId(null)}
            style={[
              styles.subCategoryChip,
              selectedSubCategoryId === null && styles.subCategoryChipActive,
            ]}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.subCategoryChipText,
                selectedSubCategoryId === null && styles.subCategoryChipTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          {subCategories.map(sub => {
            const isSelected = selectedSubCategoryId === sub.id;
            return (
              <TouchableOpacity
                key={sub.id}
                onPress={() => setSelectedSubCategoryId(sub.id)}
                style={[
                  styles.subCategoryChip,
                  isSelected && styles.subCategoryChipActive,
                ]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.subCategoryChipText,
                    isSelected && styles.subCategoryChipTextActive,
                  ]}>
                  {sub.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (!isFromProductDetails && storeDetails.vendorStatus !== 'approved' && storeDetails.vendorStatus !== 'private') {
    const status = (storeDetails.vendorStatus || '').toLowerCase();
    const isPending = status === 'pending' || !status;
    const isRejected = status === 'rejected';

    return (
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={{paddingBottom: moderateScale(40)}}
        showsVerticalScrollIndicator={false}>
        {renderStoreDetailsCard && renderStoreDetailsCard()}

        <View style={styles.pendingReviewContainer}>
          <View style={[styles.pendingIconCircle, isRejected && styles.rejectedIconCircle]}>
            <Text style={styles.pendingIconEmoji}>{isRejected ? '❌' : isPending ? '⏳' : '🔒'}</Text>
          </View>
          <Text style={styles.pendingReviewTitle}>
            {isRejected ? 'Store Rejected' : isPending ? 'Store Under Review' : 'Store Inactive'}
          </Text>
          <Text style={styles.pendingReviewSubtitle}>
            {isRejected
              ? 'Your store registration was not approved. Please tap "Edit" above to review and update your store details.'
              : isPending
              ? 'Your store registration has been submitted and is currently being reviewed by our team. Once approved, you can start adding products and publishing deals.'
              : 'Your store is currently inactive and hidden from shoppers. Please contact support or update your store information.'}
          </Text>
        </View>
      </ScrollView>
    );
  }

  const totalHeaderHeight = headerCardHeight + categoryBarHeight;

  return (
    <View style={styles.mainContainer}>
      <Animated.View
        style={[
          styles.collapsingHeaderContainer,
          {
            transform: [{translateY: headerTranslateY}],
          },
        ]}>
        {renderStoreDetailsCard && (
          <View
            onLayout={event => {
              const h = event.nativeEvent.layout.height;
              if (h > 0 && h !== headerCardHeight) {
                setHeaderCardHeight(h);
              }
            }}>
            {renderStoreDetailsCard()}
          </View>
        )}

        <View
          onLayout={event => {
            const h = event.nativeEvent.layout.height;
            if (h > 0 && h !== categoryBarHeight) {
              setCategoryBarHeight(h);
            }
          }}>
          <View style={styles.scrollerWrapper}>
            <FlatList
              ref={flatListRef}
              data={headerTabItems}
              renderItem={headerTabItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabContainer}
              bounces={false}
              contentContainerStyle={styles.contentContainerStyle}
              keyExtractor={item => item?.id ?? ''}
              extraData={activeTab}
              onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    viewPosition: 0.5,
                    animated: true,
                  });
                });
              }}
            />
          </View>
          {renderSubCategoriesFilter()}
        </View>
      </Animated.View>

      <ProductList
        ref={productListRef}
        key={`${storeDetails?.id}-${activeTab?.id}-${selectedSubCategoryId ?? 'all'}`}
        storeId={storeDetails?.id ?? ''}
        categoryId={
          activeTab?.id === CategoryListHeaderTabs.ALL_PRODUCTS ? undefined : activeTab?.id
        }
        onProductPress={handleOnPressItem}
        isVendor={!isFromProductDetails}
        selectedSubCategoryId={selectedSubCategoryId}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: totalHeaderHeight > 0 ? totalHeaderHeight : moderateScale(220),
        }}
      />
    </View>
  );
};

export default CategoryHeaderTabBar;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.primaryBackgroundColor || '#FFFFFF',
  },
  collapsingHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.primaryBackgroundColor || '#FFFFFF',
  },
  scrollerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: moderateScale(8),
  },
  contentContainerStyle: {
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
  },
  tabContainer: {
    backgroundColor: 'transparent',
  },
  categoryCard: {
    width: moderateScale(94),
    height: moderateScale(104),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(4),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  categoryCardActive: {
    backgroundColor: '#E5EEE9',
    borderWidth: 2,
    borderColor: colors.primaryTextColor || '#00A859',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  imageWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: moderateScale(4),
    backgroundColor: '#F8FAFC',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  iconWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#E5EEE9',
    borderWidth: 1,
    borderColor: 'rgba(82, 142, 107, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(4),
  },
  categoryTitleContainer: {
    height: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  categoryTitle: {
    fontSize: fontScale(11.5),
    fontFamily: fontFamily.medium,
    color: '#334155',
    textAlign: 'center',
    lineHeight: fontScale(15),
    paddingHorizontal: moderateScale(2),
  },
  categoryTitleActive: {
    fontFamily: fontFamily.bold,
    color: '#1E392A',
  },
  subCategoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: moderateScale(8),
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  subCategoriesContent: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(8),
    flexDirection: 'row',
  },
  subCategoryChip: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(20),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subCategoryChipActive: {
    backgroundColor: colors.primaryTextColor || '#00A859',
    borderColor: colors.primaryTextColor || '#00A859',
  },
  subCategoryChipText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: '#475569',
  },
  subCategoryChipTextActive: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
  },
  pendingReviewContainer: {
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    padding: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pendingIconCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  rejectedIconCircle: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  pendingIconEmoji: {
    fontSize: fontScale(28),
  },
  pendingReviewTitle: {
    fontSize: fontScale(18),
    fontFamily: fontFamily.bold,
    color: '#1F2937',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  pendingReviewSubtitle: {
    fontSize: fontScale(13),
    fontFamily: fontFamily.regular,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: fontScale(20),
    paddingHorizontal: moderateScale(6),
  },
});
