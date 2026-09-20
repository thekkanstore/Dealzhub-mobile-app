// src/components/Common/TKHeader/TKHeader.tsx
import React from 'react';
import {Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import {TKArrowIcon} from '../Icons/TKArrowIcon';
import TKQRCode from '../Icons/TKQRCode';

type Props = {
  header: string | React.ReactNode;
  rightComponent?: React.ReactNode | string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  qrValue?: string;
  onQRPress?: () => void;
  logoUri?: string;
  storeInitial?: string;
};

const TKHeader: React.FC<Props> = ({
  header,
  rightComponent,
  showBackButton = true,
  onBackPress,
  containerStyle,
  qrValue,
  onQRPress,
  logoUri,
  storeInitial,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('BottomTabStack', {screen: 'HomeTab'});
    }
  };

  const handleQRPress = () => {
    if (onQRPress) {
      onQRPress();
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

        <View style={[styles.headerContainer, !showBackButton && {marginLeft: moderateScale(16)}]}>
          <View style={styles.titleRow}>
            {!!logoUri ? (
              <Image source={{uri: logoUri}} style={styles.logoImage} resizeMode="cover" />
            ) : !!storeInitial ? (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>{storeInitial.toUpperCase()}</Text>
              </View>
            ) : null}
            <View style={styles.titleTextWrapper}>{renderHeader()}</View>
          </View>
        </View>
      </View>

      <TKRenderIf isRender={!!rightComponent || !!qrValue}>
        <View style={styles.rightContainer}>
          {renderRightChild()}

          <TKRenderIf isRender={!!qrValue}>
            <Pressable
              onPress={handleQRPress}
              accessibilityRole="button"
              accessibilityLabel="Open QR screen"
              style={styles.qrButton}>
              <TKQRCode width={24} height={24} />
            </Pressable>
          </TKRenderIf>
        </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  logoImage: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoFallback: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    color: '#064E3B',
    fontFamily: fontFamily.bold,
    fontSize: fontScale(13),
  },
  titleTextWrapper: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  qrButton: {
    padding: moderateScale(4),
  },
});
