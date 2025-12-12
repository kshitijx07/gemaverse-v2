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
import {
    PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis,
    Radar, RadarChart, PolarGrid, PolarRadiusAxis
} from 'recharts';
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
    const [matches, setMatches] = useState([]); // New Match History
    const [loading, setLoading] = useState(true);

    const { playHover, playClick } = useAudio();

    // Fetch Stats & Matches
    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem('username');
            if (!storedUser) {
                navigate('/login');
                return;
            }

            try {
                // Fetch Stats and Matches in parallel
                const [statsRes, matchesRes] = await Promise.allSettled([
                    axios.get(`/api/users/${storedUser}/stats`),
                    axios.get(`/api/matches/user/${storedUser}`)
                ]);

                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value.data);
                }

                if (matchesRes.status === 'fulfilled') {
                    setMatches(matchesRes.value.data);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    // Prepare Chart Data
    const pieData = [
        { name: 'Wins', value: stats?.wins || 0, color: '#10B981' },
        { name: 'Losses', value: stats?.losses || 0, color: '#EF4444' }
    ];

    // Process Trend Data (Last 10 matches)
    const trendData = [...matches].reverse().slice(-10).map((m, i) => ({
        index: i + 1,
        score: m.score,
        result: m.result
    }));

    // Data for Skill Radar
    const skillData = [
        { subject: 'Tactics', A: (stats?.winRate || 0), fullMark: 100 },
        { subject: 'Lethality', A: Math.min((parseFloat(stats?.kdRatio || 0) * 20), 100), fullMark: 100 }, // Scale K/D
        { subject: 'Reflexes', A: Math.min((stats?.snakeHighScore || 0) / 2, 100), fullMark: 100 }, // Scale Score
        { subject: 'Endurance', A: Math.min((stats?.playTime || 0) * 5, 100), fullMark: 100 }, // Scale Hours
        { subject: 'Experience', A: Math.min((stats?.totalXp || 0) / 50, 100), fullMark: 100 },
    ];

    // Recent Battle Log (Last 5)
    const recentBattles = [...matches].slice(0, 5);

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

                    {/* CARD 2: COMBAT RECORD (Charts & Stats) */}
                    <div className="hud-element lg:col-span-2 bg-[#0F1923]/60 backdrop-blur-sm border border-white/10 p-6 relative flex flex-col gap-6 group hover:border-yellow-400/50 transition-colors">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Combat Record</h3>
                            <div className="text-xs bg-[#FF4655]/10 text-[#FF4655] px-2 py-1 font-mono">LIVE ANALYTICS</div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-4 gap-4 text-center border-b border-white/5 pb-6">
                            <div><div className="text-2xl font-black text-white">{stats?.totalMatches || 0}</div><div className="text-[10px] text-gray-400 uppercase">Matches</div></div>
                            <div><div className="text-2xl font-black text-white">{stats?.wins || 0}</div><div className="text-[10px] text-gray-400 uppercase">Wins</div></div>
                            <div><div className="text-2xl font-black text-yellow-400">{stats?.kdRatio || '0.0'}</div><div className="text-[10px] text-gray-400 uppercase">K/D</div></div>
                            <div><div className="text-2xl font-black text-[#FF4655]">{stats?.winRate || 0}%</div><div className="text-[10px] text-gray-400 uppercase">Win Rate</div></div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[200px]">
                            {/* Win/Loss Pie */}
                            <div className="relative">
                                <div className="absolute top-2 left-2 text-[10px] text-gray-500 uppercase font-bold">Outcome Ratio</div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0F1923', borderColor: '#FF4655', color: '#FFF' }}
                                            itemStyle={{ color: '#FFF' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Score Trend Area */}
                            <div className="relative">
                                <div className="absolute top-2 left-2 text-[10px] text-gray-500 uppercase font-bold">Perf. Trend</div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FF4655" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#FF4655" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="index" hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0F1923', borderColor: '#FF4655', color: '#FFF' }}
                                            itemStyle={{ color: '#FF4655' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#FF4655" fillOpacity={1} fill="url(#colorScore)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: PLAYTIME ANALYSIS */}
                    <div className="hud-element lg:col-span-3 bg-white/5 border border-white/10 p-1 flex items-center justify-between min-h-[100px] mt-4 relative overflow-hidden backdrop-blur-sm group hover:border-[#FF4655]/50 transition-colors">
                        <div className="absolute inset-0 bg-[#FF4655]/5 skew-x-[-20deg] translate-x-1/2" />

                        <div className="p-8 z-10 flex flex-col lg:flex-row gap-8 items-center w-full justify-between">
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart
                                            innerRadius="80%"
                                            outerRadius="100%"
                                            barSize={10}
                                            data={[{ name: 'Hours', value: (stats?.playTime || 0) % 24, fill: '#FF4655' }]}
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            <PolarAngleAxis type="number" domain={[0, 24]} angleAxisId={0} tick={false} />
                                            <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <Activity className="w-8 h-8 text-[#FF4655] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white uppercase tracking-wider">Playtime Analysis</h4>
                                    <p className="text-xs text-gray-400 font-mono">Total Hours Logged in Simulation</p>
                                </div>
                            </div>
                            <div className="text-5xl font-black text-white font-mono tracking-tighter">
                                {stats?.playTime != null ? Number(stats.playTime).toFixed(1) : '0.0'}
                                <span className="text-xl text-gray-400">H</span>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: OPERATIVE SKILL GRAPH (Radar) */}
                    <div className="hud-element lg:col-span-1 bg-[#0F1923]/60 backdrop-blur-sm border border-white/10 p-4 relative flex flex-col items-center justify-center group hover:border-yellow-400/50 transition-colors h-[350px]">
                        <div className="absolute top-2 left-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Operative Skill Graph</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke="#FCE300"
                                    strokeWidth={2}
                                    fill="#FCE300"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* CARD 5: RECENT BATTLE LOG */}
                    <div className="hud-element lg:col-span-2 bg-black/40 border border-white/10 p-6 relative font-mono text-sm overflow-hidden h-[350px]">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <h3 className="text-gray-400 uppercase tracking-widest text-xs">Recent Battle Log</h3>
                            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        <div className="space-y-3 overflow-y-auto h-full pb-10 scrollbar-hide">
                            {recentBattles.length === 0 ? (
                                <div className="text-gray-600 italic">No combat data recorded.</div>
                            ) : (
                                recentBattles.map((match, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs group hover:bg-white/5 p-2 rounded transition-colors cursor-default">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-600">[{match.playedAt ? new Date(match.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'}]</span>
                                            <span className={`${match.result === 'WIN' ? 'text-green-400' : match.result === 'LOSS' ? 'text-red-400' : 'text-yellow-400'} font-bold w-12`}>
                                                {match.result || 'DONE'}
                                            </span>
                                            <span className="text-gray-300">{match.gameName}</span>
                                        </div>
                                        <div className="font-bold text-gray-500 group-hover:text-white">
                                            SCORE: {match.score}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Scanline Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-[url('https://media.giphy.com/media/dummy/giphy.gif')] opacity-[0.02]" />
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
