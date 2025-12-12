import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { Play, ArrowRight, Crosshair, Cpu, Zap, Radio } from 'lucide-react';
import Navbar from '../components/Navbar';

// Register plugin
gsap.registerPlugin(ScrollTrigger);

// --- 1. SHADERS: DIGITAL VR GRID (Glitchy, Fast, Tech) ---
const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// Random noise
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = vUv;
    uv.y += curvature(uv.x) * 0.1; // CRT Curvature effect placeholder if needed

    // Grid
    float zoom = 30.0;
    vec2 gridUv = fract(uv * zoom - vec2(uTime * 0.5, uTime * 0.2)); // Moving grid
    vec2 gridId = floor(uv * zoom);

    float lineThickness = 0.05;
    float grid = step(1.0 - lineThickness, gridUv.x) + step(1.0 - lineThickness, gridUv.y);
    
    // Glitch / Data Stream
    float noiseVal = random(vec2(gridId.y, floor(uTime * 10.0)));
    float stream = step(0.98, noiseVal) * step(uv.x, uMouse.x + 0.2) * step(uMouse.x - 0.2, uv.x);

    // Color Palette
    vec3 baseColor = vec3(0.06, 0.1, 0.14); // #0F1923 Dark Navy
    vec3 gridColor = vec3(1.0, 1.0, 1.0) * 0.1; 
    vec3 accentColor = vec3(1.0, 0.27, 0.33); // #FF4655 Red
    
    vec3 color = baseColor;
    
    // Mix Grid
    color = mix(color, gridColor, grid);
    
    // Mix Stream/Glitch
    color = mix(color, accentColor, stream * 0.8);

    // Vignette
    float d = length(uv - 0.5);
    color *= 1.0 - d * 0.5;

    gl_FragColor = vec4(color, 1.0);
}

