'use client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/features/auth/authSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const loginData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown login error occurred' }));

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
        } else {
          combinedErrorMessage = errorData.message || 'Login failed: Invalid credentials or server error.';
        }

        setError(combinedErrorMessage.trim());
        throw new Error(combinedErrorMessage.trim() || 'Login failed.');
      }

      const result = await response.json();

      dispatch(setCredentials({
        token: result.data.accessToken,
        user: {
          userId: result.data.id,
          userName: result.data.userName,
          userEmail: result.data.email,
        }
      }));

      toast.success('Login successful!');
      router.push('/profile');
    } catch (err) {
      toast.error(error || err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-white mb-12 drop-shadow-lg">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
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

        {error && (
          <div className="bg-red-800 border border-red-900 text-white px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200 text-xl shadow-lg w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <Link
            href="/register"
            className="inline-block align-baseline font-bold text-base text-gray-400 hover:text-gray-200 transition-colors duration-200"
          >
            Don't have an account? Register!
          </Link>
        </div>
      </form>
    </div>
  );
}
