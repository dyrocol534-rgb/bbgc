"use client";

import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

interface AcquisitionChartProps {
  data: { date: string; users: number; guests: number }[];
  mode?: "bar" | "area";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const users = payload.find((p: any) => p.dataKey === 'users')?.value ?? 0;
    const guests = payload.find((p: any) => p.dataKey === 'guests')?.value ?? 0;
    const total = Number(users) + Number(guests);

    return (
      <div className="bg-zinc-950/95 border border-white/10 rounded-xl p-2.5 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[130px] pointer-events-none">
        <div className="font-semibold text-white border-b border-white/10 pb-1 flex justify-between items-center gap-2">
          <span>{label}</span>
          <span className="text-[10px] text-zinc-400 font-mono font-normal">Total: {total}</span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Registered
            </span>
            <span className="font-semibold">{users}</span>
          </div>
          <div className="flex items-center justify-between text-amber-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Guests
            </span>
            <span className="font-semibold">{guests}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AcquisitionChart({ data, mode = "bar" }: AcquisitionChartProps) {
  if (mode === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.6} />
          <XAxis 
            dataKey="date" 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            allowDecimals={false} 
          />
          <RechartsTooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} 
          />
          {/* Stacked Bars: Guests at bottom, Registered on top with rounded corners */}
          <Bar 
            dataKey="guests" 
            name="Guests" 
            stackId="acq" 
            fill="#f59e0b" 
            radius={[2, 2, 0, 0]} 
            maxBarSize={28} 
          />
          <Bar 
            dataKey="users" 
            name="Registered" 
            stackId="acq" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={28} 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.6} />
        <XAxis 
          dataKey="date" 
          stroke="#71717a" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#71717a" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false} 
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="users" 
          name="Registered" 
          stroke="#10b981" 
          strokeWidth={2} 
          fillOpacity={1} 
          fill="url(#colorUsers)" 
        />
        <Area 
          type="monotone" 
          dataKey="guests" 
          name="Guests" 
          stroke="#f59e0b" 
          strokeWidth={2} 
          fillOpacity={1} 
          fill="url(#colorGuests)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
