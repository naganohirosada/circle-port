import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { ArrowLeft, MapPin, CreditCard, ReceiptText, Calendar, AlertCircle, PackageCheck, Truck } from 'lucide-react';

// --- 定数定義 ---
const STATUS_PENDING = 10;                // 支払い待ち
const STATUS_PAID = 20;                   // 支払い完了（受注）
const STATUS_SHIPPED_TO_WAREHOUSE = 30;   // クリエイターから倉庫へ発送中
const STATUS_ARRIVED_AT_WAREHOUSE = 40;   // 倉庫に到着（検品済）
const STATUS_COMPLETED = 50;              // 全工程完了
const STATUS_CANCELLED = 90;              // キャンセル

const TYPE_ITEM_TOTAL = 1;      // 商品代金合計
const TYPE_DOMESTIC_SHIPPING = 2; // 国内送料
const TYPE_INTL_SHIPPING = 3;   // 国際送料
const TYPE_HANDLING_FEE = 4;    // 手数料
const TYPE_TAX = 5;             // 税金
const TYPE_DISCOUNT = 6;        // 割引

export default function Show({ order }) {
    const { language, locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // --- ステータス設定の取得 ---
    const getStatusInfo = (status) => {
        const s = Number(status);
        const configs = {
            [STATUS_PENDING]: { 
                label: __('Waiting for Payment'), 
                color: 'text-amber-600 bg-amber-50 border-amber-100',
                icon: <CreditCard size={14} />
            },
            [STATUS_PAID]: { 
                label: __('Paid'), 
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                icon: <PackageCheck size={14} />
            },
            [STATUS_SHIPPED_TO_WAREHOUSE]: { 
                label: __('In Transit to Warehouse'), 
                color: 'text-blue-600 bg-blue-50 border-blue-100',
                icon: <Truck size={14} />
            },
            [STATUS_ARRIVED_AT_WAREHOUSE]: { 
                label: __('Arrived at Warehouse'), 
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
                icon: <MapPin size={14} />
            },
            [STATUS_COMPLETED]: { 
                label: __('Completed'), 
                color: 'text-slate-600 bg-slate-50 border-slate-200',
                icon: <PackageCheck size={14} />
            },
            [STATUS_CANCELLED]: { 
                label: __('Cancelled'), 
                color: 'text-rose-600 bg-rose-50 border-rose-100',
                icon: <AlertCircle size={14} />
            },
        };
        return configs[s] || { label: String(s), color: 'text-slate-500 bg-slate-50', icon: null };
    };

    const statusInfo = getStatusInfo(order.status);

    // --- 金額内訳取得ヘルパー ---
    const getAmount = (typeId) => {
        const b = order.payment?.breakdowns?.find(item => Number(item.type) === typeId);
        return b ? parseFloat(b.amount) : 0;
    };

    // --- 国名の翻訳取得 ---
    const getCountryDisplayName = (country) => {
        if (!country) return '';
        const translation = country.translations?.find(t => t.locale === locale);
        return translation?.name || country.name;
    };

    const address = order.shipping_address;
    const pm = order.payment_method;

    return (
        <FanLayout>
            <Head title={`${__('Order')} #${order.id}`} />
            
            <div className="max-w-[1000px] mx-auto px-6 py-12">
                {/* ヘッダーセクション */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <Link href={route('fan.orders.index')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 w-fit transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">{__('Back to History')}</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-slate-900">{__('Order')}</h1>
                            <span className="text-3xl font-light text-slate-300">#{order.id}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-white border border-slate-100 shadow-sm px-5 py-2.5 rounded-full">
                        <Calendar size={14} className="text-slate-400" />
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* メインコンテンツ（左） */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* 商品リストカード */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h2 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <ReceiptText className="text-cyan-600" size={20} />
                                {__('Order Items')}
                            </h2>
                            <div className="space-y-8">
                                {order.order_items?.map((item) => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner">
                                            <img 
                                                src={item.product?.images?.[0]?.url || item.product?.image} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{item.product?.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">
                                                {item.variation?.name || 'Standard'}
                                            </p>
                                            <p className="text-xs font-medium text-slate-500">
                                                ¥{parseFloat(item.unit_price || 0).toLocaleString()} <span className="mx-1 text-slate-300">×</span> {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right py-1">
                                            <span className="text-sm font-bold text-slate-900">
                                                ¥{(parseFloat(item.unit_price || 0) * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 配送先カード */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                                <MapPin className="text-cyan-600" size={20} />
                                {__('Shipping Address')}
                            </h2>
                            {address ? (
                                <div className="bg-slate-50 rounded-[2rem] p-7 border border-slate-100">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-base font-bold text-slate-900 mb-1">{address.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">{address.phone}</p>
                                        </div>
                                        <span className="text-[10px] px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400 font-black uppercase tracking-tighter shadow-sm">
                                            {__('Destination')}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1.5 text-sm text-slate-600 border-t border-slate-200 pt-5">
                                        <p className="font-bold text-slate-900 mb-2">〒{address.postal_code}</p>
                                        <p>{address.state} {address.city}</p>
                                        <p>{address.address_line1}</p>
                                        {address.address_line2 && <p>{address.address_line2}</p>}
                                        
                                        <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                            <p className="text-slate-900 font-bold tracking-wide">
                                                {getCountryDisplayName(address.country)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 rounded-[2rem] text-slate-400 text-sm border border-dashed border-slate-200">
                                    <AlertCircle size={24} className="mb-2 opacity-30" />
                                    <p>{__('Address information is unavailable.')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* サイドバー（右） */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-8 shadow-xl">
                            {/* ステータスバッジ */}
                            <div className="mb-10">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                    {statusInfo.label}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-8">{__('Payment Summary')}</h3>

                            {/* 金額内訳 */}
                            <div className="space-y-4 mb-10 border-b border-slate-800 pb-10 text-sm text-slate-400">
                                <div className="flex justify-between items-center">
                                    <span>{__('Items Total')}</span>
                                    <span className="text-white font-medium">¥{getAmount(TYPE_ITEM_TOTAL).toLocaleString()}</span>
                                </div>
                                
                                {getAmount(TYPE_DOMESTIC_SHIPPING) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span>{__('Domestic Shipping')}</span>
                                        <span className="text-white font-medium">¥{getAmount(TYPE_DOMESTIC_SHIPPING).toLocaleString()}</span>
                                    </div>
                                )}

                                {getAmount(TYPE_INTL_SHIPPING) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span>{__('International Shipping')}</span>
                                        <span className="text-white font-medium">¥{getAmount(TYPE_INTL_SHIPPING).toLocaleString()}</span>
                                    </div>
                                )}

                                {getAmount(TYPE_HANDLING_FEE) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span>{__('Handling Fee')}</span>
                                        <span className="text-white font-medium">¥{getAmount(TYPE_HANDLING_FEE).toLocaleString()}</span>
                                    </div>
                                )}

                                {getAmount(TYPE_TAX) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span>{__('Tax')}</span>
                                        <span className="text-white font-medium">¥{getAmount(TYPE_TAX).toLocaleString()}</span>
                                    </div>
                                )}

                                {getAmount(TYPE_DISCOUNT) !== 0 && (
                                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                                        <span>{__('Discount')}</span>
                                        <span>-¥{Math.abs(getAmount(TYPE_DISCOUNT)).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* 合計金額 */}
                            <div className="space-y-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">{__('Total Paid')}</span>
                                        <p className="text-[10px] text-slate-500">{__('Includes all taxes and fees')}</p>
                                    </div>
                                    <span className="text-5xl font-light tracking-tighter text-white">
                                        ¥{parseFloat(order.total_amount).toLocaleString()}
                                    </span>
                                </div>

                                {/* 支払いカード情報 */}
                                <div className="pt-8 border-t border-slate-800 flex items-start gap-4">
                                    <div className="p-3 bg-slate-800 rounded-2xl text-cyan-400 shadow-inner">
                                        <CreditCard size={22} />
                                    </div>
                                    <div className="text-xs">
                                        <p className="text-slate-500 uppercase font-black tracking-widest mb-1.5">{__('Method')}</p>
                                        {pm ? (
                                            <div className="space-y-1">
                                                <p className="text-white font-bold text-sm uppercase tracking-wide">
                                                    {pm.brand} <span className="mx-1 opacity-20">/</span> •••• {pm.last4}
                                                </p>
                                                <p className="text-slate-500 font-medium">
                                                    EXP {String(pm.exp_month).padStart(2, '0')} / {pm.exp_year}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-white italic opacity-40">{__('Payment details unavailable')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}