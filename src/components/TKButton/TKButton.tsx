import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {fontScale, moderateScale, verticalScale} from '../../config/styles/responsiveSize';
import {colors} from '../../config/styles/colors';
import {fontFamily} from '../../config/styles/fontFamily';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import {TKUserIcon} from '../Icons/TKUserIcon';
import {TKArrowIcon} from '../Icons/TKArrowIcon';
import {TKBackIcon} from '../Icons/TKBackIcon';
import {TKSearchIcon} from '../Icons/TKSearchIcon';

// Define the possible button types
type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'neutral';

type Props = React.ComponentProps<typeof TouchableOpacity> & {
  title: string | React.ReactNode;
  type?: ButtonType;
  isDisabled?: boolean;
  isLoading?: boolean;
  buttonTextStyle?: StyleProp<TextStyle>;
  rightChild?: React.ReactNode;
};

const TKButton: React.FC<Props> = ({title, type = 'primary', buttonTextStyle, ...props}) => {
  // Choose styles based on button type
  const buttonStyle = getButtonStyles(type);

  const renderHeader = () => {
    if (typeof title === 'string') {
      return <Text style={[styles.buttonText, buttonStyle.text, buttonTextStyle]}>{title}</Text>;
    }
    return title;
  };

  return (
    <TouchableOpacity
      {...props}
      style={[
        styles.container,
        {opacity: props.isDisabled || props.isLoading ? 0.7 : 1},
        buttonStyle.background,
        props.style,
      ]}
      disabled={props.isDisabled || props.isLoading}>
      {renderHeader()}
      <TKUserIcon width={20} height={20} color={buttonStyle.text.color} />
      <TKArrowIcon width={20} height={20} color={buttonStyle.text.color} />
      <TKBackIcon width={20} height={20} color={buttonStyle.text.color} />
      <TKSearchIcon width={20} height={20} color={buttonStyle.text.color} />
      <TKRenderIf isRender={!!props.isLoading}>
        <ActivityIndicator size={20} color={buttonStyle.text.color} style={styles.loader} />
      </TKRenderIf>
      {props.rightChild && <View style={styles.buttonIcon}>{props.rightChild}</View>}
    </TouchableOpacity>
  );
};

// Helper function to get styles based on button type
const getButtonStyles = (type: ButtonType) => {
  switch (type) {
    case 'primary':
      return {
        background: {backgroundColor: colors.primaryButtonBackgroundColor},
        text: {color: colors.secondaryTextColor},
      };
    case 'secondary':
      return {
        background: {backgroundColor: colors.secondaryButtonBackgroundColor},
        text: {color: colors.primaryTextColor},
      };
    case 'tertiary':
      return {
        background: {backgroundColor: colors.tertiaryButtonBackgroundColor},
        text: {color: colors.primaryTextColor},
      };

    case 'neutral':
      return {
        background: {backgroundColor: colors.neutralButtonBackgroundColor},
        text: {color: colors.primaryTextColor},
      };
    default:
      return {
        background: {backgroundColor: colors.primaryButtonBackgroundColor},
        text: {color: colors.primaryTextColor},
      };
  }
};

export default TKButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(30),
  },
  buttonText: {
    fontSize: fontScale(20),
    fontFamily: fontFamily.medium,
    lineHeight: verticalScale(26),
  },
  loader: {
    marginLeft: moderateScale(10),
  },
  buttonIcon: {
    paddingHorizontal: 10,
  },
});
