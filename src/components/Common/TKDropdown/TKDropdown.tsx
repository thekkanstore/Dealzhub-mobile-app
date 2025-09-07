import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Pressable, FlatList} from 'react-native';
import {
  fontScale,
  getApproximateBottomSafeArea,
  moderateScale,
  moderateScaleVertical,
} from '../../../config/styles/responsiveSize';
import Modal from 'react-native-modal';
import TKRenderIf from '../TKRenderIf/TKRenderIf';
import {strings} from '../../../utils/language/langauageUtils';
import {fontFamily} from '../../../config/styles/fontFamily';
import {colors} from '../../../config/styles/colors';
import TKSecondaryTextInput from '../TKSecondaryTextInput/TKSecondaryTextInput';

type TKDropdownProps<T> = {
  data: T[] | [];
  labelKey: keyof T;
  isVisible: boolean;
  label?: string;
  onPress: (item: T) => void;
  selectedItem: T | null;
  isDisabled?: boolean;
  leftChild?: React.ReactNode;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
};

const TKDropdown = <T,>({
  data,
  labelKey,
  isVisible,
  onPress,
  selectedItem,
  isDisabled,
  label: title,
  leftChild,
  placeholder,
  isRequired,
  error,
}: TKDropdownProps<T>) => {
  const [isDropdownVisible, setDropdownVisible] = useState(isVisible);
  return (
    <View>
      <Pressable onPress={() => setDropdownVisible(true)} disabled={isDisabled}>
        <TKSecondaryTextInput
          pointerEvents={'none'}
          editable={false}
          value={(selectedItem?.[labelKey] as string) || ''}
          isDisabled={isDisabled}
          // rightChild={
          //   <TKIcon name={'dropDown'} size={moderateScale(14)} color={colors.primaryTextColor} />
          // }
          placeholder={placeholder ?? ''}
          onFocus={() => setDropdownVisible(true)}
          label={title}
          isRequired={isRequired}
          leftChild={leftChild}
          error={error}
        />
      </Pressable>
      <Modal
        isVisible={isDropdownVisible}
        onBackdropPress={() => setDropdownVisible(false)}
        style={styles.modalMainContainer}
        onSwipeComplete={() => setDropdownVisible(false)}
        swipeDirection={['down']}
        propagateSwipe={true}
        useNativeDriverForBackdrop={true}>
        <View style={styles.modalContainer}>
          <View style={styles.titleContainer}>
            <TKRenderIf isRender={!!title}>
              <Text style={styles.titleText}>{title}</Text>
            </TKRenderIf>
            {/* <TKIcon
              name="close"
              size={14}
              onPress={() => setDropdownVisible(false)}
              style={styles.closeIcon}
            /> */}
          </View>
          <FlatList
            data={data}
            renderItem={({item, index}) => (
              <TouchableOpacity
                onPress={() => {
                  onPress(item);
                  setDropdownVisible(false);
                }}
                style={[styles.itemContainer, data.length - 1 === index && styles.itemBorder]}>
                <TKRenderIf isRender={!!leftChild}>{leftChild}</TKRenderIf>
                <Text style={styles.itemText}>{item[labelKey] as string}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            bounces={false}
            ListEmptyComponent={() => (
              <Text style={styles.noitemText}>{strings('validations.noOptionsFound')}</Text>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalMainContainer: {margin: 0, justifyContent: 'flex-end'},
  modalContainer: {
    backgroundColor: colors.primaryBackgroundColor,
    maxHeight: '44%',
    borderTopLeftRadius: moderateScale(15),
    borderTopRightRadius: moderateScale(15),
    paddingBottom: getApproximateBottomSafeArea,
  },
  titleContainer: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: moderateScale(1),
    borderColor: colors.inputBorder,
  },
  titleText: {
    fontSize: moderateScale(16),
    color: colors.darkTextColor,
    textAlign: 'left',
    lineHeight: moderateScale(24),
    fontFamily: fontFamily.regular,
    fontWeight: '500',
  },
  itemBorder: {
    borderBottomWidth: moderateScale(0),
  },
  closeIcon: {
    marginLeft: 'auto',
  },
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: moderateScale(1),
    borderColor: colors.inputBorder,
    marginVertical: moderateScaleVertical(10),
    height: moderateScaleVertical(40),
    paddingHorizontal: moderateScale(20),
  },
  itemText: {
    fontFamily: fontFamily.regular,
    fontSize: fontScale(14),
    fontWeight: '500',
    lineHeight: fontScale(22),
  },
  noitemText: {
    fontFamily: fontFamily.medium,
    fontSize: fontScale(14),
    fontWeight: '500',
    lineHeight: fontScale(22),
    alignSelf: 'center',
    marginVertical: moderateScale(30),
  },
});

export default TKDropdown;
