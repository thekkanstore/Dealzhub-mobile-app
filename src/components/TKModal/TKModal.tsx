import React, {use, useEffect} from 'react';
import {View, StyleSheet, Text, ViewStyle} from 'react-native';
import Modal from 'react-native-modal';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {getApproximateBottomSafeArea, moderateScale} from '../../config/styles/responsiveSize';
import {colors} from '../../config/styles/colors';
import {fontFamily} from '../../config/styles/fontFamily';
import {KeyboardAwareScrollView, KeyboardController} from 'react-native-keyboard-controller';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import {ToastConfig} from '../TKToastConfig/TKToastConfig';

interface TKModalProps {
  isVisible: boolean;
  onClose: () => void;
  header?: string | React.ReactNode;
  children: React.ReactNode;
  showCloseButton?: boolean;
  headerStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  bodyContainerStyle?: ViewStyle;
  modalStyle?: ViewStyle;
  swipeToClose?: boolean;
  backdropDismiss?: boolean;
  maxHeight?: ViewStyle['height'];
  backdropOpacity?: number;
}

const TKModal: React.FC<TKModalProps> = ({
  isVisible,
  onClose,
  header,
  children,
  showCloseButton = true,
  headerStyle,
  containerStyle,
  modalStyle,
  swipeToClose = true,
  backdropDismiss = true,
  maxHeight = '80%',
  bodyContainerStyle,
  backdropOpacity = 0.7,
}) => {
  const insets = useSafeAreaInsets();
  // Handle keyboard dismiss and animation cleanup when modal hides or screen focus changes
  useEffect(() => {
    if (!isVisible) {
      // Dismiss keyboard immediately when modal becomes invisible
      KeyboardController.dismiss();
    }
  }, [isVisible]);

  /**
   * this condition added to prevent rendering issue of the toast message
   * when modal is not visible even though its in the dom it hiding the toast message
   * so we are checking if the modal is visible or not
   * if not visible then we are returning null
   * this will prevent the rendering of the modal and toast message
   */
  if (!isVisible) return null;

  const renderHeader = () => {
    if (!header && !showCloseButton) return null;

    return (
      <View style={[styles.headerContainer, headerStyle]}>
        <TKRenderIf isRender={!!header}>
          <View style={styles.headerTextContainer}>
            {typeof header === 'string' ? <Text style={styles.headerText}>{header}</Text> : header}
          </View>
        </TKRenderIf>

        <TKRenderIf isRender={!header}>
          <View style={styles.headerTextContainer} />
        </TKRenderIf>

        {/* <TKRenderIf isRender={showCloseButton}>
          <View style={styles.closeIconContainer}>
            <TKIcon name="close" size={14} onPress={onClose} style={styles.closeIcon} />
          </View>
        </TKRenderIf> */}
      </View>
    );
  };
console.log('TKModal rendered with isVisible:', insets);
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={backdropDismiss ? onClose : undefined}
      style={[styles.modalMainContainer, {paddingBottom: insets.bottom + 3}, modalStyle]}
      onSwipeComplete={swipeToClose ? onClose : undefined}
      swipeDirection={swipeToClose ? ['down'] : undefined}
      propagateSwipe={true}
      useNativeDriverForBackdrop={true}
      statusBarTranslucent={true}
      backdropOpacity={backdropOpacity}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={200}
      hideModalContentWhileAnimating={true}>
      <View style={[styles.modalContainer, {maxHeight}, containerStyle]}>
        {renderHeader()}
        <KeyboardAwareScrollView
          style={[styles.bodyContainer, bodyContainerStyle]}
          keyboardShouldPersistTaps={'always'}
          disableScrollOnKeyboardHide={true}
          extraKeyboardSpace={0}
          bottomOffset={0}
          enabled={isVisible}>
          <SafeAreaView style={{flex: 1}}>{children}</SafeAreaView>
        </KeyboardAwareScrollView>
      </View>
      <TKRenderIf isRender={isVisible}>
        <Toast config={ToastConfig} />
      </TKRenderIf>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalMainContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    borderTopLeftRadius: moderateScale(15),
    borderTopRightRadius: moderateScale(15),
  },
  headerContainer: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: moderateScale(1),
    // borderColor: colors.inputBorder,
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: moderateScale(16),
    color: colors.primaryTextColor,
    textAlign: 'left',
    lineHeight: moderateScale(24),
    fontFamily: fontFamily.regular,
    fontWeight: '500',
  },
  closeIconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: moderateScale(24),
  },
  closeIcon: {
    alignSelf: 'flex-end',
  },
  bodyContainer: {
    paddingBottom: getApproximateBottomSafeArea + moderateScale(10),
  },
});

export default TKModal;
