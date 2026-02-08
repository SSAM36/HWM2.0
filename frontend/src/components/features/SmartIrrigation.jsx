import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Droplets, Power, Thermometer, Clock, Gauge } from 'lucide-react';

const SmartIrrigation = ({ sensorData }) => {
    const { t } = useTranslation();
    const [activePumps, setActivePumps] = useState({ p1: false, p2: false, p3: false });

    const moistureLevel = sensorData?.soil_moisture || 0;
    const lastUpdate = sensorData?.last_updated ? new Date(sensorData.last_updated).toLocaleTimeString() : "N/A";

    const togglePump = (pump) => {
        setActivePumps(prev => ({ ...prev, [pump]: !prev[pump] }));
    };

    const activeCount = Object.values(activePumps).filter(Boolean).length;

    // Determine moisture status
    const getMoistureColor = () => {
        if (moistureLevel < 30) return 'text-red-500';
        if (moistureLevel < 50) return 'text-amber-500';
        return 'text-blue-500';
    };

    const getMoistureBg = () => {
        if (moistureLevel < 30) return 'stroke-red-500';
        if (moistureLevel < 50) return 'stroke-amber-500';
        return 'stroke-blue-500';
    };

    return (
        <div className="gov-card h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <Gauge size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{t('smart_controls') || 'Smart Controls'}</h3>
                        <p className="text-xs text-slate-500">{t('active_zones') || 'Active Zones'}: {activeCount}/3</p>
                    </div>
                </div>
                <span className={`gov-badge ${activeCount > 0 ? 'gov-badge-success' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {activeCount > 0 ? t('active') || 'Active' : t('idle') || 'Idle'}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
                <div className="flex gap-4 h-full">
                    {/* Left: Moisture Gauge */}
                    <div className="w-2/5 flex flex-col items-center justify-center">
                        <div className="relative w-28 h-28">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    strokeWidth="10"
                                    className="stroke-slate-200 dark:stroke-slate-700"
                                />
                                <motion.circle
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: moistureLevel / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    className={getMoistureBg()}
                                    style={{
                                        strokeDasharray: `${2 * Math.PI * 42}`,
                                        strokeDashoffset: `${2 * Math.PI * 42 * (1 - moistureLevel / 100)}`
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Droplets size={16} className={getMoistureColor()} />
                                <span className={`text-2xl font-bold ${getMoistureColor()}`}>{moistureLevel}%</span>
                                <span className="text-[10px] text-slate-400 uppercase">{t('moisture') || 'Moisture'}</span>
                            </div>
                        </div>

                        {/* Temp Badge */}
                        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <Thermometer size={16} className="text-red-500" />
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">28°C</span>
                        </div>
                    </div>

                    {/* Right: Pump Controls */}
                    <div className="flex-1 flex flex-col gap-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pump Controls</p>
                        <div className="grid grid-cols-3 gap-3 flex-1">
                            {['p1', 'p2', 'p3'].map((pump, idx) => (
                                <button
                                    key={pump}
                                    onClick={() => togglePump(pump)}
                                    className={`rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2 min-h-[80px] ${activePumps[pump]
                                        ? 'bg-organic-green border-organic-green-400 text-white shadow-lg shadow-organic-green/20'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-organic-green hover:text-organic-green dark:hover:border-organic-green'
                                        }`}
                                >
                                    <Power size={20} className={activePumps[pump] ? 'animate-pulse' : ''} />
                                    <span className="text-xs font-bold uppercase">Zone {idx + 1}</span>
                                    <span className="text-[10px]">{activePumps[pump] ? 'ON' : 'OFF'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>Last Update: {lastUpdate}</span>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {t('flow_rate') || 'Flow Rate'}: 8 ml/s
                </span>
            </div>
        </div>
    );
};

export default SmartIrrigation;
