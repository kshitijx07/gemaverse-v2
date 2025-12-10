import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    LayoutDashboard,
    Trophy,
    Users,
    LogOut,
    Sword,
    Target,
    MessageSquare,
    Gamepad2,
    Play,
    Crosshair
} from 'lucide-react';

export default function GamesPage() {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);

    // Custom Cursor & Animations
    useLayoutEffect(() => {
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        const scaleUp = () => gsap.to(cursor, { scale: 2, borderColor: '#FCE300', ease: 'elastic.out' });
        const scaleDown = () => gsap.to(cursor, { scale: 1, borderColor: '#FF4655', ease: 'power2.out' });

        window.addEventListener('mousemove', moveCursor);
        document.querySelectorAll('a, button, .game-card').forEach(el => {
            el.addEventListener('mouseenter', scaleUp);
            el.addEventListener('mouseleave', scaleDown);
        });

        const ctx = gsap.context(() => {
            gsap.from('.hud-element', {
                x: -20,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power3.out'
            });

            gsap.fromTo('.game-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'back.out(1.7)',
                    delay: 0.5
                }
            );
        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
            document.querySelectorAll('a, button, .game-card').forEach(el => {
                el.removeEventListener('mouseenter', scaleUp);
                el.removeEventListener('mouseleave', scaleDown);
            });
        };
    }, []);

    const handleLogout = () => navigate('/login');

    const games = [
        {
            id: 'snake',
            title: 'SNAKE PROTOCOL',
            desc: 'Navigate the grid. Consume data packets. Avoid termination.',
            path: '/games/snake',
            image: 'https://images.unsplash.com/photo-1614726365723-49cfa385a494?w=800&q=80', // Replace with generated/better image later
            stats: 'HIGH SCORE TRACKED'
        },
        {
            id: 'tictactoe',
            title: 'TIC-TAC-TOE SIEGE',
            desc: 'Tactical grid domination. Outsmart the AI defense system.',
            path: '/games/tictactoe',
            image: 'https://images.unsplash.com/photo-1668901382969-8c73e450a1f5?w=800&q=80',
            stats: 'WINS AFFECT GLOBAL RANK'
        }
    ];

    return (
        <div ref={mainRef} className="min-h-screen bg-game-dark text-white font-sans overflow-hidden flex cursor-none selection:bg-game-red selection:text-black">

            {/* CROSSHAIR CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            {/* BACKGROUND GRID */}
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-10 pointer-events-none"
                style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            />

            {/* SIDEBAR HUD */}
            <aside className="w-24 border-r border-white/10 flex flex-col items-center py-10 z-20 bg-[#0F1923]/90 backdrop-blur-sm relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-game-red/50 scale-y-0 hover:scale-y-100 transition-transform origin-top" />

                <div className="mb-20 hud-element">
                    <div className="w-12 h-12 border-2 border-game-red flex items-center justify-center relative group cursor-pointer">
                        <div className="absolute inset-0 bg-game-red opacity-0 group-hover:opacity-20 transition-opacity" />
                        <Crosshair className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-10 w-full">
                    {[
                        { icon: LayoutDashboard, path: '/dashboard' },
                        { icon: Gamepad2, path: '/games' },
                        { icon: Sword, path: '/matchmaking' },
                        { icon: Trophy, path: '/leaderboard' },
                        { icon: Target, path: '/reviews' },
                        { icon: Users, path: '/profile' },
                        { icon: MessageSquare, path: '/chat' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(item.path)}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${item.path === '/games' ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${item.path === '/games' ? 'text-game-red' : 'text-game-gray group-hover:text-white'}`} />
                            {item.path !== '/games' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} className="hud-element mb-10 text-game-gray hover:text-game-red transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 relative overflow-y-auto p-10 lg:p-20 flex flex-col z-10">
                <header className="flex justify-between items-end mb-20 hud-element">
                    <div>
                        <div className="text-xs text-game-red font-mono tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4" /> SIMULATION DECK
                        </div>
                        <h1 className="text-6xl font-black uppercase italic tracking-tighter">
                            ACTIVE <span className="text-stroke-red">PROTOCOLS</span>
                        </h1>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-2xl font-bold font-mono text-game-yellow">STATUS: LIVE</div>
                        <div className="text-xs text-game-gray tracking-widest">SYSTEM OPTIMAL</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
                    {games.map((game, idx) => (
                        <div
                            key={game.id}
                            onClick={() => navigate(game.path)}
                            className="game-card group relative h-80 bg-[#0F1923] border border-white/10 hover:border-game-red transition-all duration-300 cursor-pointer overflow-hidden clip-path-slant"
                        >
                            {/* Bg Image */}
                            <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${game.image})` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white group-hover:text-game-yellow transition-colors">
                                        {game.title}
                                    </h2>
                                    <Play className="w-8 h-8 text-game-red opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                                </div>
                                <p className="text-game-gray text-sm font-mono mb-4 border-l-2 border-game-red pl-3">
                                    {game.desc}
                                </p>
                                <div className="inline-block bg-game-red/20 border border-game-red/50 text-game-red text-[10px] uppercase font-bold px-2 py-1 tracking-widest">
                                    {game.stats}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
