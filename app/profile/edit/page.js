'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, setCredentials } from '../../../redux/features/auth/authSlice';
import { store } from '../../../redux/store';

import { authFetch } from '../../../utils/apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        setError("You are not logged in. Please log in to view your profile.");
        toast.error("Please log in to view your profile.");
        setLoading(false);
        router.push('/login');
        return;
      }

      if (currentUser) {
        setUsername(currentUser.userName || '');
        setEmail(currentUser.userEmail || '');
        setLoading(false);
        return;
      }

      try {
        const response = await authFetch(`${API_BASE_URL}/api/User/ShowUserInfo`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorDetail = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
          throw new Error(errorDetail.message || `Failed to fetch user data: Status ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setUsername(result.data.userName || '');
          setEmail(result.data.userEmail || '');
        } else {
          setError(result.message || "Failed to retrieve user data for editing.");
          toast.error(result.message || "Failed to retrieve user data.");
        }
      } catch (err) {
        setError("Failed to load profile data. " + (err.message || "Please try again."));
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [isAuthenticated, currentUser, router, API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!username.trim() || !email.trim()) {
      const errorMessage = "Username and Email cannot be empty.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSubmitting(false);
      return;
    }

    if (!isAuthenticated) {
      setError("You must be logged in to update your profile.");
      toast.error("Please log in to continue.");
      setSubmitting(false);
      router.push('/login');
      return;
    }

    const userIdToUpdate = currentUser?.userId;
    if (!userIdToUpdate) {
      setError("User ID not found. Please log in again.");
      toast.error("User ID missing.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/api/User/UpdateUser`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUpdate,
          userName: username,
          email: email
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Unknown update error occurred' }));
        let errorMessage = errorDetail.message || 'Failed to update profile: Server error.';
        if (errorDetail.errors) {
            errorMessage = Object.values(errorDetail.errors).flat().join(' ');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      toast.success('Profile updated successfully!');

      if (result.success && result.data) {
        const currentAuthToken = store.getState().auth.authToken;

        dispatch(setCredentials({
          token: currentAuthToken,
          user: {
            userId: result.data.id || currentUser.userId,
            userName: result.data.userName || username,
            userEmail: result.data.email || email,
            joinDate: currentUser.joinDate
          }
        }));
      }

      router.push('/profile');
      router.refresh();

    } catch (err) {
      setError(err.message || 'An unexpected error occurred during profile update.');
      toast.error(err.message || 'An unexpected error occurred during profile update.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-2xl">
        Loading profile data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500 text-2xl">
        <p className="mb-4">{error}</p>
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 text-xl shadow-lg"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-white mb-12 drop-shadow-lg">
        Edit Your Profile
      </h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
        <div className="mb-6">
          <label htmlFor="username" className="block text-gray-300 text-lg font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your Username"
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
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200 text-xl shadow-lg w-full sm:w-auto"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
