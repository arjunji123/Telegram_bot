import { fetcher } from '../fetcher';
import { BACKEND_URL } from '../../src/config';
import Cookies from 'js-cookie';

// Action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE';
export const LOGOUT = 'LOGOUT';
export const LOAD_USER = 'LOAD_USER';

// Set token in cookies (expires in 7 days)
const setToken = (token) => {
  Cookies.set('token', JSON.stringify(token), { expires: 7 });
};


// Get token from cookies
const getToken = () => {
  return Cookies.get('token');
};


// Remove token from cookies
const removeToken = () => {
  Cookies.remove('token');
};



// Centralized function to store user data in localStorage
export const storeUserData = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Centralized function to retrieve user data from localStorage
const getUserDataFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Login action
export const login = (credentials) => async (dispatch) => {
  try {
    console.log('Logging in with:', credentials); // Log credentials for debugging
    const response = await fetcher.post(`${BACKEND_URL}/api/v1/api-login`, credentials);

    console.log('API response:', response); // Log API response

    if (response?.token) {
      setToken(response.token); // Store the token in cookies
      const userData = { token: response.token, ...response }; // Create user data object
      storeUserData(userData); // Save user data in localStorage
      setToken(userData)
      dispatch({
        type: LOGIN_SUCCESS,
        payload: userData,
      });
    } else {
      throw new Error('Token not received from the server.');
    }
  } catch (error) {
    console.error('Login failed:', error.message); // Log error
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.message,
    });
    throw error; // Rethrow error to allow handling in components
  }
};

// Signup action
export const signUp = (credentials) => async (dispatch) => {
  try {
    const response = await fetcher.post(`${BACKEND_URL}/api/v1/api-register`, credentials);

    console.log('API response:', response); // Log API response

    if (response?.token) {
      setToken(response.token); // Store the token in cookies
      const userData = { token: response.token, ...response };
      storeUserData(userData); // Save user data in localStorage

      dispatch({
        type: SIGNUP_SUCCESS,
        payload: userData,
      });
    } else {
      throw new Error('Token not received from the server.');
    }
  } catch (error) {
    console.error('Signup failed:', error.message); // Log error
    dispatch({
      type: SIGNUP_FAILURE,
      payload: error.message,
    });
    throw error; // Rethrow error for component handling
  }
};

// Logout action
export const logout = () => (dispatch) => {
  localStorage.removeItem('user'); // Remove user data from localStorage
  removeToken(); // Remove the token from cookies
  dispatch({
    type: LOGOUT,
  });
};



// Load user from localStorage into the app state
export const loadUserFromLocalStorage = () => (dispatch) => {
  const user = getUserDataFromLocalStorage();

  if (user) {
    dispatch({
      type: LOAD_USER,
      payload: user,
    });
  } else {
    console.log('No user found in localStorage.');
  }
};
console.log('Token from cookies:', getToken());