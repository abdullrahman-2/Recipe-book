'use client';

import { store } from '../redux/store';
import { setCredentials, logout } from '../redux/features/auth/authSlice';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const authFetch = async (url, options = {}) => {
  const state = store.getState();
  const accessToken = state.auth.authToken;
  const dispatch = store.dispatch;

  const headers = {
    ...options.headers,
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, fetchOptions);

    if (response.status === 401 && !url.includes('/api/Auth/refresh-token')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          const newHeaders = { ...fetchOptions.headers, 'Authorization': `Bearer ${token}` };
          return fetch(url, { ...fetchOptions, headers: newHeaders, credentials: 'include' });
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/Auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          const newAccessToken = refreshResult.data.accessToken;

          dispatch(setCredentials({ token: newAccessToken, user: state.auth.user }));
          
          processQueue(null, newAccessToken);

          const newHeaders = { ...fetchOptions.headers, 'Authorization': `Bearer ${newAccessToken}` };
          response = await fetch(url, { ...fetchOptions, headers: newHeaders, credentials: 'include' });
          
          return response;
        } else {
          const errorData = await refreshResponse.json().catch(() => ({ message: 'Refresh failed' }));
          toast.error("Session expired. Please log in again.");
          dispatch(logout());
          processQueue(new Error("Refresh token failed, user logged out."));
          return Promise.reject(new Error("Session expired. Please log in again."));
        }
      } catch (refreshErr) {
        toast.error("An error occurred during session refresh. Please log in again.");
        dispatch(logout());
        processQueue(new Error("Token refresh error, user logged out."));
        return Promise.reject(new Error("An error occurred during session refresh. Please log in again."));
      } finally {
        isRefreshing = false;
      }
    }

    return response;

  } catch (error) {
    if (error.message.includes('Session expired') || error.message.includes('Unauthorized')) {
        toast.error("Session expired. Please log in again.");
        dispatch(logout());
    }
    return Promise.reject(error);
  }
};
