import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, ScrollView} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
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
}

interface Props {
  headerTabItems: HeaderTabItem[];
  storeDetails: any;
  isFromProductDetails?: boolean;
}
const CategoryHeaderTabBar: React.FC<Props> = ({
  headerTabItems,
  storeDetails,
  isFromProductDetails,
}) => {
  const [activeTab, setActiveTab] = React.useState(headerTabItems[0]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = React.useState<string | null>(null);
  const navigation = useNavigation<VendorScreenNavigationProp>();
  const flatListRef = useRef<FlatList>(null);

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
  };
  const headerTabItem = ({item}: {item: HeaderTabItem}) => {
    return (
      <TouchableOpacity onPress={() => handleTabPress(item)} style={[styles.tabItemContainer]}>
        <Text style={[styles.tabItemTitle]}>{item.title}</Text>
        <View style={activeTab?.id == item?.id ? styles.dividerActive : styles.divider} />
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
    }, [refetch])
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
    return null;
  }
  return (
    <>
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
      {renderSubCategoriesFilter()}
      <View style={{flex: 1}}>
        <ProductList
          key={activeTab?.id}
          storeId={storeDetails?.id ?? ''}
          categoryId={
            activeTab?.id === CategoryListHeaderTabs.ALL_PRODUCTS ? undefined : activeTab?.id
          }
          onProductPress={handleOnPressItem}
          isVendor={!isFromProductDetails}
          selectedSubCategoryId={selectedSubCategoryId}
        />
      </View>
    </>
  );
};

export default CategoryHeaderTabBar;

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingHorizontal: moderateScale(20),
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  tabContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    maxHeight: moderateScale(35),
  },
  selectedBorder: {
    borderBottomWidth: moderateScale(3),
    borderColor: colors.primaryTextColor,
    borderRadius: moderateScale(3),
  },
  divider: {
    height: moderateScale(3),
    width: '105%',
    backgroundColor: colors.transparent,
    borderRadius: moderateScale(10),
    marginTop: moderateScale(3),
  },
  dividerActive: {
    height: moderateScale(3),
    width: '105%',
    backgroundColor: colors.primaryTextColor,
    borderRadius: moderateScale(15),
    marginTop: moderateScale(3),
  },
  tabItemTitle: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
    lineHeight: moderateScale(20),
  },
  subCategoriesContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderColor: colors.headerBorder,
  },
  subCategoriesContent: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
    flexDirection: 'row',
  },
  subCategoryChip: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
    backgroundColor: colors.inputBackgroundSecondary,
    borderWidth: 1,
    borderColor: colors.tertiaryButtonBackgroundColor,
  },
  subCategoryChipActive: {
    backgroundColor: colors.primaryButtonBackgroundColor,
    borderColor: colors.primaryButtonBackgroundColor,
  },
  subCategoryChipText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.medium,
    color: colors.primaryTextColor,
  },
  subCategoryChipTextActive: {
    color: colors.primaryBackgroundColor,
  },
});
