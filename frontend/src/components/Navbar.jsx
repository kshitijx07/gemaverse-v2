import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 mix-blend-difference">
            <div className="max-w-[1800px] mx-auto flex justify-between items-center border-b border-white/20 pb-4 relative">
                {/* HUD Decoration */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-game-red" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-game-red" />

                <Link to="/" className="text-2xl font-black tracking-tighter uppercase font-mono flex items-center gap-2 text-white">
                    <div className="w-3 h-3 bg-game-red animate-pulse" />
                    GAME<span className="text-game-red">VERSE</span>_HUD
                </Link>



                <div className="flex items-center gap-4">
                    <Link to="/login" className="px-6 py-2 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-game-red hover:border-game-red hover:text-black transition-all clip-path-slant text-white">
                        Login_SYS
                    </Link>
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
