// resources/js/Pages/Admin/InternationalShipping/Index.jsx

import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Globe, ShieldCheck, FileText, Truck, ArrowUpRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function Index({ shippings = { data: [] }, status = null, error = null }) {
    
    // ワンクリックでDHL/FedExのAPIを裏側で回す非同期キックハンドラー
    const handleGenerateLabel = (shippingId) => {
        if (confirm('DHL/FedEx APIと通信し、通関用商業インボイスおよび発送送り状ラベルPDFを全自動生成します。よろしいですか？')) {
            router.post(route('admin.international-shippings.generate-label', shippingId), {}, {
                preserveScroll: true
            });
        }
    };

    return (
        <AdminLayout header="国際出荷・通関インボイス管理">
            <Head title="国際配送・まとめ同梱出荷コントロール" />

            <div className="max-w-7xl mx-auto px-8 py-10 font-sans text-slate-700">
                
                <div className="mb-8 space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Globe className="text-indigo-600" size={24} />
                        国際配送・同梱まとめ出荷レーン
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">海外ファン向けの免税出荷手続き・DHL/FedEx送り状ラベルおよび通関書類のオンデマンド全自動一括生成</p>
                </div>

                {status && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-xs">
                        <CheckCircle className="text-emerald-500" size={16} />
                        {status}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 font-bold text-xs">
                        <AlertCircle className="text-rose-500" size={16} />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="py-5 px-6">出荷梱包ID</th>
                                <th className="py-5 px-6">海外ファン</th>
                                <th className="py-5 px-6">配送種別</th>
                                <th className="py-5 px-6">宛先国</th>
                                <th className="py-5 px-6">ステータス</th>
                                <th className="py-5 px-6">追跡番号</th>
                                <th className="py-5 px-6 text-right">国際物流キャリア連携</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                            {shippings.data.map((shipping) => {
                                const targetAddress = shipping.orders?.[0]?.shipping_address;
                                
                                return (
                                    <tr key={shipping.id} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="py-5 px-6 font-mono font-black text-slate-900">
                                            #SH-{shipping.id}
                                        </td>
                                        <td className="py-5 px-6 font-bold text-slate-800">
                                            {shipping.fan?.name || '海外ユーザー'}
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${shipping.type === 2 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {shipping.type === 2 ? '同梱まとめ配送' : '単一通常配送'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 font-mono font-black text-slate-500 text-sm">
                                            {targetAddress?.country_code ? targetAddress.country_code.toUpperCase() : '---'}
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                                shipping.status === 30 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {shipping.status === 30 ? '国際配送中' : '出荷待機・支払い済み'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 font-mono text-slate-900 font-bold tracking-tight">
                                            {shipping.tracking_number || '---'}
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            {shipping.status === 30 ? (
                                                <div className="flex justify-end gap-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                                                        <ShieldCheck size={12} className="text-emerald-500" /> Documents Lodged
                                                    </span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerateLabel(shipping.id)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center gap-1.5 ml-auto"
                                                >
                                                    <Truck size={12} /> ラベル・インボイスを発行
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {shippings.data.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-300 font-bold">現在、国際出荷待きのまとめ梱包レコードはありません。</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </AdminLayout>
    );
}