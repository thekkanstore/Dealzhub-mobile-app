import React from 'react';
import {View} from 'react-native';
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
import Config from 'react-native-config';

function App(): React.JSX.Element {
  console.log('App started', Config.ENVIRONMENT);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TKGlobalModalManager>
          <KeyboardProvider>
            <TKStatusBar />
            <View style={{flex: 1}}>
              <MainStack />
              <Toast config={ToastConfig} />
            </View>
          </KeyboardProvider>
        </TKGlobalModalManager>
      </PersistGate>
    </Provider>
  );
}

export default App;
