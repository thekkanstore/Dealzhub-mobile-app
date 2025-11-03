import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  FlatList,
} from 'react-native';
import {PhotoQuality} from 'react-native-image-picker';
import {
  FilePickerResult,
  FilePickerOptions,
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../../utils/filePicker';
import {showErrorToast} from '../../../utils/common/toastUtils';
import TKSecondaryTextInput from '../TKSecondaryTextInput/TKSecondaryTextInput';
import TKModal from '../TKModal/TKModal';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import {TKCloseCircleIcon} from '../Icons/TKCircledCloseIcon';
import {TKCloudUploadIcon} from '../Icons/TKCloudUploadIcon';
import FastImage from 'react-native-fast-image';
import TKRenderIf from '../TKRenderIf/TKRenderIf';

interface LXFilePickerProps {
  onFilePicked: (file: FilePickerResult) => void;
  onFilesPicked?: (files: FilePickerResult[]) => void; // optional multi-select callback
  allowedTypes?: ('image' | 'pdf' | 'document')[];
  maxSizeInMB?: number;
  minSizeInMB?: number;
  title?: string;
  imageQuality?: PhotoQuality;
  maxImageWidth?: number;
  maxImageHeight?: number;
  values: FilePickerResult[]; // optional multi-select values
  isRequired?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  onDelete?: (index?: number) => void; // optional delete for multi-select
  allowMultiple?: boolean; // enable multi-select without breaking existing flow
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  maxSelectable?: number; // optional, defaults to 1
}

const TKFilePicker: React.FC<LXFilePickerProps> = ({
  onFilePicked,
  onFilesPicked,
  allowedTypes = ['image'],
  maxSizeInMB = 10,
  minSizeInMB = 0.03, // min 30 kb
  title = 'Select File',
  imageQuality = 0.9 as PhotoQuality,
  maxImageWidth = 1920,
  maxImageHeight = 1920,
  values,
  isRequired = false,
  placeholder = 'Select File',
  isDisabled = false,
  onDelete,
  allowMultiple = false,
  error = '',
  containerStyle,
  maxSelectable = 5, // optional, defaults to 1
}) => {
  const [isShowOptionModal, setIsShowOptionModal] = useState(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  useEffect(() => {
    if (!isShowOptionModal) {
      setActiveOption(null);
    }
    return () => {
      setActiveOption(null);
    };
  }, [isShowOptionModal]);

  const filePickerOptions: FilePickerOptions = {
    allowedTypes,
    maxSizeInMB,
    minSizeInMB,
    imageQuality,
    maxImageWidth,
    maxImageHeight,
    allowMultiple,
    maxSelectable,
  };

  // const handleViewDocument = async () => {
  //   if (value) {
  //     // Use apiUri (web URL) if available, otherwise use local uri
  //     const documentUri = value?.uri || value?.apiUri || '';
  //     console.log('documentUri:', documentUri, value);
  //     await openDocumentViewer(documentUri);
  //   }
  // };
  const handleImagePicker = async (type: 'camera' | 'gallery') => {
    setActiveOption(type);

    const onSuccess = (file: FilePickerResult) => {
      onFilePicked(file);
      setIsShowOptionModal(false);
      setActiveOption(null);
    };

    const onError = (error: string) => {
      showErrorToast(error);
      setActiveOption(null);
    };

    try {
      if (type === 'camera') {
        await pickImageFromCamera(filePickerOptions, onSuccess, onError);
      } else {
        await pickImageFromGallery(filePickerOptions, onSuccess, onError, files => {
          if (files?.length) {
            if (onFilesPicked) {
              onFilesPicked(files);
            } else {
              onFilePicked(files[0]);
            }
            setIsShowOptionModal(false);
            setActiveOption(null);
          }
        });
      }
    } catch (error) {
      onError(`Failed to open ${type}`);
    }
  };

  // const handleDocumentPicker = async () => {
  //   setActiveOption('document');

  //   const onSuccess = (file: FilePickerResult) => {
  //     onFilePicked(file);
  //     setIsShowOptionModal(false);
  //     setActiveOption(null);
  //   };

  //   const onError = (error: string) => {
  //     showErrorToast(error);
  //     setActiveOption(null);
  //   };

  //   await pickDocument(filePickerOptions, onSuccess, onError, files => {
  //     if (files?.length) {
  //       if (onFilesPicked) {
  //         onFilesPicked(files);
  //       } else {
  //         // Backward compatible fallback: use first selected file
  //         onFilePicked(files[0]);
  //       }
  //       setIsShowOptionModal(false);
  //       setActiveOption(null);
  //     }
  //   });
  // };

  const renderOption = (
    icon: string,
    title: string,
    onPress: () => void,
    disabled = false,
    isLast = false,
    optionId: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.optionContainer,
        disabled && styles.disabledOption,
        isLast && styles.lastOption,
      ]}
      onPress={onPress}
      disabled={disabled || activeOption !== null}
      activeOpacity={0.7}>
      <View style={styles.optionIconContainer}>
        {/* <LXIcon
          name={icon}
          size={24}
          color={disabled ? colors.disabledTextColor : colors.primaryTextColor}
        /> */}
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, disabled && styles.disabledText]}>{title}</Text>
      </View>
      {activeOption === optionId && (
        <ActivityIndicator size="small" color={colors.secondaryTextColor} />
      )}
    </TouchableOpacity>
  );

  const renderRightChild = () => {
    if (isDisabled) return null;
    return <TKCloudUploadIcon />;
  };

  const renderImages = useCallback(
    ({item, index}: {item: FilePickerResult; index: number}) => (
      <View key={`${item.name}-${index}`} style={{margin: moderateScale(4)}}>
        <Pressable onPress={() => onDelete?.(index)} hitSlop={10} style={styles.closeButton}>
          <TKCloseCircleIcon />
        </Pressable>
        <FastImage
          source={{
            uri: item?.apiUri ?? item?.uri ?? '',
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}
          style={styles.image}
        />
      </View>
    ),
    [],
  );

  return (
    <>
      <Pressable
        onPress={() => {
          setIsShowOptionModal(true);
        }}>
        <TKSecondaryTextInput
          pointerEvents={'none'}
          editable={false}
          value={
            values && values.length
              ? `${values.length} file${values.length > 1 ? 's' : ''} selected`
              : ''
          }
          isDisabled={isDisabled || !!(values && values.length)}
          placeholder={placeholder ?? ''}
          onFocus={() => setIsShowOptionModal(true)}
          label={title}
          isRequired={isRequired}
          rightChild={renderRightChild()}
          error={error}
          containerStyle={containerStyle}
        />
      </Pressable>
      <TKRenderIf isRender={!!(values && values.length)}>
        <View style={[styles.imageContainer]}>
          <FlatList
            data={values}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            getItemLayout={(_, index) => ({
              length: moderateScale(160),
              offset: moderateScale(160) * index,
              index,
            })}
            renderItem={renderImages}
          />
        </View>
      </TKRenderIf>
      <TKModal
        isVisible={isShowOptionModal}
        onClose={() => setIsShowOptionModal(false)}
        header={title}
        showCloseButton={true}
        swipeToClose={true}
        backdropDismiss={true}>
        <View style={styles.container}>
          {allowedTypes.includes('image') && (
            <>
              {renderOption(
                'imageGallery',
                'Take Photo',
                () => handleImagePicker('camera'),
                false,
                false,
                'camera',
              )}
              {renderOption(
                'imageGallery',
                'Choose from Gallery',
                () => handleImagePicker('gallery'),
                false,
                !(allowedTypes.includes('pdf') || allowedTypes.includes('document')),
                'gallery',
              )}
            </>
          )}
        </View>
      </TKModal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateScale(10),
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionIconContainer: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.medium,
    color: colors.primaryTextColor,
  },
  optionSubtitle: {
    fontSize: fontScale(14),
    fontFamily: fontFamily.regular,
    color: colors.secondaryTextColor,
  },
  optionArrow: {
    marginLeft: moderateScale(8),
  },
  disabledText: {
    color: colors.disabledTextColor,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  arrowText: {
    fontSize: fontScale(16),
    color: colors.secondaryTextColor,
  },
  imageContainer: {
    marginVertical: moderateScale(10),
    backgroundColor: colors.primaryBackgroundColor,
    borderRadius: moderateScale(6),
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    height: moderateScale(150),
    width: moderateScale(150),
  },
  closeButton: {
    position: 'absolute',
    top: moderateScale(-4),
    right: moderateScale(-4),
    zIndex: 100,
  },
});

export default TKFilePicker;
