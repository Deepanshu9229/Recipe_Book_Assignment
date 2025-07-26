import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecipeDetails } from '../api/spoonacular';

export default function Favorites() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favIds.length === 0) {
      setRecipes([]);
      setLoading(false);
      return;
    }
    Promise.all(favIds.map(id => fetchRecipeDetails(id)))
      .then(setRecipes)
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading favorites...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-red-600">My Favorite Recipes</h1>
        {recipes.length === 0 ? (
          <div className="text-center text-gray-500">No favorite recipes yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map(recipe => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover rounded mb-3" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h2>
                <div className="text-sm text-gray-600 mb-2">{recipe.readyInMinutes} min | {recipe.servings} servings</div>
                <button className="bg-red-500 text-white px-3 py-1 rounded">View Details</button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
