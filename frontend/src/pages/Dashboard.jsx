import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';
import {
    LayoutDashboard,
    Trophy,
    Users,
    LogOut,
    Sword,
    Target,
    MessageSquare,
    Cpu,
    Activity,
    Zap,
    Crosshair,
    Shield,
    Gamepad2
} from 'lucide-react';


export default function Dashboard() {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Stats
    useEffect(() => {
        const fetchStats = async () => {
            const storedUser = localStorage.getItem('username');
            if (!storedUser) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`/api/users/${storedUser}/stats`);
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate]);

    // Custom Cursor & Animations
    useEffect(() => {
        if (loading) return;

        // Cursor Logic
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        const scaleUp = () => gsap.to(cursor, { scale: 2, borderColor: '#FCE300', ease: 'elastic.out' });
        const scaleDown = () => gsap.to(cursor, { scale: 1, borderColor: '#FF4655', ease: 'power2.out' });

        window.addEventListener('mousemove', moveCursor);
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', scaleUp);
            el.addEventListener('mouseleave', scaleDown);
        });

        // Entrance Animations
        const ctx = gsap.context(() => {
            gsap.from('.hud-element', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });

            gsap.from('.glitch-text', {
                skewX: 20,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                delay: 0.2
            });

        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', moveCursor);
            document.querySelectorAll('a, button').forEach(el => {
                el.removeEventListener('mouseenter', scaleUp);
                el.removeEventListener('mouseleave', scaleDown);
            });
        };
    }, [loading]);

    const handleLogout = () => navigate('/login');

    if (loading) return (
        <div className="min-h-screen bg-game-dark text-game-red flex items-center justify-center font-mono uppercase tracking-[0.5em] text-xs">
            <Cpu className="w-6 h-6 animate-spin mr-4" /> Initializing System...
        </div>
    );

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
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${i === 0 ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${i === 0 ? 'text-game-red' : 'text-game-gray group-hover:text-white'}`} />
                            {i !== 0 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} className="hud-element mb-10 text-game-gray hover:text-game-red transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* MAIN INTERFACE */}
            <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-10 lg:p-16 z-10">

                {/* HEADER */}
                <header className="mb-16 flex justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <div className="text-xs font-mono font-bold text-game-red tracking-[0.2em] mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-game-green rounded-full animate-pulse" />
                            SYSTEM ONLINE // VERSION 4.2
                        </div>
                        <h1 className="glitch-text text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                            HELLO, <br /> <span className="text-stroke-red">{stats?.username || 'AGENT'}</span>
                        </h1>
                    </div>
                    <div className="hidden lg:block text-right font-mono text-xs text-game-gray">
                        SECTOR: 7G <br />
                        PROTOCOL: ASYNC
                    </div>
                </header>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">

                    {/* CARD 1: RANK */}
                    <div className="hud-element bg-[#0F1923]/80 border border-white/10 p-8 clip-path-slant relative group hover:border-game-red/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-50"><Shield className="w-8 h-8 text-white/20" /></div>
                        <h3 className="text-sm font-bold text-game-gray uppercase tracking-widest mb-6">Current Rank</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{stats?.rankBadge?.split(' ')[0] || 'UNRANKED'}</span>
                        </div>
                        <div className="mt-2 text-game-yellow font-mono text-sm uppercase tracking-wider">{stats?.rankBadge || 'Calibrating...'}</div>
                        <div className="mt-8 h-1 w-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-game-red w-3/4 animate-pulse" />
                        </div>
                    </div>

                    {/* CARD 2: COMBAT RECORD */}
                    <div className="hud-element lg:col-span-2 bg-[#0F1923]/80 border border-white/10 p-8 relative flex flex-col justify-between group hover:border-game-yellow/50 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-game-gray uppercase tracking-widest">Combat Record</h3>
                            <div className="text-xs bg-game-red/10 text-game-red px-2 py-1 font-mono">LIVE FEED</div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div>
                                <div className="text-3xl font-black text-white">{stats?.totalMatches || 0}</div>
                                <div className="text-xs text-game-gray font-mono uppercase mt-1">Matches</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white">{stats?.wins || 0}</div>
                                <div className="text-xs text-game-gray font-mono uppercase mt-1">Victories</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-game-yellow">{stats?.kdRatio || '0.0'}</div>
                                <div className="text-xs text-game-gray font-mono uppercase mt-1">K/D Ratio</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-game-red">{stats?.winRate || 0}%</div>
                                <div className="text-xs text-game-gray font-mono uppercase mt-1">Win Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: RECENT */}
                    <div className="hud-element lg:col-span-3 bg-white/5 border border-white/10 p-1 flex items-center justify-between min-h-[100px] mt-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-game-red/5 skew-x-[-20deg] translate-x-1/2" />
                        <div className="p-8 z-10 flex flex-col lg:flex-row gap-8 items-center w-full justify-between">
                            <div className="flex items-center gap-4">
                                <Activity className="w-8 h-8 text-game-red" />
                                <div>
                                    <h4 className="font-bold text-white uppercase tracking-wider">Playtime Analysis</h4>
                                    <p className="text-xs text-game-gray font-mono">Total Hours Logged in Simulation</p>
                                </div>
                            </div>
                            <div className="text-5xl font-black text-white font-mono tracking-tighter">{stats?.playTime || 0}<span className="text-xl text-game-gray">H</span></div>
                        </div>
                    </div>

                </div>

            </main>

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(
                        20px 0, 100% 0, 
                        100% calc(100% - 20px), calc(100% - 20px) 100%, 
                        0 100%, 0 20px
                    );
                }
                .text-stroke-red {
                    -webkit-text-stroke: 1px #FF4655;
                    color: transparent;
                }
            `}</style>
        </div>
    );
}
