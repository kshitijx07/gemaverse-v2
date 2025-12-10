import React, { useRef, useEffect, useState } from 'react';
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
    ArrowLeft,
    Crosshair
} from 'lucide-react';
import ChatRooms from '../components/ChatRooms';
import RoomLobby from '../components/RoomLobby';
import axios from 'axios';

export default function ChatPage() {
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const [currentRoom, setCurrentRoom] = useState(null); // null = Lobby
    const [username, setUsername] = useState('Player_' + Math.floor(Math.random() * 1000));

    useEffect(() => {
        const initUser = async () => {
            const storedUser = localStorage.getItem('username');
            if (storedUser) {
                setUsername(storedUser);
            }
        };
        initUser();
    }, []);

    // Custom Cursor & Animations
    useEffect(() => {
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

        const ctx = gsap.context(() => {
            gsap.from('.hud-element', {
                x: -20,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: 'power3.out'
            });

            gsap.from('.chat-container', {
                y: 20,
                opacity: 0,
                duration: 1.0,
                ease: 'power3.out',
                delay: 0.3
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
    }, []);

    const handleLogout = () => navigate('/login');

    const handleLeaveRoom = async () => {
        if (currentRoom) {
            try {
                await axios.post(`/api/chat/rooms/${currentRoom.id}/leave`, { username });
            } catch (e) { }
        }
        setCurrentRoom(null);
    };

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
                        { icon: Sword, path: '/matchmaking' },
                        { icon: Trophy, path: '/leaderboard' },
                        { icon: Target, path: '/reviews' },
                        { icon: Users, path: '/profile' },
                        { icon: MessageSquare, path: '/chat' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(item.path)}
                            className={`hud-element group relative flex justify-center w-full py-2 hover:bg-white/5 transition-colors ${i === 5 ? 'border-r-2 border-game-red' : ''}`}
                        >
                            <item.icon className={`w-6 h-6 transition-colors duration-300 ${i === 5 ? 'text-game-red' : 'text-game-gray group-hover:text-white'}`} />
                            {i !== 5 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-game-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} className="hud-element mb-10 text-game-gray hover:text-game-red transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 relative overflow-hidden p-0 flex flex-col z-10">
                {currentRoom && (
                    <div className="h-16 border-b border-white/10 bg-[#0F1923]/95 flex items-center px-6 justify-between backdrop-blur-md">
                        <button onClick={handleLeaveRoom} className="flex items-center gap-2 text-game-gray hover:text-game-red transition-colors text-xs uppercase tracking-widest font-mono group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Lobby
                        </button>
                        <div>
                            <span className="text-xs text-game-gray font-mono mr-2">SECURE_CHANNEL:</span>
                            <span className="text-sm font-bold tracking-wide text-white uppercase">{currentRoom.name}</span>
                        </div>
                    </div>
                )}

                {/* Full Height Chat Interface */}
                <div className="chat-container w-full flex-1 relative z-10">
                    {currentRoom ? (
                        <ChatRooms
                            roomId={currentRoom.id}
                            roomName={currentRoom.name}
                            username={username}
                        />
                    ) : (
                        <RoomLobby onJoinRoom={setCurrentRoom} username={username} />
                    )}
                </div>
            </main>
        </div>
    );
}
