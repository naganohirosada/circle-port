import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    ChevronLeft, 
    Printer, 
    Box, 
    User, 
    QrCode,
    Truck,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function Show({ shipping, carriers }) {
    
    // 発送通知用のフォーム
    const { data, setData, patch, processing, errors } = useForm({
        carrier_id: '',
        tracking_number: '',
    });

    // 印刷実行
    const handlePrint = () => {
        window.print();
    };

    // 発送報告
    const submitNotification = (e) => {
        e.preventDefault();
        patch(route('creator.shipping.notify', shipping.id));
    };

    return (
        <CreatorLayout>
            <Head title={`配送詳細 #${shipping.id} - CP STUDIO.`} />

            {/* 印刷用グローバルスタイル：レイアウトのサイドバーやナビを強制非表示にする */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* サイドメニュー、ヘッダー、ボタン類を完全に消去 */
                    aside, nav, header, button, .no-print, [role="navigation"] { 
                        display: none !important; 
                    }
                    /* 余白の強制リセット */
                    main, .p-8, .p-10 { 
                        padding: 0 !important; 
                        margin: 0 !important; 
                    }
                    body { 
                        background: white !important; 
                    }
                    /* 影（Shadow）はインクの無駄＆印字が汚くなるため除去 */
                    .shadow-[12px_12px_0px_#000], 
                    .shadow-[12px_12px_0px_#A5F3FC],
                    .shadow-[6px_6px_0px_#000] {
                        box-shadow: none !important;
                        border: 2px solid #000 !important;
                    }
                    /* 角丸を少し抑える（プリンタ出力の安定性のため） */
                    .rounded-[2.5rem] {
                        border-radius: 0.5rem !important;
                    }
                }
            `}} />

            <div className="p-8 max-w-[1000px] mx-auto space-y-10 print:p-0 print:max-w-none">
                
                {/* 画面用ヘッダー：印刷時は非表示 */}
                <header className="flex justify-between items-end border-b-4 border-slate-900 pb-6 print:hidden">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link 
                                href={route('creator.shipping.index')} 
                                className="text-[10px] font-black uppercase text-slate-400 hover:text-cyan-500 transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft size={12} /> 配送一覧へ
                            </Link>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                            Shipment <span className="text-cyan-400">Detail</span>
                        </h1>
                    </div>

                    <button 
                        onClick={handlePrint}
                        className="bg-cyan-400 border-4 border-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none flex items-center gap-2"
                    >
                        <Printer size={18} /> パッキングリストを印刷
                    </button>
                </header>

                {/* 発送通知フォーム：印刷時は非表示 */}
                {shipping.status === 10 && (
                    <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_#A5F3FC] overflow-hidden print:hidden">
                        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
                            <Truck size={20} className="text-cyan-400" />
                            <h2 className="text-xs font-black uppercase tracking-widest italic">Step 3: 発送完了を通知する</h2>
                        </div>
                        <form onSubmit={submitNotification} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic text-slate-500">配送業者</label>
                                <select 
                                    value={data.carrier_id}
                                    onChange={e => setData('carrier_id', e.target.value)}
                                    className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-cyan-400/20"
                                >
                                    <option value="">選択してください</option>
                                    {carriers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic text-slate-500">追跡番号</label>
                                <input 
                                    type="text" 
                                    placeholder="送り状番号を入力"
                                    value={data.tracking_number}
                                    onChange={e => setData('tracking_number', e.target.value)}
                                    className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-cyan-400/20"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={processing}
                                className="bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 hover:text-slate-900 transition-all shadow-[4px_4px_0px_#A5F3FC] active:translate-y-1 active:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? '送信中...' : <><CheckCircle size={16} /> 発送を報告</>}
                            </button>
                        </form>
                    </div>
                )}

                {/* 納品書（パッキングリスト）本体 */}
                <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_#000] overflow-hidden print:shadow-none print:border-2 print:rounded-none">
                    {/* ヘッダー */}
                    <div className="bg-slate-900 p-10 text-white flex justify-between items-start print:bg-white print:text-black print:border-b-4 print:border-black">
                        <div>
                            <div className="text-3xl font-black italic tracking-tighter text-cyan-400 mb-2 print:text-black">
                                CP <span className="text-white print:text-black">STUDIO.</span>
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-widest">Packing List</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 print:text-black">国内配送用 納品書</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase text-cyan-400 mb-1 print:text-black">Shipment ID</div>
                            <div className="text-4xl font-black tracking-tighter italic">#{String(shipping.id).padStart(6, '0')}</div>
                        </div>
                    </div>

                    <div className="p-10 space-y-10">
                        {/* 住所情報 */}
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} /> 差出人 (Creator)
                                </h3>
                                <div className="font-black text-xl text-slate-900">
                                    {shipping.creator.name} <span className="text-sm text-slate-400 font-bold ml-1 text-slate-400">様</span>
                                </div>
                                <div className="text-xs font-bold text-slate-500 leading-relaxed uppercase">
                                    Email: {shipping.creator.email}<br />
                                    Creator ID: {shipping.creator_id}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Truck size={14} /> 配送先 (Warehouse)
                                </h3>
                                <div className="font-black text-xl text-slate-900 italic uppercase">
                                    {shipping.warehouse?.name || 'CP STUDIO 配送センター'}
                                </div>
                                <div className="text-xs font-bold text-slate-500 leading-relaxed uppercase">
                                    〒{shipping.warehouse?.postal_code || '---'}<br />
                                    {shipping.warehouse?.address || '---'}<br />
                                    {shipping.warehouse?.recipient_name || 'サークルポート受領係'} 宛
                                </div>
                            </div>
                        </div>

                        {/* アイテムテーブル */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                                <Box size={14} /> 同梱アイテム一覧
                            </h3>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest border-b-2 border-slate-200">
                                        <th className="py-4 text-left">商品名 / バリエーション</th>
                                        <th className="py-4 text-center w-32">数量</th>
                                        <th className="py-4 text-right w-32">倉庫検品</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-100">
                                    {shipping.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-6">
                                                <div className="font-black text-slate-900 text-base uppercase leading-tight">
                                                    {item.product?.translations?.[0]?.name || 'UNKNOWN PRODUCT'}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase italic mt-1">
                                                    SKU: {item.variation?.sku || '---'} | {item.variation?.translations?.[0]?.variant_name || 'Standard'}
                                                </div>
                                            </td>
                                            <td className="py-6 text-center">
                                                <div className="text-2xl font-black text-slate-900 italic">× {item.quantity}</div>
                                            </td>
                                            <td className="py-6 text-right">
                                                <div className="w-8 h-8 border-2 border-slate-300 rounded-lg ml-auto"></div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* フッター */}
                        <div className="flex justify-between items-end border-t-4 border-slate-900 pt-10 mt-10 print:pt-6 print:mt-6">
                            <div className="max-w-[450px]">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase mb-2 italic">倉庫受領時の注意事項</h4>
                                <ul className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase list-disc list-inside space-y-2">
                                    <li>本リストを必ず印刷し、荷物の一番上（見える位置）に同梱してください。</li>
                                    <li>配送伝票の品名欄には、必ず Shipment ID (#{shipping.id}) を記載してください。</li>
                                    <li>内容物と本リストの数量が異なる場合、受領・検品に時間がかかる場合があります。</li>
                                </ul>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 border-2 border-slate-900 rounded-xl">
                                    <QrCode size={64} className="text-slate-900" />
                                </div>
                                <span className="text-[8px] font-black text-slate-900 uppercase italic tracking-widest">Shipment Scan ID</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden print:block text-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em] mt-10">
                    Generated by CP STUDIO Creator Portal
                </div>
            </div>
        </CreatorLayout>
    );
}