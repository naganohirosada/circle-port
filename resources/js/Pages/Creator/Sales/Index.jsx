import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    ChevronLeft, 
    TrendingUp, 
    CreditCard, 
    Download,
    Info,
    ShieldAlert,
    FileSpreadsheet,
    Building2
} from 'lucide-react';

export default function Index({ salesData, summary }) {
    
    // 通貨フォーマット（完全保護）
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
    };

    // 免税証明CSVエクスポートエンドポイントへの発火処理マージ
    const handleCsvExport = () => {
        window.location.href = route('creator.sales.csv');
    };

    return (
        <CreatorLayout>
            <Head title="売上管理（免税・インボイス対応） - CP STUDIO." />

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
                            輸出免税監査対応・インボイス精算明細
                        </p>
                    </div>

                    {/* アクションをマージしたCSVダウンロードトリガー */}
                    <button 
                        onClick={handleCsvExport}
                        className="bg-white border-4 border-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none flex items-center gap-2"
                    >
                        <Download size={16} /> 免税証明 CSV 出力
                    </button>
                </header>

                {/* 【新設・消費税法対応】：国内外の仕訳・計算分離ステートカードエリア */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-[12px_12px_0px_#A5F3FC]">
                        <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={14} /> 海外向け 免税売上高 (0%)
                        </div>
                        <div className="text-4xl font-black tracking-tighter text-cyan-300">
                            {formatCurrency(summary.total_export_exempt ?? 0)}
                        </div>
                        <div className="mt-4 text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                            💡 消費税法第7条に基づき、日本の消費税0%が適法に適用されている輸出金額の通算計です。
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border-4 border-slate-900 shadow-[12px_12px_0px_#000]">
                        <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldAlert size={14} /> 国内向け 課税売上高 (10%)
                        </div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter">
                            {formatCurrency(summary.total_domestic_taxable ?? 0)}
                        </div>
                        <div className="mt-4 text-[9px] font-bold text-slate-400 uppercase flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span>内消費税額 (10%対象)</span>
                            <span className="font-black text-slate-700">{formatCurrency(summary.domestic_tax_amount ?? 0)}</span>
                        </div>
                    </div>

                    <div className="bg-cyan-400 rounded-[2.5rem] p-8 border-4 border-slate-900 shadow-[12px_12px_0px_#000] flex flex-col justify-center">
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">生涯総利益（サークル純手取り）</div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter">
                            {formatCurrency(summary.total_net)}
                        </div>
                        <div className="mt-3 text-[10px] font-bold text-slate-500 uppercase">
                            手数料 {summary.fee_rate_percent}% 控除後 / 決済総数: {summary.count} 件
                        </div>
                    </div>
                </div>

                {/* 【新設・インボイス制度対応】：プラットフォーム手数料に関する適格精算明細コンテナ */}
                <div className="bg-amber-50/50 rounded-[2.5rem] border-4 border-amber-900/30 p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-4 space-y-2">
                        <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                            <Building2 size={14} /> 適格請求書発行事業者情報（仕入税額控除明細）
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">CirclePort インボイス精算明細</h3>
                        <p className="text-[10px] font-bold text-slate-400 font-mono">
                            登録番号: <span className="text-slate-800 font-black text-xs select-all bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">{summary.operator_invoice_number}</span>
                        </p>
                    </div>
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-3xl border border-amber-900/10 shadow-sm">
                        <div className="space-y-1 text-left">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">当期徴収システム手数料（グロス差額）</span>
                            <span className="text-xl font-black text-slate-900 font-mono">{formatCurrency(summary.total_fee_charge)}</span>
                        </div>
                        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 flex flex-col justify-between text-left">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">うちサークル側仕入税額控除対象消費税額 (10%)</span>
                            <span className="text-xl font-black text-indigo-600 font-mono">{formatCurrency(summary.fee_tax_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* 【クレンジング拡張】：国税局監査基準に準拠した国際追跡証明対応・取引履歴テーブル */}
                <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_#000] overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wide text-left">
                        <FileSpreadsheet size={14} /> ※日本の税務調査時、本履歴の「税区分」「国際配送キャリア」「追跡番号(AWB)」を提示することで輸出免税が100%適法に立証されます。
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[950px]">
                            <thead className="bg-slate-900 text-white text-[10px] uppercase italic tracking-widest">
                                <tr>
                                    <th className="p-6">決済日時 / オーダーID</th>
                                    <th className="p-6">商品内容（一部）</th>
                                    <th className="p-6 text-center">消費税区分 / 仕向け地</th>
                                    <th className="p-6">配送キャリア / 追跡番号(AWB)</th>
                                    <th className="p-6 text-right">売上純利益</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-4 divide-slate-50">
                                {salesData.length > 0 ? salesData.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="text-xs font-black text-slate-900">
                                                {new Date(payment.created_at).toLocaleString('ja-JP')}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                #{payment.order?.id || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm font-bold text-slate-600 truncate max-w-[240px]">
                                                {payment.order?.order_items?.[0]?.product?.translations?.[0]?.name || '商品情報なし'}
                                                {payment.order?.order_items?.length > 1 && ` 他${payment.order.order_items.length - 1}点`}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                                payment.is_export_exempt 
                                                    ? 'bg-cyan-50 border-cyan-200 text-cyan-600' 
                                                    : 'bg-rose-50 border-rose-200 text-rose-600'
                                            }`}>
                                                {payment.is_export_exempt ? `海外免税 (0%)` : '国内課税 (10%)'}
                                            </span>
                                            <div className="text-[10px] font-mono font-black text-slate-400 mt-1.5 uppercase tracking-widest">
                                                Country: {payment.destination_country}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-black text-slate-800">
                                                {payment.carrier_name}
                                            </div>
                                            <div className="text-[10px] font-mono font-bold text-slate-400 select-all underline decoration-cyan-400 decoration-2 underline-offset-2 mt-0.5">
                                                {payment.tracking_number}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="text-xl font-black text-slate-900 font-mono">
                                                {formatCurrency(payment.calculated_net_amount)}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="text-slate-300 font-black italic uppercase tracking-[0.3em]">
                                                売上データが存在しません
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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