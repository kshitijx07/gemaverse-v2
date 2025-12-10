import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Crown } from 'lucide-react';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);

    // Data Fetch
    useEffect(() => {
        axios.get('/api/users/leaderboard')
            .then(res => setUsers(res.data))
            .catch(err => {
                console.error("Leaderboard fetch failed", err);
                // Fallback mock
                const mockUsers = Array.from({ length: 10 }).map((_, i) => ({
                    id: i,
                    username: `Player_${i + 1}`,
                    rankBadge: 'Unknown',
                    wins: 0,
                    snakeHighScore: 0,
                    winRate: 0
                }));
                setUsers(mockUsers);
            });
    }, []);

    // Helper to calculate win rate if needed (User model might not send it pre-calculated in getLeaderboard list, 
    // UserController returns raw User entities. User entity doesn't have winRate field.
    // I need to calculate it on the fly: wins / (wins + losses) * 100).
    const getWinRate = (user) => {
        const total = (user.wins || 0) + (user.losses || 0);
        return total > 0 ? Math.round((user.wins / total) * 100) + '%' : '0%';
    };

    return (
        <div className="min-h-screen bg-game-dark text-white p-8 pt-24 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Global <span className="text-game-yellow">Rankings</span></h1>
                        <p className="text-game-gray font-mono">SEASON 4 // EPISODE 2</p>
                    </div>
                    <Trophy className="w-16 h-16 text-game-yellow opacity-20" />
                </div>

                <div className="bg-[#0F1923] border border-white/10">
                    {/* Header */}
                    <div className="grid grid-cols-12 p-4 text-xs font-bold uppercase tracking-widest text-game-gray border-b border-white/10">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-4">Agent</div>
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-1 text-center text-game-yellow">XP</div>
                        <div className="col-span-2 text-center text-game-red">Snake HS</div>
                        <div className="col-span-2 text-center">Win %</div>
                    </div>

                    {/* Rows */}
                    {users.map((user, i) => (
                        <div key={user.id} className="grid grid-cols-12 p-6 items-center hover:bg-white/5 transition-colors border-b border-white/5 group">
                            <div className="col-span-1 text-center font-black text-lg text-game-gray group-hover:text-white">
                                {i === 0 ? <Crown className="w-6 h-6 text-game-yellow mx-auto" /> : i + 1}
                            </div>
                            <div className="col-span-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-800 rounded-full border border-white/10" />
                                <span className="font-bold text-lg">{user.username}</span>
                            </div>
                            <div className="col-span-2 text-center text-sm font-bold text-game-red">{user.rankBadge || user.rank || 'Unranked'}</div>
                            <div className="col-span-1 text-center font-mono text-lg text-game-yellow">{user.totalXp || 0}</div>
                            <div className="col-span-2 text-center font-mono text-game-red font-bold">{user.snakeHighScore || 0}</div>
                            <div className="col-span-2 text-center font-mono text-green-400">{getWinRate(user)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
