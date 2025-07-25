import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipeDetails } from '../api/spoonacular';
import { toast } from 'react-toastify';
import { ArrowLeft, Clock, Users, Star, Heart, DollarSign, Leaf, Wheat, CheckCircle2, ExternalLink } from 'lucide-react';

export default function RecipeDetail() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecipeDetails = async () => {
            try {
                setLoading(true);
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
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading recipe details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 text-lg">Recipe not found</p>
                    <Link to="/" className="inline-flex items-center mt-4 text-orange-600 hover:text-orange-700">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Recipes
                    </Link>
                </div>
            </div>
        );
    }

    const getDietaryBadges = () => {
        const badges = [];
        if (recipe.vegetarian) badges.push({ label: 'Vegetarian', icon: Leaf, color: 'bg-green-100 text-green-800' });
        if (recipe.vegan) badges.push({ label: 'Vegan', icon: Leaf, color: 'bg-green-100 text-green-800' });
        if (recipe.glutenFree) badges.push({ label: 'Gluten Free', icon: Wheat, color: 'bg-blue-100 text-blue-800' });
        if (recipe.dairyFree) badges.push({ label: 'Dairy Free', icon: CheckCircle2, color: 'bg-purple-100 text-purple-800' });
        return badges;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Navigation */}
            <nav className="p-6">
                <Link
                    to="/"
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 font-medium"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Recipes
                </Link>
            </nav>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Hero Image */}
                    <div className="relative h-64 md:h-80">
                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {recipe.title}
                            </h1>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Recipe Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                                <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Ready in</p>
                                <p className="font-semibold text-gray-800">{recipe.readyInMinutes || 'N/A'} min</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Servings</p>
                                <p className="font-semibold text-gray-800">{recipe.servings || 'N/A'}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Health Score</p>
                                <p className="font-semibold text-gray-800">{recipe.healthScore || 'N/A'}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <Heart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Likes</p>
                                <p className="font-semibold text-gray-800">{recipe.aggregateLikes || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Dietary Badges */}
                        {getDietaryBadges().length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Dietary Information</h3>
                                <div className="flex flex-wrap gap-2">
                                    {getDietaryBadges().map((badge, index) => (
                                        <span
                                            key={index}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
                                        >
                                            <badge.icon className="h-4 w-4 mr-1" />
                                            {badge.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Ingredients */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                                    Ingredients
                                </h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
                                        <ul className="space-y-2">
                                            {recipe.extendedIngredients.map(ingredient => (
                                                <li
                                                    key={ingredient.id}
                                                    className="flex items-start text-gray-700"
                                                >
                                                    <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                    <span>{ingredient.original}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 italic">No ingredients available</p>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Instructions
                                </h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps.length > 0 ? (
                                        <ol className="list-decimal ml-6 space-y-2">
                                            {recipe.analyzedInstructions[0].steps.map((step, idx) => (
                                                <li key={step.number} className="text-gray-700 leading-relaxed">
                                                    {step.step}
                                                </li>
                                            ))}
                                        </ol>
                                    ) : recipe.instructions ? (
                                        <div className="prose prose-sm max-w-none">
                                            <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No instructions available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Source Link */}
                        {recipe.sourceUrl && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 font-medium" >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Original Recipe
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}