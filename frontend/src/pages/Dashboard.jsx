import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';
// --- 3D IMPORTS ---
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Float,
    MeshDistortMaterial,
    PerspectiveCamera,
    Environment,
    Stars,
    Sparkles
} from '@react-three/drei';
// ------------------
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
    Crosshair,
    Shield,
    Gamepad2
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

// --- COMPONENT: 3D RANK BADGE (Floating Core) ---
const HolographicCore = ({ primaryColor = "#FF4655" }) => {
    const meshRef = useRef(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = t * 0.2;
            meshRef.current.rotation.y = t * 0.4;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef} scale={2.2}>
                <icosahedronGeometry args={[1, 1]} />
                <MeshDistortMaterial
                    color={primaryColor}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                    wireframe={true}
                    emissive={primaryColor}
                    emissiveIntensity={0.5}
                />
            </mesh>
            <mesh scale={1.2}>
                <icosahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="white" wireframe transparent opacity={0.1} />
            </mesh>
        </Float>
    );
};

// --- COMPONENT: 3D BACKGROUND (Digital Void) ---
const Background3D = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <color attach="background" args={['#0F1923']} />

                {/* Fog to fade deep objects */}
                <fog attach="fog" args={['#0F1923', 5, 20]} />

                {/* Distant Star Grid */}
                <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Floating "Data" Particles (Red Accent) */}
                <Sparkles
                    count={50}
                    scale={[12, 12, 10]}
                    size={6}
                    speed={0.4}
                    opacity={0.5}
                    color="#FF4655"
                />

                {/* Floating "Dust" (White) */}
                <Sparkles
                    count={100}
                    scale={[20, 20, 10]}
                    size={2}
                    speed={0.2}
                    opacity={0.2}
                    color="#ffffff"
                />

                {/* Subtle Environment Lighting */}
                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const { playHover, playClick } = useAudio();

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
                // Optionally set fallback/demo stats if API fails, but for now we'll just log
            } finally {
                // Determine loading delay based on network speed (optional simulation)
                // or just turn off loading
                setLoading(false);
            }
        };
        fetchStats();
    }, [navigate]);

    // Animations & Cursor
    useEffect(() => {
        if (loading) return;

        // Cursor Logic (Desktop Only)
        const cursor = cursorRef.current;
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        };
        const scaleUp = () => gsap.to(cursor, { scale: 2, borderColor: '#FCE300', ease: 'elastic.out' });
        const scaleDown = () => gsap.to(cursor, { scale: 1, borderColor: '#FF4655', ease: 'power2.out' });

        window.addEventListener('mousemove', moveCursor);

        // Add listeners to interactive elements
        // We use a small timeout to let the DOM settle or just select what's there. 
        // For accurate selection of dynamically rendered items, we might need to re-run this or use delegation.
        // For now, we select existing ones.
        const interactiveElements = document.querySelectorAll('button, a, .cursor-pointer, .hud-element');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', scaleUp);
            el.addEventListener('mouseleave', scaleDown);
        });

        // GSAP Animations
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
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', scaleUp);
                el.removeEventListener('mouseleave', scaleDown);
            });
        };
    }, [loading]);

    const handleLogout = () => navigate('/login');

    if (loading) return (
        <div className="min-h-screen bg-[#0F1923] text-[#FF4655] flex items-center justify-center font-mono uppercase tracking-[0.5em] text-xs">
            <Cpu className="w-6 h-6 animate-spin mr-4" /> Initializing System...
        </div>
    );

    return (
        <div ref={mainRef} className="min-h-screen bg-[#0F1923] text-white font-sans overflow-hidden flex cursor-none selection:bg-[#FF4655] selection:text-black relative">

            {/* --- 3D BACKGROUND --- */}
            <Background3D />

            {/* CROSSHAIR CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-[#FF4655] bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-[#FF4655] rounded-full" />
            </div>

            {/* SIDEBAR HUD */}
            <aside className="w-24 border-r border-white/10 flex flex-col items-center py-10 z-20 bg-[#0F1923]/80 backdrop-blur-md relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-[#FF4655]/50 scale-y-0 hover:scale-y-100 transition-transform origin-top" />

                <div className="mb-20 hud-element">
                    <div className="w-12 h-12 border-2 border-[#FF4655] flex items-center justify-center relative group cursor-pointer">
                        <div className="absolute inset-0 bg-[#FF4655] opacity-0 group-hover:opacity-20 transition-opacity" />
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
                            onClick={() => { playClick(); navigate(item.path); }}
                            onMouseEnter={playHover}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${i === 0 ? 'border-r-2 border-[#FF4655]' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${i === 0 ? 'text-[#FF4655]' : 'text-gray-400 group-hover:text-white'}`} />
                            {i !== 0 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} className="hud-element mb-10 text-gray-400 hover:text-[#FF4655] transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* MAIN INTERFACE */}
            <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-10 lg:p-16 z-10">

                {/* HEADER */}
                <header className="mb-16 flex justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <div className="text-xs font-mono font-bold text-[#FF4655] tracking-[0.2em] mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            SYSTEM ONLINE // VERSION 4.2
                        </div>
                        <h1 className="glitch-text text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                            HELLO, <br /> <span className="text-stroke-red">{stats?.username || 'AGENT'}</span>
                        </h1>
                    </div>
                    <div className="hidden lg:block text-right font-mono text-xs text-gray-400">
                        SECTOR: 7G <br />
                        PROTOCOL: ASYNC
                    </div>
                </header>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">

                    {/* CARD 1: 3D RANK */}
                    <div className="hud-element bg-[#0F1923]/60 backdrop-blur-sm border border-white/10 p-0 overflow-hidden clip-path-slant relative group hover:border-[#FF4655]/50 transition-colors h-[400px]">
                        <div className="absolute inset-0 z-0">
                            <Canvas>
                                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                                <ambientLight intensity={0.5} />
                                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF4655" />
                                <HolographicCore primaryColor="#FF4655" />
                                <Environment preset="city" />
                            </Canvas>
                        </div>
                        <div className="relative z-10 p-8 flex flex-col justify-between h-full pointer-events-none">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Rank</h3>
                                <Shield className="w-6 h-6 text-white/50" />
                            </div>
                            <div>
                                <span className="text-5xl font-black text-white drop-shadow-lg">{stats?.rankBadge?.split(' ')[0] || 'UNRANKED'}</span>
                                <div className="mt-2 text-yellow-400 font-mono text-sm uppercase tracking-wider">{stats?.rankBadge || 'Calibrating...'}</div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: COMBAT RECORD */}
                    <div className="hud-element lg:col-span-2 bg-[#0F1923]/60 backdrop-blur-sm border border-white/10 p-8 relative flex flex-col justify-between group hover:border-yellow-400/50 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Combat Record</h3>
                            <div className="text-xs bg-[#FF4655]/10 text-[#FF4655] px-2 py-1 font-mono">LIVE FEED</div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div>
                                <div className="text-3xl font-black text-white">{stats?.totalMatches || 0}</div>
                                <div className="text-xs text-gray-400 font-mono uppercase mt-1">Matches</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white">{stats?.wins || 0}</div>
                                <div className="text-xs text-gray-400 font-mono uppercase mt-1">Victories</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-yellow-400">{stats?.kdRatio || '0.0'}</div>
                                <div className="text-xs text-gray-400 font-mono uppercase mt-1">K/D Ratio</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-[#FF4655]">{stats?.winRate || 0}%</div>
                                <div className="text-xs text-gray-400 font-mono uppercase mt-1">Win Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: RECENT */}
                    <div className="hud-element lg:col-span-3 bg-white/5 border border-white/10 p-1 flex items-center justify-between min-h-[100px] mt-4 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute inset-0 bg-[#FF4655]/5 skew-x-[-20deg] translate-x-1/2" />
                        <div className="p-8 z-10 flex flex-col lg:flex-row gap-8 items-center w-full justify-between">
                            <div className="flex items-center gap-4">
                                <Activity className="w-8 h-8 text-[#FF4655]" />
                                <div>
                                    <h4 className="font-bold text-white uppercase tracking-wider">Playtime Analysis</h4>
                                    <p className="text-xs text-gray-400 font-mono">Total Hours Logged in Simulation</p>
                                </div>
                            </div>
                            <div className="text-5xl font-black text-white font-mono tracking-tighter">{stats?.playTime || 0}<span className="text-xl text-gray-400">H</span></div>
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
