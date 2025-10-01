import {StyleSheet, View} from 'react-native';
import React from 'react';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import WishlistItems from '../../components/Wishlist/WishlistItems/WishlistItems';

const Wishlist = () => {
  return (
    <View style={styles.container}>
      <TKHeader header={'Wishlist'} />
      <WishlistItems />
    </View>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
});
