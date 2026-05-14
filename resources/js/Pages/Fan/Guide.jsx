import React, { useState } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    ShoppingBag, Box, Users, Heart, ArrowRight, ShieldCheck, Zap, Info, 
    ChevronRight, HelpCircle, AlertTriangle, Gift, Truck, Warehouse, 
    CreditCard, Receipt, PackageCheck, Coins, Ban, Flag, Boxes, Search, 
    Rocket, Clock, Scale, Shield, Landmark, LayoutList, ClipboardCheck,
    Globe, MapPin, Timer, AlertCircle, CheckCircle2, Sparkles 
} from 'lucide-react';

export default function Guide() {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // Navigation Items
    const menuItems = [
        { id: 'purchase', title: 'How to Buy', icon: <ShoppingBag size={18} /> },
        { id: 'go-order', title: 'About Group Orders', icon: <Users size={18} /> },
        { id: 'countries', title: 'Supported Countries', icon: <Globe size={18} /> },
        { id: 'payment-system', title: 'About Payments (Primary / Secondary)', icon: <Receipt size={18} /> },
        { id: 'shipping-prohibited', title: 'Shipping Info-Prohibited Items', icon: <Ban size={18} /> },
        { id: 'fees', title: 'Service Fees', icon: <Coins size={18} /> },
        { id: 'intl-shipping', title: 'International Shipping Methods', icon: <Truck size={18} /> },
        { id: 'payment-methods', title: 'Payment Methods', icon: <CreditCard size={18} /> },
        { id: 'storage', title: 'Warehouse Storage Period', icon: <Clock size={18} /> },
        { id: 'processing-time', title: 'Processing Time', icon: <Timer size={18} /> },
        { id: 'consolidation', title: 'About Consolidation Service', icon: <Boxes size={18} /> },
        { id: 'domestic-shipping', title: 'Domestic Shipping Methods', icon: <PackageCheck size={18} /> },
        { id: 'precautions', title: 'Precautions List', icon: <AlertCircle size={18} /> },
    ];

    return (
        <FanLayout>
            <Head title={__('User Guide - CirclePort')} />

            <div className="bg-white min-h-screen">
                {/* --- 1. HERO SECTION --- */}
                <header className="pt-32 pb-16 px-6 bg-slate-900 text-white rounded-b-[4rem]">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center gap-3 text-cyan-400">
                            <HelpCircle size={24} />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">{__('Help Center')}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                            {__('User Guide')}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-tight max-w-2xl leading-relaxed text-sm">
                            {__('From how to use CirclePort to payments, shipping, and precautions, we have summarized all the information for a smooth transaction.')}
                        </p>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- 2. SIDEBAR NAVIGATION --- */}
                    <aside className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-24 space-y-2 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">{__('Contents')}</h3>
                            {menuItems.map((item) => (
                                <a 
                                    key={item.id} 
                                    href={`#${item.id}`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-white hover:text-cyan-600 hover:shadow-sm transition-all group"
                                >
                                    <span className="text-slate-300 group-hover:text-cyan-500 transition-colors">{item.icon}</span>
                                    <span className="text-[11px] font-black uppercase tracking-tight">{__(item.title)}</span>
                                </a>
                            ))}
                        </div>
                    </aside>

                    {/* --- 3. MAIN CONTENT --- */}
                    <main className="flex-1 space-y-32 pb-40">

                        {/* How to Buy */}
                        <section id="purchase" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <ShoppingBag className="text-cyan-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('How to Buy')}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { step: "01", title: "Find Products", desc: "Find your favorite works and creators from the marketplace." },
                                    { step: "02", title: "Add to Cart", desc: "Select quantity and variations and proceed to the ordering process." },
                                    { step: "03", title: "Primary Payment", desc: "Pay for the product price and system usage fee to confirm your order." }
                                ].map((s, i) => (
                                    <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <span className="text-3xl font-black text-slate-200 italic">{s.step}</span>
                                        <h4 className="text-lg font-black mt-2 mb-3 uppercase">{__(s.title)}</h4>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">{__(s.desc)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* About Group Orders */}
                        <section id="go-order" className="scroll-mt-32 space-y-16">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <Users className="text-cyan-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('About Group Orders')}</h2>
                            </div>

                            {/* 配送タイプ */}
                            <div className="space-y-8">
                                <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                                    <Box className="text-cyan-500" size={20} /> {__('Two selectable shipping types')}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 group hover:bg-white hover:shadow-2xl transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="px-4 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{__('Type A')}</div>
                                            <Truck size={32} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter">{__('Bulk Shipping (Bulk to GOM)')}</h4>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                            {__('All items are shipped together to the "Organizer (GOM)" at once. International shipping costs are divided equally among all participants, keeping them to a minimum.')}
                                        </p>
                                        <ul className="space-y-3 text-[10px] font-black uppercase">
                                            <li className="flex items-center gap-2 text-indigo-600"><CheckCircle2 size={14} /> {__('International shipping costs are minimized')}</li>
                                            <li className="flex items-center gap-2 text-rose-500"><AlertCircle size={14} /> {__('Consolidation with other orders is not allowed')}</li>
                                        </ul>
                                    </div>

                                    <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 group hover:bg-white hover:shadow-2xl transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="px-4 py-1 bg-cyan-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{__('Type B')}</div>
                                            <Warehouse size={32} className="text-slate-200 group-hover:text-cyan-500 transition-colors" />
                                        </div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter">{__('Individual Shipping (Direct to Fan)')}</h4>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                            {__('Items are sorted at the Japanese warehouse and shipped directly to each participant\'s address. There is no need to share addresses with the organizer, saving on shipping while protecting privacy.')}
                                        </p>
                                        <ul className="space-y-3 text-[10px] font-black uppercase">
                                            <li className="flex items-center gap-2 text-cyan-600"><CheckCircle2 size={14} /> {__('Divide domestic shipping costs for primary payment among everyone')}</li>
                                            <li className="flex items-center gap-2 text-cyan-600"><CheckCircle2 size={14} /> {__('Can be consolidated with other orders at the warehouse')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* How to Join */}
                            <div className="bg-slate-900 text-white p-12 rounded-[4rem] space-y-12 relative overflow-hidden">
                                <Users className="absolute -left-10 -bottom-10 text-white/5" size={300} />
                                <div className="text-center space-y-4 relative z-10">
                                    <h3 className="text-4xl font-black uppercase tracking-tighter">{__('How to Join')}</h3>
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">{__('Steps to join a GO')}</p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-12 relative z-10">
                                    {[
                                        { title: "Search for missions", desc: "Select the project you want to join from the list of recruiting GOs.", icon: <Search /> },
                                        { title: "Perform primary payment", desc: "Pay for the product price and system fee to secure a slot.", icon: <CreditCard /> },
                                        { title: "Wait for success", desc: "The project succeeds when the target quantity is reached. The creator will begin production.", icon: <Clock /> }
                                    ].map((step, i) => (
                                        <div key={i} className="space-y-4 text-center">
                                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto border border-white/10">
                                                {step.icon}
                                            </div>
                                            <h5 className="text-lg font-black uppercase tracking-tight">{__(step.title)}</h5>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">{__(step.desc)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* GOの作成 */}
                            <div className="grid md:grid-cols-2 gap-16 items-center">
                                <div className="space-y-8">
                                    <div className="inline-block p-4 bg-cyan-100 text-cyan-600 rounded-3xl">
                                        <Rocket size={32} />
                                    </div>
                                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">
                                        {__('Start a')}<br />
                                        <span className="text-slate-400">{__('GO Mission')}</span>
                                    </h3>
                                    <p className="text-slate-500 font-bold uppercase text-xs leading-relaxed tracking-widest">
                                        {__('Do you want to spread your favorite creator\'s work to the world? You can become an "Organizer (Manager)" and start a new group purchase project.')}
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-1">1</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{__('Set products and target quantity (Minimum Quantity)')}</div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-1">2</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{__('Select recruitment period and shipping type (Bulk/Individual)')}</div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-1">3</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{__('Spread on SNS and gather fans from around the world')}</div>
                                        </div>
                                    </div>
                                    <Link href={route('fan.go.create')} className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-500 transition-all shadow-xl">
                                        {__('Create Project')} <ArrowRight size={16} />
                                    </Link>
                                </div>
                                <div className="bg-slate-100 rounded-[4rem] aspect-square flex flex-col items-center justify-center p-12 text-center group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Sparkles size={60} className="text-cyan-300 mb-6 group-hover:scale-125 transition-transform duration-700" />
                                    <h4 className="text-xl font-black uppercase tracking-tighter mb-4">{__('Become a Manager')}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                        {__('Organizers are awarded special badges upon project success, increasing trust within the community.')}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 決済について */}
                        <section id="payment-system" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <Receipt className="text-cyan-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('About Payments (Primary Payment / Secondary Payment)')}</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xl font-black uppercase"><span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span> {__('Primary Payment')}</h4>
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed pl-10">
                                        {__('Fees paid at the time of order confirmation. Includes product price, system fee, GO fee, and domestic shipping (if any).')}<br />
                                        <span className="text-cyan-600">※{__('*Items are still in the Japanese warehouse.')}</span>
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xl font-black uppercase"><span className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">2</span> {__('Secondary Payment')}</h4>
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed pl-10">
                                        {__('Fees calculated after items arrive at the warehouse. Includes international shipping, customs (if applicable), and shipping insurance. Shipped after payment is complete.')}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 対応国 */}
                        <section id="countries" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <Globe className="text-cyan-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('Supported Countries / Regions List')}</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {["USA", "Canada", "UK", "France", "Germany", "Indonesia", "Thailand", "Singapore", "Malaysia", "Vietnam", "China", "Taiwan", "Hong Kong", "South Korea", "Australia", "New Zealand"].map(c => (
                                    <div key={c} className="px-6 py-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                        <MapPin size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{c}</span>
                                    </div>
                                ))}
                                <div className="col-span-full mt-4 p-4 bg-cyan-50 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-cyan-700 uppercase">{__('*Please contact us if you wish to ship to regions other than those listed above.')}</p>
                                </div>
                            </div>
                        </section>

                        {/* 配送情報 / 禁制品 */}
                        <section id="shipping-prohibited" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <Ban className="text-rose-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('Shipping Info / Prohibited Items by Country/Region')}</h2>
                            </div>
                            <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100">
                                <h4 className="text-xl font-black text-rose-600 uppercase mb-6 flex items-center gap-2"><AlertTriangle /> {__('Items that cannot be shipped internationally')}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {["Flammable Liquids", "Aerosol Cans", "Standalone Lithium Batteries", "Raw Meat / Fresh Food", "Plants / Seeds", "Drugs / Chemicals", "Cash / Securities", "Items covered by the Washington Convention"].map(item => (
                                        <div key={item} className="p-4 bg-white rounded-2xl flex items-center gap-2 shadow-sm">
                                            <Flag size={12} className="text-rose-400" />
                                            <span className="text-[10px] font-black text-rose-500 uppercase">{__(item)}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-8 text-[10px] text-rose-400 font-bold leading-relaxed">
                                    {__('*Individual countries may have their own prohibited items. If unsure, please check each country\'s customs website in advance.')}
                                </p>
                            </div>
                        </section>

                        {/* 利用料金 */}
                        <section id="fees" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <Coins className="text-cyan-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('Service Fees')}</h2>
                            </div>
                            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-900 text-white">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">{__('Item')}</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">{__('Fee')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { name: "System usage fee", price: "8% of product price" },
                                            { name: "GO order fee", price: "5% of product price" },
                                            { name: "Consolidation fee", price: "Free (up to 5 items)" },
                                            { name: "Storage fee", price: "Free for 30 days" },
                                            { name: "Heavy-duty packaging option", price: "¥500~" }
                                        ].map((f, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-5 text-[11px] font-black uppercase">{__(f.name)}</td>
                                                <td className="px-8 py-5 text-sm font-black text-right italic">{__(f.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 国際配送手段 */}
                        <section id="intl-shipping" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <Truck className="text-cyan-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('International Shipping Methods')}</h2>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { name: "Express (DHL/FedEx)", time: "2-5 Days", desc: "The fastest and safest shipping method. Tracking and insurance included." },
                                    { name: "EMS (Japan Post)", time: "5-10 Days", desc: "Standard international express mail by the post office." },
                                    { name: "Standard (Air Mail)", time: "10-21 Days", desc: "A cost-effective shipping method. Ideal for lightweight items." }
                                ].map((m, i) => (
                                    <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all">
                                        <div className="text-cyan-500 mb-4"><Truck size={24} /></div>
                                        <h4 className="text-sm font-black uppercase tracking-tight mb-1">{__(m.name)}</h4>
                                        <span className="inline-block px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-500 rounded-md mb-4">{m.time}</span>
                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{__(m.desc)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 倉庫・作業時間 */}
                        <section id="storage" className="scroll-mt-32 grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                    <Clock className="text-cyan-500" size={32} />
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">{__('Warehouse Storage Period')}</h2>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                        {__('Items can be stored free of charge for 30 days from arrival at the warehouse. You can wait for items from multiple creators to arrive. From the 31st day, an extension fee is charged per day.')}
                                    </p>
                                </div>
                            </div>
                            <div id="processing-time" className="scroll-mt-32 space-y-6">
                                <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                    <Timer className="text-cyan-500" size={32} />
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">{__('Processing Time')}</h2>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                        {__('Inspection: 1-2 business days after arrival')}<br />
                                        {__('Consolidation / Repacking: 1-3 business days after application')}<br />
                                        {__('Shipping: 1-2 business days after secondary payment completion')}<br />
                                        <span className="text-[9px] text-slate-400">{__('*Closed on Japanese weekends and holidays.')}</span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 同梱サービス */}
                        <section id="consolidation" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <Boxes className="text-cyan-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('About Consolidation Service')}</h2>
                            </div>
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="md:w-1/2 space-y-6">
                                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                                        {__('Combines multiple packages from different creators into one box. Since international shipping is determined by weight and size rather than the number of boxes, consolidating can save on shipping significantly.')}
                                    </p>
                                    <div className="flex items-center gap-4 p-4 bg-cyan-50 rounded-2xl border border-cyan-100 text-cyan-700 font-black text-xs">
                                        <Zap /> {__('Up to 70% shipping savings possible')}
                                    </div>
                                </div>
                                <div className="md:w-1/2 bg-slate-100 rounded-[3rem] p-12 flex items-center justify-center relative group">
                                    <Boxes size={100} className="text-slate-300 group-hover:scale-110 group-hover:text-cyan-500 transition-all duration-700" />
                                </div>
                            </div>
                        </section>

                        {/* 注意事項 */}
                        <section id="precautions" className="scroll-mt-32 space-y-8">
                            <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                                <AlertCircle className="text-rose-500" size={32} />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{__('Precautions List')}</h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    "Cancellations or refunds after primary payment are generally not accepted.",
                                    "The payment deadline for secondary payment (international shipping) is 14 days from request. Extension fees occur after the deadline.",
                                    "Any customs duties or import taxes are the customer's responsibility (payment on delivery, etc.).",
                                    "If shipping is delayed or cancelled due to unforeseen circumstances by the creator, CirclePort will mediate the refund process.",
                                    "Regarding damage during transit, we will respond based on the carrier's compensation standards, comparing with the condition at inspection."
                                ].map((text, i) => (
                                    <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                        <div className="text-rose-400 font-black">!</div>
                                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{__(text)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </main>
                </div>
            </div>

            {/* --- 4. FINAL CTA --- */}
            <footer className="py-32 bg-slate-900 text-white text-center px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">{__('Start Your Global Journey')}</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link href={route('fan.products.index')} className="w-full md:w-auto px-12 py-6 bg-cyan-500 text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-2xl">
                            {__('View Marketplace')}
                        </Link>
                        <Link href={route('fan.go.index')} className="w-full md:w-auto px-12 py-6 bg-white/10 text-white border border-white/20 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white/20 transition-all">
                            {__('Search for GO Projects')}
                        </Link>
                    </div>
                </div>
            </footer>
        </FanLayout>
    );
}