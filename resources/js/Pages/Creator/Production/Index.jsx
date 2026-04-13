// resources/js/Pages/Creator/Production/Index.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    ChevronLeft, 
    Printer, 
    PackageCheck, 
    AlertCircle,
    ArrowRightCircle,
    Filter
} from 'lucide-react';

export default function Index({ productionList, groupOrder, filters }) {
    
    // 全体の合計製作数を計算
    const totalQuantity = productionList.reduce((sum, item) => sum + Number(item.total_quantity), 0);

    return (
        <CreatorLayout>
            <Head title="製作管理 - CP STUDIO." />

            <div className="p-8 max-w-[1200px] mx-auto space-y-8">
                {/* ヘッダーエリア */}
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
                            Production <span className="text-cyan-400">Ledger</span>
                        </h1>
                        <p className="text-sm font-bold mt-1 text-slate-400 uppercase italic tracking-widest">
                            製作管理台帳（製作数集計・発注指示）
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {/* プロジェクト絞り込み中の解除ボタン */}
                        {groupOrder && (
                            <Link 
                                href={route('creator.production.index')}
                                className="bg-slate-100 text-slate-400 px-4 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-200 transition-all"
                            >
                                <Filter size={14} /> フィルター解除
                            </Link>
                        )}
                        <button 
                            onClick={() => window.print()}
                            className="bg-white border-4 border-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none flex items-center gap-2"
                        >
                            <Printer size={16} /> 印刷 / PDF出力
                        </button>
                    </div>
                </header>

                {/* 集計サマリー */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    <div className="md:col-span-8 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-[12px_12px_0px_#A5F3FC]">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div>
                                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <AlertCircle size={14} /> 
                                    {groupOrder ? 'プロジェクト絞り込み適用中' : '総製作数（全プロジェクト合計）'}
                                </div>
                                <div className="text-7xl font-black tracking-tighter">
                                    {totalQuantity}<span className="text-xl ml-2 text-slate-500 font-bold uppercase">個</span>
                                </div>
                            </div>
                            {groupOrder && (
                                <div className="bg-white/10 p-6 rounded-3xl border border-white/20 max-w-sm">
                                    <div className="text-[9px] font-black text-slate-400 uppercase mb-2">対象プロジェクト</div>
                                    <div className="font-black text-sm uppercase leading-tight">{groupOrder.title}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-4 bg-cyan-400 rounded-[2.5rem] p-10 border-4 border-slate-900 shadow-[12px_12px_0px_#000] flex flex-col justify-center">
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">次のステップ</div>
                        <div className="text-lg font-black text-slate-900 leading-tight uppercase">
                            製作完了後、<br/>国内配送の手配へ
                        </div>
                        <div className="mt-4 flex gap-2">
                            <span className="w-8 h-2 bg-slate-900 rounded-full"></span>
                            <span className="w-8 h-2 bg-white/50 rounded-full"></span>
                            <span className="w-8 h-2 bg-white/50 rounded-full"></span>
                        </div>
                    </div>
                </div>

                {/* 製作リストテーブル */}
                <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-[12px_12px_0px_#000] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 text-white text-[10px] uppercase italic tracking-widest">
                            <tr>
                                <th className="p-8">商品詳細 / バリエーション</th>
                                <th className="p-8 w-[150px] text-right">必要製作数</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-slate-50">
                            {productionList.length > 0 ? productionList.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_#DDD] group-hover:shadow-none transition-all">
                                                {/* 前回修正した product_thumbnail を使用 */}
                                                <img src={item.product_thumbnail} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                                                    ID: {item.product_id}
                                                </div>
                                                <div className="font-black text-xl text-slate-900 uppercase tracking-tight leading-none mb-2">
                                                    {/* 前回修正した product_name を使用 */}
                                                    {item.product_name}
                                                </div>
                                                <div className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-lg text-[10px] font-black border-2 border-cyan-200 uppercase">
                                                    仕様: {item.variation?.name || 'スタンダード / フリーサイズ'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">数量</div>
                                        <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                            <span className="text-lg mr-1 text-cyan-400 italic">×</span>
                                            {item.total_quantity}
                                        </div>
                                    </td>
                                </tr>
                            ) ) : (
                                <tr>
                                    <td colSpan="2" className="p-20 text-center">
                                        <div className="text-slate-300 font-black italic uppercase tracking-[0.3em]">
                                            製作対象のデータはありません
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 注意事項 */}
                <div className="bg-pink-50 border-4 border-dashed border-pink-200 rounded-[2rem] p-8 flex items-start gap-4">
                    <PackageCheck className="text-pink-500 shrink-0" size={24} />
                    <div className="space-y-2">
                        <h4 className="font-black text-pink-500 uppercase text-xs tracking-widest">製作・発注時の注意事項</h4>
                        <p className="text-[11px] font-bold text-pink-400 leading-relaxed uppercase">
                            このリストは1次決済（商品代金）が完了した注文のみを自動集計しています。
                            製作を開始する前に、すべてのバリエーションと数量が正しいか確認してください。
                            不明な点がある場合は管理者へお問い合わせください。
                        </p>
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}