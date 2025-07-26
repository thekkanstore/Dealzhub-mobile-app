import {combineReducers} from '@reduxjs/toolkit';
import systemReducer from './systemSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  // feature: featureReducer,
  system: systemReducer,
  user: userReducer,
});

export default rootReducer;
