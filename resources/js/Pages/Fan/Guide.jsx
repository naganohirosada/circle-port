import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import { 
    Globe, ShoppingBag, Box, Users, Heart, ArrowRight, Sparkles, 
    ShieldCheck, Zap, Info, ChevronRight, HelpCircle, AlertTriangle, 
    Gift, Truck, Warehouse, CreditCard, Receipt, PackageCheck, Coins,
    CheckCircle2, Ban, Flag, MessageSquare, Boxes
} from 'lucide-react';

export default function Guide() {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 font-sans">
            <Head title={__('User Guide - CirclePort')} />

            {/* --- Navigation --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-cyan-600 transition-colors">
                            <Globe size={24} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic tracking-widest">CirclePort</span>
                    </Link>
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-2">
                        <ChevronRight size={14} className="rotate-180" /> {__('Back to Home')}
                    </Link>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <section className="pt-48 pb-24 px-6 text-center bg-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-50/50 blur-[120px] -z-10 rounded-full" />
                <div className="max-w-4xl mx-auto space-y-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">{__('CirclePort Official Guide')}</p>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">
                        {__('No Borders for Your')}<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600">{__('Love of Creation.')}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        {__('The smartest and most emotional way to connect with Japanese creators and bring your treasures home.')}
                    </p>
                </div>
            </section>

            {/* --- Step-by-Step Timeline --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="relative">
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                        {[
                            { icon: <ShoppingBag />, title: __("01. Order"), desc: __("Choose Standard or GO and checkout.") },
                            { icon: <Warehouse />, title: __("02. Storage"), desc: __("Arrives in Tokyo. Up to 30 days free.") },
                            { icon: <Box />, title: __("03. Combine"), desc: __("Instruct us to pack multiple items into one box.") },
                            { icon: <Truck />, title: __("04. Arrived"), desc: __("Global shipping. Meet your treasure at your door.") }
                        ].map((step, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group relative z-10 text-center">
                                <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                    {React.cloneElement(step.icon, { size: 32 })}
                                </div>
                                <h3 className="text-xl font-black uppercase italic mb-3">{step.title}</h3>
                                <p className="text-sm text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- GO Type Comparison --- */}
            <section className="py-24 px-6 bg-slate-900 rounded-[4rem] mx-4 md:mx-12 my-20 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase">{__('Choosing Your Path')}</h2>
                        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">{__('Standard Order vs Group Order (GO)')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Type A */}
                        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 flex flex-col">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center">
                                    <PackageCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic">{__('Type A: GOM Distribution')}</h3>
                                    <p className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest">{__('Maximum Savings')}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 font-medium leading-relaxed">
                                {__('Participants split both domestic AND international shipping. Items are sent in bulk to a Group Order Manager (GOM) for local distribution.')}
                            </p>
                            <ul className="space-y-4 flex-grow">
                                {[__("Split domestic shipping"), __("Split international shipping"), __("Local pickup or domestic re-delivery")].map((li, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                        <CheckCircle2 size={16} className="text-cyan-500" /> {li}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Type B */}
                        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 flex flex-col">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                                    <Truck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic">{__('Type B: Individual Ship-out')}</h3>
                                    <p className="text-xs font-bold text-indigo-500/70 uppercase tracking-widest">{__('Privacy & Control')}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 font-medium leading-relaxed">
                                {__('Split domestic shipping to the warehouse, then pay for individual international shipping to your own home.')}
                            </p>
                            <ul className="space-y-4 flex-grow">
                                {[__("Split domestic shipping"), __("Individual international ship-out"), __("Consolidate with other solo orders")].map((li, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                        <CheckCircle2 size={16} className="text-indigo-500" /> {li}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Become a GOM */}
                    <div className="mt-12 bg-gradient-to-r from-indigo-600 to-cyan-600 p-1 rounded-[3rem] group">
                        <div className="bg-slate-900 p-10 md:p-12 rounded-[2.9rem] flex flex-col md:flex-row items-center justify-between gap-8 group-hover:bg-slate-900/50 transition-colors">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <Flag className="text-cyan-400" size={24} />
                                    <h3 className="text-2xl font-black uppercase italic">{__('Become a GOM')}</h3>
                                </div>
                                <p className="text-slate-400 font-bold max-w-xl">
                                    {__('Cant find a GO for your area? Create your own! Host a GO, gather fans, and lead your community while managing the distribution.')}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[100px]">
                                    <MessageSquare size={20} className="mx-auto mb-2 text-cyan-400" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Recruit</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[100px]">
                                    <Boxes size={20} className="mx-auto mb-2 text-indigo-400" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Sort</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Pricing Table --- */}
            <section className="py-24 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-black tracking-tighter italic uppercase">{__('Pricing Transparency')}</h2>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">{__('Every yen accounted for.')}</p>
                </div>
                
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="text-left py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">{__('Service')}</th>
                                <th className="text-left py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">{__('Fee')}</th>
                                <th className="text-left py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">{__('Notes')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { s: __("Standard Order Fee"), f: "8%", n: __("Individual speed delivery") },
                                { s: __("GO Order Fee"), f: "5%", n: __("Community discount rate") },
                                { s: __("Consolidation"), f: "¥300", n: __("Flat fee per final box") },
                                { s: __("Storage"), f: __("FREE"), n: __("Up to 30 days from arrival") }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-8 px-10 font-black italic uppercase text-slate-900">{row.s}</td>
                                    <td className="py-8 px-10 font-black text-2xl text-cyan-600 tracking-tighter">{row.f}</td>
                                    <td className="py-8 px-10 text-sm font-bold text-slate-400">{row.n}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* --- Restrictions --- */}
            <section className="py-24 px-6 max-w-5xl mx-auto">
                <div className="bg-rose-50 rounded-[3rem] p-12 border border-rose-100 flex flex-col md:flex-row gap-12 items-center">
                    <div className="space-y-6 flex-grow">
                        <div className="flex items-center gap-4 text-rose-600">
                            <AlertTriangle size={32} />
                            <h2 className="text-3xl font-black tracking-tight uppercase italic">{__('Restricted Items')}</h2>
                        </div>
                        <p className="text-slate-600 font-bold leading-relaxed">
                            {__('Due to international aviation safety regulations, we cannot ship flammable or pressurized items. Please check before purchasing.')}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {[__("Perfumes"), __("Spray Cans"), __("Lithium Batteries"), __("Lighters")].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-rose-100 text-xs font-black text-rose-800">
                                    <Ban size={14} className="text-rose-400" /> {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-64 h-64 bg-rose-100 rounded-[2.5rem] flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={80} className="text-rose-300" />
                    </div>
                </div>
            </section>

            {/* --- Creator Support --- */}
            <section className="py-24 px-6 max-w-5xl mx-auto text-center">
                <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-16 rounded-[4rem] space-y-10 shadow-2xl shadow-indigo-100">
                    <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                        <Gift size={40} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tight italic uppercase">{__('Creator Empowerment')}</h2>
                        <div className="text-[80px] font-black text-indigo-600 leading-none italic tracking-tighter">100%</div>
                        <p className="text-lg text-slate-500 font-bold max-w-xl mx-auto">
                            {__('CirclePort’s chip system takes 0% commission. Every yen you tip goes straight to the creator to fuel their future sparks.')}
                        </p>
                    </div>
                </div>
            </section>

            {/* --- Final CTA --- */}
            <footer className="py-32 px-6 text-center border-t border-slate-100 bg-white">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">{__('Ready to start your collection?')}</h2>
                    <Link href={route('fan.products.index')} className="inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-cyan-600 transition-all shadow-2xl hover:-translate-y-1">
                        {__('Explore Marketplace')} <ArrowRight size={20} />
                    </Link>
                </div>
            </footer>
        </div>
    );
}