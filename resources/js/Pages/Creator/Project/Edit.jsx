import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Calendar, AlertCircle, Save, Megaphone } from 'lucide-react';

export default function Edit({ project }) {
    const translation = project.translations.find(t => t.locale === 'ja') || {};
    
    // 通常の編集フォーム
    const { data, setData, patch, processing } = useForm({
        title: translation.title || '',
        description: translation.description || '',
        // ... 他のカラム
    });

    // 延長専用フォーム
    const extensionForm = useForm({
        new_delivery_date: project.delivery_date || '',
        reason: '',
    });

    const handleExtend = (e) => {
        e.preventDefault();
        extensionForm.post(route('creator.project.extend', project.id));
    };

    return (
        <CreatorLayout>
            <Head title="プロジェクト編集 - CP STUDIO." />
            
            <div className="p-8 max-w-[1200px] mx-auto space-y-12">
                {/* ヘッダーエリア */}
                <header className="flex justify-between items-center border-b-8 border-slate-900 pb-6">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">
                        Edit <span className="text-cyan-400">Project</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* 左側：基本情報設定 */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#000]">
                            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Save size={16} /> 基本設定
                            </h2>
                            {/* ... タイトルや説明文の入力フィールド ... */}
                        </section>
                    </div>

                    {/* 右側：重要アクション（期間延長） */}
                    <div className="space-y-8">
                        <section className="bg-pink-50 border-4 border-pink-500 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#FDA4AF]">
                            <h2 className="text-xs font-black uppercase tracking-widest mb-4 text-pink-600 flex items-center gap-2">
                                <AlertCircle size={16} /> 期間延長の申請
                            </h2>
                            <p className="text-[10px] font-bold text-pink-400 uppercase mb-6 italic leading-relaxed">
                                お届け予定日を変更すると、自動的に進捗アナウンスとして支援者へ通知されます。
                            </p>
                            
                            <form onSubmit={handleExtend} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">新しいお届け予定日</label>
                                    <input 
                                        type="date"
                                        value={extensionForm.data.new_delivery_date}
                                        onChange={e => extensionForm.setData('new_delivery_date', e.target.value)}
                                        className="w-full bg-white border-4 border-slate-900 rounded-2xl px-4 py-3 font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">延期の理由（支援者へのメッセージ）</label>
                                    <textarea 
                                        rows="4"
                                        value={extensionForm.data.reason}
                                        onChange={e => extensionForm.setData('reason', e.target.value)}
                                        className="w-full bg-white border-4 border-slate-900 rounded-2xl px-4 py-3 font-bold text-sm"
                                        placeholder="例：部材の調達に遅れが生じたため..."
                                    ></textarea>
                                </div>
                                <button 
                                    className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none"
                                >
                                    予定日を変更する
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}