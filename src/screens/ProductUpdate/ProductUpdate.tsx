import {StyleSheet, View} from 'react-native';
import React from 'react';
import ProductUpdateForm from '../../forms/ProductUpdate/ProductUpdateForm';

const ProductUpdate = () => {
  return (
    <View style={styles.container}>
      <ProductUpdateForm />
    </View>
  );
};

export default ProductUpdate;

const styles = StyleSheet.create({
  container: {flex: 1},
});
