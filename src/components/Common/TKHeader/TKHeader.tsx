import React from 'react';
import {Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import {TKArrowIcon} from '../Icons/TKArrowIcon';

type Props = {
  header: string | React.ReactNode;
  rightComponent?: React.ReactNode | string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const TKHeader: React.FC<Props> = ({
  header,
  rightComponent,
  showBackButton = true,
  onBackPress,
  containerStyle,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const renderHeader = () => {
    if (typeof header === 'string') {
      return <Text style={styles.headerText}>{header}</Text>;
    }
    return header;
  };

  const renderRightChild = () => {
    if (typeof rightComponent === 'string') {
      return <Text style={[styles.rightChildText]}>{rightComponent}</Text>;
    }
    return rightComponent;
  };
  return (
    <View style={[styles.mainContainer, containerStyle]}>
      <View style={styles.leftContainer}>
        <TKRenderIf isRender={showBackButton}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <TKArrowIcon width={14} height={14} color={colors.primaryTextColor} direction="left" />
          </Pressable>
        </TKRenderIf>

        <View style={[styles.headerContainer, !showBackButton && {marginLeft: moderateScale(16)}]}>{renderHeader()}</View>
      </View>

      <TKRenderIf isRender={!!rightComponent}>
        <View style={styles.rightContainer}>{renderRightChild()}</View>
      </TKRenderIf>
    </View>
  );
};

export default TKHeader;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primaryBackgroundColor,
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderColor: colors.headerBorder,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: moderateScale(8),
    marginRight: 8,
    backgroundColor: colors.tertiaryButtonBackgroundColor,
    borderRadius: moderateScale(20),
  },
  headerContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
    lineHeight: fontScale(20),
  },
  rightChildText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
    lineHeight: fontScale(20),
    textAlign: 'right',
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
