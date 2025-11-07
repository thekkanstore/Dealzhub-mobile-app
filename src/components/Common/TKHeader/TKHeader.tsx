// src/components/Common/TKHeader/TKHeader.tsx
import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import QRCodeSVG from 'react-native-qrcode-svg';

import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import {TKArrowIcon} from '../Icons/TKArrowIcon';
import TKQRCode from '../Icons/TKQRCode';
import TKButton from '../TKButton/TKButton.tsx';

type Props = {
  header: string | React.ReactNode;
  rightComponent?: React.ReactNode | string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  qrValue?: string;
};

const TKHeader: React.FC<Props> = ({
  header,
  rightComponent,
  showBackButton = true,
  onBackPress,
  containerStyle,
  qrValue = 'https://example.com',
}) => {
  const navigation = useNavigation();
  const [qrModalVisible, setQrModalVisible] = useState(false);

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

        <View style={[styles.headerContainer, !showBackButton && {marginLeft: moderateScale(16)}]}>
          {renderHeader()}
        </View>
      </View>

      <TKRenderIf isRender={!!rightComponent}>
        <View style={styles.rightContainer}>
          {renderRightChild()}

          <Pressable
            onPress={() => setQrModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open QR modal"
            style={styles.qrButton}>
            <TKQRCode width={24} height={24} />
          </Pressable>
        </View>
      </TKRenderIf>

      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setQrModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalCenter}>
          <View style={styles.modalContainer}>
            <QRCodeSVG value={qrValue} size={180} />
            <TKButton
              title={'Close'}
              onPress={() => setQrModalVisible(false)}
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  qrButton: {
    padding: moderateScale(4),
  },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCenter: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modalContainer: {
    width: moderateScale(260),
    backgroundColor: colors.primaryBackgroundColor,
    padding: moderateScale(30),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    elevation: 4,
  },
  scanText: {
    textAlign: 'left',
    width: '100%',
    marginBottom: moderateScale(16),
    fontSize: fontScale(24),
    fontWeight: 'bold',
    color: colors.primaryButtonBackgroundColor,
    fontFamily: fontFamily.regular,
  },
  closeButton: {
    marginTop: moderateScale(24),

    width: '100%',
  },
  closeButtonText: {
    color: colors.primaryTextColor,
    fontFamily: fontFamily.bold,
  },
});
