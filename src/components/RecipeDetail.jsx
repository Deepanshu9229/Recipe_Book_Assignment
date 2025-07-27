import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipeDetails } from '../api/spoonacular';
import { toast } from 'react-toastify';
import { ArrowLeft, Clock, Users, ChefHat, Heart, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';


export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);

  // Load rating from localStorage when recipe changes
  useEffect(() => {
    if (recipe?.id) {
      const storedRating = localStorage.getItem(`rating_${recipe.id}`);
      if (storedRating) setRating(Number(storedRating));
    }
  }, [recipe]);
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favs.includes(recipe?.id));
  }, [recipe]);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await fetchRecipeDetails(id);
        setRecipe(data);
      } catch (error) {
        toast.error('Could not load recipe details!');
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [id]);

  const handleFavorite = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (favs.includes(recipe.id)) {
      updated = favs.filter(id => id !== recipe.id);
      setIsFavorite(false);
    } else {
      updated = [...favs, recipe.id];
      setIsFavorite(true);
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleRating = (value) => {
    if (!user) {
      navigate('/login', {state: {from: location.pathname}});
      return;
    }
    setRating(value);
    localStorage.setItem(`rating_${recipe.id}`, value);
  };

  const toggleIngredient = (ingredientId) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      newSet.has(ingredientId) ? newSet.delete(ingredientId) : newSet.add(ingredientId);
      return newSet;
    });
  };

  const dietaryTags = recipe ? [
    recipe.vegetarian && 'Vegetarian',
    recipe.vegan && 'Vegan',
    recipe.glutenFree && 'Gluten-Free',
    recipe.dairyFree && 'Dairy-Free',
    recipe.veryHealthy && 'Healthy'
  ].filter(Boolean) : [];

  const instructions = recipe?.analyzedInstructions?.[0]?.steps || [];
  const hasInstructions = instructions.length > 0 || recipe?.instructions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Recipe not found</p>
          <Link to="/" className="text-red-600 hover:text-red-700">← Back to Recipes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Recipe Search
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Recipe Header */}
          <div className="p-6  bg-gray-100">
            <div className="flex flex-col md:flex-row gap-6">
              <img src={recipe.image} alt={recipe.title} className="w-full md:w-1/3 h-64 md:h-80 object-cover rounded-lg" />

              <div className="md:w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>

                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm mb-4 ${isFavorite ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}
                  onClick={handleFavorite}
                >
                  <Heart className="w-4 h-4" />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => handleRating(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${rating >= n ? 'bg-yellow-400' : 'bg-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{rating ? `You rated ${rating}` : 'Rate this recipe'}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-semibold">{recipe.readyInMinutes || 'N/A'} min</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Servings</div>
                    <div className="font-semibold">{recipe.servings || 'N/A'}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <ChefHat className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Difficulty</div>
                    <div className="font-semibold">Easy</div>
                  </div>
                </div>

                {/* Dietary Tags */}
                {dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dietaryTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-3 gap-8 p-6">
            {/* Ingredients */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {recipe.extendedIngredients?.map(ingredient => (
                  <label key={ingredient.id} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      className="mt-1 text-red-500"
                    />
                    <span className={`text-sm ${checkedIngredients.has(ingredient.id) ? 'line-through opacity-60' : ''}`}>
                      {ingredient.original}
                    </span>
                  </label>
                )) || <p className="text-gray-500 ">No ingredients available</p>}
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Directions</h2>
              {hasInstructions ? (
                instructions.length > 0 ? (
                  <ol className="list-decimal ml-6 space-y-2">
                    {instructions.map(step => (
                      <li key={step.number} className="text-gray-700">{step.step}</li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
                )
              ) : (
                <p className="text-gray-500 italic">No instructions available</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Recipe Source</h3>
                <p className="text-sm text-gray-600">Community contributed recipe</p>
              </div>
              {recipe.sourceUrl && (
                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  View Original Recipe
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-black text-center py-4 text-sm text-gray-100">
        &copy; {new Date().getFullYear()} Recipe Book. Made by Deepanshu Patel.
      </footer>
    </div>
  );
}