'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RecipesPage() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(9);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7032';
  const API_URL = `${API_BASE_URL}/api/Recipe`;

  useEffect(() => {
    const fetchAllRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          const errorDetail = await response.json().catch(() => ({ message: 'Unknown error occurred or server response not JSON' }));
          throw new Error(errorDetail.message || `HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        const recipesData = responseData.data;

        if (!Array.isArray(recipesData)) {
            throw new Error("Invalid data format received from server.");
        }

        setAllRecipes(recipesData);
        toast.success("Recipes loaded successfully!");

      } catch (err) {
        setError(err.message || "Failed to load recipes. Please try again.");
        toast.error(err.message || "Failed to load recipes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecipes();
  }, [API_URL]);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe =>
      (recipe.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (recipe.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [allRecipes, searchTerm]);

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-2xl">
        Loading recipes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-2xl">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-white mb-12 drop-shadow-lg">
        Explore All Recipes
      </h1>

      <div className="max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Search recipes by name or description..."
          className="w-full p-4 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-lg"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {filteredRecipes.length === 0 && searchTerm !== '' ? (
        <p className="text-gray-400 text-xl text-center mt-10">
          No recipes found matching "{searchTerm}".
        </p>
      ) : filteredRecipes.length === 0 && searchTerm === '' ? (
        <p className="text-gray-400 text-xl text-center mt-10">
          No recipes available yet. Be the first to add one!
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} passHref>
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform transition-transform duration-200 hover:scale-105 hover:shadow-2xl flex flex-col cursor-pointer">
                  {recipe.img ? (
                    <img src={`${API_BASE_URL}${recipe.img}`} alt={recipe.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="relative w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                      No Image Available
                    </div>
                  )}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors duration-200">
                        {recipe.name}
                      </h3>
                      <p className="text-gray-400 text-base mb-3 line-clamp-3">
                        {recipe.description}
                      </p>
                    </div>
                    <div className="flex justify-end items-center text-sm text-gray-500 mt-4">
                      {recipe.creationDate && (
                        <span>Created: {new Date(recipe.creationDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-2 flex-wrap">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`py-2 px-4 rounded-lg font-bold transition-colors duration-200 text-lg ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } mx-1 my-1`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
