 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

 import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/features/auth/authSlice'; // تأكد من المسار الصحيح

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch(); 

  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage(null);

     if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setErrorMessage(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setErrorMessage(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const registerData = {
      userName: userName,
      email: email,
      password: password,
    
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
        credentials: 'include'  
      });

      console.log("Response from register API:", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error, no JSON response.' }));
        console.error("Backend Error Details:", errorData);

        let combinedErrorMessage = '';

        if (response.status === 400 && errorData.errors) {
          for (const key in errorData.errors) {
            if (Array.isArray(errorData.errors[key])) {
              combinedErrorMessage += errorData.errors[key].join(' ') + ' ';
            }
          }
          if (!combinedErrorMessage) {
            combinedErrorMessage = errorData.title || 'Validation errors occurred.';
          }
        } else if (response.status === 409) {
          combinedErrorMessage = errorData.message || 'User with this email already exists.';
        } else {
          combinedErrorMessage = errorData.message || 'Registration failed: Server error.';
        }
        
        setErrorMessage(combinedErrorMessage.trim());
        throw new Error(combinedErrorMessage.trim() || 'Registration failed.');
      }

      const result = await response.json();
      console.log('Registration successful:', result);

       
      dispatch(setCredentials({
        token: result.data.accessToken,  
        user: {  
          userId: result.data.id,
          userName: result.data.userName,
          userEmail: result.data.email,
        }
    
      }));

      toast.success('Registration successful! You are now logged in.');
      router.push('/profile'); 
 
    } catch (err) {
      console.error('Error during registration:', err);
      if (!errorMessage) {
        setErrorMessage(err.message || 'An unexpected error occurred during registration.');
      }
      toast.error(errorMessage || err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-white mb-12 drop-shadow-lg">
        Register
      </h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
         <div className="mb-6">
          <label htmlFor="userName" className="block text-gray-300 text-lg font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="userName"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="mr...."
            required
          />
        </div>

         <div className="mb-6">
          <label htmlFor="email" className="block text-gray-300 text-lg font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@example.com"
            required
          />
        </div>

         <div className="mb-6">
          <label htmlFor="password" className="block text-gray-300 text-lg font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>

         <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-300 text-lg font-bold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>

         {errorMessage && (
          <div className="bg-red-800 border border-red-900 text-white px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{errorMessage}</span>
          </div>
        )}

         <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200 text-xl shadow-lg w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <Link
            href="/login"
            className="inline-block align-baseline font-bold text-base text-gray-400 hover:text-gray-200 transition-colors duration-200"
          >
            Already have an account? Login!
          </Link>
        </div>
      </form>
    </div>
  );
}