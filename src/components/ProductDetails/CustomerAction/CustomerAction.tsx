import {StyleSheet} from 'react-native';
import React from 'react';
import TKButton from '../../Common/TKButton/TKButton';
import {strings} from '../../../utils/language/langauageUtils';

const CustomerAction = () => {
  return (
    <>
      <TKButton title={strings('button.addToCart')} type={'secondary'} style={styles.button} />
      <TKButton title={strings('button.buyNow')} type={'primary'} style={styles.button} />
    </>
  );
};

export default CustomerAction;

const styles = StyleSheet.create({
  button: {
    width: '45%',
  },
});
