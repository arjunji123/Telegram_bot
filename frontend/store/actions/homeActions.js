import { fetchData, API_URLS } from '../utils/home';
import { fetcherGet } from '../fetcher';  
import { BACKEND_URL } from '../../src/config';
// Action to set the data
export const setAPIData = (apiName, data) => ({
  type: `SET_${apiName.toUpperCase()}_DATA`,
  payload: data,
});

// Action to set loading state
export const setAPILoading = (apiName) => ({
  type: `FETCH_${apiName.toUpperCase()}_REQUEST`,
});

// Action to set error state
export const setAPIError = (apiName, error) => ({
  type: `FETCH_${apiName.toUpperCase()}_FAILURE`,
  error,
});

// Async action to fetch data
export const fetchAPIData = (apiName) => async (dispatch) => {
  dispatch(setAPILoading(apiName));

  try {
    const url = API_URLS[apiName];
    const data = await fetchData(url);
    dispatch(setAPIData(apiName, data));
  } catch (error) {
    dispatch(setAPIError(apiName, error.message || 'Something went wrong'));
  }
};


export const FETCH_ME_REQUEST = 'FETCH_ME_REQUEST';
export const SET_ME_DATA  = 'SET_ME_DATA';
export const FETCH_ME_FAILURE = 'FETCH_ME_FAILURE';

export const FETCH_COIN_REQUEST = 'FETCH_COIN_REQUEST';
export const SET_COIN_DATA  = 'SET_COIN_DATA';
export const FETCH_COIN_FAILURE = 'FETCH_COIN_FAILURE';

// Fetch User Request Action
const fetchMeRequest = () => {
  return {
    type: FETCH_ME_REQUEST,
  };
};

// Fetch User Success Action
const setMeData  = (data) => {
  return {
    type: SET_ME_DATA,
    payload: data,
  };
};

// Fetch User Failure Action
const fetchMeFailure = (error) => {
  return {
    type: FETCH_ME_FAILURE,
    payload: error,
  };
};
// Fetch User Request Action
const fetchCoinRequest = () => {
  return {
    type: FETCH_COIN_REQUEST,
  };
};

// Fetch User Success Action
const setCoinData  = (data) => {
  return {
    type: SET_COIN_DATA,
    payload: data,
  };
};

// Fetch User Failure Action
const fetchCoinFailure = (error) => {
  return {
    type: FETCH_COIN_FAILURE,
    payload: error,
  };
};

// Async Action to fetch user data using the fetcher
// export const fetchMeData = () => {
//   return async (dispatch) => {
//     dispatch(fetchMeRequest());

//     try {
//       // Use fetcher to make the API call
//       const data = await fetcherGet(`${BACKEND_URL}/api/v1/api-me`);
//       // Dispatch success action with the data
//       dispatch(fetchMeSuccess(data));
//     } catch (error) {
//       // Dispatch failure action if fetcher throws an error
//       dispatch(fetchMeFailure(error.message));
//     }
//   };
// };
export const fetchMeData = () => async (dispatch) => {
  dispatch(fetchMeRequest());
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/api-me`);
    dispatch(setMeData(data));
  } catch (error) {
    dispatch(fetchMeFailure(error.message));
  }
};
export const fetchCoinData = () => async (dispatch) => {
  dispatch(fetchCoinRequest());
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/pending-coins`);
    dispatch(setCoinData(data));
  } catch (error) {
    dispatch(fetchCoinFailure(error.message));
  }
};