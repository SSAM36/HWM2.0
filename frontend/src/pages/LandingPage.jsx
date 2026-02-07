import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    CloudRain, Sprout, Tractor, LineChart,
    ShieldCheck, Phone, ArrowRight, UserCheck,
    FileText, Activity, MapPin
} from 'lucide-react';

const HeroSection = () => {
    const { t } = useTranslation();
    return (
        <section className="bg-slate-50 dark:bg-slate-900 pt-16 pb-24 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-8 border border-blue-200 dark:border-blue-800">
                    <ShieldCheck size={16} />
                    <span>Official Portal for Smart Agriculture</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                    {t('landing_hero_title') || "Empowering Farmers,"}<br />
                    <span className="text-organic-green">{t('landing_hero_subtitle') || "Securing the Future."}</span>
                </h1>

                <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-normal">
                    {t('landing_hero_desc') || "Access government schemes, real-time crop health analysis, and AI-driven market insights all in one simple, accessible platform."}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/auth"
                        className="w-full sm:w-auto px-8 py-4 bg-organic-green hover:bg-green-800 text-white font-bold text-lg rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <UserCheck size={20} />
                        {t('get_started') || "Farmer Login / Register"}
                    </Link>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold text-lg rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                        {t('view_demo') || "How it Works"}
                    </button>
                </div>
            </div>
        </section>
    );
};

const ServiceCard = ({ icon: Icon, title, desc, link }) => (
    <Link to={link || '#'} className="block h-full group">
        <div className="h-full bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-organic-green dark:hover:border-organic-green hover:shadow-md transition-all flex flex-col">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-organic-green group-hover:bg-organic-green group-hover:text-white transition-colors mb-4">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-1">{desc}</p>
            <div className="mt-4 flex items-center text-organic-green font-bold text-sm">
                Access Service <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </Link>
);

const ServicesGrid = () => {
    const { t } = useTranslation();
    const services = [
        {
            icon: Activity,
            title: "Crop Health Check",
            desc: "Upload photos to detect diseases instantly using AI models approved by agricultural universities.",
            link: "/dashboard"
        },
        {
            icon: Sprout,
            title: "Expert Recommendations",
            desc: "Get personalized Advice on fertilizers, seeds, and irrigation based on your soil type.",
            link: "/crop-recommendation"
        },
        {
            icon: FileText,
            title: "Government Schemes",
            desc: "Check eligibility and apply for subsidies like PM-KISAN, crop insurance, and equipment grants.",
            link: "/schemes-assistant"
        },
        {
            icon: Tractor,
            title: "Equipment & Tools",
            desc: "Analyze and maintain your farm equipment with our digital maintenance logs.",
            link: "/equipment"
        },
        {
            icon: LineChart,
            title: "Market Prices (Mandi)",
            desc: "View real-time prices from local Mandis to ensure you get the best value for your produce.",
            link: "/inventory"
        },
        {
            icon: MapPin,
            title: "Land Mapping",
            desc: "Digitally map your farm boundaries and soil health zones for precision farming.",
            link: "/mark-my-land"
        }
    ];

    return (
        <section className="py-20 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Digital Services for Farmers</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Access all essential agricultural services from a single dashboard.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s, i) => (
                        <ServiceCard key={i} {...s} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const StatCard = ({ label, value }) => (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center">
        <div className="text-4xl font-bold text-gov-blue mb-2">{value}</div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
);

const ImpactSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-12">Trusted by Farmers Across The Nation</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard label={t("water_saved") || "Water Saved"} value="42%" />
                    <StatCard label={t("yield_increase") || "Yield Increase"} value="25%" />
                    <StatCard label={t("farmers") || "Farmers"} value="15,000+" />
                    <StatCard label={t("districts") || "Villages"} value="120+" />
                </div>
            </div>
        </section>
    );
};

const HelpLine = () => (
    <section className="bg-gov-blue py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Technical Support Helpline</h3>
                <p className="text-blue-100">Our agronomy experts are available 24/7 to assist you.</p>
            </div>
            <a href="tel:1800-123-456" className="flex items-center gap-3 px-8 py-4 bg-white text-blue-700 rounded-full font-bold text-xl hover:bg-blue-50 transition-colors shadow-lg">
                <Phone size={24} />
                <span>1800-123-456</span>
            </a>
        </div>
    </section>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen font-sans">
            <HeroSection />
            <ServicesGrid />
            <ImpactSection />
            <HelpLine />

            {/* Simple Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center text-sm">
                <p>&copy; 2024 Annadata Saathi. All rights reserved.</p>
                <div className="mt-4 flex justify-center gap-6">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms of Service</a>
                    <a href="#" className="hover:text-white">Contact Us</a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
