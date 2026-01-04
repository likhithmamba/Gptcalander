import React, { useState, useEffect } from 'react';
import { useCalendarDispatch } from '../hooks';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

export const FocusSession: React.FC = () => {
    const dispatch = useCalendarDispatch();
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'break'>('work');

    useEffect(() => {
        let interval: number;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound?
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    };
    
    const exitFocus = () => dispatch({ type: 'SET_APP_VIEW', payload: 'dashboard' });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-bg relative animate-fade-in">
            <button onClick={exitFocus} className="absolute top-6 right-6 p-2 text-mist hover:text-text">
                <X size={24} />
            </button>

            <div className="mb-8 flex gap-4">
                <button 
                    onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
                    className={`px-4 py-1 rounded-full text-sm font-mono transition-all ${mode === 'work' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-mist bg-surface'}`}
                >
                    DEEP WORK
                </button>
                <button 
                    onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                    className={`px-4 py-1 rounded-full text-sm font-mono transition-all ${mode === 'break' ? 'bg-success text-white shadow-lg shadow-success/20' : 'text-mist bg-surface'}`}
                >
                    RECHARGE
                </button>
            </div>

            <div className="relative">
                {/* Glowing ring */}
                <div className={`absolute -inset-8 rounded-full blur-3xl opacity-20 ${isActive ? 'bg-secondary animate-pulse-slow' : 'bg-transparent'}`}></div>
                <h1 className="text-9xl font-mono font-bold text-text tabular-nums tracking-tighter relative z-10">
                    {formatTime(timeLeft)}
                </h1>
            </div>

            <div className="mt-12 flex gap-6">
                <button onClick={toggleTimer} className="w-16 h-16 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-text">
                    {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button onClick={resetTimer} className="w-16 h-16 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-mist hover:text-text">
                    <RotateCcw size={24} />
                </button>
            </div>

            <p className="mt-12 text-mist text-sm animate-pulse opacity-50">
                {isActive ? "Stay with the task. The rest can wait." : "Ready to engage?"}
            </p>
        </div>
    );
};
