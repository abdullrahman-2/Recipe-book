 'use client';  

import { Provider } from 'react-redux';
import { store } from '../redux/store';  
import { Toaster } from 'react-hot-toast';  
import AuthInitializer from './AuthInitializer/AuthInitializer';  
import Navbar from './Nav/Navbar';

export default function ReduxProviderWrapper({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
           <Navbar />
        {children}    
         

         <Toaster position="top-center" reverseOrder={false} />
      </AuthInitializer>
    </Provider>
  );
}