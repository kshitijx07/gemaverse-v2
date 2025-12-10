import React, { useState } from 'react';
import { gsap } from 'gsap';
import { Radio, Search, Users, Clock, Zap } from 'lucide-react';

export default function Matchmaking() {
    const [searching, setSearching] = useState(false);
    const [timer, setTimer] = useState(0);

    const startQueue = () => {
        setSearching(true);
        let t = 0;
        const interval = setInterval(() => {
            t += 1;
            setTimer(t);
            // Mock Match Found afte 5s
            if (t > 4) {
                clearInterval(interval);
                alert("MATCH FOUND! (Backend integration pending...)");
                setSearching(false);
                setTimer(0);
            }
        }, 1000);

        // Radar Spinner
        gsap.to(".radar-spin", { rotation: 360, repeat: -1, duration: 2, ease: "linear" });
    };

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="min-h-screen bg-game-dark flex items-center justify-center relative overflow-hidden text-white font-sans p-6">

            {/* Background Map Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555617981-778dd2509121?w=1600')] bg-cover bg-center mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl text-center">

                <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 italic">Ranked <span className="text-game-red">Queue</span></h1>
                <p className="text-game-gray font-mono mb-12">SERVER: US-EAST-1 // TICK: 128</p>

                {/* RADAR UI */}
                <div className="w-64 h-64 mx-auto bg-black/40 border border-white/20 rounded-full relative flex items-center justify-center mb-12 backdrop-blur-md">
                    {searching && (
                        <>
                            <div className="radar-spin absolute inset-0 border-t-2 border-game-red rounded-full opacity-50" />
                            <div className="radar-spin absolute inset-2 border-r-2 border-game-yellow rounded-full opacity-30 animation-delay-500" />
                            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-game-red to-transparent opacity-20 animate-pulse" />
                        </>
                    )}

                    <div className="text-center z-10">
                        {searching ? (
                            <>
                                <div className="text-3xl font-mono font-bold animate-pulse">{formatTime(timer)}</div>
                                <div className="text-[10px] uppercase tracking-widest text-game-gray mt-2">Searching...</div>
                            </>
                        ) : (
                            <Zap className="w-16 h-16 text-white/20" />
                        )}
                    </div>
                </div>

                <button
                    onClick={startQueue}
                    disabled={searching}
                    className={`px-12 py-6 bg-white text-black font-black text-2xl uppercase tracking-widest clip-path-slant transition-all hover:scale-105 active:scale-95 ${searching ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'hover:bg-game-red hover:text-white'}`}
                >
                    {searching ? "In Queue" : "Find Match"}
                </button>

                <div className="mt-12 grid grid-cols-3 gap-4 text-xs font-mono text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>12,402 ONLINE</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>EST. WAIT: 0:45</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Radio className="w-4 h-4" />
                        <span>PING: 14ms</span>
                    </div>
                </div>

            </div>

            <style>{`
                .clip-path-slant { clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%); }
            `}</style>
        </div>
    );
}
