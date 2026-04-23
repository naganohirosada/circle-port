import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, fans }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    return (
        <AdminLayout user={auth.user} header="ファン管理">
            <Head title="ファン管理" />

            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4">ファン名 / ID</th>
                                <th className="p-4">メールアドレス</th>
                                <th className="p-4 text-center">注文数</th>
                                <th className="p-4 text-right">累計利用額</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {fans.data.map((fan) => (
                                <tr key={fan.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{fan.name}</div>
                                        <div className="text-[10px] font-mono text-gray-400">#FAN-{fan.id}</div>
                                    </td>
                                    <td className="p-4 text-gray-500">{fan.email}</td>
                                    <td className="p-4 text-center font-bold">{fan.orders_count} 回</td>
                                    <td className="p-4 text-right font-black text-gray-800">
                                        ¥{formatCurrency(fan.orders_sum_total_amount)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={route('admin.fans.show', fan.id)} className="text-xs font-black text-indigo-600 hover:underline">
                                            詳細
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