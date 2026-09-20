import React from 'react';
import 'react-native-gesture-handler';
import 'react-native-screens/gesture-handler';
import 'react-native-reanimated';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import {View} from 'react-native';

import MainStack from './src/navigation/MainStack';
import {persistor, store} from './src/redux/store';
import TKStatusBar from './src/components/Common/TKStatusBar/TKStatusBar';
import {ToastConfig} from './src/components/Common/TKToastConfig/TKToastConfig';
import {TKGlobalModalManager} from './src/components/Common/TKGlobalModalManager/TKGlobalModalManager';
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context';
import {GlobalSafeAreaProvider} from './src/providers/SafeAreaProvider';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';
import {colors} from './src/config/styles/colors';

const WEB_CLIENT_ID =
  Config.GOOGLE_CLIENT_ID ||
  '298300377700-4hrlh6u6v192i4qm6h5upkrems99sasf.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

export const queryClient = new QueryClient();

function App(): React.JSX.Element {
  console.log('Firebase initialized:', firebase.apps.length > 0);

  React.useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged(authUser => {
      console.log('Firebase Auth State Changed:', authUser ? authUser.uid : 'null');
    });
    return () => unsubscribe();
  }, []);

  firestore()
    .collection('test')
    .doc('connection_check')
    .get()
    .then(doc => {
      console.log('Firestore connection successful:', doc.exists);
    })
    .catch(error => {
      console.log('Firestore connection error:', error);
    });

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <GlobalSafeAreaProvider>
              <View style={{flex: 1, backgroundColor: colors.primaryBackgroundColor}}>
                <TKGlobalModalManager>
                  <KeyboardProvider>
                    <TKStatusBar />
                    <MainStack />
                    <Toast config={ToastConfig} />
                  </KeyboardProvider>
                </TKGlobalModalManager>
              </View>
            </GlobalSafeAreaProvider>
          </SafeAreaProvider>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
