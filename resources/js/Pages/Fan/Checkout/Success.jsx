import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Mail, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/Utils/helpers';

export default function Success({ order, fee_breakdown }) {
    const { language, currency } = usePage().props;
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
                                #{order.id}
                            </span>
                        </div>
                        
                        <div className="h-px w-12 bg-slate-800 md:h-12 md:w-px"></div>

                        <div className="text-center md:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">
                                {__('Total Amount')}
                            </span>
                            <span className="text-2xl font-light tracking-wider">
                                {formatCurrency(fee_breakdown.total, currency)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 料金内訳カード */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-slate-600" />
                        {__('Order Summary')}
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{__('Items Total')}</span>
                            <span className="font-bold text-slate-900">
                                {formatCurrency(fee_breakdown.item_total, currency)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{__('Tax')}</span>
                            <span className="font-bold text-slate-900">
                                {formatCurrency(fee_breakdown.item_tax, currency)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{__('Shipping')}</span>
                            <span className="font-bold text-slate-900">
                                {formatCurrency(fee_breakdown.shipping, currency)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{__('Shipping Tax')}</span>
                            <span className="font-bold text-slate-900">
                                {formatCurrency(fee_breakdown.shipping_tax, currency)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                                {order.is_go_order ? __('GO Order Fee (5%)') : __('System Fee (8%)')}
                            </span>
                            <span className="font-bold text-slate-900">
                                {formatCurrency(fee_breakdown.fee, currency)}
                            </span>
                        </div>

                        <div className="h-px bg-slate-200 my-4" />

                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-slate-900">{__('Total')}</span>
                            <span className="text-slate-900">
                                {formatCurrency(fee_breakdown.total, currency)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 注文商品リスト */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">{__('Order Items')}</h2>
                    <div className="space-y-4">
                        {order.order_items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-slate-200">
                                    <img
                                        src={item.product?.images?.[0]?.url || '/images/no-image.jpg'}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">
                                        {item.product?.translations?.[0]?.name || item.product?.name_en}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {__('Quantity')}: {item.quantity} × {formatCurrency(item.unit_price, currency)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">
                                        {formatCurrency(item.unit_price * item.quantity, currency)}
                                    </p>
                                </div>
                            </div>
                        ))}
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

                    <Link 
                        href={route('fan.orders.index')}
                        className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-slate-900 transition-all flex items-center justify-center gap-3"
                    >
                        <Package size={18} />
                        {__('View Order History')}
                        <ArrowRight size={16} />
                    </Link>
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