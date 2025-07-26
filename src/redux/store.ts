import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from './rootReducer';

// Reset action type
const RESET_STATE = 'RESET_STATE';

// wrapper root reducer that handles the reset action
const rootReducerWithReset = (state: any, action: any) => {
  if (action.type === RESET_STATE) {
    // Define the persistent state
    const persistentState = {};
    state = persistentState;
  }
  return rootReducer(state, action);
};

// Persist configuration for onboarding only
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: [], // Exclude kycVerification from persistence
};

// Persist the onboarding reducer
const persistedReducer = persistReducer(persistConfig, rootReducerWithReset);

// Create the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Create the persistor object for persistence
export const persistor = persistStore(store);

// Define types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const resetState = () => ({
  type: RESET_STATE,
});