float curvature(float x) {
    return x * x * 0.1;
}
`;

// Simple Vertex Shader override for full control
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// --- 2. COMPONENTS ---



// 3. LANDING PAGE
export default function LandingPage() {
    const mountRef = useRef(null);
    const cursorRef = useRef(null);
    const mainRef = useRef(null);

    // Three.js Setup
    useEffect(() => {
        const mount = mountRef.current;
        const W = mount.clientWidth;
        const H = mount.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(W / -2, W / 2, H / 2, H / -2, 0.1, 10);
        camera.position.z = 1;

        const uniforms = {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(W, H) },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        };

        const geometry = new THREE.PlaneGeometry(W, H);
        // Using a simpler, highly performant shader material for the grid
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: `
                precision mediump float;
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uMouse;
                varying vec2 vUv;
                
                float random(vec2 st) { return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }
                
                void main() {
                    vec2 aspect = vec2(uResolution.x/uResolution.y, 1.0);
                    vec2 uv = vUv * aspect * 10.0; // Grid scale
                    
                    // Moving Grid
                    uv.x += uTime * 0.5;
                    
                    vec2 f = fract(uv);
                    vec2 i = floor(uv);
                    
                    // Grid Lines
                    float line = step(0.95, f.x) + step(0.95, f.y);
                    
                    // Random Tech Data blocks
                    float noise = step(0.9, random(i + floor(uTime * 5.0)));
                    
                    vec3 col = vec3(0.06, 0.1, 0.14); // Base
                    col += vec3(0.1) * line; // Grid lines
                    col += vec3(1.0, 0.27, 0.33) * noise * 0.5; // Red Glitch
                    
                    // Mouse interaction
                    float d = distance(vUv * aspect, uMouse * aspect);
                    col += vec3(0.99, 0.89, 0.0) * smoothstep(0.2, 0.0, d) * 0.1; // Yellow tint near mouse

                    gl_FragColor = vec4(col, 1.0);
                }
            `
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const onResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            renderer.setSize(w, h);
            uniforms.uResolution.value.set(w, h);
            camera.left = w / -2;
            camera.right = w / 2;
            camera.top = h / 2;
            camera.bottom = h / -2;
            camera.updateProjectionMatrix();
            mesh.geometry = new THREE.PlaneGeometry(w, h);
        };

        const onMouseMove = (e) => {
            const rect = mount.getBoundingClientRect();
            uniforms.uMouse.value.set(
                (e.clientX - rect.left) / rect.width,
                1.0 - (e.clientY - rect.top) / rect.height
            );
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);

        let frameId;
        const animate = (t) => {
            uniforms.uTime.value = t * 0.001;
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate(0);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            mount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    // Custom CROSSHAIR Cursor
    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

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

        return () => {
            try {
                window.removeEventListener('mousemove', moveCursor);
                document.querySelectorAll('a, button').forEach(el => {
                    el.removeEventListener('mouseenter', scaleUp);
                    el.removeEventListener('mouseleave', scaleDown);
                });
            } catch (e) { }
        };
    }, []);

    // GSAP HIGHLIGHTS SCROLL
    useEffect(() => {
        const ctx = gsap.context(() => {
            const sections = gsap.utils.toArray('.highlight-panel');

            // Horizontal Scroll for Work Section
            gsap.to(sections, {
                xPercent: -100 * (sections.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: '.highlights-container',
                    pin: true,
                    scrub: 1,
                    snap: 1 / (sections.length - 1),
                    end: () => '+=' + document.querySelector('.highlights-container').offsetWidth
                }
            });

            // Glitch Text Reveal
            gsap.from('.hero-glitch', {
                y: 100, opacity: 0, skewX: 20, duration: 1, stagger: 0.1, ease: 'power4.out', delay: 0.5
            });

        }, mainRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={mainRef} className="bg-game-dark text-white min-h-screen font-sans overflow-x-hidden selection:bg-game-red selection:text-black cursor-none">

            {/* CROSSHAIR CURSOR */}
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-game-red bg-transparent rounded-full mix-blend-difference flex items-center justify-center">
                <div className="w-1 h-1 bg-game-red rounded-full" />
            </div>

            <Navbar />

            {/* HERO SECTION */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden border-b border-white/10">
                <div ref={mountRef} className="absolute inset-0 z-0 opacity-80" />

                <div className="relative z-10 text-center px-6">
                    <div className="overflow-hidden">
                        <h1 className="hero-glitch text-[12vw] leading-[0.85] font-black uppercase tracking-[-0.05em] font-mono text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 hover:text-game-red transition-colors duration-300 select-none">
                            Master The <br /> <span className="text-stroke-2">Grid</span>
                        </h1>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-6">
                        <p className="font-mono text-game-red tracking-[0.2em] text-sm md:text-base animate-pulse">
                            /// TACTICAL GAMING TERMINAL ONLINE_
                        </p>
                        <button className="group relative px-10 py-4 bg-game-red text-black font-bold uppercase tracking-widest clip-path-slant hover:bg-game-yellow transition-colors overflow-hidden">
                            <span className="relative z-10">Initiate Protocol</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Tech Geometry Decorations */}
                <div className="absolute bottom-10 left-10 hidden md:block font-mono text-xs text-game-gray">
                    COORDS: 34.0522° N, 118.2437° W <br />
                    SYSTEM: ONLINE
                </div>
            </header>

            {/* HIGHLIGHTS / WORK SCROLL (Horizontal) */}
            <section className="highlights-container h-screen w-[300%] flex flex-nowrap bg-game-dark relative overflow-hidden">

                {/* Panel 1: Jett Knife */}
                <div className="highlight-panel w-screen h-full flex items-center justify-center p-10 md:p-32 flex-shrink-0 relative border-r border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-[1600px]">
                        <div className="order-2 md:order-1">
                            <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 text-white">
                                Snake <span className="text-game-red">Protocol</span>
                            </h2>
                            <p className="text-xl text-game-gray max-w-lg mb-8">
                                Navigate the infinite grid. Consume, grow, survive. The classic challenge reimagined for the elite.
                            </p>
                            <div className="font-mono text-xs text-game-yellow">
                                MODULE: SNAKE // STATUS: ACTIVE
                            </div>
                        </div>
                        <div className="order-1 md:order-2 h-[50vh] bg-black relative border-2 border-white/20 p-2">
                            <img
                                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW53b3F6Znh4eW53b3F6Znh4eW53b3F6Znh4eW53b3F6Znh4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aD2saalBwwftBIY/giphy.gif" // Placeholder ACTION gif
                                alt="Action Clip"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Panel 2: Cyberpunk City */}
                <div className="highlight-panel w-screen h-full flex items-center justify-center p-10 md:p-32 flex-shrink-0 relative border-r border-white/10 bg-[#000]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-[1600px]">
                        <div className="h-[50vh] bg-black relative border-2 border-game-yellow p-2">
                            <img
                                src="https://media.giphy.com/media/fH983FJbMMz4eMFft1/giphy.gif?cid=ecf05e478y4y4y4y4y4y4y4y4y4y4y4y4y4y4y4y4y4y4y4y&ep=v1_gifs_search&rid=giphy.gif&ct=g"
                                alt="Cyberpunk City"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-game-yellow text-black text-xs font-bold px-2 py-1">AI ACTIVE</div>
                        </div>
                        <div>
                            <h2 className="text-6xl md:text-8xl font-black uppercase mb-4 text-game-yellow">
                                Siege <span className="text-white">Engine</span>
                            </h2>
                            <p className="text-xl text-game-gray max-w-lg mb-8">
                                Strategic warfare on a 3x3 matrix. Defeat the adaptive AI or challenge rival agents.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Panel 3: VR HUD */}
                <div className="highlight-panel w-screen h-full flex items-center justify-center p-10 md:p-32 flex-shrink-0 relative bg-game-red">
                    <div className="text-center">
                        <div className="mb-8 inline-block p-4 border-4 border-black">
                            <Cpu className="w-24 h-24 text-black animate-spin-slow" />
                        </div>
                        <h2 className="text-[10vw] font-black uppercase text-black leading-none">
                            Ranked <br /> Warfare
                        </h2>
                        <p className="text-2xl text-black font-bold mt-8">
                            Climb the leaderboard. Secure your legacy.
                        </p>
                    </div>
                </div>

            </section>

            {/* NEXT GEN ENGINE (Features) */}
            <section className="py-32 px-6 bg-game-dark border-t border-white/10 relative z-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/10 pb-10">
                        <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                            Agent <br /> <span className="text-game-red">Abilities</span>
                        </h3>
                        <div className="text-right font-mono text-sm text-game-gray mt-8 md:mt-0">
                            // UPDATED: PATCH 7.02 <br />
                            // REGION: GLOBAL
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            { icon: Zap, title: "Hyper Speed", desc: "Low latency inputs for competitive integrity." },
                            { icon: Radio, title: "Global Comms", desc: "Real-time voice architecture integration." },
                            { icon: Crosshair, title: "Pixel Perfect", desc: "128-tick servers as standard." }
                        ].map((feat, i) => (
                            <div key={i} className="group p-10 border border-white/10 hover:border-game-red transition-all cursor-pointer bg-white/5 hover:bg-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-50">
                                    <feat.icon className="w-12 h-12 text-white/10 group-hover:text-game-red/20 transition-colors" />
                                </div>
                                <div className="text-4xl font-black mb-4 group-hover:text-game-red transition-colors">0{i + 1}</div>
                                <h4 className="text-xl font-bold uppercase mb-2">{feat.title}</h4>
                                <p className="text-game-gray text-sm">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-20 px-6 bg-black text-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <h2 className="text-[20vw] font-black text-white select-none">GAME</h2>
                </div>

                <div className="relative z-10">
                    <button className="px-12 py-6 bg-white text-black font-black text-2xl uppercase tracking-widest hover:bg-game-red hover:text-white transition-all clip-path-slant mb-12">
                        DO HAVE FUN !!!
                    </button>

                    <div className="flex justify-center gap-8 font-mono text-sm text-game-gray uppercase">
                        <a href="#" className="hover:text-white">Legal</a>
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Support</a>
                    </div>
                </div>
            </footer>

            <style>{`
                .clip-path-slant {
                    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
                }
                .text-stroke-2 {
                    -webkit-text-stroke: 2px #FF4655;
                    color: transparent;
                }
            `}</style>
        </div>
    );
}