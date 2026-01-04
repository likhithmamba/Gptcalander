import React, { useState, useEffect } from 'react';
import { useCalendarDispatch } from '../hooks';
import { X, Play, Pause, Square } from 'lucide-react';

export const FocusSession: React.FC = () => {
    const dispatch = useCalendarDispatch();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        let interval: number;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Auto-hide controls for immersion
    useEffect(() => {
        let timeout: number;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = window.setTimeout(() => setShowControls(false), 3000);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return {
            m: mins.toString().padStart(2, '0'),
            s: secs.toString().padStart(2, '0')
        };
    };

    const time = formatTime(timeLeft);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-black relative overflow-hidden animate-fade-in selection:bg-white selection:text-black">
            
            {/* Ambient Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-white/5 blur-[120px] rounded-full transition-all duration-[3000ms] ${isActive ? 'scale-110 opacity-30' : 'scale-90 opacity-10'}`}></div>

            {/* Exit Button */}
            <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'canvas' })} 
                className={`absolute top-8 right-8 text-mist hover:text-white transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
            >
                <X size={24} />
            </button>

            {/* The Monolith Timer */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-baseline font-mono font-bold tracking-tighter text-white tabular-nums">
                    <span className="text-[20vw] leading-none">{time.m}</span>
                    <span className="text-[5vw] opacity-50 mx-4">:</span>
                    <span className="text-[20vw] leading-none text-white/90">{time.s}</span>
                </div>
                
                <p className={`mt-8 text-sm font-mono tracking-[0.2em] text-mist transition-opacity duration-1000 ${isActive ? 'opacity-50 animate-pulse' : 'opacity-0'}`}>
                    FLOW STATE ACTIVE
                </p>
            </div>

            {/* Floating Controls */}
            <div className={`absolute bottom-20 flex gap-8 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className="group flex items-center justify-center w-20 h-20 rounded-full border border-white/10 hover:border-white/50 hover:bg-white/5 transition-all"
                >
                    {isActive ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white ml-1" />}
                </button>
                
                <button 
                    onClick={() => { setIsActive(false); setTimeLeft(25*60); }}
                    className="group flex items-center justify-center w-20 h-20 rounded-full border border-white/10 hover:border-white/50 hover:bg-white/5 transition-all"
                >
                    <Square size={24} className="text-white" />
                </button>
            </div>
        </div>
    );
};