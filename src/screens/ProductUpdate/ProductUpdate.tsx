import {StyleSheet, View} from 'react-native';
import React from 'react';
import ProductUpdateForm from '../../forms/ProductUpdate/ProductUpdateForm';
import {RouteProp} from '@react-navigation/native';
import {VendorStackParamList} from '../../navigation/rootparamstypes';

interface Props {
  route: RouteProp<VendorStackParamList, 'ProductUpdate'>;
}
const ProductUpdate: React.FC<Props> = () => {
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
