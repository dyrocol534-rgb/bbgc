"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function AcquisitionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <RechartsTooltip 
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
          itemStyle={{ fontWeight: 'bold' }}
        />
        <Area type="monotone" dataKey="users" name="Registered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
        <Area type="monotone" dataKey="guests" name="Guests" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGuests)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
