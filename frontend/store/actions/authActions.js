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


// Token ko get karna
const token = Cookies.get('token');
console.log(token);  


// Remove token from cookies
const removeToken = () => {
  Cookies.remove('token');
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
    return decoded.exp < Date.now() / 1000; // Compare expiration time
  } catch (e) {
    console.error('Failed to decode token:', e);
    return true; // Treat as expired if decoding fails
  }
};

// Centralized function to store user data in localStorage
const storeUserData = (user) => {
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

// Check if the token is valid and dispatch appropriate actions
export const checkToken = () => (dispatch) => {
  const token = getToken(); // Get token from cookies
  const user = getUserDataFromLocalStorage();

  if (token && user) {
    if (isTokenExpired(token)) {
      dispatch(logout()); // Logout if token is expired
      return { expired: true };
    } else {
      dispatch({
        type: LOAD_USER,
        payload: user, // Dispatch user data if token is valid
      });
    }
  } else {
    console.log('No valid token or user found.');
  }

  return { expired: false };
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