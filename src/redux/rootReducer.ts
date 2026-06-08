import {combineReducers} from '@reduxjs/toolkit';
import systemReducer from './systemSlice';
import userReducer from './userSlice';
import productReducer from './productSlice';
import sessionStatesReducer from './sessionStatesSlice';

const rootReducer = combineReducers({
  product: productReducer,
  system: systemReducer,
  user: userReducer,
  sessionStates: sessionStatesReducer,
});

export default rootReducer;
