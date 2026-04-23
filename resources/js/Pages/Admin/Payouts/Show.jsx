import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ auth, payout }) {
    const { post, processing } = useForm();
    const formatCurrency = (amount) => new Intl.NumberFormat('ja-JP').format(amount || 0);

    const handlePaid = () => {
        if (confirm('振込完了としてマークしますか？')) {
            post(route('admin.payouts.paid', payout.id));
        }
    };

    return (
        <AdminLayout user={auth.user} header={`振込詳細 #${payout.id}`}>
            <Head title="振込詳細" />

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* ヘッダーアクション */}
                <div className="flex justify-between items-center">
                    <Link href={route('admin.payouts.index')} className="text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors">
                        ← 振込一覧に戻る
                    </Link>
                    {payout.status !== 30 && (
                        <button 
                            onClick={handlePaid}
                            disabled={processing}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
                        >
                            {processing ? '処理中...' : '振込完了に更新'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 振込金額情報 */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">振込予定金額</p>
                        <p className="text-4xl font-black text-gray-900 tabular-nums font-mono">¥{formatCurrency(payout.amount)}</p>
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">対象クリエイター</p>
                            <Link href={route('admin.creators.show', payout.creator_id)} className="font-bold text-indigo-600 hover:underline">
                                {payout.creator?.name}
                            </Link>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">振込予定日</p>
                            <p className="text-sm font-bold text-gray-700">{payout.scheduled_date}</p>
                        </div>
                    </div>

                    {/* 振込先銀行情報 */}
                    <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl">
                        <h3 className="text-[11px] font-black text-gray-500 uppercase mb-4 tracking-widest">Bank Account / 振込先口座</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-500">銀行名</span>
                                <span className="font-bold">{payout.creator?.bank_name || '未設定'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-500">支店名 / 番号</span>
                                <span className="font-bold">{payout.creator?.branch_name || '---'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-800 pb-2">
                                <span className="text-gray-500">口座種別</span>
                                <span className="font-bold">普通</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">口座番号</span>
                                <span className="font-black text-lg text-emerald-400 font-mono tracking-wider">
                                    {payout.creator?.account_number || '-------'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 振込内訳セクション */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                    <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Included Sales / 振込内訳</h4>
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                            {payout.details?.length || 0} PAYMENTS
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] text-gray-400 font-bold uppercase bg-gray-50/50">
                                    <th className="p-6">決済ID</th>
                                    <th className="p-6">決済日時</th>
                                    <th className="p-6 text-right">クリエイター受取額</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {payout.details && payout.details.length > 0 ? (
                                    payout.details.map((detail) => (
                                        <tr key={detail.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="p-6">
                                                <Link 
                                                    href={route('admin.payments.show', detail.payment_id)}
                                                    className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    #{detail.payment_id}
                                                </Link>
                                            </td>
                                            <td className="p-6 text-gray-500 font-mono text-xs">
                                                {detail.payment?.created_at}
                                            </td>
                                            <td className="p-6 text-right font-black text-gray-900 tabular-nums">
                                                ¥{formatCurrency(detail.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="p-12 text-center text-sm text-gray-400 italic">
                                            振込明細が見つかりません。
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}