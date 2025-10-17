import {StyleSheet, View} from 'react-native';
import React from 'react';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import CartItemsComponent from '../../components/Cart/CartItems/CartItems';
import {moderateScale} from '../../config/styles/responsiveSize';

const Cart = () => {
  return (
    <View style={styles.container}>
      <TKHeader header={strings('labels.myCart')} containerStyle={styles.headerContainer} />
      <CartItemsComponent />
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  headerContainer: {
    paddingHorizontal: moderateScale(16),
  },
});
