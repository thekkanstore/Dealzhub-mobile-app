import {StyleSheet, View} from 'react-native';
import React from 'react';
import {colors} from '../../../config/styles/colors';
import ProductList from '../../Products/ProductList/ProductList';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {useNavigation, NavigationProp, ParamListBase} from '@react-navigation/native';
import {navigationStrings} from '../../../navigation/navigationStrings';
import {IProductTable} from '../../../config/models/product';

const HomeProductListing = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const handleOnPressItem = (item: IProductTable) => {
    navigation.navigate(navigationStrings.VENDOR_TAB as any, {
      screen: navigationStrings.PRODUCT_DETAILS,
      params: {
        productId: item.id,
        isStackChange: true,
      },
    });
  };
  return (
    <View style={styles.container}>
      <ProductList isActive onProductPress={handleOnPressItem} />
    </View>
  );
};

export default HomeProductListing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryBackgroundColor,
    gap: moderateScale(16),
  },
});
