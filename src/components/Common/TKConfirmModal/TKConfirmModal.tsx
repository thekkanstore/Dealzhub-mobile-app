import React from 'react';
import TKModal from '../TKModal/TKModal';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import TKButton from '../TKButton/TKButton';
import {StyleSheet, Text, View} from 'react-native';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {colors} from '../../../config/styles/colors';

type LXConfirmModalProps = {
  isVisible: boolean;
  title: string;
  bodyText: string;
  confirmButtonText: string;
  confirmButtonAction: () => void;
  cancelButtonText?: string;
  cancelButtonAction: () => void;
  isConfirmLoader?: boolean;
};

const TKConfirmModal: React.FC<LXConfirmModalProps> = ({
  title,
  bodyText,
  confirmButtonText,
  confirmButtonAction,
  cancelButtonText,
  cancelButtonAction,
  isVisible,
  isConfirmLoader = false,
}) => {
  return (
    <TKModal
      header={title}
      onClose={cancelButtonAction}
      isVisible={isVisible}
      bodyContainerStyle={style.bodyContainer}>
      <View>
        <Text style={style.bodyText}>{bodyText}</Text>
      </View>
      <TKRenderIf isRender={!!cancelButtonText}>
        <TKButton
          title={cancelButtonText ?? 'Cancel'}
          onPress={cancelButtonAction}
          style={style.MT_20}
          type={'secondary'}
        />
      </TKRenderIf>
      <TKButton
        title={confirmButtonText}
        onPress={confirmButtonAction}
        style={style.MT_20}
        isLoading={isConfirmLoader}
      />
    </TKModal>
  );
};

export default TKConfirmModal;

const style = StyleSheet.create({
  bodyText: {
    fontSize: fontScale(14),
    fontWeight: '500',
    fontFamily: fontFamily.regular,
    lineHeight: fontScale(20),
    color: colors.primaryTextColor,
    marginTop: fontScale(15),
  },
  MT_20: {
    marginTop: 20,
  },
  bodyContainer: {
    paddingHorizontal: moderateScale(16),
  },
});
