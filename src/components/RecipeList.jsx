import React, { useEffect, useState } from 'react';
import { fetchRecipes } from '../api/spoonacular';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Clock, Users, Star, Search } from 'lucide-react';

export default function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                setLoading(true);
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

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading delicious recipes...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 py-8 mb-7">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Discover Amazing Recipes
                    </h1>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Explore our collection of delicious recipes from around the world
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-200 " />
                        </div>
                        <input type="text" placeholder="Search recipes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent" />
                    </div>
                </div>
            </div>

            {/* Recipes card Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="mb-6">
                    <p className="text-gray-600">
                        {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRecipes.map(recipe => (
                        <div key={recipe.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden group flex flex-col h-full"
                            onClick={() => navigate(`/recipe/${recipe.id}`)}>
                            <div className="relative overflow-hidden">
                                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                                    {recipe.title}
                                </h2>
                                <div className="mt-auto flex items-center justify-between text-sm ">
                                    <div className=" bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium  text-center">
                                        View Recipe
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRecipes.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Search className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-600 mb-2">No recipes found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
}