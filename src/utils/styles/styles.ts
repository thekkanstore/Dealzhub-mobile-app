import {Platform} from 'react-native';
import {moderateScale} from '../../config/styles/responsiveSize';
import {colors} from '../../config/styles/colors';

export const stylesUtils = {
  darkShadow: ({
    elevation = 10,
    shadowOffset = {width: 0.5, height: 0.5},
    shadowOpacity = 0.12,
    shadowRadius = moderateScale(1),
  }: {
    elevation?: number;
    shadowOffset?: {width: number; height: number};
    shadowOpacity?: number;
    shadowRadius?: number;
  } = {}) => {
    if (Platform.OS === 'android') {
      return {
        elevation,
        shadowColor: colors.darkTextColor,
      };
    }
    return {
      shadowColor: colors.darkTextColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    };
  },
};
