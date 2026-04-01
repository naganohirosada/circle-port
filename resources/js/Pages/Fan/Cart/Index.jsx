import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Index({ cart }) {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const updateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        router.patch(route('fan.cart.update', cartKey), { quantity: newQty }, { preserveScroll: true });
    };

    const removeItem = (cartKey) => {
        router.delete(route('fan.cart.remove', cartKey), { preserveScroll: true });
    };

    return (
        <FanLayout>
            <Head title={`${__('Shopping Cart')} - CirclePort`} />

            <div className="max-w-[1200px] mx-auto px-6 py-16">
                <h1 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-4">
                    <ShoppingBag size={32} className="text-cyan-600" />
                    {__('Shopping Cart')}
                </h1>

                {cart.items?.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* 商品リスト (8カラム) */}
                        <div className="lg:col-span-8 space-y-8">
                            {cart.items.map((item) => (
                                <div key={item.cart_key} className="flex gap-6 pb-8 border-b border-slate-100 group">
                                    <div className="w-32 h-40 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
                                            {item.variation_name && (
                                                <p className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-2">
                                                    {item.variation_name}
                                                </p>
                                            )}
                                            <p className="text-slate-400 text-sm">¥{item.price.toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                                <button onClick={() => updateQuantity(item.cart_key, item.quantity - 1)} className="p-2 hover:bg-slate-100 transition-colors text-slate-400"><Minus size={16} /></button>
                                                <span className="px-4 text-sm font-bold text-slate-700">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cart_key, item.quantity + 1)} className="p-2 hover:bg-slate-100 transition-colors text-slate-400"><Plus size={16} /></button>
                                            </div>
                                            <button onClick={() => removeItem(item.cart_key)} className="text-slate-300 hover:text-pink-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                                                <Trash2 size={14} /> {__('Remove')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right py-2 min-w-[100px]">
                                        <p className="text-lg font-light text-slate-900">¥{item.subtotal.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 注文サマリー (4カラム) */}
                        <div className="lg:col-span-4">
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white sticky top-12 shadow-2xl shadow-slate-200">
                                <h2 className="text-xl font-black mb-8 border-b border-slate-800 pb-6 tracking-widest uppercase">{__('Order Summary')}</h2>
                                
                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>{__('Subtotal')}</span>
                                        <span className="text-white font-medium">¥{cart.total_price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>{__('Customs Estimate')}</span>
                                        <span className="text-white font-medium">¥{cart.tax_estimate.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest text-cyan-400">{__('Total')}</span>
                                        <span className="text-4xl font-light">¥{(cart.total_price + cart.tax_estimate).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all active:scale-[0.98]">
                                    {__('Checkout')} <ArrowRight size={20} />
                                </button>

                                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-cyan-600" /> Secure Checkout
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium mb-8">{__('Your cart is empty')}</p>
                        <Link href={route('fan.products.index')} className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all">
                            {__('Continue Shopping')}
                        </Link>
                    </div>
                )}
            </div>
        </FanLayout>
    );
}