// app/profile/page.js
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

 import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, logout, setCredentials } from '../../redux/features/auth/authSlice'; // <<<<< إضافة setCredentials
import { store } from '../../redux/store';  

 import { authFetch } from '../../utils/apiClient';  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();

   const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(6);  

   async function deleteRecipe(id) {
    if (!isAuthenticated) {
      toast.error("You must be logged in to delete recipes.");
      router.push('/login');
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/api/Recipe/DeleteRecipe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(id),
      });

      if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Unknown error occurred or server response not JSON' }));
        console.error("Failed to delete recipe:", errorDetail);
        throw new Error(errorDetail.message || `Failed to delete recipe: HTTP Status ${response.status}`);
      }

      toast.success("Recipe deleted successfully!");
      setUserRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id));
      router.refresh();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      toast.error(err.message || "Failed to delete recipe.");
    }
  }

  // دالة حذف المستخدم باستخدام authFetch
  async function deleteUser() {
    if (!isAuthenticated) {
      toast.error("You must be logged in to delete your account.");
      router.push('/login');
      return;
    }

    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/api/User/DeleteUser`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorDetail = await response.json().catch(() => ({ message: 'Unknown error occurred or server response not JSON' }));
        console.error("Failed to delete user:", errorDetail);
        throw new Error(errorDetail.message || `Failed to delete user: HTTP Status ${response.status}`);
      }

      toast.success("Your account has been deleted successfully!");
      dispatch(logout());
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.message || "Failed to delete account.");
      dispatch(logout());
      router.push('/');
    }
  }

   const fetchUserProfile = async () => {
    console.log("[ProfilePage] fetchUserProfile called.");
    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      console.log("[ProfilePage] Not authenticated, redirecting to login.");
      setError("You are not logged in. Please log in to view your profile.");
      setLoading(false);
      router.push('/login');
      toast.error("Please log in to view your profile.");
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
        const errorDetail = await response.json().catch(() => ({ message: 'Unknown error occurred or server response not JSON' }));
        console.error("[ProfilePage] Failed to fetch user profile details:", errorDetail);
        setError(errorDetail.message || `HTTP error! Status: ${response.status}`);
        toast.error("Failed to load user profile: " + (errorDetail.message || `Status ${response.status}`));
        return;
      }

      const result = await response.json();
      console.log("[ProfilePage] Full User Profile API Response:", result);

      if (result.success && result.data) {
      
        const currentAuthToken = store.getState().auth.authToken;  

        dispatch(setCredentials({
          token: currentAuthToken,  
          user: { 
            userId: result.data.userId,
            userName: result.data.userName,
            userEmail: result.data.userEmail,
            joinDate: result.data.joinDate  
          }
        }));

         setUserRecipes(result.data.vwRecipeDtos.map(recipe => ({
          id: recipe.id,
          title: recipe.name,
          description: recipe.description,
          createdAt: recipe.creationDate,
          img: recipe.img ? `${API_BASE_URL}${recipe.img}` : '/images/default-recipe.jpg'
        })));
      } else {
        setError(result.message || "Failed to retrieve user data.");
        toast.error(result.message || "Failed to retrieve user data.");
      }

    } catch (err) {
      console.error("[ProfilePage] Error fetching user profile:", err);
      setError("Failed to load user profile. " + (err.message || "Please try again."));
      toast.error("Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    console.log("[ProfilePage] useEffect triggered. isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setUserRecipes([]);
    }
  }, [isAuthenticated]);

   const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn("Logout API returned non-OK status, but proceeding with client-side logout:", await response.text());
      }

      dispatch(logout());

      toast.success('Logged out successfully!');
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to log out.");
      dispatch(logout());
      router.push('/');
    }
  };

   const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = userRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const totalPages = Math.ceil(userRecipes.length / recipesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

   if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-2xl">
        Loading profile...
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    console.log("[ProfilePage] Not authenticated or currentUser is null/undefined, showing login prompt.");
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-300 text-2xl">
        <p className="mb-4">You are not logged in. Please log in to view your profile.</p>
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 text-xl shadow-lg"
        >
          Login
        </Link>
      </div>
    );
  }

  if (error) {
    console.log("[ProfilePage] Error state active:", error);
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500 text-2xl">
        <p className="mb-4">{error}</p>
        <button
            onClick={fetchUserProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 text-xl shadow-lg"
        >
            Try Again
        </button>
      </div>
    );
  }

  console.log("[ProfilePage] Current User from Redux (before render):", currentUser);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="break-words text-5xl font-extrabold text-center text-white mb-12 drop-shadow-lg">
        {currentUser.userName}'s Profile
      </h1>
       <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl mb-10">
        <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
          <p className="break-words"><span className="font-semibold text-gray-300">Email:</span> {currentUser.userEmail}</p>
          <p><span className="font-semibold text-gray-300">Username:</span> {currentUser.userName}</p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            href="/profile/edit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 w-full sm:w-auto text-center"
          >
            Edit Profile
          </Link>
          <button
            onClick={deleteUser}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 w-full sm:w-auto"
          >
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">
          Your Recipes ({userRecipes.length})
        </h2>
        {userRecipes.length === 0 ? (
          <p className="text-gray-400 text-lg text-center">You haven't added any recipes yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-gray-700 rounded-lg shadow-md overflow-hidden transform transition-transform duration-200 hover:scale-105 hover:shadow-xl flex flex-col">
                  <Link href={`/recipes/${recipe.id}`} className="block">
                    {recipe.img ? (
                      <img src={recipe.img} alt={recipe.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="relative w-full h-48 bg-gray-600 flex items-center justify-center text-gray-300 text-sm">
                        No Image Available
                      </div>
                    )}
                  </Link>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                        <Link href={`/recipes/${recipe.id}`} className="hover:underline">
                          {recipe.title}
                        </Link>
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                    <div className="flex justify-end items-center text-sm text-gray-400 mt-2">
                      <span>Created: {new Date(recipe.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Link
                        href={`/create-recipe?id=${recipe.id}`}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-full text-sm transition-colors duration-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          deleteRecipe(recipe.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-sm transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`py-2 px-4 rounded-lg font-bold transition-colors duration-200 ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
       <div className="max-w-4xl mx-auto mt-8 text-center">
        <Link
          href="/create-recipe"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 text-xl shadow-lg"
        >
          Create New Recipe
        </Link>
      </div>
    </div>
  );
}
