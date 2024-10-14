import { fetchData, API_URLS } from '../utils/home';

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



