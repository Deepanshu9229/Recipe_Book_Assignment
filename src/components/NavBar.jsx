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
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
          <span className="text-2xl font-extrabold tracking-widest">RECIPE BOOK</span>
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;