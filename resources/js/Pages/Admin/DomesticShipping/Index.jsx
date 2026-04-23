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
                                <th className="p-4">対象注文</th>
                                <th className="p-4">購入者</th>
                                <th className="p-4">ステータス</th>
                                <th className="p-4">発送日</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {shippings.data.map((ship) => (
                                <tr key={ship.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="text-sm font-bold text-gray-900">#{ship.id}</div>
                                        <div className="text-[10px] font-mono text-gray-400">{ship.tracking_number || '追跡番号なし'}</div>
                                    </td>
                                    <td className="p-4">
                                        <Link href={route('admin.orders.show', ship.order_id)} className="text-xs text-indigo-600 font-bold hover:underline">
                                            ORDER #{ship.order_id}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{ship.order?.fan?.name}</td>
                                    <td className="p-4">{getStatusBadge(ship.status)}</td>
                                    <td className="p-4 text-xs text-gray-400">{ship.shipped_at || '未発送'}</td>
                                    <td className="p-4 text-right">
                                        <Link href={route('admin.shippings.domestic.show', ship.id)} className="text-xs font-black text-gray-400 hover:text-gray-900">
                                            詳細を確認
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