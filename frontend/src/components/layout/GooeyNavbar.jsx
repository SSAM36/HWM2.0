import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, Globe, LogIn, LogOut, User } from 'lucide-react';
import { useThemeStore, useLanguageStore } from '../../store/themeStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supportedLanguages } from '../../i18n';

const NavItem = ({ to, label, isActive, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
            ? "bg-organic-green dark:bg-organic-green text-white font-bold"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
    >
        {label}
    </Link>
);

const Navbar = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) { console.error(e); }
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const NAV_Links = [
        { to: '/dashboard', label: t('dashboard') },
        { to: '/autonomous-farm', label: t('auto_farm') },
        { to: '/mark-my-land', label: t('land_map') },
        { to: '/crop-recommendation', label: t('crop_ai') },
        { to: '/equipment', label: t('equipment') },
        { to: '/schemes-assistant', label: t('schemes') },
        { to: '/inventory', label: t('inventory') },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Annadata Saathi" className="w-12 h-12 object-contain" />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-tight text-slate-900 dark:text-white">Annadata Saathi</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Govt. of India Initiative</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {NAV_Links.slice(0, 5).map(link => (
                            <NavItem
                                key={link.to}
                                to={link.to}
                                label={link.label}
                                isActive={location.pathname === link.to}
                            />
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Language Selector */}
                        <button
                            onClick={() => {
                                const langs = ['en', 'hi', 'mr'];
                                const next = langs[(langs.indexOf(language) + 1) % langs.length];
                                setLanguage(next);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-colors"
                        >
                            <Globe size={14} /> {supportedLanguages.find(l => l.code === language)?.nativeName || language.toUpperCase()}
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* User Auth */}
                        {user ? (
                            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col items-end hidden xl:flex">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{user.full_name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Farmer ID: {user.id?.substring(0, 6) || '---'}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    title="Logout"
                                    className="p-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth" className="ml-2 px-5 py-2 bg-gov-blue hover:bg-blue-700 text-white text-sm font-bold rounded-md shadow-sm transition-colors flex items-center gap-2">
                                <LogIn size={16} /> {t('login')}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar/Menu */}
            {isOpen && (
                <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl py-4 flex flex-col gap-2 px-4">
                    {NAV_Links.map(link => (
                        <NavItem
                            key={link.to}
                            to={link.to}
                            label={link.label}
                            isActive={location.pathname === link.to}
                            onClick={() => setIsOpen(false)}
                        />
                    ))}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                            >
                                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Theme
                            </button>
                            <button
                                onClick={() => {
                                    const langs = ['en', 'hi', 'mr'];
                                    const next = langs[(langs.indexOf(language) + 1) % langs.length];
                                    setLanguage(next);
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                            >
                                <Globe size={16} /> {supportedLanguages.find(l => l.code === language)?.nativeName || language.toUpperCase()}
                            </button>
                        </div>
                        {user ? (
                            <button onClick={handleLogout} className="text-red-600 font-bold text-sm">Logout</button>
                        ) : (
                            <Link to="/auth" className="text-gov-blue font-bold text-sm">Login</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
