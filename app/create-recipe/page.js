'use client';

 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../redux/features/auth/authSlice';

import { authFetch } from '../../utils/apiClient';


export default function CreateOrEditRecipePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');

  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipeData = useCallback(async () => {
    if (!recipeId) {
      setLoading(false);
      setTitle('');
      setDescription('');
      setIngredients('');
      setInstructions('');
      setImageFile(null);
      setImageUrl('');
      setOriginalImageUrl('');
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      setError("You are not authorized. Please log in to edit recipes.");
      toast.error("Please log in to edit recipes.");
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/api/Recipe/${recipeId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred or server response not JSON' }));
        throw new Error(errorData.message || `Failed to fetch recipe data: Status ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setTitle(result.data.name || '');
        setDescription(result.data.description || '');
        setIngredients(result.data.ingredients || '');
        setInstructions(result.data.instructions || '');
        const fullImageUrl = result.data.img ? `${API_BASE_URL}${result.data.img}` : '';
        setImageUrl(fullImageUrl);
        setOriginalImageUrl(fullImageUrl);
        setImageFile(null);
      } else {
        setError(result.message || "Recipe data not found.");
        toast.error(result.message || "Recipe data not found.");
      }

    } catch (err) {
      setError("Failed to load recipe data for editing. Please try again.");
      toast.error("Failed to load recipe data.");
    } finally {
      setLoading(false);
    }
  }, [recipeId, isAuthenticated, router, API_BASE_URL]);

  useEffect(() => {
    if (recipeId && isAuthenticated) {
        fetchRecipeData();
    } else if (!recipeId) {
        setLoading(false);
    } else if (!isAuthenticated && recipeId) {
        router.push('/login');
        toast.error("You need to be logged in to edit recipes.");
    }
  }, [fetchRecipeData, recipeId, isAuthenticated, router]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      if (recipeId && originalImageUrl) {
        setImageUrl(originalImageUrl);
      } else {
        setImageUrl('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    if (!title.trim() || !description.trim() || !ingredients.trim() || !instructions.trim()) {
      const errorMessage = "All fields are required.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSubmitting(false);
      return;
    }

    if (!isAuthenticated) {
      setError("You must be logged in to create or edit recipes.");
      toast.error("Please log in to continue.");
      setSubmitting(false);
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('Name', title);
    formData.append('Description', description);
    formData.append('Ingredients', ingredients);
    formData.append('Instructions', instructions);

    if (recipeId) {
      formData.append('Id', recipeId);
    }

    if (imageFile) {
      formData.append('ImageFile', imageFile);
    }
    else {
      if (recipeId) {
        if (originalImageUrl) {
          const relativePath = originalImageUrl.replace(API_BASE_URL, '');
          formData.append('Img', relativePath);
        } else {
          formData.append('Img', '');
        }
      }
      else {
        formData.append('Img', '');
      }
    }

    let apiEndpoint = '';
    let httpMethod = '';

    if (recipeId) {
      apiEndpoint = `${API_BASE_URL}/api/Recipe/${recipeId}`;
      httpMethod = 'PUT';
    } else {
      apiEndpoint = `${API_BASE_URL}/api/Recipe`;
      httpMethod = 'POST';
    }

    try {
      const response = await authFetch(apiEndpoint, {
        method: httpMethod,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred or server response not JSON' }));

        let errorMessage = errorData.message || `Failed to ${recipeId ? 'update' : 'create'} recipe.`;
        if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).flat().join(' ');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      toast.success(`Recipe ${recipeId ? 'updated' : 'created'} successfully!`);
      router.push('/profile');
      router.refresh();

    } catch (err) {
      setError(err.message || `An unexpected error occurred during recipe ${recipeId ? 'update' : 'creation'}.`);
      toast.error(err.message || `An unexpected error occurred during recipe ${recipeId ? 'update' : 'creation'}.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && recipeId) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-2xl">
        Loading recipe data...
      </div>
    );
  }

  const pageTitle = recipeId ? 'Edit Recipe' : 'Create New Recipe';
  const submitButtonText = recipeId ? 'Update Recipe' : 'Create Recipe';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-white mb-12 drop-shadow-lg">
        {pageTitle}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
        <div className="mb-6">
          <label htmlFor="title" className="block text-gray-300 text-lg font-bold mb-2">
            Recipe Title
          </label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Spicy Chicken Curry"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-300 text-lg font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows="3"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of your delicious recipe."
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="ingredients" className="block text-gray-300 text-lg font-bold mb-2">
            Ingredients (each on a new line)
          </label>
          <textarea
            id="ingredients"
            rows="6"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., 2 cups flour&#10;1 tsp salt&#10;..."
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="instructions" className="block text-gray-300 text-lg font-bold mb-2">
            Instructions (each step on a new line)
          </label>
          <textarea
            id="instructions"
            rows="8"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 transition-colors duration-200"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., 1. Preheat oven.&#10;2. Mix dry ingredients.&#10;3. Add wet ingredients.&#10;..."
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="recipeImage" className="block text-gray-300 text-lg font-bold mb-2">
            Recipe Image
          </label>
          <input
            type="file"
            id="recipeImage"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100 mb-2"
          />
          {imageUrl && (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Image Preview:</p>
              <img
                src={imageUrl.startsWith(API_BASE_URL) ? imageUrl : `${API_BASE_URL}${imageUrl}`}
                alt="Recipe Preview"
                className="w-full max-h-48 object-cover rounded-lg border border-gray-700"
              />
            </div>
          )}
          {!imageUrl && recipeId && !imageFile && (
            <p className="text-gray-500 text-sm mt-2">No image available for this recipe yet. Upload a new one!</p>
          )}
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
            {submitting ? (recipeId ? 'Updating...' : 'Creating...') : submitButtonText}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
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
