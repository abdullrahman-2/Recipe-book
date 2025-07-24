import RecipeCard from "../recipes/RecipeCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getRecipeData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Recipe`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch recipes: ${response.statusText || errorText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    return null;
  }
}

export default async function FeaturedRecipes() {
  let recipesData = await getRecipeData();

  const featuredRecipesList = Array.isArray(recipesData) ? recipesData : [];

  const limitedFeaturedRecipes = featuredRecipesList.slice(0, 4);

  return (
    <section className="py-12 text-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center text-white mb-10">
          Featured Recipes
        </h2>
        {limitedFeaturedRecipes.length === 0 ? (
          <p className="text-center text-gray-400 text-xl">
            No featured recipes available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {limitedFeaturedRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
