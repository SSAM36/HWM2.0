// Placeholder for other pages to avoid breakages in App.jsx imports
// Ideally I should implement these fully in dark mode too but to fix the immediate error:
import React from 'react';

const Placeholder = ({ title }) => (
    <div className="bg-slate-900 min-h-[50vh] flex items-center justify-center border border-slate-800 rounded-2xl">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400">This module is under development.</p>
        </div>
    </div>
);

export default Placeholder;
