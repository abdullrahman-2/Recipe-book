import Link from 'next/link';
// import Image from 'next/image'; // تم إزالة استيراد Image

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RecipeCard({ recipe }) {
  const imageUrl = recipe.img
    ? `${API_BASE_URL}${recipe.img}`
    : '/images/default-recipe.jpg';

  const title = recipe.name || 'Unknown Recipe';
  const description = recipe.description || 'A delicious and easy-to-make recipe.';
  const id = recipe.id || '#';

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
      <div className="relative w-full h-48">
        {/* تم استبدال مكون Image بـ <img> tag عادي */}
        <img
          src={imageUrl}
          alt={title}
          // استخدام كلاسات Tailwind لضبط الحجم وطريقة العرض
          className="w-full h-full object-cover rounded-t-lg"
          // تم إزالة layout, objectFit, sizes لأنها خاصة بـ next/image
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2 truncate">
          {title}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        <Link
          href={`/recipes/${id}`}
          className="inline-block bg-gray-200 text-gray-800 py-2 px-4 rounded-full hover:bg-white transition-colors duration-300"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
}