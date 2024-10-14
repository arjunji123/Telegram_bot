import { combineReducers } from 'redux';
import homeReducer from './homeReducer';

const rootReducer = combineReducers({
  apiData: homeReducer,
});

export default rootReducer;