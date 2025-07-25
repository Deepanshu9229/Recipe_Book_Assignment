import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

function NavBar() {
    return (
        <nav className="bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-3 text-white hover:text-orange-100 transition-colors duration-200">
                        <ChefHat className="h-8 w-8" />
                        <span className="text-xl font-bold tracking-wide">Recipe Book</span>
                    </Link>
                    
                    
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-white hover:text-orange-100 transition-colors duration-200 font-medium">Home
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;