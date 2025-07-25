import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

function NavBar() {
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 font-['Inter',_'system-ui',_sans-serif]">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
                    <ChefHat className="w-8 h-8" />
                    <span className="text-2xl font-bold">Recipe Book</span>
                </Link>
                
                <div className="text-sm text-gray-600">
                    
                </div>
            </div>
        </nav>
    );
}

export default NavBar;