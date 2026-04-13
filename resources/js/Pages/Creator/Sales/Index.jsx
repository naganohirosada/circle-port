import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    ChevronLeft, 
    TrendingUp, 
    CreditCard, 
    Download,
    History,
    Info
} from 'lucide-react';

export default function Index({ salesData, summary }) {
    
    // 通貨フォーマット（憲法第3条：将来の多言語・多通貨対応の布石）
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
    };

    return (
        <CreatorLayout>
            <Head title="売上管理 - CP STUDIO." />

            <div className="p-8 max-w-[1200px] mx-auto space-y-8">
                {/* ヘッダー */}
                <header className="flex justify-between items-end border-b-4 border-slate-900 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link 
                                href={route('creator.dashboard')} 
                                className="text-[10px] font-black uppercase text-slate-400 hover:text-cyan-500 transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft size={12} /> ダッシュボード
                            </Link>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                            Sales <span className="text-cyan-400">Analytics</span>
                        </h1>
                        <p className="text-sm font-bold mt-1 text-slate-400 uppercase italic tracking-widest">
                            売上実績・純利益確認
                        </p>
                    </div>

                    <button className="bg-white border-4 border-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none flex items-center gap-2">
                        <Download size={16} /> CSV Export
                    </button>
                </header>

                {/* 売上サマリーカード */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-[12px_12px_0px_#A5F3FC]">
                        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={14} /> 純売上（手取り額）
                        </div>
                        <div className="text-5xl font-black tracking-tighter">
                            {formatCurrency(summary.total_net)}
                        </div>
                        <div className="mt-4 text-[10px] font-bold text-slate-500 uppercase">
                            手数料 {summary.fee_rate_percent}% 控除後
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border-4 border-slate-900 shadow-[12px_12px_0px_#000]">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CreditCard size={14} /> 総売上（グロス）
                        </div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter">
                            {formatCurrency(summary.total_gross)}
                        </div>
                    </div>

                    <div className="bg-cyan-400 rounded-[2.5rem] p-8 border-4 border-slate-900 shadow-[12px_12px_0px_#000] flex flex-col justify-center">
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">決済件数</div>
                        <div className="text-5xl font-black text-slate-900 tracking-tighter">
                            {summary.count}<span className="text-xl ml-1">件</span>
                        </div>
                    </div>
                </div>

                {/* 取引履歴 */}
                <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_#000] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 text-white text-[10px] uppercase italic tracking-widest">
                            <tr>
                                <th className="p-6">決済日時 / オーダーID</th>
                                <th className="p-6">商品内容（一部）</th>
                                <th className="p-6 text-right">売上金額</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-slate-50">
                            {salesData.length > 0 ? salesData.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="text-xs font-black text-slate-900">
                                            {new Date(payment.created_at).toLocaleString('ja-JP')}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                                            #{payment.order?.id}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-sm font-bold text-slate-600 truncate max-w-[300px]">
                                            {payment.order?.order_items?.[0]?.product?.translations?.[0]?.name || '商品情報なし'}
                                            {payment.order?.order_items?.length > 1 && ` 他${payment.order.order_items.length - 1}点`}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="text-xl font-black text-slate-900">
                                            {formatCurrency(payment.calculated_net_amount)}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="p-20 text-center">
                                        <div className="text-slate-300 font-black italic uppercase tracking-[0.3em]">
                                            売上データが存在しません
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ヘルプ情報 */}
                <div className="bg-slate-100 rounded-[2rem] p-6 flex items-start gap-4">
                    <Info className="text-slate-400 shrink-0" size={20} />
                    <div className="space-y-1">
                        <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">売上の計上タイミングについて</h4>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                            この画面では「1次決済（商品購入）」が完了した金額を表示しています。
                            振込申請に関する機能は、現在準備中です。
                        </p>
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}