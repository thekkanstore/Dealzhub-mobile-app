import React from 'react';
import {ImageBackground, Text, View, Dimensions, Animated, Image} from 'react-native';
import {imagePath} from '../../assets/imagePath';
import TKStatusBar from '../../components/TKStatusBar/TKStatusBar';
import {strings} from '../../utils/language/langauageUtils';
import TKButton from '../../components/TKButton/TKButton';
import {useSafeAreaBottom} from '../../providers/SafeAreaProvider';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../../config/styles/colors';
import {styles} from './LoginStyle';

const {width} = Dimensions.get('window');

const Login = () => {
  const bottomPadding = useSafeAreaBottom(10);
  const handleGetStarted = () => {};

  const renderTitle = () => {
    return (
      <View style={styles.googleLogoContainer}>
        <Image source={imagePath.googleLogo} style={styles.googleLogo} />
        <Text style={styles.signInText}>{strings('login.signInWithGoogle')}</Text>;
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
        <View style={styles.dotsContainer}>
          {[...Array(3)].map((_, index) => {
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: index === 2 ? 30 : 8,
                    backgroundColor:
                      index === 2
                        ? colors.primaryButtonBackgroundColor
                        : colors.neutralButtonBackgroundColor,
                  },
                ]}
              />
            );
          })}
        </View>

        <TKButton
          title={renderTitle()}
          onPress={handleGetStarted}
          style={{marginBottom: bottomPadding, marginHorizontal: 30}}
          type={'neutral'}
        />
      </View>
    </View>
  );
};

export default Login;
