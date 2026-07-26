import React, {useState} from 'react';
import {ImageBackground, Text, View, Dimensions, Image, Platform, TouchableOpacity} from 'react-native';

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
import {TKAppleIcon} from '../../components/Common/Icons/TKAppleIcon';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {updateGuestStatus} from '../../redux/userSlice';

const {width, height} = Dimensions.get('window');
// TODO: Replace with valid demo account credentials created in Firebase Console
const DEMO_EMAIL = 'reviewer@dealzhub.com';
const DEMO_PASSWORD = 'Reviewer123!';

const Login = () => {
    const bottomPadding = useSafeAreaBottom(50);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const appConfig = useAppSelector(state => state.sessionStates.appConfig);

    const isAnyLoading = isGoogleLoading || isAppleLoading;

    const handleGetStarted = async () => {
        try {
            setIsGoogleLoading(true);
            await authService.onGoogleSignIn();
        } catch (error) {
            //
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        try {
            setIsGoogleLoading(true);
            await authService.onDemoLogin(DEMO_EMAIL, DEMO_PASSWORD);
        } catch (error) {
            //
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        try {
            setIsAppleLoading(true);
            await authService.onAppleSignIn();
        } catch (error) {
            //
        } finally {
            setIsAppleLoading(false);
        }
    };

    const handleGuestLogin = () => {
        updateGuestStatus(true);
    };

    const renderTitle = () => {
        return (
            <View style={styles.googleLogoContainer}>
                <Image source={imagePath.googleLogo} style={styles.googleLogo}/>
                <Text style={styles.signInText}>{strings('login.signInWithGoogle')}</Text>
            </View>
        );
    };

    const renderAppleTitle = () => {
        return (
            <View style={styles.googleLogoContainer}>
                <TKAppleIcon width={20} height={20} color="#FFFFFF"/>
                <Text style={styles.appleSignInText}>{strings('login.signInWithApple')}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TKStatusBar barStyle="light-content" backgroundColor="transparent"/>
            <ImageBackground source={imagePath.loginBackground} style={[styles.image, {width}, {height}]}
                             resizeMode={'cover'}>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0)', '#000000']}
                    locations={[0.0788, 0.9994]}
                    style={styles.gradientContainer}
                    start={{x: 0.5, y: 0}}
                    end={{x: 0.5, y: 1}}>
                    <View style={styles.spacer}/>
                        <TouchableOpacity onLongPress={handleDemoLogin} activeOpacity={0.8} delayLongPress={2000}>
                            <View style={styles.contentWrapper}>
                                <Text style={styles.titleText}>{strings('labels.dealzHub')}</Text>
                                <Text style={styles.descriptionText}>{strings('login.loginDescription')}</Text>
                            </View>
                        </TouchableOpacity>
                    <View style={[styles.bottomContent, {paddingBottom: bottomPadding}]}>
                        <TKButton
                            title={renderTitle()}
                            onPress={handleGetStarted}
                            style={{marginHorizontal: 30}}
                            type={'neutral'}
                            isDisabled={isAnyLoading}
                            isLoading={isGoogleLoading}
                        />
                        {Platform.OS === 'ios' && appleAuth.isSupported && (
                            <TKButton
                                title={renderAppleTitle()}
                                onPress={handleAppleSignIn}
                                style={styles.appleButton}
                                isDisabled={isAnyLoading}
                                isLoading={isAppleLoading}
                            />
                        )}
                        <TKRenderIf isRender={!!appConfig?.isStoreReview}>
                            <TKButton
                                title="Reviewer Login"
                                onPress={handleDemoLogin}
                                style={{marginHorizontal: 30}}
                                type={'primary'}
                                isDisabled={isAnyLoading}
                                isLoading={isGoogleLoading}
                            />
                        </TKRenderIf>

                        <TouchableOpacity onPress={handleGuestLogin} activeOpacity={0.8} style={{marginTop: 10, alignSelf: 'center'}}>
                            <Text style={{color: '#FFFFFF', fontSize: 16, textDecorationLine: 'underline'}}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
};

export default Login;
