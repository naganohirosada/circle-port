import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, order }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    // ステータスバッジ
    const getStatusBadge = (status) => {
        const config = {
            10: { label: "支払い待ち", style: "bg-amber-50 text-amber-700 border-amber-200" },
            20: { label: "支払い完了 (受注)", style: "bg-blue-50 text-blue-700 border-blue-200" },
            30: { label: "倉庫へ発送中", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
            40: { label: "倉庫到着 (検品済)", style: "bg-cyan-50 text-cyan-700 border-cyan-200" },
            50: { label: "全工程完了", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            90: { label: "キャンセル", style: "bg-rose-50 text-rose-700 border-rose-200" },
        };

        const active = config[status] || { label: `不明 (${status})`, style: "bg-gray-50 text-gray-500 border-gray-200" };

        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${active.style}`}>
                {active.label}
            </span>
        );
    };

    /**
     * 【修正版】価格取得ロジック
     * dd()の結果に基づき、product.price を確実に拾うようにしました
     */
    const getUnitPrice = (item) => {
        // 1. バリエーション価格
        if (item.product_variant?.price) return parseFloat(item.product_variant.price);
        // 2. 注文保存価格
        if (item.price && parseFloat(item.price) > 0) return parseFloat(item.price);
        // 3. 商品基本価格 (ddで確認できた 2200 の場所)
        if (item.product?.price) return parseFloat(item.product.price);
        
        return 0;
    };

    const getProductName = (product) => product?.translations?.[0]?.name || product?.name || '名称未設定';
    const getProductImage = (product) => product?.images?.[0]?.url || product?.images?.[0]?.path || null;

    return (
        <AdminLayout user={auth.user} header={`注文詳細 #${order.id}`}>
            <Head title={`注文詳細 #${order.id}`} />

            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                {/* 戻るナビゲーション */}
                <div className="flex justify-between items-center">
                    <Link href={route('admin.orders.index')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 font-bold transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        注文一覧へ戻る
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左カラム：概要と顧客情報 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 tracking-widest">Order Summary / 概要</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">注文番号</p>
                                    <p className="text-2xl font-black text-gray-900">#{order.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">現在のステータス</p>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">購入者</p>
                                    <p className="text-lg font-bold text-gray-800">{order.fan?.name || '不明なユーザー'}</p>
                                    <p className="text-xs text-gray-400">{order.fan?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* 決済リンクカード */}
                        {order.payment && (
                            <div className="bg-indigo-600 rounded-3xl shadow-lg p-8 text-white">
                                <h3 className="text-[11px] font-black text-indigo-200 uppercase mb-6 tracking-widest">Linked Payment / 決済紐付け</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">決済総額</p>
                                        <p className="text-3xl font-black">¥{formatCurrency(order.payment.total_amount)}</p>
                                    </div>
                                    <div className="pt-4 border-t border-indigo-500">
                                        <Link 
                                            href={route('admin.payments.show', order.payment.id)}
                                            className="inline-flex items-center gap-2 text-xs font-bold bg-white text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
                                        >
                                            決済詳細を表示
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 右カラム：注文明細テーブル */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Order Items / 注文明細</h4>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/30">
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase">商品情報</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-center">数量</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-right">単価 (税込)</th>
                                        <th className="p-6 text-[10px] font-bold text-gray-400 uppercase text-right">小計</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(order.order_items || []).map((item) => {
                                        const unitPrice = getUnitPrice(item);
                                        const subtotal = unitPrice * (item.quantity || 0);

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                            {getProductImage(item.product) ? (
                                                                <img src={getProductImage(item.product)} className="w-full h-full object-cover" alt="item" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 font-bold uppercase text-center p-1">No Image</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-gray-800 leading-tight mb-1">{getProductName(item.product)}</div>
                                                            {item.product_variant && (
                                                                <div className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                                                                    {item.product_variant.name}
                                                                </div>
                                                            )}
                                                            <div className="text-[10px] text-gray-400 mt-1 font-mono uppercase">SKU: {item.product?.sku || '---'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-sm text-center font-bold text-gray-600 tabular-nums">× {item.quantity}</td>
                                                <td className="p-6 text-sm text-right font-medium text-gray-400 tabular-nums">¥{formatCurrency(unitPrice)}</td>
                                                <td className="p-6 text-sm text-right font-black text-gray-800 tabular-nums text-lg">¥{formatCurrency(subtotal)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {/* 合計フッター */}
                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">注文合計金額 (税込)</span>
                                <span className="text-3xl font-black text-gray-900">¥{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}