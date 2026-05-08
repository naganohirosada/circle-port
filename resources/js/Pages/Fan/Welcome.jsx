import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import { 
    Globe, ShoppingBag, Box, Users, Heart, ArrowRight, Sparkles, 
    Send, ShieldCheck, Zap, Info, ChevronDown, CheckCircle2,
    Search, Package, CreditCard, Gift
} from 'lucide-react';

export default function Welcome() {
    const { language, auth } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const images = {
        identity: "/images/identity.jpg", 
        step1: "/images/step1.png", 
        step2: "/images/step2.png", 
        step3: "/images/step3.png",
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">
            <Head title={__('Welcome to CirclePort - Connect with Japanese Creators')} />

            {/* --- 1. Navigation --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Globe size={24} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic tracking-widest">CirclePort</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#how-it-works" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-600 transition-colors">
                            {__('How it Works')}
                        </a>
                        <Link href={auth.fan ? route('fan.dashboard') : route('fan.login')} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-md font-bold text-center">
                            {auth.fan ? __('Dashboard') : __('Login')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- 2. Hero Section --- */}
            <section className="relative pt-40 pb-20 md:pt-52 md:pb-40 px-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-white -z-10" />
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-cyan-100 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        <Sparkles size={14} /> {__('Connecting Your Passion to Japan’s Soul')}
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-[88px] font-black tracking-tighter leading-tight text-slate-900">
                        {__('No Borders for Your')}<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600 italic">
                            {__('Love of Creation.')}
                        </span>
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-500 font-medium leading-relaxed px-4">
                        {__('Beyond borders and oceans, your heart beats for the worlds they create. CirclePort ensures that passion arrives safe and sound. We protect, combine, and deliver your Japanese treasures—all to keep you connected to the creators you adore.')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Link href={route('fan.products.index')} className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-cyan-600 transition-all shadow-xl hover:-translate-y-0.5 font-bold">
                            {__('Explore Marketplace')} <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- 3. Identity Section --- */}
            <section className="py-24 md:py-36 px-6 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div className="space-y-12 text-left">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
                                {__('The Best Way to Support')}<br />
                                <span className="text-cyan-600 italic">{__('Japanese Creators.')}</span>
                            </h2>
                            <div className="grid gap-10 text-slate-900">
                                {/* 通常注文とGO */}
                                <div className="flex gap-6 group">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black uppercase italic tracking-tight">{__('Standard & Group Orders')}</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
                                            {__('Order directly for yourself, or join a Group Order (GO) to split domestic shipping costs with regional fans.')}
                                        </p>
                                    </div>
                                </div>

                                {/* おまとめ梱包 */}
                                <div className="flex gap-6 group">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                                        <Box size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black uppercase italic tracking-tight">{__('Flat-Rate Consolidation')}</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">{__('Shop from multiple creators? We store your items and pack them into one box for just ¥300 flat fee.')}</p>
                                    </div>
                                </div>

                                {/* チップ制度 */}
                                <div className="flex gap-6 group">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                        <Gift size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black uppercase italic tracking-tight">{__('100% Direct Support')}</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
                                            {__('Support creators with our Chip (Tip) system. CirclePort takes 0% commission, ensuring your full contribution reaches the creator.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* identity画像 */}
                        <div className="relative group px-4">
                            <div className="aspect-[3/4] md:aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white bg-slate-200">
                                <img 
                                    src={images.identity} 
                                    alt="Japanese Fan Culture Heat" 
                                    className="w-full h-full object-cover object-bottom transition-transform duration-1000 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                            </div>
                            {/* 「配送料の節約」バッジは削除しました */}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. How to Use --- */}
            <section id="how-it-works" className="py-24 md:py-40 px-6 bg-white overflow-hidden text-center text-slate-900">
                <div className="max-w-4xl mx-auto space-y-6 mb-24">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Simple 3-Step Process</h2>
                    <p className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none">{__('From Japan to Your Door')}</p>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 relative">
                    <div className="space-y-10 group relative text-center">
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
                                <img src={images.step1} alt="Find & Order" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="absolute -top-6 -left-4 w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-xl group-hover:bg-cyan-500 transition-all duration-500">01</div>
                        </div>
                        <div className="space-y-4 px-2">
                            <h3 className="text-2xl font-black tracking-tight uppercase italic">{__('Find & Order')}</h3>
                            <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed">{__('Browse creators and join an active GO. Pay item price + 8% fee. Items go to our warehouse.')}</p>
                        </div>
                    </div>

                    <div className="space-y-10 group relative text-center">
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
                                <img src={images.step2} alt="Wait & Combine" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="absolute -top-6 -left-4 w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-xl group-hover:bg-cyan-500 transition-all duration-500">02</div>
                        </div>
                        <div className="space-y-4 px-2">
                            <h3 className="text-2xl font-black tracking-tight uppercase italic">{__('Wait & Combine')}</h3>
                            <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed">{__('We notify you when items arrive. Hold orders for free, then combine them into one single package with a click.')}</p>
                        </div>
                    </div>

                    <div className="space-y-10 group relative text-center">
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
                                <img src={images.step3} alt="Ships to You" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="absolute -top-6 -left-4 w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-xl group-hover:bg-cyan-500 transition-all duration-500">03</div>
                        </div>
                        <div className="space-y-4 px-2">
                            <h3 className="text-2xl font-black tracking-tight uppercase italic">{__('Ships to You')}</h3>
                            <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed">{__('Pay international shipping + ¥300 fee. We ship globally via DHL/EMS with full tracking.')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. Pricing Section --- */}
            <section className="py-20 px-6 mb-32">
                <div className="max-w-6xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white text-center space-y-16 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
                    
                    <div className="space-y-6 relative z-10 text-white">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase italic">{__('Transparent Pricing')}</h2>
                        <p className="text-slate-400 font-bold text-lg">{__('No hidden fees. We believe in absolute honesty with our community.')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                        <div className="p-10 md:p-12 rounded-[2.5rem] border border-white/10 bg-white/5 transition-all hover:scale-105 duration-500">
                            <p className="text-[11px] font-black uppercase text-slate-500 mb-6 tracking-widest">{__('Standard Fee')}</p>
                            <p className="text-5xl md:text-[80px] font-black italic tracking-tighter mb-4 leading-none text-white">8%</p>
                        </div>
                        <div className="p-10 md:p-12 rounded-[2.5rem] border border-cyan-500 bg-cyan-500/10 shadow-2xl shadow-cyan-900/30 transition-all hover:scale-105 duration-500">
                            <p className="text-[11px] font-black uppercase text-slate-500 mb-6 tracking-widest">{__('GO Discount')}</p>
                            <p className="text-5xl md:text-[80px] font-black italic tracking-tighter mb-4 leading-none text-cyan-400">5%</p>
                        </div>
                        <div className="p-10 md:p-12 rounded-[2.5rem] border border-white/10 bg-white/5 transition-all hover:scale-105 duration-500">
                            <p className="text-[11px] font-black uppercase text-slate-500 mb-6 tracking-widest">{__('Consolidation')}</p>
                            <p className="text-5xl md:text-[80px] font-black italic tracking-tighter mb-4 leading-none text-white">¥300</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 6. Footer --- */}
            <footer className="py-24 px-6 border-t border-slate-100 bg-white text-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <div className="flex items-center gap-6">
                        <Globe size={20} className="text-slate-300" />
                        <span className="text-slate-400 font-bold uppercase tracking-widest">© 2026 CirclePort Project. All rights reserved.</span>
                    </div>
                    <div className="flex gap-12">
                        <a href="#" className="hover:text-cyan-600 transition-colors font-bold uppercase tracking-widest">{__('Privacy')}</a>
                        <a href="#" className="hover:text-cyan-600 transition-colors font-bold uppercase tracking-widest">{__('Terms')}</a>
                        <Link href={route('welcome.creator')} className="text-indigo-500 underline underline-offset-8 decoration-2 hover:text-indigo-700 transition-all font-bold tracking-normal">{__('Are you a Creator?')}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}