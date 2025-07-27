import RecipeCard from "../recipes/RecipeCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getRecipeData() {
  console.log("[FeaturedRecipes] Attempting to fetch recipe data.");
  console.log(`[FeaturedRecipes] API_BASE_URL: ${API_BASE_URL}`); // تأكد من قيمة الـ URL

  try {
    const response = await fetch(`${API_BASE_URL}/api/Recipe`);
    console.log(`[FeaturedRecipes] Response status: ${response.status}`);
    console.log(`[FeaturedRecipes] Response OK: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FeaturedRecipes] Failed to fetch recipes. Status: ${response.status}, Error Text: ${errorText}`);
      throw new Error(`Failed to fetch recipes: ${response.statusText || errorText}`);
    }

    const result = await response.json();
    console.log("[FeaturedRecipes] Raw API Response data:", result); // عرض الـ Response كاملاً
    
    // تأكد أن الـ API بيرجع 'data' property
    const recipesData = result?.data;
    console.log("[FeaturedRecipes] Parsed recipesData:", recipesData);

    if (!Array.isArray(recipesData)) {
      console.warn("[FeaturedRecipes] recipesData is not an array, returning empty list.");
      return []; // نرجع مصفوفة فارغة لو البيانات مش مصفوفة
    }
    
    return recipesData;
  } catch (error) {
    console.error("[FeaturedRecipes] Error in getRecipeData:", error);
    return null; // نرجع null أو مصفوفة فارغة في حالة الخطأ
  }
}

export default async function FeaturedRecipes() {
  console.log("[FeaturedRecipes] Component rendering.");
  let recipesData = await getRecipeData();
  console.log("[FeaturedRecipes] Data received from getRecipeData:", recipesData);

  const featuredRecipesList = Array.isArray(recipesData) ? recipesData : [];
  console.log("[FeaturedRecipes] Final featuredRecipesList (after array check):", featuredRecipesList);

  const limitedFeaturedRecipes = featuredRecipesList.slice(0, 4);
  console.log("[FeaturedRecipes] Limited featuredRecipes:", limitedFeaturedRecipes);


  return (
    <section className="py-12 text-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center text-white mb-10">
          Featured Recipes
        </h2>
        {/* <<<<< أضف هذا السطر مؤقتاً للتشخيص */}
        <div className="text-center text-gray-300 text-sm mb-4">
          Data Loaded: {JSON.stringify(limitedFeaturedRecipes, null, 2)}
        </div>
        {/* <<<<< نهاية الإضافة المؤقتة */}
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
