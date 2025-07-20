import {combineReducers} from '@reduxjs/toolkit';
import systemReducer from './systemSlice';

const rootReducer = combineReducers({
  // feature: featureReducer,
  system: systemReducer,
});

export default rootReducer;
