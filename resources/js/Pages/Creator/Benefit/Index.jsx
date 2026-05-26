// resources/js/Pages/Creator/Benefit/Index.jsx

import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Gift, Printer, Trash2, Upload, CheckCircle, Info, Sparkles, FileText, Image, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Index({ benefits = [], creator = null, status = null, error = null }) {
    const [activeSection, setActiveSection] = useState('all');

    // 特典デジタルファイル用のフォーム管理
    const { data: benefitData, setData: setBenefitData, post: postBenefit, processing: processingBenefit, reset: resetBenefit } = useForm({
        benefit_title: '',
        min_tip_amount: 500,
        benefit_file: null,
    });

    // 物理サンクスカード用のフォーム管理
    const { data: cardData, setData: setCardData, post: postCard, processing: processingCard } = useForm({
        thanks_card_message: creator?.thanks_card_message || '',
        card_bg: null,
        card_sign: null,
    });

    const submitBenefit = (e) => {
        e.preventDefault();
        postBenefit(route('creator.benefits.store'), {
            preserveScroll: true,
            onSuccess: () => resetBenefit('benefit_title', 'benefit_file')
        });
    };

    const submitCardSettings = (e) => {
        e.preventDefault();
        postCard(route('creator.benefits.card-update'), {
            preserveScroll: true
        });
    };

    const handleDeleteBenefit = (id, title) => {
        if (confirm(`特典「${title}」を削除しますか？`)) {
            router.delete(route('creator.benefits.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <CreatorLayout user={creator} header="ファン特典・同梱カード管理">
            <Head title="ファン感謝 特典・同梱サンクスカード管理" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-800">
                
                <div className="space-y-1 mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                        <Gift className="text-cyan-600" />
                        ファン感謝・バックヤード設定
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">海外ファンの応援チップに対するデジタルリワードの解放、および倉庫自動連動サンクスカードのデザイン構成</p>
                </div>

                {status && (
                    <div className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-800 flex items-center gap-3">
                        <CheckCircle className="text-emerald-500" size={18} />
                        {status}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* 左セクション：応援チップ特典（デジタル解放スロット） */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Sparkles className="text-cyan-500" size={18} />
                                    チップ応援 特典登録
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">指定金額以上のチップを上乗せした海外ファンへ、マイページ上で自動解放するデジタル資産</p>
                            </div>

                            <form onSubmit={submitBenefit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">特典タイトル</label>
                                    <input 
                                        type="text" 
                                        placeholder="例: 限定描き下ろし高解像度スマホ壁紙"
                                        value={benefitData.benefit_title}
                                        onChange={e => setBenefitData('benefit_title', e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3.5 focus:ring-2 focus:ring-cyan-500/20 text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">解放条件・最低チップ応援金額 (JPY)</label>
                                    <select 
                                        value={benefitData.min_tip_amount}
                                        onChange={e => setBenefitData('min_tip_amount', Number(e.target.value))}
                                        className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3.5 focus:ring-2 focus:ring-cyan-500/20 text-slate-700 cursor-pointer"
                                    >
                                        <option value="500">500円以上の上乗せチップ</option>
                                        <option value="1000">1,000円以上の上乗せチップ</option>
                                        <option value="2000">2,000円以上の上乗せチップ</option>
                                        <option value="5000">5,000円以上の上乗せチップ</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">デジタルアセット添付 (最大50MB)</label>
                                    <div className="border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-xl p-6 text-center transition-all bg-slate-50/50 hover:bg-white relative">
                                        <input 
                                            type="file" 
                                            onChange={e => setBenefitData('benefit_file', e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                                        <p className="text-[11px] font-black text-slate-700 truncate">
                                            {benefitData.benefit_file ? benefitData.benefit_file.name : 'ファイルを指定（ZIP, PNG, PDFなど）'}
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processingBenefit || !benefitData.benefit_title || !benefitData.benefit_file}
                                    className="w-full py-4 bg-slate-900 text-white hover:bg-cyan-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                    特典アセットを新規登録
                                </button>
                            </form>
                        </div>

                        {/* 現在の登録特典一覧ループ */}
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">現在の解放条件一覧</h4>
                            <div className="space-y-2">
                                {benefits.map((b) => (
                                    <div key={b.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate">{b.benefit_title}</p>
                                            <p className="text-[9px] font-black text-cyan-600 uppercase mt-0.5">解放条件: ¥{Number(b.min_tip_amount).toLocaleString()} 以上のチップ</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteBenefit(b.id, b.benefit_title)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {benefits.length === 0 && (
                                    <p className="text-xs font-bold text-slate-300 text-center py-6">登録されているチップ応援特典はありません</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 右セクション：オンデマンド・サンクスカード（物理同梱デザイン） */}
                    <div className="lg:col-span-7">
                        <form onSubmit={submitCardSettings} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 space-y-6">
                            <div className="space-y-1 border-b border-slate-50 pb-4">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Printer className="text-cyan-500" size={18} />
                                    オンデマンド・サンクスカード設定
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">倉庫スタッフが海外出荷の現物を検品した瞬間に、プリンターから自動印刷して荷箱に同梱されるポストカード</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-[11px] leading-relaxed font-medium">
                                <p className="font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider mb-1">
                                    <Info size={12} className="text-cyan-500" /> 
                                    インテリジェント同梱印刷の印字仕様
                                </p>
                                倉庫のCUPSサーバーが、あなたがアップロードした背景の上に、購入した**海外ファンの名前（セレクト国籍付）**、**応援チップ金額に応じた限定サポーターバッジ**、**一意の通関シリアルコード**をリアルタイムに自動合成・刻印して高速排紙します。
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* カード背景アップローダー */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Image size={12} /> ポストカード背景画像</label>
                                    <div className="border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-white relative transition-all">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={e => setCardData('card_bg', e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <Upload size={18} className="mx-auto text-slate-400 mb-2" />
                                        <p className="text-[10px] font-black text-slate-700 truncate">
                                            {cardData.card_bg ? cardData.card_bg.name : '背景を差し替え (100x148mm規格)'}
                                        </p>
                                    </div>
                                    {creator?.thanks_card_background && (
                                        <div className="p-2 bg-slate-900 rounded-lg text-[9px] font-mono text-slate-400 truncate">
                                            現在の背景: /storage/{creator.thanks_card_background}
                                        </div>
                                    )}
                                </div>

                                {/* 手書き透過サインアップローダー */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><ShieldCheck size={12} /> クリエイター手書きサイン (透過PNG)</label>
                                    <div className="border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-white relative transition-all">
                                        <input 
                                            type="file" 
                                            accept="image/png"
                                            onChange={e => setCardData('card_sign', e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <Upload size={18} className="mx-auto text-slate-400 mb-2" />
                                        <p className="text-[10px] font-black text-slate-700 truncate">
                                            {cardData.card_sign ? cardData.card_sign.name : '透過サインPNGを指定'}
                                        </p>
                                    </div>
                                    {creator?.thanks_card_signature && (
                                        <div className="p-2 bg-slate-900 rounded-lg text-[9px] font-mono text-slate-400 truncate">
                                            現在のサイン: /storage/{creator.thanks_card_signature}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 共通サンクスメッセージテキストエリア */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><FileText size={12} /> 海外ファン向け共通サンクスメッセージ (全英語または日本語)</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Thank you for supporting my artwork from overseas! Hope this box brings joy to you."
                                    value={cardData.thanks_card_message}
                                    onChange={e => setCardData('thanks_card_message', e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-4 focus:ring-2 focus:ring-cyan-500/20 text-slate-800 font-mono leading-relaxed"
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={processingCard}
                                    className="w-full py-4 bg-slate-900 text-white hover:bg-cyan-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.99]"
                                >
                                    {processingCard ? 'デザイン同報処理中...' : 'サンクスカード印刷構成を保存・更新'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

            </div>
        </CreatorLayout>
    );
}