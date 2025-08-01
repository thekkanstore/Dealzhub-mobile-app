import React from 'react';
import {View, Text} from 'react-native';
import {colors} from '../../config/styles/colors';
import {fontScale} from '../../config/styles/responsiveSize';
import {fontFamily} from '../../config/styles/fontFamily';

export const ToastConfig = {
  customError: ({text1}: any) => {
    return (
      <View
        style={{
          height: 60,
          width: '90%',
          backgroundColor: colors.errorToastBackgroundColor,
          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}>
        <Text
          style={{
            color: colors.secondaryTextColor,
            fontSize: fontScale(14),
            fontWeight: '400',
            fontFamily: fontFamily.medium,
            flex: 1,
          }}>
          {text1}
        </Text>
      </View>
    );
  },
  customSuccess: ({text1}: any) => (
    <View
      style={{
        height: 60,
        width: '90%',
        backgroundColor: colors.successButtonBackgroundColor,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
      }}>
      <Text
        style={{
          color: colors.secondaryTextColor,
          fontSize: fontScale(14),
          fontWeight: '400',
          fontFamily: fontFamily.regular,
          flex: 1,
        }}>
        {text1}
      </Text>
    </View>
  ),
};
