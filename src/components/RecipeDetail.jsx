import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipeDetails } from '../api/spoonacular';
import { toast } from 'react-toastify';

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const loadRecipeDetails = async () => {
      try {
        const data = await fetchRecipeDetails(id);
        setRecipe(data);
      } catch (error) {
        toast.error('Could not load recipe details!');
      }
    };

    loadRecipeDetails();
  }, [id]);

  if (!recipe) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <nav className="mb-4">
        <Link to="/" className="text-blue-600 hover:underline">← Back to Recipes</Link>
      </nav>
      <div className="bg-white rounded shadow p-6 max-w-2xl mx-auto">
        <img src={recipe.image} alt={recipe.title} className="w-full h-64 object-cover rounded mb-4" />
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc ml-6 mb-4">
          {recipe.extendedIngredients?.map(ing => (
            <li key={ing.id}>{ing.original}</li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <div className="mb-4 whitespace-pre-line">
          {recipe.instructions || 'No instructions.'}
        </div>
      </div>
    </div>
  );
}
