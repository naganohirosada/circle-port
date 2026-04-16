import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    ChevronLeft, 
    Truck, 
    Box, 
    Clock, 
    CheckCircle2, 
    ExternalLink,
    AlertCircle,
    Printer,
    MapPin,
    Package,
    Plus
} from 'lucide-react';

export default function Index({ shippings }) {
    
    /**
     * ステータス定数に基づいた表示情報の取得
     * 10: 準備中, 20: 発送済み, 30: 受領済み
     */
    const getStatusInfo = (status) => {
        switch(status) {
            case 10: return { label: '準備中', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock };
            case 20: return { label: '発送済み', color: 'bg-cyan-50 text-cyan-600 border-cyan-100', icon: Truck };
            case 30: return { label: '受領済み', color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle2 };
            default: return { label: '不明', color: 'bg-red-50 text-red-500 border-red-100', icon: AlertCircle };
        }
    };

    return (
        <CreatorLayout>
            <Head title="国内配送管理 - CP STUDIO." />

            <div className="p-8 max-w-[1200px] mx-auto space-y-10">
                {/* ページヘッダー */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-slate-900 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Link 
                                href={route('creator.dashboard')} 
                                className="text-[10px] font-black uppercase text-slate-400 hover:text-cyan-500 transition-colors flex items-center gap-1 group"
                            >
                                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                                ダッシュボードに戻る
                            </Link>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                            Domestic <span className="text-cyan-400 underline decoration-8 decoration-slate-900 underline-offset-8">Shipping</span>
                        </h1>
                        <p className="text-sm font-bold mt-4 text-slate-500 uppercase italic tracking-widest">
                            倉庫への配送プランおよび受領ステータスの管理
                        </p>
                    </div>

                    <Link 
                        href={route('creator.shipping.create')}
                        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all shadow-[8px_8px_0px_#A5F3FC] active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 whitespace-nowrap"
                    >
                        <Plus size={18} strokeWidth={3} /> 新規配送を登録
                    </Link>
                </header>

                {/* リストエリア */}
                <div className="space-y-8">
                    {shippings && shippings.length > 0 ? shippings.map((shipping) => {
                        const status = getStatusInfo(shipping.status);
                        return (
                            <div key={shipping.id} className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_#000] overflow-hidden group hover:-translate-y-1 transition-transform">
                                
                                {/* カード上部：サマリーバー */}
                                <div className="p-6 border-b-4 border-slate-900 flex flex-wrap justify-between items-center bg-slate-50 gap-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        {/* ステータスバッジ */}
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-2 ${status.color}`}>
                                            <status.icon size={14} />
                                            {status.label}
                                        </div>

                                        {/* 配送先倉庫バッジ */}
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase italic tracking-wider shadow-[4px_4px_0px_#A5F3FC]">
                                            <MapPin size={14} className="text-cyan-400" />
                                            配送先: {shipping.warehouse?.name || '未設定'}
                                        </div>

                                        {/* 管理番号 & 日付 */}
                                        <div className="flex items-center gap-3 ml-2">
                                            <span className="font-black text-slate-900 text-xs">#{String(shipping.id).padStart(6, '0')}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                                                作成日: {new Date(shipping.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {shipping.tracking_number && (
                                            <div className="hidden lg:block text-[10px] font-black uppercase text-slate-400 border-r-2 border-slate-200 pr-4">
                                                追跡番号: <span className="text-slate-900 font-black">{shipping.tracking_number}</span>
                                            </div>
                                        )}
                                        <Link 
                                            href={route('creator.shipping.show', shipping.id)}
                                            className="bg-white border-2 border-slate-900 p-2 rounded-xl text-slate-900 hover:bg-cyan-400 transition-colors shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none"
                                            title="詳細を見る"
                                        >
                                            <ExternalLink size={20} />
                                        </Link>
                                    </div>
                                </div>

                                {/* カード下部：詳細コンテンツ */}
                                <div className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        
                                        {/* 左側：アイテムリスト (8/12) */}
                                        <div className="lg:col-span-8 space-y-4">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                                                <Package size={14} /> 梱包アイテム
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {shipping.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl hover:border-slate-900 transition-colors group/item">
                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                            <div className="min-w-[40px] h-10 bg-white rounded-lg border-2 border-slate-200 flex items-center justify-center">
                                                                <Box className="text-slate-300" size={20} />
                                                            </div>
                                                            <div className="truncate">
                                                                <div className="text-[11px] font-black text-slate-900 uppercase truncate">
                                                                    {item.product?.translations?.[0]?.name || '不明な商品'}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-slate-400 uppercase italic">
                                                                    {item.variation?.translations?.[0]?.variant_name || 'Standard'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xl font-black text-slate-900 italic ml-4">
                                                            ×{item.quantity}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 右側：アクション・メッセージ (4/12) */}
                                        <div className="lg:col-span-4 flex flex-col justify-end">
                                            {shipping.status === 10 && (
                                                <div className="bg-cyan-50 border-4 border-dashed border-cyan-200 rounded-[2rem] p-6 text-center">
                                                    <p className="text-[10px] font-black text-cyan-600 uppercase mb-4 tracking-widest">要対応</p>
                                                    <Link 
                                                        href={route('creator.shipping.show', shipping.id)}
                                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#A5F3FC] active:translate-y-0.5 active:shadow-none"
                                                    >
                                                        <Printer size={16} /> パッキングリスト出力
                                                    </Link>
                                                </div>
                                            )}
                                            
                                            {shipping.status === 20 && (
                                                <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-[8px_8px_0px_#A5F3FC]">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="animate-pulse w-2 h-2 bg-cyan-400 rounded-full"></div>
                                                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">配送中</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase italic">
                                                        倉庫への配送を確認中です。<br />
                                                        受領後に在庫へ反映されます。
                                                    </p>
                                                </div>
                                            )}

                                            {shipping.status === 30 && (
                                                <div className="bg-green-50 border-2 border-green-200 rounded-[2rem] p-6 flex items-center gap-4">
                                                    <div className="bg-green-500 p-2 rounded-xl text-white">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">受領完了</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                                                            倉庫での受領が完了しました
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-32 text-center">
                            <Box size={48} className="mx-auto text-slate-200 mb-6" />
                            <div className="text-slate-300 font-black italic uppercase tracking-[0.4em] text-xl">
                                配送プランが見つかりません
                            </div>
                            <Link 
                                href={route('creator.shipping.create')}
                                className="inline-block mt-8 text-cyan-500 font-black uppercase text-xs hover:underline decoration-2 underline-offset-4"
                            >
                                最初の配送プランを作成する &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </CreatorLayout>
    );
}