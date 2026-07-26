import {StyleSheet, View} from 'react-native';
import React from 'react';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import WishlistItems from '../../components/Wishlist/WishlistItems/WishlistItems';
import {moderateScale} from '../../config/styles/responsiveSize';
import {useAppSelector} from '../../redux/hooks';
import TKButton from '../../components/Common/TKButton/TKButton';
import {updateGuestStatus} from '../../redux/userSlice';
import {colors} from '../../config/styles/colors';
import {fontFamily} from '../../config/styles/fontFamily';
import {Text} from 'react-native';

const Wishlist = () => {
  const isGuest = useAppSelector(state => state.user.isGuest);

  const handleLoginPress = () => {
    updateGuestStatus(false);
  };

  return (
    <View style={styles.container}>
      <TKHeader header={'Wishlist'} containerStyle={styles.headerContainer} />
      {isGuest ? (
        <View style={styles.guestContainer}>
          <Text style={styles.guestTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.guestSubtitle}>Login or create an account to start adding items to your wishlist.</Text>
          <TKButton title="Login / Register" onPress={handleLoginPress} type="primary" style={styles.loginButton} />
        </View>
      ) : (
        <WishlistItems />
      )}
    </View>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  headerContainer: {
    paddingHorizontal: moderateScale(16),
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(30),
  },
  guestTitle: {
    fontSize: moderateScale(20),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
    marginBottom: moderateScale(10),
  },
  guestSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
    color: colors.secondaryTextColor,
    textAlign: 'center',
    marginBottom: moderateScale(30),
  },
  loginButton: {
    width: '100%',
  },
});
