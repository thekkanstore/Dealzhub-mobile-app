import React from 'react';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import MainStack from './src/navigation/MainStack';
import {persistor, store} from './src/redux/store';
import TKStatusBar from './src/components/TKStatusBar/TKStatusBar';
import {ToastConfig} from './src/components/TKToastConfig/TKToastConfig';
import {TKGlobalModalManager} from './src/components/TKGlobalModalManager/TKGlobalModalManager';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <SafeAreaView style={{flex: 1}}>
            <TKGlobalModalManager>
              <KeyboardProvider>
                <TKStatusBar />
                <MainStack />
                <Toast config={ToastConfig} />
              </KeyboardProvider>
            </TKGlobalModalManager>
          </SafeAreaView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
