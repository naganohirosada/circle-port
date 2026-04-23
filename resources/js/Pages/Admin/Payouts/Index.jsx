import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, payouts }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    const getStatusBadge = (status) => {
        const config = {
            10: { label: "未振込", style: "bg-amber-50 text-amber-700 border-amber-200" },
            20: { label: "処理中", style: "bg-blue-50 text-blue-700 border-blue-200" },
            30: { label: "振込済", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        };
        const active = config[status] || { label: status, style: "bg-gray-50" };
        return <span className={`px-2 py-1 rounded text-[10px] font-black border uppercase ${active.style}`}>{active.label}</span>;
    };

    return (
        <AdminLayout user={auth.user} header="振込管理">
            <Head title="振込管理" />

            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-4">振込予定日</th>
                                <th className="p-4">クリエイター</th>
                                <th className="p-4 text-right">振込金額</th>
                                <th className="p-4 text-center">ステータス</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payouts.data.map((payout) => (
                                <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-mono font-bold text-gray-900">{payout.scheduled_date}</td>
                                    <td className="p-4 font-bold text-gray-700">{payout.creator?.name}</td>
                                    <td className="p-4 text-right font-black text-indigo-600">¥{formatCurrency(payout.amount)}</td>
                                    <td className="p-4 text-center">{getStatusBadge(payout.status)}</td>
                                    <td className="p-4 text-right">
                                        <Link href={route('admin.payouts.show', payout.id)} className="text-xs font-black text-gray-400 hover:text-gray-900">
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