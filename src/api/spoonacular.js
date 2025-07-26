
const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function fetchRecipes() {
  const res = await fetch(`${BASE_URL}/complexSearch?apiKey=${API_KEY}&offset=10&number=50`);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function fetchRecipeDetails(id) {
  const res = await fetch(`${BASE_URL}/${id}/information?apiKey=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch recipe details');
  return res.json();
}