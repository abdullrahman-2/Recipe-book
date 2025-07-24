'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout, setLoadingAuth } from '../../redux/features/auth/authSlice';

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (authToken && user) {
      try {
        dispatch(setCredentials({
          token: authToken,
          user: JSON.parse(user)
        }));
      } catch (e) {
        dispatch(logout());
      }
    } else {
      dispatch(logout());
    }
    dispatch(setLoadingAuth(false));

  }, [dispatch]);

  return <>{children}</>;
}
