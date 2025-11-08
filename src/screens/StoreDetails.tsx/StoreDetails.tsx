import {StyleSheet, View} from 'react-native';
import React from 'react';
import StoreDetailsForm from '../../forms/StoreDetails/StoreDetailsForm';

const StoreDetails = () => {
  return (
    <View style={styles.container}>
      <StoreDetailsForm />
    </View>
  );
};

export default StoreDetails;

const styles = StyleSheet.create({
  container: {flex: 1},
});
