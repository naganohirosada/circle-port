// resources/js/Pages/Fan/Order/Show.jsx

import React, { useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { renderDualCurrency } from '@/Utils/helpers';
import { 
    Package, Calendar, MapPin, CreditCard, ArrowLeft, 
    CheckCircle2, Circle, Box, Globe, Sparkles
} from 'lucide-react';

export default function Show({ order, fee_breakdown = null }) {
    const { language, currency } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 【新設・超堅牢ガード】：引数が足りない場合でもDBデータから内訳を自動逆算してクラッシュを永久防止
    const finalBreakdown = useMemo(() => {
        if (fee_breakdown) return fee_breakdown;

        // order.breakdownsリレーション、または order_items の小計から安全に復元
        const bItems = order?.breakdowns || [];
        
        // 1: 商品小計, 2: 倉庫中継費, 4: システム手数料
        const itemTotal = bItems.find(b => b.type === 1)?.amount 
            || order?.order_items?.reduce((sum, i) => sum + (Number(i.unit_price) * i.quantity), 0) 
            || 0;
            
        const shipping = bItems.find(b => b.type === 2)?.amount || 0;
        const fee = bItems.find(b => b.type === 4)?.amount || 0;
        
        // 注文メモ(notes)に格納されているチップ応援金を安全にデコード抽出
        let tipTotal = 0;
        if (order?.notes) {
            try {
                const decoded = JSON.parse(order.notes);
                if (decoded && decoded.creator_tip) {
                    tipTotal = Number(decoded.creator_tip);
                }
            } catch (e) {
                tipTotal = 0;
            }
        }

        return {
            item_total: itemTotal,
            shipping: shipping,
            fee: fee,
            tip_total: tipTotal,
            total: Number(order?.total_amount || (itemTotal + shipping + fee + tipTotal))
        };
    }, [fee_breakdown, order]);

    // クラファン風製造プロセスの動的ステップ定義
    const currentStep = useMemo(() => {
        switch (order?.status) {
            case 'pending':
            case 'authorized':
                return 0; // 1次決済完了
            case 'manufacturing':
            case 'processing':
                return 1; // 製造中
            case 'arrived_at_warehouse':
            case 'inspecting':
                return 2; // 倉庫到着・検品中
            case 'international_shipping':
            case 'shipped':
                return 3; // 国際配送中
            case 'completed':
            case 'delivered':
                return 4; // 配達完了
            default:
                return 0;
        }
    }, [order?.status]);

    const steps = [
        { label: __('Order Placed'), desc: __('Phase-1 Paid') },
        { label: __('Manufacturing'), desc: __('サークル製造中') },
        { label: __('Warehouse Arrived'), desc: __('倉庫到着・検品中') },
        { label: __('Intl. Shipping'), desc: __('Phase-2 国際配送') },
        { label: __('Delivered'), desc: __('ファンへお届け') }
    ];

    return (
        <FanLayout>
            <Head title={`${__('Order Details')} #${order?.id} - CirclePort`} />

            <div className="max-w-[1000px] mx-auto px-6 py-16 font-sans text-slate-800">
                <Link href={route('fan.orders.index')} className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {__('Back to Orders')}
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
                    <div>
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-cyan-600 mb-2">
                            <Package size={14} /> {__('Order Details')}
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Order #{order?.id}
                        </h1>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-400 font-bold">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {order?.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order?.status === 'completed' || order?.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'}`}>
                            {__(order?.status_label || order?.status)}
                        </span>
                    </div>
                </div>

                {/* クラファン風の「視覚的製造ステータスバー」 */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm mb-12">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                        <Sparkles size={12} className="text-cyan-500" />
                        {__('Production & Fulfillment Status')}
                    </p>
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
                        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-100 md:left-0 md:right-0 md:top-[15px] md:h-0.5 md:w-full -z-10">
                            <div 
                                className="bg-cyan-500 h-full md:h-full transition-all duration-1000 origin-left"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {steps.map((step, idx) => {
                            const isDone = idx <= currentStep;
                            const isCurrent = idx === currentStep;

                            return (
                                <div key={idx} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3 flex-1 w-full relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                        isDone ? 'bg-cyan-500 text-white ring-4 ring-cyan-50 shadow-lg shadow-cyan-100' : 'bg-white text-slate-300 border-2 border-slate-200'
                                    }`}>
                                        {isDone ? <CheckCircle2 size={16} strokeWidth={3} /> : <Circle size={10} className="fill-slate-200 text-transparent" />}
                                    </div>
                                    <div className="text-left md:text-center">
                                        <p className={`text-xs font-black uppercase tracking-tight ${isCurrent ? 'text-cyan-600' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT: ORDER ITEMS LIST */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">{__('Ordered Items')}</h2>
                            <div className="space-y-6">
                                {order?.order_items?.map((item) => {
                                    const displayName = item.product_variant 
                                        ? (item.product_variant.translations?.[0]?.variant_name || item.product_variant.variant_name)
                                        : (item.product?.translations?.[0]?.name || item.product?.name);

                                    return (
                                        <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <div className="w-16 h-20 bg-white rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                                <img 
                                                    src={item.product?.images?.[0]?.url || '/images/no-image.jpg'} 
                                                    className="w-full h-full object-cover" 
                                                    alt="" 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-slate-900 truncate">{displayName}</h3>
                                                {item.product_variant && (
                                                    <p className="text-[10px] font-black text-cyan-600 uppercase mt-0.5">
                                                        {item.product?.translations?.[0]?.name}
                                                    </p>
                                                )}
                                                <p className="text-xs text-slate-500 mt-2 font-medium">
                                                    {__('Quantity')}: {item.quantity} × {renderDualCurrency(item.unit_price, currency)}
                                                </p>
                                            </div>
                                            <div className="text-right justify-between flex flex-col">
                                                <span className="text-sm font-black text-slate-900">
                                                    {renderDualCurrency(item.unit_price * item.quantity, currency)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 配送先 ＆ 決済方法情報 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5"><MapPin size={12} /> {__('Shipping Destination')}</label>
                                <div className="text-xs font-bold text-slate-700 leading-relaxed">
                                    <p className="font-black text-slate-900 text-sm mb-1">{order?.shipping_address?.name || order?.address?.name}</p>
                                    <p>{order?.shipping_address?.address_line1 || order?.address?.address_line1}</p>
                                    {order?.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                                    <p>{order?.shipping_address?.city || order?.address?.city}, {order?.shipping_address?.state || order?.address?.state}</p>
                                    <p className="text-cyan-600 font-black mt-1 uppercase tracking-wider">{order?.shipping_address?.country_code || order?.address?.country_code} {order?.shipping_address?.postal_code || order?.address?.postal_code}</p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5"><CreditCard size={12} /> {__('Payment Method')}</label>
                                <div className="text-xs font-bold text-slate-700">
                                    <p className="font-black text-slate-900 text-sm mb-1 uppercase">{order?.payment_method?.brand || __('Credit Card')}</p>
                                    <p className="font-mono text-slate-500">**** **** **** {order?.payment_method?.last4 || '****'}</p>
                                    <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-black tracking-widest uppercase">
                                        <CheckCircle2 size={10} /> {__('Secured via Stripe')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: BILLING SUMMARY (【安全ガード適用版】) */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{__('Payment Summary')}</h2>
                            
                            <div className="space-y-4 text-sm font-medium text-slate-500 border-b border-slate-200/60 pb-6">
                                <div className="flex justify-between">
                                    <span>{__('Items Subtotal')}</span>
                                    <span className="font-bold text-slate-800">{renderDualCurrency(finalBreakdown.item_total, currency)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>{__('Warehouse Handling Fee')}</span>
                                    <span className="font-bold text-slate-800">
                                        {finalBreakdown.shipping === 0 ? __('FREE') : `+${renderDualCurrency(finalBreakdown.shipping, currency)}`}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>{order?.is_go_order ? __('GO Order Fee (5%)') : __('System Fee (8%)')}</span>
                                    <span className="font-bold text-slate-800">+{renderDualCurrency(finalBreakdown.fee, currency)}</span>
                                </div>

                                {finalBreakdown.tip_total > 0 && (
                                    <div className="flex justify-between text-cyan-600 font-bold">
                                        <span>{__('Creator Support Tip')}</span>
                                        <span>+{renderDualCurrency(finalBreakdown.tip_total, currency)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider block leading-none mb-1">{__('Phase-1 Total')}</span>
                                        <span className="text-[9px] font-black bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded uppercase tracking-widest">
                                            {__('Tax-Free Exported')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black italic text-cyan-600">
                                            {renderDualCurrency(finalBreakdown.total, currency)}
                                        </span>
                                    </div>
                                </div>

                                {currency?.code !== 'JPY' && (
                                    <p className="text-[9px] text-slate-400 font-bold text-right italic pt-1">
                                        {__('* Converted including 5% forex spread')}
                                    </p>
                                )}
                            </div>

                            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex gap-3 text-slate-500">
                                <Box size={16} className="text-cyan-500 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">{__('Next Step: Phase-2')}</p>
                                    <p className="text-[9px] font-medium leading-normal text-slate-400">
                                        {__('When items arrive at the central warehouse, international freight will be measured. You will receive an invoice for the Phase-2 shipping fee.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}