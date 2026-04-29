// resources/js/Pages/Creator/Settings/Bank.jsx

import React, { useState, useEffect } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Landmark, Save, CheckCircle2, X, Info } from 'lucide-react';

export default function Bank({ creator }) {
    const { flash } = usePage().props;
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (flash.message) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash.message]);

    const { data, setData, post, processing, errors } = useForm({
        bank_name: creator?.bank_name ?? '',
        branch_name: creator?.branch_name ?? '',
        account_type: creator?.account_type ?? '普通',
        account_number: creator?.account_number ?? '',
        account_holder: creator?.account_holder ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.settings.bank.update'), {
            preserveScroll: true,
        });
    };

    return (
        <CreatorLayout>
            <Head title="振込先情報の編集" />

            {/* フラッシュメッセージ */}
            <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showFlash ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}>
                <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl border border-cyan-500/30 flex items-center gap-4 min-w-[320px] backdrop-blur-xl">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-0.5">Success</p>
                        <p className="text-sm font-bold">{flash.message}</p>
                    </div>
                    <button onClick={() => setShowFlash(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-4xl mx-auto pb-24">
                <div className="mb-10">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                        <Landmark className="text-cyan-400" size={24} />
                        Payout Settings
                    </h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        売上の振込先口座情報を管理します
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        
                        <div className="flex items-start gap-4 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                            <Info className="text-cyan-500 mt-1" size={20} />
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                売上の振込は毎月月末締め、翌月15日払いとなります。
                                口座名義は必ず「カタカナ」で入力してください。不備がある場合、振込が遅れる原因となります。
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 銀行名 */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">銀行名</label>
                                <input type="text" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    placeholder="〇〇銀行" />
                                {errors.bank_name && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.bank_name}</p>}
                            </div>

                            {/* 支店名 */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">支店名</label>
                                <input type="text" value={data.branch_name} onChange={e => setData('branch_name', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    placeholder="〇〇支店" />
                                {errors.branch_name && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.branch_name}</p>}
                            </div>

                            {/* 口座種別 */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">口座種別</label>
                                <select value={data.account_type} onChange={e => setData('account_type', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all">
                                    <option value="普通">普通預金</option>
                                    <option value="当座">当座預金</option>
                                </select>
                            </div>

                            {/* 口座番号 */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">口座番号</label>
                                <input type="text" value={data.account_number} onChange={e => setData('account_number', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    placeholder="1234567" />
                                {errors.account_number && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.account_number}</p>}
                            </div>

                            {/* 口座名義 */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">口座名義（カタカナ）</label>
                                <input type="text" value={data.account_holder} onChange={e => setData('account_holder', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    placeholder="サークル ヤマダ" />
                                {errors.account_holder && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.account_holder}</p>}
                            </div>
                        </div>

                        {/* 保存ボタン */}
                        <div className="pt-6">
                            <button 
                                type="submit"
                                disabled={processing}
                                className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${processing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-cyan-500 active:scale-[0.98]'}`}
                            >
                                <Save size={20} />
                                {processing ? '保存中...' : '振込先情報を更新する'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </CreatorLayout>
    );
}