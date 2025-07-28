import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {colors} from '../../config/styles/colors';
import {moderateScale} from '../../config/styles/responsiveSize';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
const TKItemCard: React.FC<Props> = ({children, style}) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

export default TKItemCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardItemBackground,
    borderRadius: moderateScale(28),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    // iOS Shadow                                        │ │
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    // Android Shadow
    elevation: 5,
  },
});
