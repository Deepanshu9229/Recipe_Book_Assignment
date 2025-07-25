import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipeDetails } from '../api/spoonacular';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  Bookmark,
  ExternalLink,
  ChefHat
} from 'lucide-react';

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipeDetails = async () => {
      try {
        const data = await fetchRecipeDetails(id);
        setRecipe(data);
      } catch (error) {
        toast.error('Could not load recipe details!');
      } finally {
        setLoading(false);
      }
    };
    loadRecipeDetails();
  }, [id]);

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
          <Link to="/" className="text-red-600 hover:text-red-700">
            ← Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  const getDietaryTags = () => {
    const tags = [];
    if (recipe.vegetarian) tags.push('Vegetarian');
    if (recipe.vegan) tags.push('Vegan');
    if (recipe.glutenFree) tags.push('Gluten-Free');
    if (recipe.dairyFree) tags.push('Dairy-Free');
    if (recipe.veryHealthy) tags.push('Healthy');
    return tags;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',_'system-ui',_sans-serif]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Recipe Search
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </div>
              
              <div className="md:w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
                
                {/* Rating and Actions */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">4.8 (324 reviews)</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm">
                      <Heart className="w-4 h-4" />
                      Save
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      <Bookmark className="w-4 h-4" />
                      Collection
                    </button>
                  </div>
                </div>

                {/* Recipe Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-600">Prep + Cook</div>
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
                {getDietaryTags().length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getDietaryTags().map(tag => (
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
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {recipe.extendedIngredients?.map(ingredient => (
                    <label key={ingredient.id} className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 text-red-500 focus:ring-red-500" />
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {ingredient.original}
                      </span>
                    </label>
                  )) || (
                    <p className="text-gray-500 italic">No ingredients available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Directions</h2>
              <div className="prose prose-sm max-w-none">
                {recipe.instructions ? (
                  <div 
                    className="text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                  />
                ) : (
                  <p className="text-gray-500 italic">No instructions available</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Recipe Source</h3>
                <p className="text-sm text-gray-600">Community contributed recipe</p>
              </div>
              
              {recipe.sourceUrl && (
                <a 
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Recipe
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}