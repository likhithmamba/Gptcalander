import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ViewProps } from '../types';

export const PressureView: React.FC<ViewProps> = ({ thoughts }) => {
  // Aggregate data by day (mock logic for demo as dates might be fuzzy)
  // We'll visualize intensity and count
  
  const totalActive = thoughts.filter(t => t.status === 'active').length;
  const highIntensity = thoughts.filter(t => t.intensity === 'high').length;
  const completionRate = thoughts.length ? Math.round((thoughts.filter(t => t.status === 'done').length / thoughts.length) * 100) : 0;

  const data = [
    { name: 'Low', count: thoughts.filter(t => t.intensity === 'low').length, color: '#4b5563' },
    { name: 'Med', count: thoughts.filter(t => t.intensity === 'medium').length, color: '#d97706' },
    { name: 'High', count: highIntensity, color: '#991b1b' },
  ];

  return (
    <div className="pb-32 px-4 max-w-2xl mx-auto w-full pt-8 animate-fade-in">
      <h2 className="text-3xl font-thin text-glow mb-2 tracking-tight">Pressure</h2>
      <p className="text-mist mb-12 text-sm">Cognitive load analysis</p>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="bg-paper p-4 rounded-lg border border-[#333] text-center">
          <span className="block text-2xl font-bold text-glow">{totalActive}</span>
          <span className="text-xs text-mist uppercase tracking-wider">Active</span>
        </div>
        <div className="bg-paper p-4 rounded-lg border border-[#333] text-center">
          <span className="block text-2xl font-bold text-red-400">{highIntensity}</span>
          <span className="text-xs text-mist uppercase tracking-wider">Heavy</span>
        </div>
        <div className="bg-paper p-4 rounded-lg border border-[#333] text-center">
          <span className="block text-2xl font-bold text-accent">{completionRate}%</span>
          <span className="text-xs text-mist uppercase tracking-wider">Momentum</span>
        </div>
      </div>

      <div className="h-64 w-full bg-paper rounded-lg p-4 border border-[#333]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#555" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              itemStyle={{ color: '#e5e5e5' }}
              cursor={{fill: '#333', opacity: 0.2}}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
