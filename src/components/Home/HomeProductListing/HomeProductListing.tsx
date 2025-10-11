import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import ProductList from '../../Products/ProductList/ProductList';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {IProductTable} from '../../../config/models/product';
import {fontFamily} from '../../../config/styles/fontFamily';
import {colors} from '../../../config/styles/colors';
import {HeaderTabItem} from '../../Vendor/CategoryHeaderTabBar/CategoryHeaderTabBar';
import {useGetCategoriesList} from '../../../react-queries/categories/categoriesQuery';
import {ICategoryTable} from '../../../config/models/category';
import FastImage from 'react-native-fast-image';
import {HomeScreenNavigationProp} from '../../../navigation/rootparamstypes';

const HomeProductListing = () => {
  const [activeTab, setActiveTab] = React.useState<HeaderTabItem>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const {data: categoriesList} = useGetCategoriesList();
  const handleOnPressItem = (item: IProductTable) => {
    navigation.navigate(navigationStrings.VENDOR_TAB as any, {
      screen: navigationStrings.PRODUCT_DETAILS,
      params: {
        isStackChange: true,
        product: item,
      },
    });
  };

  const handleTabPress = (selectedData: HeaderTabItem) => {
    setActiveTab(selectedData);
    const activeIndex = categoriesList?.findIndex(item => item.id === selectedData.id);
    if (activeIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: activeIndex ?? 0,
        viewPosition: 0.5,
        animated: true,
      });
    }
  };
  const headerTabItem = ({item}: {item: ICategoryTable}) => {
    return (
      <TouchableOpacity onPress={() => handleTabPress(item)} style={[styles.imageContainer]}>
        <FastImage
          source={{uri: item.image}}
          style={[activeTab?.id === item.id ? styles.selectedImage : styles.unselectedImage]}
        />
        <Text style={[styles.tabItemTitle]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={categoriesList ?? []}
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
      <View style={styles.productListContainer}>
        <ProductList
          key={activeTab?.id}
          categoryId={activeTab?.id}
          onProductPress={handleOnPressItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingHorizontal: moderateScale(20),
  },
  imageContainer: {
    width: moderateScale(80),
    gap: moderateScale(5),
    marginRight: moderateScale(8),
  },
  selectedImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(40),
    borderWidth: moderateScale(2),
    borderColor: colors.primaryButtonBackgroundColor,
  },
  unselectedImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(40),
    borderWidth: moderateScale(2),
    borderColor: colors.tertiaryButtonBackgroundColor,
  },
  image: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(40),
  },

  tabContainer: {
    backgroundColor: colors.primaryBackgroundColor,
  },
  productListContainer: {
    flexGrow: 1,
  },
  tabItemTitle: {
    fontSize: fontScale(12),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
  },
});

export default HomeProductListing;
