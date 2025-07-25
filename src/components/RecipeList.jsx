import React, { useEffect, useState } from 'react';
import { fetchRecipes } from '../api/spoonacular';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, Star, Clock, Users } from 'lucide-react';

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const categories = [
    'All', 'Soup', 'Salad', 'Rice', 'Bean', 'Smoothie', 'Stew'
  ];

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await fetchRecipes();
        setRecipes(data.results);
      } catch (error) {
        toast.error('Could not load recipes!');
      } finally {
        setLoading(false);
      }
    };
    loadRecipes();
  }, []);

  // Simple category detection based on recipe title
  function getRecipeCategory(recipe) {
    const title = recipe.title.toLowerCase();
    
    if (title.includes('soup')) return 'Soup';
    if (title.includes('salad')) return 'Salad';
    if (title.includes('rice')) return 'Rice';
    if (title.includes('bean') || title.includes('lentil')) return 'Bean';
    if (title.includes('smoothie')) return 'Smoothie';
    if (title.includes('stew')) return 'Stew';
    
    return 'Other';
  }

  // Filter logic
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || getRecipeCategory(recipe) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: " sans-serif"}}>
      {/* Header Section */}
      <div className="bg-white py-8 mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2  ">Find the Perfect Recipe</h1>
            <p className="text-gray-500 text-lg  ">Browse thousands of recipes</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedCategory === 'All' ? 'All Recipes' : selectedCategory}
          </h2>
          <p className="text-gray-600">{filteredRecipes.length} recipes found</p>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {filteredRecipes.map(recipe => {
            const category = getRecipeCategory(recipe);
            
            return (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={recipe.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-5 flex flex-col h-32">
                  {/* Header with title and category tag */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-medium text-gray-900 leading-tight flex-1 line-clamp-2">
                      {recipe.title}
                    </h3>
                    
                    <span className="shrink-0 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full border border-red-100">
                      {category}
                    </span>
                  </div>

                  {/* Button positioned at bottom */}
                  <div className="mt-auto">
                    <button
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors text-sm font-medium group-hover:bg-red-500"
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or category filter</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Show All Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}