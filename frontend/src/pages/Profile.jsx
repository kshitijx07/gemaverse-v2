import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { User, Shield, Trophy, Target, Edit3, Save, Hexagon } from 'lucide-react';
import Navbar from '../components/Navbar'; // Assuming we extract Navbar later, for now inline or link back

export default function Profile() {
    const containerRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        username: 'ProGamer123',
        rank: 'Diamond II',
        bio: 'Entry fragger looking for a team. I play Jett/Reyna main.',
        wins: 142,
        losses: 56,
        winRate: '72%'
    });

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
        );
        gsap.from(".stat-card", {
            y: 20, opacity: 0, stagger: 0.1, duration: 0.4, delay: 0.2
        });
    }, []);

    const toggleEdit = () => setIsEditing(!isEditing);

    return (
        <div ref={containerRef} className="min-h-screen bg-game-dark text-white p-8 pt-24 font-sans">

            <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">

                {/* ID CARD */}
                <div className="lg:col-span-4 bg-[#0F1923] border border-white/10 p-8 rounded-none relative overflow-visible clip-path-hud">
                    <div className="absolute top-0 right-0 p-2 text-game-yellow text-xs font-mono">ID_VERIFIED</div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 relative mb-6">
                            <Hexagon className="w-full h-full text-game-red absolute animate-spin-slow opacity-20" />
                            <div className="w-full h-full rounded-full border-4 border-game-red flex items-center justify-center bg-black/50 overflow-hidden relative z-10">
                                <User className="w-16 h-16 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{user.username}</h1>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-game-red/10 border border-game-red/30 rounded text-game-red text-sm font-bold uppercase tracking-widest mb-6">
                            <Shield className="w-4 h-4" /> {user.rank}
                        </div>

                        <div className="w-full space-y-4 text-left">
                            <div className="group">
                                <label className="text-[10px] text-game-gray uppercase tracking-widest font-bold">Bio</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-black/30 border border-white/10 p-2 text-sm text-white focus:border-game-yellow outline-none h-24 resize-none"
                                        value={user.bio}
                                        onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-white/10 pl-3">{user.bio}</p>
                                )}
                            </div>
                        </div>

                        <button onClick={toggleEdit} className="mt-8 w-full py-3 flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 hover:border-white/50 transition-all uppercase font-bold text-xs tracking-widest">
                            {isEditing ? <><Save className="w-4 h-4" /> Save Stats</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                        </button>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="lg:col-span-8 space-y-8">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                        <Target className="text-game-yellow" /> Performance Analytics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Victory Rate', value: user.winRate, color: 'text-game-yellow' },
                            { label: 'Total Wins', value: user.wins, color: 'text-green-400' },
                            { label: 'Total Losses', value: user.losses, color: 'text-red-400' },
                        ].map((stat, i) => (
                            <div key={i} className="stat-card bg-[#0F1923] border border-white/10 p-6 relative group hover:border-game-red/50 transition-colors">
                                <div className="text-4xl font-black mb-2 font-mono group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                                <div className={`text-xs uppercase tracking-widest font-bold ${stat.color}`}>{stat.label}</div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 opacity-10 bg-white clip-path-triangle" />
                            </div>
                        ))}
                    </div>

                    {/* RECENT MATCHES MOCK */}
                    <div className="bg-[#0F1923] border border-white/10 p-6">
                        <h3 className="text-xs text-game-gray uppercase tracking-widest font-bold mb-6">Recent Operations</h3>
                        <div className="space-y-2">
                            {[1, 2, 3].map((m) => (
                                <div key={m} className="flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 cursor-pointer border-l-2 border-transparent hover:border-game-yellow transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${m === 2 ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <span className="font-bold uppercase text-sm">Ranked Queue</span>
                                    </div>
                                    <div className="font-mono text-sm text-gray-500">24/10/5 KDA</div>
                                    <div className="font-bold text-sm">{m === 2 ? 'DEFEAT' : 'VICTORY'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .clip-path-hud { clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%); }
                .clip-path-triangle { clip-path: polygon(100% 0, 0 100%, 100% 100%); }
            `}</style>
        </div>
    );
}
