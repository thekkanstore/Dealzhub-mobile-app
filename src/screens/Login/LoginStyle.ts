import {StyleSheet, Dimensions, Platform, StatusBar} from 'react-native';
import {moderateScale} from '../../config/styles/responsiveSize';
import {fontFamily} from '../../config/styles/fontFamily';
import {colors} from '../../config/styles/colors';

const {width, height} = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: Platform.OS === 'android' ? height + (StatusBar.currentHeight || 0) : height,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  contentWrapper: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(16),
    alignItems: 'center',
  },

  titleText: {
    fontSize: moderateScale(40),
    fontFamily: fontFamily.bold,
    color: colors.tertiaryTextColor,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: moderateScale(16),
    fontFamily: fontFamily.regular,
    color: colors.secondaryTextColor,
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginTop: -10,
    marginBottom: 5,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  bottomContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(20),
    gap: moderateScale(16),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(20),
    gap: moderateScale(8),
  },
  dot: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primaryButtonBackgroundColor,
  },

  googleLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogo: {
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: moderateScale(8),
  },
  signInText: {
    fontSize: moderateScale(16),
    fontFamily: fontFamily.semiBold,
    color: colors.neutralButtonTextColor,
  },
  appleButton: {
    marginHorizontal: 30,
    backgroundColor: '#000000',
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff',
  },
  appleSignInText: {
    fontSize: moderateScale(16),
    fontFamily: fontFamily.semiBold,
    color: '#FFFFFF',
    marginLeft: moderateScale(8),
  },
});
