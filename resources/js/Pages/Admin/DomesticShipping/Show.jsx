import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, shipping }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    // ステータスバッジ
    const getStatusBadge = (status) => {
        const config = {
            10: { label: "配送準備中", style: "bg-gray-100 text-gray-600" },
            20: { label: "発送済み", style: "bg-blue-50 text-blue-700 border-blue-200" },
            30: { label: "倉庫到着済み", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        };
        const active = config[status] || { label: status, style: "bg-gray-50" };
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${active.style}`}>{active.label}</span>;
    };

    /**
     * 【修正】商品名 + バリエーション名を取得
     */
    const getFullProductName = (item) => {
        const pName = item.product?.translations?.[0]?.name || item.product?.name || '名称未設定';
        const vName = item.variation?.translations?.[0]?.variant_name || item.variation?.variant_name;
        
        return vName ? `${pName} [ ${vName} ]` : pName;
    };

    const getProductImage = (product) => product?.images?.[0]?.url || product?.images?.[0]?.path || null;

    return (
        <AdminLayout user={auth.user} header={`国内配送詳細 #${shipping.id}`}>
            <Head title={`国内配送詳細 #${shipping.id}`} />

            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                <div className="flex justify-between items-center">
                    <Link href={route('admin.shippings.domestic.index')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 font-bold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        国内配送一覧に戻る
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左カラム：配送・注文概要 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-8">
                            <h3 className="text-[11px] font-black text-emerald-600 uppercase mb-6 tracking-widest">Domestic Shipping</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">現在のステータス</p>
                                    {getStatusBadge(shipping.status)}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">追跡番号</p>
                                    <p className="text-lg font-mono font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        {shipping.tracking_number || '未登録'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-3xl p-8 text-white">
                            <h3 className="text-[11px] font-black text-gray-500 uppercase mb-6 tracking-widest">Order Info</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">注文ID</p>
                                    <Link href={route('admin.orders.show', shipping.order_id)} className="text-lg font-black text-emerald-400 hover:underline">
                                        #{shipping.order_id}
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">購入者</p>
                                    <p className="text-sm font-bold">{shipping.order?.fan?.name || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右カラム：配送アイテム明細 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Shipped Items</h4>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/30">
                                    <tr className="text-[10px] text-gray-400 font-bold uppercase">
                                        <th className="p-6">商品 / バリエーション</th>
                                        <th className="p-6 text-center">数量</th>
                                        <th className="p-6 text-right">単価 (参考)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(shipping.items || []).map((item) => {
                                        // 【修正】バリエーション価格を優先
                                        const unitPrice = item.variation?.price || item.product?.price || 0;

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                            {getProductImage(item.product) ? (
                                                                <img src={getProductImage(item.product)} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 font-black">NO IMAGE</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-gray-800 leading-tight">
                                                                {getFullProductName(item)}
                                                            </div>
                                                            {item.variation && (
                                                                <div className="mt-1 text-[9px] text-indigo-500 font-bold uppercase tracking-tighter">
                                                                    Variant ID: #{item.product_variant_id}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center font-black text-gray-700 text-lg">
                                                    × {item.quantity}
                                                </td>
                                                <td className="p-6 text-right text-sm font-medium text-gray-400 tabular-nums">
                                                    ¥{formatCurrency(unitPrice)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}