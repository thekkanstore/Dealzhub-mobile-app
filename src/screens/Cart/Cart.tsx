import {View} from 'react-native';
import React from 'react';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import CartItemsComponent from '../../components/Cart/CartItems/CartItems';

const Cart = () => {
  return (
    <View>
      <TKHeader header={strings('labels.myCart')} />
      <CartItemsComponent />
    </View>
  );
};

export default Cart;
