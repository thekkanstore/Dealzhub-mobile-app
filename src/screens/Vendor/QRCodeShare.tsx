import React, {useCallback, useEffect, useRef} from 'react';
import {Alert, Image, Platform, StyleSheet, Text, View} from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import {captureRef} from 'react-native-view-shot';
import Share from 'react-native-share';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import RNFS from 'react-native-fs';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import TKButton from '../../components/Common/TKButton/TKButton';
import {colors} from '../../config/styles/colors';
import {fontScale, moderateScale} from '../../config/styles/responsiveSize';
import {fontFamily} from '../../config/styles/fontFamily';
import {strings} from '../../utils/language/langauageUtils';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {VendorStackParamList} from '../../navigation/rootparamstypes';

interface Props {
  route: RouteProp<VendorStackParamList, 'QRCodeShare'>;
}

const QRCodeShare: React.FC<Props> = ({route}) => {
  const {qrValue, storeName, storeLogo} = route.params;
  const navigation = useNavigation();
  const qrRef = useRef<View>(null);
  const qrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (!qrValue) {
      Alert.alert(
        strings('labels.error') || 'Error',
        'Store QR Code and sharing are strictly available for registered stores with completed payment.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    }
  }, [qrValue, navigation]);

  const captureQRCode = useCallback(async (): Promise<string | null> => {
    try {
      if (!qrRef.current) {
        return null;
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      return await captureRef(qrRef.current, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error capturing QR code:', error);
      return null;
    }
  }, []);

  const handleDownload = async () => {
    try {
      // Request storage permission for Android
      if (Platform.OS === 'android') {
        if (Number(Platform.Version) < 33) {
          const permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

          const result = await check(permission);
          if (result !== RESULTS.GRANTED) {
            const requestResult = await request(permission);
            if (requestResult !== RESULTS.GRANTED) {
              Alert.alert(
                strings('labels.permissionDenied'),
                strings('labels.storagePermissionRequired'),
              );
              return;
            }
          }
        }
      }

      // Capture the QR code
      const uri = await captureQRCode();

      if (!uri) {
        Alert.alert(strings('labels.error'), strings('labels.qrCodeNotReady'));
        return;
      }

      // Save to storage
      const fileName = `${storeName?.replace(/\s+/g, '_') || 'store'}_QR_${Date.now()}.png`;
      const destPath = `${
        Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath
      }/${fileName}`;

      if (uri.startsWith('data:')) {
        const base64Data = uri.split(',')[1];
        await RNFS.writeFile(destPath, base64Data, 'base64');
      } else {
        let sourcePath = uri;
        if (uri.startsWith('file://')) {
          sourcePath = uri.replace('file://', '');
        }

        const pathsToTry = [
          sourcePath,
          uri,
          Platform.OS === 'android' ? sourcePath.replace(/^\//, '') : sourcePath,
        ];

        let sourceExists = false;
        let validPath = sourcePath;

        for (const path of pathsToTry) {
          try {
            const exists = await RNFS.exists(path);
            if (exists) {
              sourceExists = true;
              validPath = path;
              break;
            }
          } catch (e) {
            /* empty */
          }
        }

        if (!sourceExists) {
          const base64Uri = await captureRef(qrRef.current!, {
            format: 'png',
            quality: 1,
            result: 'base64',
          });
          await RNFS.writeFile(destPath, base64Uri, 'base64');
        } else {
          await RNFS.copyFile(validPath, destPath);
        }
      }

      Alert.alert(
        strings('labels.success'),
        `${strings('labels.qrCodeSaved')} ${Platform.OS === 'ios' ? 'Documents' : 'Downloads'}`,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving QR code:', error);
      Alert.alert(strings('labels.error'), strings('labels.failedToSaveQRCode'));
    }
  };

  const handleShare = async () => {
    try {
      // Capture the QR code
      const uri = await captureQRCode();

      if (!uri) {
        Alert.alert(strings('labels.error'), strings('labels.qrCodeNotReady'));
        return;
      }

      // Prepare the share URL - always create a proper file in cache
      const fileName = `${storeName?.replace(/\s+/g, '_') || 'store'}_QR_${Date.now()}.png`;
      const tempPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // Handle different URI formats and always write to a reliable temp path
      if (uri.startsWith('data:')) {
        // Convert data URL to temporary file for sharing
        const base64Data = uri.split(',')[1];
        await RNFS.writeFile(tempPath, base64Data, 'base64');
      } else {
        // Try to handle file path, but fallback to base64 if it fails
        let sourcePath = uri;
        if (uri.startsWith('file://')) {
          sourcePath = uri.replace('file://', '');
        }

        // Check if the source file exists and is a valid path
        let fileExists = false;
        try {
          // Validate the path looks reasonable (contains only valid characters)
          if (sourcePath && sourcePath.length > 5 && /^[/\w\-._]+$/.test(sourcePath)) {
            fileExists = await RNFS.exists(sourcePath);
          }
        } catch (e) {
          fileExists = false;
        }

        if (fileExists) {
          // Copy the existing file to temp location
          await RNFS.copyFile(sourcePath, tempPath);
        } else {
          // Fallback: Re-capture as base64 if the temp file is invalid
          const base64Uri = await captureRef(qrRef.current!, {
            format: 'png',
            quality: 1,
            result: 'base64',
          });
          await RNFS.writeFile(tempPath, base64Uri, 'base64');
        }
      }

      // Verify the final file exists
      const finalFileExists = await RNFS.exists(tempPath);
      if (!finalFileExists) {
        Alert.alert(strings('labels.error'), strings('labels.failedToGenerateQRFile'));
        return;
      }

      // Share options
      const shareOptions = {
        title: `${strings('labels.shareStore')} - ${storeName}`,
        message: `${strings('labels.checkOutMyStore')}: ${storeName}\n${qrValue}`,
        url: Platform.OS === 'android' ? `file://${tempPath}` : tempPath,
        type: 'image/png',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error: any) {
      if (error?.message !== 'User did not share' && !error?.message?.includes('cancel')) {
        // eslint-disable-next-line no-console
        console.error('Error sharing QR code:', error);
        Alert.alert(strings('labels.error'), strings('labels.failedToShareQRCode'));
      }
    }
  };

  return (
    <View style={styles.container}>
      <TKHeader
        containerStyle={styles.headerContainer}
        header={strings('labels.shareYourStore')}
        showBackButton
      />

      <View style={styles.content}>
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper} ref={qrRef} collapsable={false}>
            {/* Store Logo */}
            <View style={styles.logoWrapper}>
              {storeLogo ? (
                <Image source={{uri: storeLogo}} style={styles.storeLogo} resizeMode="cover" />
              ) : (
                <View style={styles.storeLogoFallback}>
                  <Text style={styles.storeLogoFallbackText}>
                    {storeName ? storeName.charAt(0).toUpperCase() : 'S'}
                  </Text>
                </View>
              )}
            </View>

            {/* Store Name & Subtitle */}
            <Text style={styles.storeName}>{storeName || strings('labels.myStore')}</Text>
            <Text style={styles.scanSubtitle}>Scan to visit our store</Text>

            {/* QR Code SVG */}
            <View style={styles.qrInnerBox}>
              <QRCodeSVG
                value={qrValue || 'https://dealzhub.co.in'}
                size={moderateScale(190)}
                getRef={ref => (qrCodeRef.current = ref)}
              />
            </View>

            {/* DealzHub Footer Badge */}
            <View style={styles.dealzhubBadge}>
              <Image
                source={require('../../assets/images/appLogo.png')}
                style={styles.dealzhubLogo}
                resizeMode="contain"
              />
              <Text style={styles.dealzhubText}>DealzHub</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TKButton
            title={strings('labels.share')}
            onPress={handleShare}
            style={styles.shareButton}
          />
          <TKButton
            title={strings('labels.download')}
            onPress={handleDownload}
            type="secondary"
            style={styles.downloadButton}
          />
        </View>
      </View>
    </View>
  );
};

export default QRCodeShare;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: moderateScale(20),
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(16),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    width: '90%',
    maxWidth: moderateScale(320),
  },
  logoWrapper: {
    marginBottom: moderateScale(10),
  },
  storeLogo: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  storeLogoFallback: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeLogoFallbackText: {
    color: '#064E3B',
    fontFamily: fontFamily.bold,
    fontSize: fontScale(24),
  },
  storeName: {
    fontSize: fontScale(18),
    fontFamily: fontFamily.bold,
    color: colors.primaryTextColor,
    textAlign: 'center',
    marginBottom: moderateScale(2),
  },
  scanSubtitle: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: moderateScale(16),
  },
  qrInnerBox: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(8),
    borderRadius: moderateScale(12),
  },
  dealzhubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    marginTop: moderateScale(16),
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
    justifyContent: 'center',
  },
  dealzhubLogo: {
    width: moderateScale(18),
    height: moderateScale(18),
  },
  dealzhubText: {
    fontSize: fontScale(12),
    fontFamily: fontFamily.semiBold,
    color: '#064E3B',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(12),
  },
  shareButton: {
    width: '100%',
  },
  downloadButton: {
    width: '100%',
  },
  headerContainer: {
    paddingLeft: moderateScale(16),
  },
});
