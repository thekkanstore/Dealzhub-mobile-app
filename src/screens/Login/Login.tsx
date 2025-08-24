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

const {width} = Dimensions.get('window');

const Login = () => {
  const bottomPadding = useSafeAreaBottom(10);
  const [isLoading, setIsLoading] = useState(false);
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
          <View style={styles.contentWrapper}>
            <Text style={styles.titleText}>{strings('labels.thekkan')}</Text>
            <Text style={styles.descriptionText}>{strings('login.loginDescription')}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.bottomContent}>
        <TKButton
          title={renderTitle()}
          onPress={handleGetStarted}
          style={{marginBottom: bottomPadding, marginHorizontal: 30}}
          type={'neutral'}
          isDisabled={isLoading}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export default Login;
