import React, {useState} from 'react';
import {ImageBackground, Text, View, Dimensions, Image} from 'react-native';

import {imagePath} from '../../assets/imagePath';
import TKStatusBar from '../../components/Common/TKStatusBar/TKStatusBar';
import {strings} from '../../utils/language/langauageUtils';
import {useSafeAreaBottom} from '../../providers/SafeAreaProvider';
import LinearGradient from 'react-native-linear-gradient';
import {styles} from './LoginStyle';
import authService from '../../services/auth/authService';
import TKButton from '../../components/Common/TKButton/TKButton';
import {useAppSelector} from '../../redux/hooks';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';

const {width} = Dimensions.get('window');
// TODO: Replace with valid demo account credentials created in Firebase Console
const DEMO_EMAIL = 'reviewer@dealzhub.com';
const DEMO_PASSWORD = 'Reviewer123!';

const Login = () => {
  const bottomPadding = useSafeAreaBottom(50);
  const [isLoading, setIsLoading] = useState(false);
  const appConfig = useAppSelector(state => state.sessionStates.appConfig);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      await authService.onGoogleSignIn();
    } catch (error) {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      await authService.onDemoLogin(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (error) {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const renderTitle = () => {
    return (
      <View style={styles.googleLogoContainer}>
        <Image source={imagePath.googleLogo} style={styles.googleLogo} />
        <Text style={styles.signInText}>{strings('login.signInWithGoogle')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TKStatusBar barStyle="light-content" backgroundColor="transparent" />
      <ImageBackground source={imagePath.loginBackground} style={[styles.image, {width}]}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', '#000000']}
          locations={[0.0788, 0.9994]}
          style={{flex: 1, justifyContent: 'flex-end'}}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}>
          <View style={[styles.contentWrapper, appConfig?.isStoreReview && {bottom: '27%'}]}>
            <Text style={styles.titleText}>{strings('labels.dealzHub')}</Text>
            <Text style={styles.descriptionText}>{strings('login.loginDescription')}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.bottomContent}>
        <TKButton
          title={renderTitle()}
          onPress={handleGetStarted}
          style={{marginBottom: appConfig?.isStoreReview ? 0 : bottomPadding, marginHorizontal: 30}}
          type={'neutral'}
          isDisabled={isLoading}
          isLoading={isLoading}
        />
        <TKRenderIf isRender={!!appConfig?.isStoreReview}>
          <TKButton
            title="Reviewer Login"
            onPress={handleDemoLogin}
            style={{marginBottom: bottomPadding, marginHorizontal: 30}}
            type={'primary'}
            isDisabled={isLoading}
            isLoading={isLoading}
          />
        </TKRenderIf>
      </View>
    </View>
  );
};

export default Login;
