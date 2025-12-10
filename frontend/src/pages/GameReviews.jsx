import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, MessageSquare, Plus } from 'lucide-react';

export default function GameReviews() {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);

    useEffect(() => {
        // Initialize mock games or fetch from backend
        // axios.post('/api/games/init'); 
        // axios.get('/api/games').then(res => setGames(res.data));

        setGames([
            { id: 1, title: 'Cyberpunk Arena', rating: 4.8, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800', desc: 'Fast-paced shooter.' },
            { id: 2, title: 'Neon Racer', rating: 4.2, img: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800', desc: 'High octane racing.' },
            { id: 3, title: 'Void Walkers', rating: 4.9, img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800', desc: 'Strategy RPG.' }
        ]);
    }, []);

    return (
        <div className="min-h-screen bg-game-dark text-white p-8 pt-24 font-sans">
            <h1 className="text-4xl font-black uppercase mb-12 border-l-4 border-game-red pl-6">Operations <span className="text-gray-500">Log</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {games.map(game => (
                    <div key={game.id} onClick={() => setSelectedGame(game)} className="group bg-[#0F1923] border border-white/10 overflow-hidden cursor-pointer hover:border-game-yellow transition-all">
                        <div className="h-48 overflow-hidden relative">
                            <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 flex items-center gap-1 text-game-yellow text-xs font-bold rounded">
                                <Star className="w-3 h-3 fill-current" /> {game.rating}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-black uppercase mb-2 group-hover:text-game-red transition-colors">{game.title}</h3>
                            <p className="text-sm text-gray-400 mb-4">{game.desc}</p>
                            <div className="text-xs font-bold uppercase tracking-widest text-game-gray flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> 124 Reviews
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <div className="border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-gray-500 hover:text-white hover:border-white/30 cursor-pointer transition-all">
                    <Plus className="w-12 h-12 mb-4" />
                    <span className="font-bold uppercase tracking-widest">Submit New Log</span>
                </div>
            </div>

            {/* Modal placeholder for actual review form */}
            {selectedGame && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedGame(null)}>
                    <div className="bg-[#0F1923] p-8 border border-game-red max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-black uppercase mb-4">Review: {selectedGame.title}</h2>
                        <textarea className="w-full bg-black/30 border border-white/10 p-4 h-32 text-white mb-4 block" placeholder="Enter operational report..." />
                        <button className="w-full bg-game-red text-white font-bold uppercase py-4 hover:bg-white hover:text-black transition-colors">Submit Report</button>
                    </div>
                </div>
            )}
        </div>
    );
}
