import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, payments }) {
    /**
     * ステータス値に応じたバッジのスタイルとラベルを返す
     */
    const getStatusBadge = (status) => {
        const styles = {
            20: "bg-emerald-50 text-emerald-700 border-emerald-200", // 成功
            10: "bg-amber-50 text-amber-700 border-amber-200",    // 支払い待ち
            30: "bg-rose-50 text-rose-700 border-rose-200",       // キャンセル/失敗
        };
        const labels = { 20: "Success", 10: "Pending", 30: "Canceled" };
        
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                {labels[status] || "Unknown"}
            </span>
        );
    };

    return (
        <AdminLayout user={auth.user} header="決済管理">
            <Head title="決済管理" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* テーブルコンテナ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">決済種別</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">関連リソース (リンク)</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">金額</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ステータス</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stripe ID</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">決済日時</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.data && payments.data.length > 0 ? (
                                    payments.data.map((payment) => {
                                        // 1次決済（商品）か2次決済（国際送料）かの判定
                                        const isPrimary = !!payment.order_id;
                                        const isSecondary = !!payment.shipping_id;

                                        return (
                                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* 1. 決済種別ラベル */}
                                                <td className="p-4">
                                                    {isPrimary && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tighter">
                                                            1次決済 (商品)
                                                        </span>
                                                    )}
                                                    {isSecondary && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-tighter">
                                                            2次決済 (送料)
                                                        </span>
                                                    )}
                                                    {!isPrimary && !isSecondary && (
                                                        <span className="text-gray-400 text-[10px]">不明</span>
                                                    )}
                                                </td>

                                                {/* 2. 関連リソースリンク */}
                                                <td className="p-4">
                                                    {isPrimary ? (
                                                        <Link 
                                                            href={route('admin.orders.show', payment.order_id)} 
                                                            className="group flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-900 transition-colors"
                                                        >
                                                            <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            </div>
                                                            注文 #{payment.order_id}
                                                        </Link>
                                                    ) : isSecondary ? (
                                                        <Link 
                                                            href={route('admin.shippings.show', payment.shipping_id)} 
                                                            className="group flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-900 transition-colors"
                                                        >
                                                            <div className="p-1.5 bg-pink-50 rounded-lg group-hover:bg-pink-100">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            </div>
                                                            荷物 #{payment.shipping_id}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs italic">紐付けデータなし</span>
                                                    )}
                                                </td>

                                                {/* 3. 金額 */}
                                                <td className="p-4 text-sm font-black text-gray-700 tabular-nums">
                                                    ¥{new Intl.NumberFormat('ja-JP').format(payment.total_amount)}
                                                </td>

                                                {/* 4. ステータス */}
                                                <td className="p-4">
                                                    {getStatusBadge(payment.status)}
                                                </td>

                                                {/* 5. Transaction ID (Stripe) */}
                                                <td className="p-4">
                                                    <code className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                        {payment.external_transaction_id || '---'}
                                                    </code>
                                                </td>

                                                {/* 6. 日時 */}
                                                <td className="p-4 text-[11px] text-gray-500 tabular-nums">
                                                    {payment.created_at}
                                                </td>

                                                <td className="p-4">
                                                    <Link 
                                                        href={route('admin.payments.show', payment.id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all"
                                                    >
                                                        詳細を確認
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-gray-400 text-sm font-medium">表示できる決済データがありません。</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ページネーションフッター */}
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            全 <span className="font-bold text-gray-700">{payments.total}</span> 件中 
                            <span className="font-bold text-gray-700"> {payments.from} - {payments.to}</span> 件を表示
                        </div>
                        
                        {/* ページネーションリンク */}
                        <div className="flex gap-1">
                            {payments.links.map((link, index) => (
                                link.url === null ? (
                                    <span
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="px-3 py-1 text-xs rounded-md border bg-white text-gray-300 border-gray-100 cursor-not-allowed"
                                    />
                                ) : (
                                    <Link
                                        key={index}
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
            </div>
        </AdminLayout>
    );
}