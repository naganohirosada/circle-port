import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { renderDualCurrency, __ } from '@/Utils/helpers';
import {
    ArrowLeft, Truck, Package, CreditCard, CheckCircle,
    MapPin, Calendar, DollarSign, AlertCircle
} from 'lucide-react';

export default function Show({ shipping, fee_breakdown }) {
    const { language, auth, currency } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const getStatusColor = (status) => {
        switch (status) {
            case 10: return 'bg-yellow-500'; // 見積もり中
            case 20: return 'bg-blue-500';  // 支払い待ち
            case 30: return 'bg-green-500'; // 支払い完了
            case 40: return 'bg-purple-500'; // 発送準備中
            case 50: return 'bg-indigo-500'; // 発送済み
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 10: return __('Estimating');
            case 20: return __('Payment Pending');
            case 30: return __('Paid');
            case 40: return __('Preparing Shipment');
            case 50: return __('Shipped');
            default: return __('Unknown');
        }
    };

    return (
        <FanLayout>
            <Head title={__('International Shipping Details')} />

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* ヘッダー */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={route('fan.international-shippings.index')}
                        className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                            {__('International Shipping')} #{shipping.id}
                        </h1>
                        <p className="text-slate-600 mt-1">
                            {__('Shipping Details & Payment')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左側：配送情報 */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* ステータス */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">{__('Status')}</h2>
                                <span className={`px-4 py-2 rounded-full text-white text-sm font-bold ${getStatusColor(shipping.status)}`}>
                                    {getStatusText(shipping.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <Truck size={20} className="text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-600">{__('Type')}</p>
                                        <p className="font-bold text-slate-900">
                                            {shipping.type === 1 ? __('Regular Shipping') : __('Consolidated Shipping')}
                                        </p>
                                    </div>
                                </div>

                                {shipping.carrier && (
                                    <div className="flex items-center gap-3">
                                        <Package size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm text-slate-600">{__('Carrier')}</p>
                                            <p className="font-bold text-slate-900">{shipping.carrier.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Calendar size={20} className="text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-600">{__('Created')}</p>
                                        <p className="font-bold text-slate-900">
                                            {new Date(shipping.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {shipping.tracking_number && (
                                    <div className="flex items-center gap-3">
                                        <MapPin size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm text-slate-600">{__('Tracking')}</p>
                                            <p className="font-bold text-slate-900">{shipping.tracking_number}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 同梱商品リスト */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">{__('Items')}</h2>
                            <div className="space-y-4">
                                {shipping.items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-slate-200">
                                            <img
                                                src={item.order_item?.product?.images?.[0]?.url || '/images/no-image.jpg'}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900">
                                                {item.order_item?.product?.translations?.[0]?.name ||
                                                 item.order_item?.product?.name_en}
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {__('Quantity')}: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右側：料金内訳 & 決済 */}
                    <div className="space-y-8">
                        {/* 料金内訳 */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <DollarSign size={20} />
                                {__('Fee Breakdown')}
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">{__('Base Shipping Fee')}</span>
                                    <span className="font-bold text-slate-900">
                                        {renderDualCurrency(fee_breakdown.base_shipping_fee, currency)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">{__('International Fee (3%)')}</span>
                                    <span className="font-bold text-slate-900">
                                        {renderDualCurrency(fee_breakdown.international_fee, currency)}
                                    </span>
                                </div>

                                <div className="h-px bg-slate-200 my-4" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-slate-900">{__('Total')}</span>
                                    <span className="text-slate-900">
                                        {renderDualCurrency(fee_breakdown.total_amount, currency)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 決済ボタン */}
                        {shipping.status === 20 && (
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl">
                                <div className="text-center">
                                    <CreditCard size={48} className="text-cyan-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {__('Complete Payment')}
                                    </h3>
                                    <p className="text-slate-600 mb-6">
                                        {__('Pay for international shipping fees')}
                                    </p>

                                    <button
                                        onClick={() => {
                                            fetch(route('fan.international-shippings.checkout', shipping.id), {
                                                method: 'POST',
                                                headers: {
                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                                                    'Content-Type': 'application/json',
                                                },
                                            })
                                            .then(response => response.json())
                                            .then(data => {
                                                if (data.url) {
                                                    window.location.href = data.url;
                                                }
                                            });
                                        }}
                                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold uppercase tracking-widest transition-colors"
                                    >
                                        {__('Pay')} {renderDualCurrency(fee_breakdown.total_amount, currency)}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 支払い完了 */}
                        {shipping.status >= 30 && (
                            <div className="bg-green-50 rounded-[2.5rem] p-8 border border-green-200">
                                <div className="text-center">
                                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-green-900 mb-2">
                                        {__('Payment Completed')}
                                    </h3>
                                    <p className="text-green-700">
                                        {__('Your international shipping payment has been processed successfully.')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}