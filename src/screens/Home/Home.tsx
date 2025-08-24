import React from 'react';
import {StyleSheet, View} from 'react-native';
import LocationBar from '../../components/Home/LocationBar/LocationBar';
import {colors} from '../../config/styles/colors';
import {moderateScale} from '../../config/styles/responsiveSize';
import TKTextInput from '../../components/Common/TKTextInput/TKTextInput';
import TKSecondaryTextInput from '../../components/Common/TKSecondaryTextInput/TKSecondaryTextInput';

const Home = () => {
  return (
    <View style={styles.container}>
      <LocationBar />
      <TKTextInput />
      <TKSecondaryTextInput />
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
