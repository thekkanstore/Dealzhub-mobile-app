import React from 'react';
import {StyleSheet, TouchableOpacity, Text, View, StyleProp, TextStyle} from 'react-native';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';

type Props<T> = {
  value: T;
  buttonName: string | React.ReactNode;
  onSelect: (data: T) => void;
  isSelected: boolean;
  disabled?: boolean;
  size?: number;
  textStyle?: StyleProp<TextStyle>;
  color?: string;
};

const TKRadioButton = <T,>({
  value,
  buttonName,
  onSelect,
  disabled,
  isSelected,
  color,
  textStyle,
  size,
}: Props<T>) => {
  const style = useCustomStyle();
  const renderButtonName = () => {
    if (typeof buttonName === 'string') {
      return <Text style={[style.buttonText, textStyle]}>{buttonName}</Text>;
    }
    return buttonName;
  };
  return (
    <View style={style.mainContainer}>
      <TouchableOpacity
        disabled={disabled}
        style={[
          style.buttonContainer,
          size ? {height: size, width: size, borderRadius: size / 2} : undefined,
          color && {borderColor: color},
          isSelected && {borderWidth: 6},
        ]}
        onPress={() => onSelect(value)}>
        <View
          style={[
            style.buttonInnerContainer,
            size ? {height: size / 2, width: size / 2, borderRadius: size / 4} : undefined,
            isSelected && style.buttonInnerContainerSelected,
            isSelected && color && {backgroundColor: color},
          ]}
        />
      </TouchableOpacity>
      {renderButtonName()}
    </View>
  );
};

export default TKRadioButton;

const useCustomStyle = () => {
  return StyleSheet.create({
    mainContainer: {
      flexDirection: 'row',
    },
    buttonContainer: {
      height: moderateScale(18),
      width: moderateScale(18),
      borderRadius: moderateScale(18),
      borderWidth: moderateScale(2),
      borderColor: colors.radioButtonBackgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonInnerContainer: {
      height: moderateScale(9),
      width: moderateScale(9),
      borderRadius: moderateScale(10),
      backgroundColor: colors.transparent,
    },
    buttonInnerContainerSelected: {
      backgroundColor: colors.radioButtonDisabledBackgroundColor,
      borderRadius: moderateScale(10),
    },
    buttonText: {
      fontSize: fontScale(14),
      color: colors.placeHolderTextColor,
      fontFamily: fontFamily.regular,
      marginLeft: moderateScale(6),
      fontWeight: '400',
      lineHeight: fontScale(18),
    },
  });
};
