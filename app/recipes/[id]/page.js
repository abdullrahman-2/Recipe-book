import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getRecipeDetails(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Recipe/${id}`, {
      // cache: 'no-store'
      // next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch recipe: ${response.statusText || errorText}`);
    }

    const result = await response.json();
    
    const recipeData = result?.data;
    
    if (!recipeData) {
        return null;
    }

    const parsedIngredients = recipeData.ingredients ? recipeData.ingredients.split('\n').filter(item => item.trim() !== '') : [];
    const parsedInstructions = recipeData.instructions ? recipeData.instructions.split('\n').filter(item => item.trim() !== '') : [];

    const fullImageUrl = recipeData.img ? `${API_BASE_URL}${recipeData.img}` : null;

    return {
        id: recipeData.id,
        name: recipeData.name,
        chefName: recipeData.userName,
        description: recipeData.description,
        ingredients: parsedIngredients,
        instructions: parsedInstructions,
        img: fullImageUrl,
        creationDate: recipeData.creationDate
    };

  } catch (error) {
    return null;
  }
}

export default async function RecipeDetailsPage({ params }) {
  const { id } = params;

  const recipe = await getRecipeDetails(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden md:flex">
        <div className="md:w-1/2 relative h-80 md:h-auto">
          {recipe.img ? (
            <img
              src={recipe.img}
              alt={recipe.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="rounded-lg"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-gray-400 text-sm">
                No Image Available
            </div>
          )}
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>

        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            {recipe.name}
          </h1>
          <p className="text-gray-300 text-lg mb-2 leading-relaxed">
            **By chef:** <h1 className="text-green-300 font-semibold">{recipe.chefName || "Unknown Chef"}</h1>
          </p>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {recipe.description}
          </p>

          <h2 className="text-3xl font-bold text-white mb-4">Ingredients</h2>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <ul className="list-disc list-inside text-gray-300 text-lg mb-8 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient.trim()}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-lg mb-8">No ingredients listed for this recipe.</p>
          )}

          <h2 className="text-3xl font-bold text-white mb-4">Instructions</h2>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <ol className="list-decimal list-inside text-gray-300 text-lg space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction.trim()}</li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-400 text-lg">No instructions provided for this recipe.</p>
          )}
        </div>
      </div>

      <div className="text-center mt-12">
        <Link 
          href="/recipes"
          className="bg-gray-700 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-600 transition-colors duration-300 shadow-lg"
        >
          Back to All Recipes
        </Link>
      </div>
    </div>
  );
}
