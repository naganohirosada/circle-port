import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, shippings, success }) {
    const statusMap = {
        10: { label: '商品待ち', color: 'bg-slate-100 text-slate-600' },
        20: { label: '梱包・計量中', color: 'bg-blue-100 text-blue-700' },
        30: { label: '支払い待ち', color: 'bg-orange-100 text-orange-700' },
        40: { label: '支払い済', color: 'bg-green-100 text-green-700' },
    };

    return (
        <AdminLayout user={auth.user} header="国際配送管理">
            <Head title="国際配送一覧" />

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                    {success}
                </div>
            )}

            <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">配送ID</th>
                            <th className="px-6 py-4 text-left">ファン (宛先国)</th>
                            <th className="px-6 py-4 text-center">アイテム数</th>
                            <th className="px-6 py-4 text-center">ステータス</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {shippings.data.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900">
                                    #{s.id}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{s.fan?.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {s.address?.country?.translations?.[0]?.name || '国不明'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold">
                                    {s.items_count} 個
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusMap[s.status]?.color}`}>
                                        {statusMap[s.status]?.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link 
                                        href={route('admin.international-shippings.show', s.id)}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        梱包・計量
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}