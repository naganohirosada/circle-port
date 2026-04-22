import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import BarcodeScanner from '@/Components/Admin/BarcodeScanner';

export default function Index({ auth, shippings, success }) {
    // ステータスのラベルと色をマッピング（Enumのvalueに合わせて調整）
    const statusMap = {
        20: { label: '発送済み', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        30: { label: '受領・検品済', color: 'bg-green-100 text-green-700 border-green-200' },
    };

    return (
        <AdminLayout user={auth.user} header="検品・受領管理">
            <Head title="検品一覧" />

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
                    <span className="font-bold">✓</span> {success}
                </div>
            )}

            <div className="mb-8">
                <BarcodeScanner />
            </div>

            <div className="w-full bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">配送ID</th>
                            <th className="px-6 py-4 text-left">発送元(クリエイター)</th>
                            <th className="px-6 py-4 text-left">内容物</th>
                            <th className="px-6 py-4 text-left">追跡番号 / 業者</th>
                            <th className="px-6 py-4 text-center">ステータス</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {shippings.length > 0 ? shippings.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-mono font-bold text-gray-900">#{s.id}</div>
                                    <div className="text-xs text-gray-400">{s.shipping_date || '未設定'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-bold text-gray-800">{s.creator?.name}</div>
                                    <div className="text-xs text-gray-500">{s.creator?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">
                                        {s.items_count || 0} 種類
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-mono text-indigo-600 font-semibold">{s.tracking_number}</div>
                                    <div className="text-xs text-gray-400">{s.carrier?.name}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusMap[s.status]?.color || 'bg-gray-100'}`}>
                                        {statusMap[s.status]?.label || '不明'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    {s.status === 20 ? ( // SHIPPED の場合のみ検品可能
                                        <Link href={route('admin.inspections.show', s.id)} className="inline-flex items-center px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition shadow-sm">
                                            検品を開始
                                        </Link>
                                    ) : (
                                        <Link href={route('admin.inspections.show', s.id)} className="text-indigo-600 hover:underline font-semibold text-xs">
                                            詳細を表示
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                    現在、検品待ちの配送はありません。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}