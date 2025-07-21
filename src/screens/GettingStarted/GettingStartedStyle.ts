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
    position: 'absolute',
    bottom: '20%',
    left: 0,
    right: 0,
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(16),
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: moderateScale(32),
    fontFamily: fontFamily.bold,
    color: colors.tertiaryTextColor,
    textAlign: 'left',
    // lineHeight: moderateScale(38),
  },
  descriptionText: {
    fontSize: moderateScale(16),
    fontFamily: fontFamily.regular,
    color: colors.secondaryTextColor,
    textAlign: 'left',
    lineHeight: moderateScale(22),
    // marginTop: moderateScale(8),
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: moderateScale(20),
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
});
