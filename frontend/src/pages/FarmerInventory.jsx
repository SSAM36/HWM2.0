import React, { useState, useEffect, useMemo } from 'react';
import {
    Package, Plus, Search, Tag, Calendar, ShieldCheck,
    ArrowUpRight, BarChart3, MoreVertical, RefreshCw,
    Trash2, ExternalLink, Filter, TrendingUp, AlertCircle,
    QrCode, X, Download, Share2, Copy, Check
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FarmerInventory = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total_stock: 0,
        avg_integrity: 0,
        listed_items: 0
    });

    // QR Modal State
    const [showQrModal, setShowQrModal] = useState(null);
    const [copied, setCopied] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const [farmerId, setFarmerId] = useState("70adcaac-b6c7-4b08-bf0a-4012c0cf3191");

    // Scannable URL logic
    const scannableBaseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                const id = parsed.id || parsed.user_id;
                if (id) setFarmerId(id);
            } catch (e) { console.error("User parsing error:", e); }
        }
    }, [location]);

    useEffect(() => {
        fetchInventory();
    }, [farmerId]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const res = await fetch(`${apiBase}/api/feature6/list/${farmerId}`);
            const data = await res.json();
            const items = Array.isArray(data) ? data : [];
            setBatches(items);

            if (items.length > 0) {
                const total = items.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
                const avgInt = items.reduce((acc, curr) => acc + (parseInt(curr.integrity_score) || 0), 0) / items.length;
                const listed = items.filter(d => d.status === 'ready_for_sale' || d.status === 'listed').length;

                setStats({
                    total_stock: Math.round(total),
                    avg_integrity: Math.round(avgInt),
                    listed_items: listed
                });
            } else {
                setStats({ total_stock: 0, avg_integrity: 0, listed_items: 0 });
            }
        } catch (e) {
            console.error("Inventory fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = useMemo(() => {
        return batches.filter(b =>
            b.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.batch_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [batches, searchTerm]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'harvested': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'ready_for_sale': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'listed': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'growing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const handleCopy = (batchId) => {
        const url = `${scannableBaseUrl}/product-transparency/${batchId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pt-24 transition-all duration-700">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-[2px] bg-emerald-500"></div>
                            <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">Annadata Smart Ledger</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none stroke-text">
                            Farm <span className="text-emerald-500">Vault</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
                            Manage your digital agriculture assets. Every harvest is turned into a secure on-chain batch with a unique QR digital passport.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchInventory}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-5 rounded-[2rem] border border-slate-800 transition-all active:scale-95 group shadow-2xl"
                        >
                            <RefreshCw size={24} className={`${loading ? 'animate-spin text-emerald-500' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                        </button>
                        <button
                            onClick={() => navigate('/add-batch')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[2.2rem] font-black uppercase tracking-widest text-xs flex items-center gap-4 transition-all shadow-[0_20px_50px_-15px_rgba(16,185,129,0.4)] active:scale-95"
                        >
                            <Plus size={20} />
                            Register Asset
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-in fade-in duration-700 delay-100">
                    <StatCard
                        label="Inventory Load"
                        value={`${stats.total_stock} Qtl`}
                        icon={<Package className="text-emerald-400" />}
                        sub="Total Harvested Volume"
                    />
                    <StatCard
                        label="Biological Trust"
                        value={`${stats.avg_integrity}%`}
                        icon={<ShieldCheck className="text-blue-400" />}
                        sub="Real-Time Health Index"
                    />
                    <StatCard
                        label="Commercial Reach"
                        value={stats.listed_items}
                        icon={<TrendingUp className="text-purple-400" />}
                        sub="Verified for Sale"
                    />
                </div>

                {/* Search Bar */}
                <div className="bg-slate-900/30 rounded-[3rem] border border-slate-800/40 p-6 mb-12 backdrop-blur-3xl sticky top-24 z-30 shadow-2xl group hover:border-emerald-500/20 transition-all">
                    <div className="relative">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-emerald-500 transition-colors" size={28} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find batch by variety or traceability ID..."
                            className="w-full bg-slate-950/60 border border-slate-800/60 rounded-[2.5rem] py-7 pl-20 pr-10 focus:outline-none focus:border-emerald-500/50 focus:ring-[12px] focus:ring-emerald-500/5 transition-all font-bold text-white placeholder:text-slate-800 text-xl"
                        />
                    </div>
                </div>

                {/* Batch List */}
                <div className="grid grid-cols-1 gap-8 pb-32">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-900/40 rounded-[3.5rem] animate-pulse border border-slate-800/50" />)
                    ) : filteredBatches.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center bg-slate-900/10 rounded-[4rem] border border-dashed border-slate-800/40 p-12 text-center group">
                            <div className="p-10 bg-slate-950 rounded-full border border-slate-900 mb-8 group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                                <Package size={64} className="text-slate-800 group-hover:text-emerald-900 transition-colors" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tight text-slate-600 mb-2">Vault Empty</h3>
                            <p className="text-slate-700 max-w-xs font-black uppercase tracking-[0.2em] text-[10px]">No traceability logs found for this farmer node.</p>
                        </div>
                    ) : (
                        filteredBatches.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/product-transparency/${item.batch_id}`)}
                                className="group bg-slate-900/10 hover:bg-slate-900/40 rounded-[3.5rem] border border-slate-800/40 p-8 flex flex-col lg:flex-row items-center gap-12 hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] shadow-2xl animate-in fade-in slide-in-from-right-8"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Asset Image */}
                                <div className="relative w-40 h-40 flex-shrink-0">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-[3rem] p-[2px] group-hover:bg-emerald-500/30 transition-all duration-500">
                                        <div className="w-full h-full bg-slate-950 rounded-[2.9rem] overflow-hidden">
                                            <img
                                                src={item.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=300'}
                                                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-3 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.5)] border-4 border-slate-950 group-hover:rotate-12 transition-all">
                                        <ShieldCheck size={20} className="text-slate-950" />
                                    </div>
                                </div>

                                {/* Main Data */}
                                <div className="flex-1 text-center lg:text-left space-y-3">
                                    <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest pt-0.5 font-mono">HASH: {item.batch_id}</span>
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white group-hover:text-emerald-400 transition-colors leading-none">
                                        {item.crop_name}
                                    </h3>
                                    <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] font-medium">{item.variety} • {item.location || 'Verified Node'}</p>
                                </div>

                                {/* Technical Specs */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 px-12 lg:border-l border-slate-800/40">
                                    <Metric label="Current Volume" value={item.quantity} unit="QTL" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1 leading-none">Integrity Core</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-black text-white">{item.integrity_score || 0}%</span>
                                            <div className="w-1.5 h-8 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="w-full bg-emerald-500 transition-all" style={{ height: `${item.integrity_score || 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 hidden lg:block">
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-2 leading-none">Registry Status</p>
                                        <span className={`inline-block px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-lg ${getStatusColor(item.status)}`}>
                                            {(item.status || 'COMMITTED').replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-row lg:flex-col gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowQrModal(item);
                                        }}
                                        className="w-20 h-20 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 transition-all duration-500 relative group/qr shadow-lg"
                                    >
                                        <QrCode size={28} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/product-transparency/${item.batch_id}`);
                                        }}
                                        className="w-20 h-20 flex items-center justify-center bg-slate-800/40 border border-white/5 rounded-[2rem] text-slate-400 hover:border-emerald-500/40 hover:text-white transition-all duration-500 shadow-lg group/view"
                                    >
                                        <BarChart3 size={28} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* QR MODAL */}
            {showQrModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl animate-in fade-in duration-300">
                    <div
                        className="bg-slate-900 w-full max-w-lg rounded-[4rem] border border-white/5 p-12 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden group"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowQrModal(null)}
                            className="absolute top-8 right-8 p-3 bg-slate-950 rounded-2xl border border-white/5 text-slate-500 hover:text-white transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 w-full">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">{showQrModal.crop_name}</h2>
                            <p className="text-emerald-500 font-mono text-[10px] mb-10 font-black tracking-widest uppercase">Verified Batch ID: {showQrModal.batch_id}</p>

                            <div className="relative mb-12 flex justify-center p-4 bg-white rounded-[3rem] border-8 border-emerald-500/20 shadow-2xl overflow-hidden group/qr-box mx-auto w-[280px] h-[280px]">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scannableBaseUrl + '/product-transparency/' + showQrModal.batch_id)}&bgcolor=ffffff&color=059669`}
                                    className="w-full h-full"
                                    alt="Passport QR"
                                />
                                <div className="absolute top-0 left-0 w-full h-[4px] bg-emerald-500/30 animate-[scan_2s_linear_infinite] z-20"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => handleCopy(showQrModal.batch_id)}
                                    className="flex items-center justify-center gap-3 bg-slate-950 border border-white/5 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    {copied ? 'Link Logged' : 'Copy URL'}
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center justify-center gap-3 bg-emerald-600 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest text-slate-950 hover:bg-emerald-500 transition-all active:scale-95 shadow-xl"
                                >
                                    <Printer size={16} /> Print ID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(280px); }
                }
                .stroke-text {
                    -webkit-text-stroke: 1.5px rgba(16, 185, 129, 0.2);
                    color: rgba(255, 255, 255, 0.9);
                }
            `}} />
        </div>
    );
};

const StatCard = ({ label, value, icon, sub }) => (
    <div className="group bg-slate-900/20 rounded-[3.5rem] p-10 border border-slate-800/50 backdrop-blur-3xl transition-all relative overflow-hidden shadow-2xl h-full flex flex-col justify-center">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-all duration-700"></div>
        <div className="flex justify-between items-start mb-8">
            <div className="p-6 bg-slate-950 rounded-[2.2rem] border border-white/[0.03] group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
        </div>
        <div>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-4 leading-none">{label}</p>
            <h3 className="text-6xl font-black text-white tracking-tighter mb-3 leading-none">{value}</h3>
            <p className="text-[10px] text-emerald-500/50 font-black uppercase tracking-widest leading-none">{sub}</p>
        </div>
    </div>
);

const Metric = ({ label, value, unit }) => (
    <div className="space-y-1">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1 leading-none">{label}</p>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{value}</span>
            <span className="text-[12px] text-slate-600 font-black uppercase pt-0.5">{unit}</span>
        </div>
    </div>
);

export default FarmerInventory;
