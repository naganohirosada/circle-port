import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, shippings }) {
    const getStatusBadge = (status) => {
        const config = {
            10: { label: "配送準備中", style: "bg-gray-50 text-gray-500" },
            20: { label: "発送済み", style: "bg-blue-50 text-blue-700 border-blue-100" },
            30: { label: "倉庫到着済み", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
        };
        const active = config[status] || { label: status, style: "bg-gray-50" };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${active.style}`}>{active.label}</span>;
    };

    return (
        <AdminLayout user={auth.user} header="国内配送一覧">
            <Head title="国内配送一覧" />

            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4">配送ID / 追跡番号</th>
                                <th className="p-4">対象コンテキスト</th>
                                <th className="p-4">発送元・購入者</th>
                                <th className="p-4">ステータス</th>
                                <th className="p-4">発送日</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {shippings.data.map((ship) => (
                                <tr key={ship.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="text-sm font-bold text-gray-900">#{ship.domestic_shipping_number || ship.id}</div>
                                        <div className="text-[10px] font-mono text-gray-400">{ship.tracking_number || '追跡番号なし'}</div>
                                    </td>
                                    <td className="p-4">
                                        {/* 【修正】order_idの有無で条件分岐し、Ziggyのエラーを完全に防ぐ */}
                                        {ship.order_id ? (
                                            <Link href={route('admin.orders.show', ship.order_id)} className="text-xs text-indigo-600 font-bold hover:underline">
                                                ORDER #{ship.order_id}
                                            </Link>
                                        ) : (
                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
                                                📦 新規作品納品
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {ship.order_id ? (
                                            <div className="text-gray-600 font-medium">{ship.order?.fan?.name || '購入者不明'}</div>
                                        ) : (
                                            <div className="text-slate-800 font-black">
                                                👤 {ship.creator?.name || 'クリエイター'} 
                                                <span className="text-[10px] text-gray-400 block font-normal mt-0.5">{ship.creator?.shop_name}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">{getStatusBadge(ship.status)}</td>
                                    <td className="p-4 text-xs text-gray-400">{ship.shipped_at || '未発送'}</td>
                                    <td className="p-4 text-right">
                                        <Link href={route('admin.inspections.show', ship.id)} className="text-xs font-black text-gray-400 hover:text-indigo-600">
                                            詳細・検品を開始
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}