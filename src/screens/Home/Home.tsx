import React from 'react';
import {StyleSheet, View} from 'react-native';
import LocationBar from './components/LocationBar/LocationBar';
import {colors} from '../../config/styles/colors';
import {moderateScale} from '../../config/styles/responsiveSize';

const Home = () => {
  return (
    <View style={styles.container}>
      <LocationBar />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(16),
  },
});
