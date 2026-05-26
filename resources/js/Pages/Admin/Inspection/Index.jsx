// resources/js/Pages/Admin/Inspection/Index.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ScanBarcode, Box, Users, AlertCircle, CheckCircle2, ShieldAlert, Layers, ArrowRight, Printer, Check } from 'lucide-react';

export default function Index({ scannedGroupOrder = null, status = null, error = null }) {
    const inputRef = useRef(null);
    const [lastScanned, setLastScanned] = useState('');

    const { data, setData, post, processing, reset } = useForm({
        barcode_raw: '',
    });

    // 常時オートフォーカス制御（ハンディスキャナの連続稼働を保証）
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }

        const handleGlobalKeyDown = (e) => {
            if (document.activeElement !== inputRef.current) {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [scannedGroupOrder]);

    const handleBarcodeSubmit = (e) => {
        if (e) e.preventDefault();
        if (!data.barcode_raw.trim()) return;

        setLastScanned(data.barcode_raw);
        post(route('admin.inspections.scan'), {
            preserveScroll: true,
            onSuccess: () => reset('barcode_raw'),
            onError: () => reset('barcode_raw')
        });
    };

    // 【新設】：仕分け検品完了 ＆ プリンターサーバー自動排紙トリガー
    const handleOrderInspectComplete = (orderId) => {
        router.post(route('admin.inspections.order.complete', orderId), {
            group_order_id: scannedGroupOrder?.id
        }, {
            preserveScroll: true,
            onSuccess: () => {
                if (inputRef.current) inputRef.current.focus();
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
            <Head title="倉庫バーコードスキャン・検品仕分けコンソール" />

            <header className="bg-slate-950 border-b border-slate-800 px-8 py-5 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 shadow-lg">
                        <ScanBarcode size={22} className="animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-base font-black uppercase tracking-widest text-white">CP Warehouse Automation</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Terminal Mode: Active Continuous Scanner Slot</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        Scanner Connected
                    </span>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                        <form onSubmit={handleBarcodeSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">スキャン待機スロット (常時オートフォーカス)</label>
                                <div className="relative">
                                    <input 
                                        ref={inputRef}
                                        type="text"
                                        value={data.barcode_raw}
                                        onChange={e => setData('barcode_raw', e.target.value)}
                                        placeholder="バーコードを読み込んでください..."
                                        disabled={processing}
                                        className="w-full bg-slate-900 border-2 border-slate-800 focus:border-cyan-500 rounded-2xl py-5 pl-5 pr-12 text-sm font-bold text-white placeholder-slate-600 focus:ring-4 focus:ring-cyan-500/10 transition-all font-mono tracking-wide"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-900 space-y-4">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tight">
                                <span>最終読込コード:</span>
                                <span className="font-mono text-cyan-400 font-black">{lastScanned || '---'}</span>
                            </div>
                            
                            {status && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3 text-emerald-400 animate-fadeIn">
                                    <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                                    <p className="text-xs font-bold leading-normal">{status}</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 text-rose-400 animate-fadeIn">
                                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-500" />
                                    <p className="text-xs font-bold leading-normal">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-[2rem] p-6 text-slate-500 space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ShieldAlert size={14} className="text-cyan-500" />
                            現場オペレーションガイド
                        </h4>
                        <p className="text-[11px] font-medium leading-relaxed">
                            外箱の「配送伝票バーコード」をスキャンすると、該当GOプランの入荷内訳が自動ロードされます。各ファンの箱詰めが終わったら、右側のボタンを押してサンクスカードをオンデマンド排紙してください。
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    {scannedGroupOrder ? (
                        <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-8 animate-fadeIn">
                            
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-900 pb-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                        <Layers size={12} />
                                        登録サークル: {scannedGroupOrder.creator?.name}
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">{scannedGroupOrder.title}</h2>
                                    <p className="text-xs text-slate-500 font-mono">GO-ID: #{scannedGroupOrder.id}</p>
                                </div>
                                <div className="flex gap-6 text-right">
                                    <div className="bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800 min-w-[120px]">
                                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider mb-0.5">総確定個数</span>
                                        <span className="text-xl font-black font-mono text-white">{scannedGroupOrder.current_quantity} <span className="text-xs text-slate-600 font-bold">点</span></span>
                                    </div>
                                    <div className="bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800 min-w-[120px]">
                                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider mb-0.5">海外出荷箱数</span>
                                        <span className="text-xl font-black font-mono text-cyan-400">{scannedGroupOrder.orders?.length || 0} <span className="text-xs text-slate-600 font-bold">箱</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Box size={14} className="text-slate-500" />
                                    入荷内訳チェックリスト (総入荷数と現物を照合)
                                </h3>
                                <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-3">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                                        <div className="w-10 h-12 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                            <img src={scannedGroupOrder.product?.images?.[0]?.url || '/images/no-image.jpg'} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-white text-sm">{scannedGroupOrder.product?.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase mt-0.5">基本単価: ¥{(scannedGroupOrder.product?.price || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 仕分け梱包レーン（【大進化】：検品完了 ＆ プリンター連動アクションの追加マージ） */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Users size={14} className="text-slate-500" />
                                    仕分け梱包レーン (ファン別の海外梱包ボックスへ配置)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {scannedGroupOrder.orders?.map((order) => {
                                        const isInspected = order.status === 'arrived_at_warehouse' || order.status === 'completed' || order.status === 'international_shipping';

                                        return (
                                            <div key={order.id} className={`border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${isInspected ? 'bg-slate-950 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40'}`}>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider w-fit">
                                                        BOX #{order.id}
                                                    </div>
                                                    <p className="text-xs font-black text-white pt-1">海外配送: {order.shipping_address?.country_code || order.address?.country_code || 'OVERSEAS'}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">
                                                        構成アイテム: {order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0} 点
                                                    </p>
                                                </div>
                                                
                                                <div className="text-right">
                                                    {isInspected ? (
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                                                            <Check size={12} strokeWidth={3} /> Card Printed
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleOrderInspectComplete(order.id)}
                                                            className="px-4 py-2.5 bg-cyan-500 hover:bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/10 active:scale-95"
                                                        >
                                                            <Printer size={12} /> Complete & Print
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-[450px] bg-slate-950/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
                            <ScanBarcode size={48} className="text-slate-700 mb-4" />
                            <h3 className="text-slate-400 font-black text-sm uppercase tracking-widest">Scanner Terminal Standby</h3>
                            <p className="text-xs text-slate-600 max-w-[400px] mt-2 font-medium">
                                バーコードが読み取られると、ここに該当する共同購入の入荷内訳、および海外ファン別の仕分け梱包レーンが自動展開されます。
                            </p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}