import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { CheckCircle2, ArrowRight, Package, Calendar, Clock, ShoppingBag } from 'lucide-react';

export default function Thanks({ go, order, language }) {
    const __ = (key) => (language && language[key]) ? language[key] : key;

    return (
        <FanLayout>
            <Head title={`${__('Order Confirmed')} - CirclePort`} />
            
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                {/* 1. 成功アイコン & メインメッセージ */}
                <div className="mb-12 relative inline-block">
                    <div className="absolute inset-0 bg-cyan-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <CheckCircle2 size={120} className="relative text-cyan-500 mx-auto" strokeWidth={1.5} />
                </div>

                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-6 leading-tight">
                    {__('You\'re in!')}<br />
                    {__('Order Confirmed')}
                </h1>
                
                <p className="text-slate-500 font-medium text-lg mb-12 max-w-xl mx-auto">
                    {__('Thank you for joining this project. Your support helps the creator bring these items to life!')}
                </p>

                {/* 2. 注文情報ミニカード */}
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 mb-16 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-left space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{__('Order ID')}</p>
                        <p className="text-xl font-black text-slate-900">#CP-{order.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div className="h-px md:h-12 w-full md:w-px bg-slate-100"></div>
                    <div className="text-left space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{__('Project')}</p>
                        <p className="text-lg font-black text-slate-900 uppercase truncate max-w-[200px]">{go.title}</p>
                    </div>
                    <div className="h-px md:h-12 w-full md:w-px bg-slate-100"></div>
                    <div className="text-left space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{__('Status')}</p>
                        <span className="inline-block bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            {__('Primary Payment Received')}
                        </span>
                    </div>
                </div>

                {/* 3. ネクストステップ（タイムライン） */}
                <div className="text-left space-y-8 mb-16">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-center mb-10">
                        {__('What happens next?')}
                    </h3>
                    
                    <div className="relative">
                        {/* 垂直ライン */}
                        <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-100 hidden md:block"></div>
                        
                        <div className="space-y-12">
                            {[
                                { icon: <Clock />, title: __('Recruitment Phase'), desc: __('We are currently gathering participants. Production starts once the period ends.'), active: true },
                                { icon: <Package />, title: __('Production & Arrival'), desc: __('Items are made in Japan and sent to our warehouse for inspection.'), active: false },
                                { icon: <ArrowRight />, title: __('Global Shipping'), desc: __('Your package will be carefully packed and shipped to your doorstep.'), active: false },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-8 relative">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-colors ${step.active ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200' : 'bg-slate-100 text-slate-300'}`}>
                                        {React.cloneElement(step.icon, { size: 20 })}
                                    </div>
                                    <div>
                                        <h4 className={`font-black uppercase text-sm mb-1 ${step.active ? 'text-slate-900' : 'text-slate-300'}`}>{step.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. アクションボタン */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        href={route('fan.orders.index')}
                        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-cyan-600 transition-all shadow-xl"
                    >
                        {__('View Order Details')}
                    </Link>
                    <Link 
                        href={route('fan.go.index')}
                        className="bg-white border-2 border-slate-900 text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-900 hover:text-white transition-all"
                    >
                        {__('Back to Projects')}
                    </Link>
                </div>
            </div>
        </FanLayout>
    );
}