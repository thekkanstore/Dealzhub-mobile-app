import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {PhotoQuality} from 'react-native-image-picker';
// import {LXCloseCircleIcon, LXCloudUploadIcon} from '../molecules/svgIcons';
import {
  FilePickerResult,
  FilePickerOptions,
  pickImageFromCamera,
  pickImageFromGallery,
  pickDocument,
  openDocumentViewer,
} from '../../../utils/filePicker';
import {showErrorToast} from '../../../utils/common/toastUtils';
import TKSecondaryTextInput from '../TKSecondaryTextInput/TKSecondaryTextInput';
import TKModal from '../TKModal/TKModal';
import {fontScale, moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';

interface LXFilePickerProps {
  onFilePicked: (file: FilePickerResult) => void;
  allowedTypes?: ('image' | 'pdf' | 'document')[];
  maxSizeInMB?: number;
  minSizeInMB?: number;
  title?: string;
  imageQuality?: PhotoQuality;
  maxImageWidth?: number;
  maxImageHeight?: number;
  value: FilePickerResult | null;
  isRequired?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  onDelete?: () => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const TKFilePicker: React.FC<LXFilePickerProps> = ({
  onFilePicked,
  allowedTypes = ['image', 'pdf'],
  maxSizeInMB = 5,
  minSizeInMB = 0.03, // min 30 kb
  title = 'Select File',
  imageQuality = 0.8 as PhotoQuality,
  maxImageWidth = 1920,
  maxImageHeight = 1920,
  value,
  isRequired = false,
  placeholder = 'Select File',
  isDisabled = false,
  onDelete,
  error = '',
  containerStyle,
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
  };

  const handleViewDocument = async () => {
    if (value) {
      // Use apiUri (web URL) if available, otherwise use local uri
      const documentUri = value.uri || value.apiUri || '';
      await openDocumentViewer(documentUri);
    }
  };
  const handleImagePicker = async (type: 'camera' | 'gallery') => {
    setActiveOption(type);

    const onSuccess = (file: FilePickerResult) => {
      console.log(`${type} picker success:`, file);
      onFilePicked(file);
      setIsShowOptionModal(false);
      setActiveOption(null);
    };

    const onError = (error: string) => {
      console.log(`${type} picker error:`, error);
      showErrorToast(error);
      setActiveOption(null);
    };

    try {
      if (type === 'camera') {
        await pickImageFromCamera(filePickerOptions, onSuccess, onError);
      } else {
        await pickImageFromGallery(filePickerOptions, onSuccess, onError);
      }
    } catch (error) {
      console.error(`Error in handle${type}Picker:`, error);
      onError(`Failed to open ${type}`);
    }
  };

  const handleDocumentPicker = async () => {
    setActiveOption('document');

    const onSuccess = (file: FilePickerResult) => {
      onFilePicked(file);
      setIsShowOptionModal(false);
      setActiveOption(null);
    };

    const onError = (error: string) => {
      showErrorToast(error);
      setActiveOption(null);
    };

    await pickDocument(filePickerOptions, onSuccess, onError);
  };

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
    if (value)
      return (
        <Pressable onPress={() => onDelete?.()} hitSlop={10}>
          {/* <TkCloseCircleIcon color={colors.secondaryTextColor} /> */}
        </Pressable>
      );
    // return <LXCloudUploadIcon height={moderateScale(18)} width={moderateScale(18)} />;
  };
  return (
    <>
      <Pressable
        onPress={() => {
          if (!value) {
            setIsShowOptionModal(true);
            return;
          }
          handleViewDocument();
        }}>
        <TKSecondaryTextInput
          pointerEvents={'none'}
          editable={false}
          value={value ? (value.name ?? 'Document uploaded') : ''}
          isDisabled={isDisabled}
          placeholder={placeholder ?? ''}
          onFocus={() => setIsShowOptionModal(true)}
          label={title}
          isRequired={isRequired}
          rightChild={renderRightChild()}
          error={error}
          containerStyle={containerStyle}
        />
      </Pressable>
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
                !(allowedTypes.includes('pdf') || allowedTypes.includes('document')) &&
                  allowedTypes.includes('image'),
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

          {(allowedTypes.includes('pdf') || allowedTypes.includes('document')) &&
            renderOption(
              'imageGallery',
              'Choose Document',
              handleDocumentPicker,
              false,
              true,
              'document',
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
    // backgroundColor: colors.neutralBackgroundColor,
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
});

export default TKFilePicker;
