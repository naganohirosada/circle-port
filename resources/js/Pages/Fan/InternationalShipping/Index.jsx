import React, { useState } from 'react';
import FanLayout from '@/Layouts/FanLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { formatCurrency } from '@/Utils/helpers';
import { 
    Package, Truck, CreditCard, CheckCircle2, 
    AlertCircle, ChevronRight, Box, Boxes, 
    ArrowRight, History, Info
} from 'lucide-react';
import axios from 'axios';

export default function Index({ auth, shippings, availableOrders }) {
    // 既存の配送の支払い処理中ステート
    const [processingId, setProcessingId] = useState(null);
    // 同梱依頼のための選択中注文ID
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    
    const { language, currency } = usePage().props;
    const __ = (key) => language?.[key] || key;

    // 既存の送料支払い処理
    const handlePayment = async (id) => {
        if (processingId) return;
        setProcessingId(id);
        try {
            const response = await axios.post(route('fan.international-shippings.checkout', id));
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert(__('Failed to initialize payment.'));
            setProcessingId(null);
        }
    };

    // 同梱依頼（まとめ配送）の送信
    const handleRequestConsolidation = () => {
        if (selectedOrderIds.length === 0) return;
        
        if (confirm(__('Request consolidation for the selected orders?'))) {
            router.post(route('fan.international-shippings.store'), {
                order_ids: selectedOrderIds
            }, {
                onSuccess: () => setSelectedOrderIds([]),
            });
        }
    };

    // チェックボックスの切り替え
    const toggleOrderSelection = (id) => {
        setSelectedOrderIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const statusBadge = (status) => {
        switch(status) {
            case 10: return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">{__('Quoting')}</span>;
            case 20: return <span className="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-100">{__('Payment Pending')}</span>;
            case 40: return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">{__('Paid')}</span>;
            case 50: return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{__('Shipped')}</span>;
            default: return null;
        }
    };

    return (
        <FanLayout>
            <Head title={`${__('International Shipping')} - CirclePort`} />

            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4">
                            <Truck size={40} className="text-cyan-500" />
                            {__('Shipping Manager')}
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                            {__('Consolidate your items and manage global delivery')}
                        </p>
                    </div>
                </div>

                {/* --- セクション1：倉庫に到着済みのアイテム（同梱待ち） --- */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Boxes size={20} className="text-cyan-500" />
                            {__('Ready to Ship (At Warehouse)')}
                        </h2>
                        {selectedOrderIds.length > 0 && (
                            <button 
                                onClick={handleRequestConsolidation}
                                className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-100 animate-in fade-in zoom-in duration-300"
                            >
                                {__('Ship Selected Items Together')}
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>

                    {availableOrders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {availableOrders.map(order => (
                                <div 
                                    key={order.id} 
                                    onClick={() => toggleOrderSelection(order.id)}
                                    className={`group cursor-pointer bg-white rounded-3xl p-6 border-2 transition-all flex items-center gap-6 ${selectedOrderIds.includes(order.id) ? 'border-cyan-500 ring-4 ring-cyan-50 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${selectedOrderIds.includes(order.id) ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-slate-200 text-transparent'}`}>
                                        <CheckCircle2 size={20} strokeWidth={3} />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex -space-x-4">
                                            {order.order_items.map((item, idx) => (
                                                <div key={idx} className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden bg-slate-50 shadow-sm relative">
                                                    <img src={'/storage/' + (item.product?.images?.[0]?.file_path || '/images/no-image.jpg')} className="w-full h-full object-cover" />
                                                    <div className="absolute bottom-0 right-0 bg-slate-900 text-white text-[8px] px-1 font-black">x{item.quantity}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order #{order.id}</p>
                                            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                                                {order.order_items.map(item => item.product?.translations?.[0]?.name).join(', ')}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-300 uppercase italic">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                            <Box className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-bold text-sm">{__('No items are currently waiting at the warehouse.')}</p>
                        </div>
                    )}
                </div>

                {/* --- セクション2：現在の国際配送状況 --- */}
                <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <History size={20} className="text-cyan-500" />
                        {__('Shipping History & Pending Payments')}
                    </h2>

                    {shippings.length > 0 ? (
                        <div className="space-y-6">
                            {shippings.map((s) => (
                                <div key={s.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-8">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-lg font-black text-slate-900 tracking-tighter">#{s.id}</span>
                                                        {statusBadge(s.status)}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{__('Created at')}: {new Date(s.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            
                                            {s.tracking_number && (
                                                <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-100">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.carrier?.name || 'Carrier'}</span>
                                                    <span className="text-sm font-mono font-bold text-slate-700">{s.tracking_number}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                            <div className="lg:col-span-7">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {s.items?.map((item, idx) => (
                                                        <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0">
                                                                <img src={item.order_item?.product?.images?.[0]?.url} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-bold text-slate-800 truncate">{item.order_item?.product?.translations?.[0]?.name || 'Item'}</p>
                                                                <p className="text-[10px] font-black text-cyan-600 uppercase">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="lg:col-span-5">
                                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                                    {s.status === 20 ? (
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center text-slate-900 mb-2">
                                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{__('International Fee')}</span>
                                                                <span className="text-2xl font-black italic tracking-tighter">{formatCurrency(s.fee_breakdown?.total_amount || s.shipping_fee, currency)}</span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span>{__('Base Shipping')}</span>
                                                                    <span>{formatCurrency(s.fee_breakdown?.base_shipping_fee || s.shipping_fee, currency)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>{__('System Fee (3%)')}</span>
                                                                    <span>{formatCurrency(s.fee_breakdown?.international_fee || 0, currency)}</span>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => handlePayment(s.id)}
                                                                disabled={processingId === s.id}
                                                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-cyan-100"
                                                            >
                                                                {processingId === s.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CreditCard size={16} />}
                                                                {__('Pay Shipping Fee')}
                                                            </button>
                                                            <div className="flex gap-2 text-slate-400">
                                                                <Info size={12} className="flex-shrink-0 mt-0.5" />
                                                                <p className="text-[9px] font-bold leading-tight uppercase italic">{__('Weight/Size confirmed. Please complete payment to initiate shipping.')}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                                            <div className={`mb-3 p-3 rounded-full ${s.status >= 40 ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-300'}`}>
                                                                {s.status >= 50 ? <Truck size={24} /> : <Package size={24} />}
                                                            </div>
                                                            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">
                                                                {s.status === 10 ? __('Awaiting Quotation') : 
                                                                    s.status === 40 ? __('Awaiting Pickup') : 
                                                                    __('In Transit')}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[200px]">
                                                                {s.status === 10 ? __('Warehouse staff is weighing your package.') : 
                                                                    s.status === 40 ? __('Payment received. Preparing for dispatch.') : 
                                                                    __('Your package is on its way to you.')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border border-slate-100">
                            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">{__('No shipping history found.')}</p>
                        </div>
                    )}
                </div>
            </div>
        </FanLayout>
    );
}