import { combineReducers } from 'redux';
import homeReducer from './homeReducer';
import withdrawalReducers from './withdrawalReducers';

const rootReducer = combineReducers({
  apiData: homeReducer,
  moneyData: withdrawalReducers,
});

export default rootReducer;