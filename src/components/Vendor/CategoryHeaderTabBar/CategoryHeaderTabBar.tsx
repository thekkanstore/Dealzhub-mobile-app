import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {colors} from '../../../config/styles/colors';
import ProductList from '../../Products/ProductList/ProductList';
import {CategoryListHeaderTabs} from '../../../config/common/constants';

export interface HeaderTabItem {
  id?: string;
  title?: string;
}

interface Props {
  selectedTab: HeaderTabItem | null;
  headerTabItems: HeaderTabItem[];
  storeDetails: any;
}
const CategoryHeaderTabBar: React.FC<Props> = ({selectedTab, headerTabItems, storeDetails}) => {
  const [activeTab, setActiveTab] = React.useState(headerTabItems[0]);
  //   const navigation = useNavigation<OrderStackNavigationProp>();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (selectedTab) {
      setActiveTab(selectedTab);
      //   navigation.setParams({initialTab: null});
    }
  }, [selectedTab]);

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
      <View style={{flex: 1}}>
        <ProductList
          key={activeTab?.id}
          storeId={storeDetails?.id ?? ''}
          categoryId={
            activeTab?.id === CategoryListHeaderTabs.ALL_PRODUCTS ? undefined : activeTab?.id
          } // optional
          limit={2}
          onProductPress={product => {
            // Handle product selection
            console.log('Selected product:', product.name);
          }}
        />
      </View>
    </>
  );
};

export default CategoryHeaderTabBar;

const styles = StyleSheet.create({
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
  },
  tabContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    paddingHorizontal: moderateScale(16),
    maxHeight: moderateScale(35),
  },
  selectedBorder: {
    borderBottomWidth: moderateScale(3),
    borderColor: colors.primaryTextColor,
    borderRadius: moderateScale(3),
  },
  divider: {
    height: moderateScale(3),
    width: '115%',
    backgroundColor: colors.transparent,
    borderRadius: moderateScale(10),
    marginTop: moderateScale(3),
  },
  dividerActive: {
    height: moderateScale(3),
    width: '115%',
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
});
