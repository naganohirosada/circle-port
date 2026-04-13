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
    AlertCircle
} from 'lucide-react';

export default function Index({ shippings }) {
    
    const getStatusInfo = (status) => {
        switch(status) {
            case 10: return { label: '準備中', color: 'bg-slate-100 text-slate-500', icon: Clock };
            case 20: return { label: '発送済み', color: 'bg-cyan-100 text-cyan-700', icon: Truck };
            case 30: return { label: '受領済み', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
            default: return { label: '不明', color: 'bg-red-100 text-red-500', icon: AlertCircle };
        }
    };

    return (
        <CreatorLayout>
            <Head title="国内配送管理 - CP STUDIO." />

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
                            Domestic <span className="text-cyan-400">Shipping</span>
                        </h1>
                        <p className="text-sm font-bold mt-1 text-slate-400 uppercase italic tracking-widest">
                            倉庫への配送状況・ステータス管理
                        </p>
                    </div>

                    <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-[6px_6px_0px_#A5F3FC] active:translate-y-1 active:shadow-none">
                        + 新規配送を登録
                    </button>
                </header>

                {/* ステータス別リスト */}
                <div className="space-y-6">
                    {shippings.length > 0 ? shippings.map((shipping) => {
                        const status = getStatusInfo(shipping.status);
                        return (
                            <div key={shipping.id} className="bg-white border-4 border-slate-900 rounded-[2rem] shadow-[8px_8px_0px_#000] overflow-hidden group">
                                <div className="p-6 border-b-4 border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ${status.color}`}>
                                            <status.icon size={14} />
                                            {status.label}
                                        </div>
                                        <span className="font-black text-slate-400 text-xs">#{shipping.id}</span>
                                        <span className="text-xs font-bold text-slate-400 italic">{new Date(shipping.created_at).toLocaleDateString()} 作成</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {shipping.tracking_number && (
                                            <div className="text-[10px] font-black uppercase text-slate-400">
                                                追跡番号: <span className="text-slate-900">{shipping.tracking_number}</span>
                                            </div>
                                        )}
                                        <button className="text-slate-400 hover:text-slate-900 transition-colors">
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Box size={14} /> 梱包アイテム
                                            </h3>
                                            <div className="space-y-2">
                                                {shipping.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border-2 border-transparent group-hover:border-slate-100 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white rounded-lg border-2 border-slate-200"></div>
                                                            <div>
                                                                <div className="text-xs font-black text-slate-900 uppercase">
                                                                    {item.product?.translations?.[0]?.name || '商品情報なし'}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-slate-400 uppercase">
                                                                    {item.variation?.name || 'Standard'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-black text-slate-900 italic">
                                                            × {item.quantity}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-end">
                                            {shipping.status === 10 && (
                                                <div className="bg-cyan-50 border-4 border-dashed border-cyan-200 rounded-3xl p-6">
                                                    <p className="text-[10px] font-black text-cyan-600 uppercase mb-4">発送準備が整いましたか？</p>
                                                    <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-cyan-500 transition-all">
                                                        発送通知を送る
                                                    </button>
                                                </div>
                                            )}
                                            {shipping.status === 20 && (
                                                <div className="bg-slate-900 text-white rounded-3xl p-6">
                                                    <p className="text-[10px] font-black text-cyan-400 uppercase mb-1">現在配送中</p>
                                                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">
                                                        倉庫で受領・検品が完了すると、<br />ステータスが「受領済み」に変わります。
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-32 text-center">
                            <div className="text-slate-300 font-black italic uppercase tracking-[0.4em] text-xl">
                                登録された配送データはありません
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CreatorLayout>
    );
}