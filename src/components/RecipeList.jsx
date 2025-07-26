import React, { useEffect, useState } from 'react';
import { fetchRecipes } from '../api/spoonacular';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "sans-serif" }}>
      {/* Hero Section with Video Background */}
      <section className="relative min-h-[500px] h-screen flex items-center justify-center overflow-hidden mb-10">
        {/* Video Background */}
        <video className="absolute inset-0 w-full h-full object-cover z-0" src="/heroo.mp4" autoPlay loop muted playsInline style={{ minHeight: '90%', height: '90%' }} />
        {/* Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-orange-100 z-10"></div> */}
        {/* Hero Content */}
        <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4 pt-40">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Discover & Cook
            <div>
              <span className="text-red-500">Delicious Recipes</span>
            </div>
          </h1>
          <p className="text-l md:text-xl text-gray-500 mb-8 font-light drop-shadow">
            Find inspiration for your next meal.
          </p>
          {/* Animated Scroll Arrow */}
          <div className="flex items-center justify-center mt-8  ">
            <button
              onClick={() => {
                const resultsSection = document.getElementById('results-section');
                if (resultsSection) {
                  resultsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white/20 rounded-full shadow-lg p-2 hover:bg-orange-100 transition-colors flex items-center justify-center" aria-label="Scroll Down" >
              <svg className="w-8 h-8 animate-bounce text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <section id="results-section" className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filter Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Recipe</h2>
            <p className="text-gray-600">Search through our collection and filter by category</p>
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedCategory === 'All' ? 'All Recipes' : `${selectedCategory} Recipes`}
          </h3>
          <p className="text-gray-600">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe, index) => {
            const category = getRecipeCategory(recipe);
            return (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="relative overflow-hidden">
                  <img src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'} alt={recipe.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-gray-900 leading-tight mb-4 group-hover:text-orange-600 transition-colors">
                    {recipe.title}
                  </h4>
                  <button onClick={() => navigate(`/recipe/${recipe.id}`)} className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium group-hover:bg-orange-400">
                    View Recipe
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-8 ">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">No recipes found</h4>
            <p className="text-gray-500 mb-6">Try adjusting your search terms or category filter</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              Show All Recipes
            </button>
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    {/* Simple Footer */}
    <footer className="bg-white border-t border-gray-200 text-center py-4 mt-auto text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Recipe Book. Made by Deepanshu Patel.
    </footer>


    </div>
  )
}