"use client";

import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#71717a'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-zinc-950/95 border border-white/10 rounded-lg px-2.5 py-1.5 shadow-xl text-xs backdrop-blur-md pointer-events-none">
        <div className="flex items-center gap-1.5 font-medium text-white">
          <span 
            className="w-2 h-2 rounded-full shrink-0" 
            style={{ backgroundColor: item.payload.fill || item.color }} 
          />
          <span>{item.name}:</span>
          <span className="font-mono text-zinc-300 font-semibold">{item.value} plays</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DeviceChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={36}
          outerRadius={56}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={PIE_COLORS[index % PIE_COLORS.length]} 
              className="transition-all hover:opacity-80 cursor-pointer"
            />
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
