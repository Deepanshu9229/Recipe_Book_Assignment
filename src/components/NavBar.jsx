import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  const [hide, setHide] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setHide(currentScroll > lastScroll && currentScroll > 60);
      setLastScroll(currentScroll);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  return (
    <nav
      className={`bg-black border-b  sticky top-0 z-50 font-['Inter',_'system-ui',_sans-serif] transition-transform duration-300 ${
        hide ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
          <span className="text-2xl font-extrabold tracking-widest">RECIPE BOOK</span>
        </Link>
        <Link to="/favorites" className="flex items-center gap-2 text-white hover:text-red-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21C12 21 7 16.5 4 13.5C1.5 11 2 7.5 5 6C7.5 4.5 10 6.5 12 8.5C14 6.5 16.5 4.5 19 6C22 7.5 22.5 11 20 13.5C17 16.5 12 21 12 21Z" />
          </svg>
          <span className="hidden md:inline text-base font-semibold">Favorites</span>
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;