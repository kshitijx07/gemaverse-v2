import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users, MessageSquare } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const ChatRooms = ({ roomId = 'public', roomName = 'Global Comms', username }) => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // Refs for WebSocket client
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Clear messages when switching rooms
        setMessages([]);
        setIsConnected(false);

        // Connect to WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log(`Connected to room: ${roomId}`);
            setIsConnected(true);

            // Subscribe to Specific Room Topic
            const topic = roomId === 'public' ? '/topic/public' : `/topic/room/${roomId}`;

            client.subscribe(topic, (payload) => {
                const message = JSON.parse(payload.body);
                setMessages(prev => [...prev, message]);
            });

            // Join Message - Route to correct room
            client.send(`/app/chat/${roomId}/addUser`, {}, JSON.stringify({
                sender: username,
                type: 'JOIN'
            }));

        }, (err) => {
            console.error('Error connecting to chat:', err);
            setIsConnected(false);
        });

        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
        };
    }, [roomId, username]); // Re-connect if room changes

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && stompClientRef.current && isConnected) {
            const chatMessage = {
                sender: username,
                content: messageInput,
                type: 'CHAT'
            };

            // Send to dynamic room endpoint
            stompClientRef.current.send(`/app/chat/${roomId}/sendMessage`, {}, JSON.stringify(chatMessage));
            setMessageInput('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-transparent border-none rounded-none overflow-hidden text-white font-sans">

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.type === 'JOIN' ? 'items-center my-4' : (msg.sender === username ? 'items-end' : 'items-start')}`}>

                        {msg.type === 'JOIN' ? (
                            <div className="text-xs text-game-yellow tracking-widest uppercase opacity-70 border border-game-yellow/20 px-2 py-1 bg-game-yellow/5">
                                -- {msg.sender} CONNECTED --
                            </div>
                        ) : (
                            <div className={`max-w-[80%] ${msg.sender === username ? 'text-right' : 'text-left'}`}>
                                <div className={`text-[10px] mb-1 uppercase tracking-wider flex items-center gap-2 ${msg.sender === username ? 'justify-end text-game-red' : 'justify-start text-game-gray'}`}>
                                    <span>{msg.sender}</span>
                                </div>
                                <div className={`p-3 text-sm font-light tracking-wide leading-relaxed shadow-lg backdrop-blur-sm ${msg.sender === username
                                    ? 'bg-game-red/10 border-r-2 border-game-red rounded-l-lg rounded-tr-none text-white'
                                    : 'bg-white/5 border-l-2 border-white/20 rounded-r-lg rounded-tl-none text-game-gray'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-[#0F1923]">
                <form onSubmit={sendMessage} className="flex gap-4">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={`Start Transmission...`}
                        className="flex-1 bg-black/50 border border-white/10 p-4 text-sm focus:outline-none focus:border-game-yellow transition-colors font-mono tracking-wider text-white placeholder-gray-700"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected}
                        className="bg-game-red text-black px-6 py-2 uppercase text-xs font-black tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatRooms;
