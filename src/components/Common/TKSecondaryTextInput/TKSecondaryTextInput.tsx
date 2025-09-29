import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import {stylesUtils} from '../../../utils/styles/styles';

type TKTextInputProps = TextInputProps & {
  // Optional label for the input
  label?: string;
  isRequired?: boolean;
  // Children to render on the left (icon, component, etc.)
  leftChild?: React.ReactNode;
  // Children to render on the right (icon, component, etc.)
  rightChild?: React.ReactNode | string;
  // Optional helper text below the input
  helperText?: string;
  // Optional error message
  error?: string;
  // Custom container style
  containerStyle?: StyleProp<ViewStyle>;
  // Custom input style
  inputStyle?: StyleProp<TextStyle>;
  // Custom helper text style
  helperTextStyle?: StyleProp<TextStyle>;
  // Custom error text style
  errorTextStyle?: StyleProp<TextStyle>;
  // Whether to show the right content area, even if rightChild is not provided
  showRightSpace?: boolean;
  // Whether to show the left content area, even if leftChild is not provided
  showLeftSpace?: boolean;
  wrapperStyle?: StyleProp<ViewStyle>;
  rightChildContainerStyle?: StyleProp<ViewStyle>;
  isDisabled?: boolean;
};

const TKSecondaryTextInput: React.FC<TKTextInputProps> = ({
  label,
  isRequired,
  leftChild,
  rightChild,
  helperText,
  error,
  containerStyle,
  inputStyle,
  helperTextStyle,
  errorTextStyle,
  showRightSpace = false,
  showLeftSpace = false,
  wrapperStyle,
  rightChildContainerStyle,
  isDisabled = false,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (restProps.onFocus) {
      restProps.onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (restProps.onBlur) {
      restProps.onBlur(e);
    }
  };

  const renderRightChild = () => {
    if (typeof rightChild === 'string') {
      return <Text style={[styles.rightChildText]}>{rightChild}</Text>;
    }
    return rightChild;
  };
  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <TKRenderIf isRender={!!label}>
        <View style={styles.labelContainer}>
          <Text style={[styles.labelText, isDisabled && styles.labelDisableColor]}>
            {label}
            <Text style={styles.requiredText}>{isRequired && ' *'}</Text>
          </Text>
        </View>
      </TKRenderIf>
      <View
        style={[
          styles.container,
          isFocused && styles.focusedContainer,
          !!error && styles.errorContainer,
          isDisabled && styles.disabledContainer,
          containerStyle,
        ]}>
        {/* Left child area */}
        <TKRenderIf isRender={!!leftChild || showLeftSpace}>
          <View style={styles.leftChildContainer}>{leftChild}</View>
        </TKRenderIf>

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            !leftChild && !showLeftSpace && styles.inputWithoutLeftPadding,
            !rightChild && !showRightSpace && styles.inputWithoutRightPadding,
            inputStyle,
            isDisabled && {color: colors.primaryTextColor},
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.placeHolderTextColor}
          {...restProps}
        />

        {/* Right child area */}
        <TKRenderIf isRender={!!rightChild || showRightSpace}>
          <View style={[styles.rightChildContainer, rightChildContainerStyle]}>
            {renderRightChild()}
          </View>
        </TKRenderIf>
      </View>

      {/* Helper text or error message */}
      <TKRenderIf isRender={!!helperText || !!error}>
        <Text
          style={[
            styles.helperText,
            !!error && styles.errorText,
            helperText && helperTextStyle,
            error && errorTextStyle,
          ]}>
          {error ? error : helperText}
        </Text>
      </TKRenderIf>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: verticalScale(16),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(10),
    backgroundColor: colors.inputBackgroundSecondary,
    height: verticalScale(45),
    width: '100%',
    ...stylesUtils.darkShadow({
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1.5,
    }),
  },
  disabledContainer: {
    backgroundColor: colors.backgroundContainerLight,
    borderColor: colors.inputDisabledBackground,
  },
  labelContainer: {
    marginBottom: verticalScale(4),
  },
  focusedContainer: {
    borderColor: colors.inputBorder,
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  leftChildContainer: {
    paddingLeft: moderateScale(16),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightChildContainer: {
    paddingHorizontal: moderateScale(10),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(10),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
    fontSize: fontScale(14),
  },
  rightChildText: {
    flex: 1,
    paddingVertical: verticalScale(10),
    fontFamily: fontFamily.regular,
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
  },
  inputWithoutLeftPadding: {
    paddingLeft: moderateScale(16),
  },
  inputWithoutRightPadding: {
    paddingRight: moderateScale(16),
  },
  helperText: {
    marginTop: verticalScale(4),
    marginLeft: moderateScale(4),
    fontSize: moderateScale(14),
    color: colors.secondaryTextColor,
    fontFamily: fontFamily.regular,
  },
  errorText: {
    color: colors.errorTextColor,
  },
  labelText: {
    fontSize: moderateScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.semiBold,
  },
  labelDisableColor: {
    color: colors.disabledTextColor,
  },
  requiredText: {
    color: colors.errorTextColor,
    fontFamily: fontFamily.regular,
    fontSize: moderateScale(14),
  },
});

export default TKSecondaryTextInput;
