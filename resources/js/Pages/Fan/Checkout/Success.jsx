import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Mail } from 'lucide-react';

export default function Success({ order_id }) {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    return (
        <FanLayout>
            <Head title={`${__('Order Completed')} - CirclePort`} />

            <div className="max-w-[800px] mx-auto px-6 py-24 text-center">
                {/* 成功アイコンのアニメーション演出 */}
                <div className="mb-10 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20 animate-pulse"></div>
                        <CheckCircle size={100} className="text-cyan-500 relative z-10" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    {__('Thank you for your order!')}
                </h1>
                
                <p className="text-slate-500 text-lg mb-12 leading-relaxed">
                    {__('Your order has been placed successfully.')}<br />
                    {__('We will notify you as soon as your items arrive at our warehouse.')}
                </p>

                {/* 注文情報カード */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                        <div className="text-center md:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">
                                {__('Order Number')}
                            </span>
                            <span className="text-2xl font-light tracking-wider">
                                #{order_id}
                            </span>
                        </div>
                        
                        <div className="h-px w-12 bg-slate-800 md:h-12 md:w-px"></div>

                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Mail size={20} className="text-cyan-400" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">
                                    {__('Confirmation Email')}
                                </span>
                                <span className="text-sm text-slate-300">
                                    {__('Sent to your email')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 次のアクションボタン */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        href={route('fan.products.index')}
                        className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all flex items-center justify-center gap-3"
                    >
                        <ShoppingBag size={18} />
                        {__('Continue Shopping')}
                    </Link>

                    {/* <Link 
                        href={route('fan.orders.index')} // 注文履歴ページ（後ほど作成）
                        className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-slate-900 transition-all flex items-center justify-center gap-3"
                    >
                        <Package size={18} />
                        {__('View Order History')}
                        <ArrowRight size={16} />
                    </Link> */}
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">
                        {__('Need help?')} <Link href="/contact" className="text-cyan-600 hover:underline">{__('Contact Support')}</Link>
                    </p>
                </div>
            </div>
        </FanLayout>
    );
}