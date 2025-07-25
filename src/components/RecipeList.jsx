import React, { useEffect, useState } from 'react';
import { fetchRecipes } from '../api/spoonacular';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await fetchRecipes();
        setRecipes(data.results);
      } catch (error) {
        toast.error('Could not load recipes!');
      }
    };

    loadRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Recipe Book</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            className="bg-white rounded shadow p-4 cursor-pointer hover:bg-blue-50"
            onClick={() => navigate(`/recipe/${recipe.id}`)}
          >
            <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover rounded mb-2" />
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}