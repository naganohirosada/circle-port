import React, { useState } from 'react'; // useStateを追加
import FanLayout from '@/Layouts/FanLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';

export default function Index({ auth, shippings }) {
    // どの配送を処理中かを管理するステート（IDを保持）
    const [processingId, setProcessingId] = useState(null);
    
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;

    const handlePayment = async (id) => {
        // すでに何かを処理中なら何もしない
        if (processingId) return;
        
        setProcessingId(id);

        try {
            const response = await axios.post(route('fan.international-shippings.checkout', id));
            if (response.data.url) {
                // Stripeの決済ページへ移動
                window.location.href = response.data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert(__('Failed to initialize payment. Please try again later.'));
            setProcessingId(null); // エラー時はボタンを元に戻す
        }
    };

    const statusBadge = (status) => {
        switch(status) {
            case 10: return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{__('Waiting for items / Consolidation')}</span>;
            case 20: return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{__('Packing / Weighing')}</span>;
            case 30: return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold shrink-0">{__('Waiting for shipping payment')}</span>;
            case 40: return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">{__('Payment completed / Preparing for shipment')}</span>;
            case 50: return <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">{__('Shipped')}</span>;
            default: return null;
        }
    };

    return (
        <FanLayout user={auth.user} header={__('Warehouse Arrival & Shipping Management')}>
            <Head title={__('Shipping Management')} />

            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="space-y-6">
                    {shippings.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400">{__('No items have arrived at the warehouse yet.')}</p>
                        </div>
                    ) : (
                        shippings.map((s) => (
                            <div key={s.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            {statusBadge(s.status)}
                                            <span className="text-xs text-gray-400 font-mono">ID: #{s.id}</span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {s.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                        <img 
                                                            src={item.order_item?.product?.images?.[0]?.file_path?.startsWith('http') 
                                                                ? item.order_item.product.images[0].file_path 
                                                                : `/storage/${item.order_item?.product?.images?.[0]?.file_path}`} 
                                                            className="w-full h-full object-cover" 
                                                            alt="Product"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-gray-900 truncate">
                                                            {item.order_item?.product?.translations?.[0]?.name}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">
                                                            {item.order_item?.variation?.translations?.[0]?.name || __('Standard')} / {__('Quantity')}: {item.quantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:w-72 bg-gray-50 rounded-2xl p-6 flex flex-col justify-center border border-gray-100">
                                        {s.status === 30 ? (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">{__('Confirmed International Shipping Fee')}</div>
                                                <div className="text-3xl font-black text-gray-900 mb-4">
                                                    ￥{s.shipping_fee.toLocaleString()}
                                                </div>
                                                <button 
                                                    onClick={() => handlePayment(s.id)}
                                                    disabled={processingId === s.id}
                                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                                        ${processingId === s.id 
                                                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                                                        }`}
                                                >
                                                    {processingId === s.id ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            {__('Processing...')}
                                                        </>
                                                    ) : (
                                                        __('Pay Now')
                                                    )}
                                                </button>
                                                <p className="text-[10px] text-gray-400 mt-3 italic leading-tight">
                                                    {__('Items will be shipped within 3 business days after payment is completed.')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-sm font-bold text-gray-600">
                                                    {s.status < 30 ? __('Packing / Weighing') : __('Payment completed')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </FanLayout>
    );
}