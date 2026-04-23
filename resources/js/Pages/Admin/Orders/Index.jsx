import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, orders }) {
    const getStatusBadge = (status) => {
        // システムの注文ステータスに合わせて調整してください
        const styles = {
            1: "bg-blue-50 text-blue-700 border-blue-200",   // 新規注文
            2: "bg-amber-50 text-amber-700 border-amber-200", // お取り寄せ中
            3: "bg-purple-50 text-purple-700 border-purple-200", // 国内倉庫到着
            4: "bg-emerald-50 text-emerald-700 border-emerald-200", // 完了
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || "bg-gray-50"}`}>
                STATUS: {status}
            </span>
        );
    };

    return (
        <AdminLayout user={auth.user} header="注文管理">
            <Head title="注文管理" />

            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">注文番号</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">購入者 (ファン)</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">商品数</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">合計金額</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ステータス</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">注文日時</th>
                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.data.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                                    <td className="p-4 font-bold text-indigo-600">#{order.id}</td>
                                    <td className="p-4 font-medium text-gray-700">
                                        {order.fan?.name || '不明なユーザー'}
                                    </td>
                                    <td className="p-4 text-gray-500">{order.order_items_count} 点</td>
                                    <td className="p-4 font-black text-gray-800">
                                        ¥{new Intl.NumberFormat('ja-JP').format(order.total_amount)}
                                    </td>
                                    <td className="p-4">{getStatusBadge(order.status)}</td>
                                    <td className="p-4 text-xs text-gray-400 tabular-nums">{order.created_at}</td>
                                    <td className="p-4 text-right">
                                        <Link 
                                            href={route('admin.orders.show', order.id)}
                                            className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                        >
                                            詳細
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* ページネーションリンク */}
                    <div className="flex gap-1">
                        {orders.links.map((link, i) => (
                            link.url === null ? (
                                // URLがnullの場合はリンクにせず、ただのspanとして表示（クリック不可）
                                <span
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="px-3 py-1 text-xs rounded-md border bg-white text-gray-300 border-gray-100 cursor-not-allowed"
                                />
                            ) : (
                                // URLがある場合のみLinkコンポーネントを使用
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                                        link.active 
                                            ? "bg-indigo-600 text-white border-indigo-600 font-bold" 
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                    }`}
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}