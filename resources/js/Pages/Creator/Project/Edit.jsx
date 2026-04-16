import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    Calendar, 
    AlertCircle, 
    Save, 
    Megaphone, 
    Package, 
    ArrowLeft, 
    CheckCircle2 
} from 'lucide-react';

export default function Edit({ project, products }) {
    // 日本語の翻訳データを取得
    const translation = project.translations.find(t => t.locale === 'ja') || {};
    
    // 通常の編集フォーム（左側・商品管理含む）
    const { data, setData, patch, processing, errors } = useForm({
        title: translation.title || '',
        description: translation.description || '',
        target_amount: project.target_amount || 0,
        status: project.status || 10,
        end_date: project.end_date ? project.end_date.slice(0, 16) : '', // datetime-local形式に調整
        product_ids: project.products.map(p => p.id), // 現在紐付いている商品ID
    });

    // 延長専用フォーム（右側）
    const extensionForm = useForm({
        new_delivery_date: project.delivery_date || '',
        reason: '',
    });

    // 基本設定の保存
    const handleUpdate = (e) => {
        e.preventDefault();
        patch(route('creator.project.update', project.id));
    };

    // 期間延長の実行
    const handleExtend = (e) => {
        e.preventDefault();
        extensionForm.post(route('creator.project.extend', project.id), {
            onSuccess: () => extensionForm.reset('reason'),
        });
    };

    return (
        <CreatorLayout>
            <Head title="プロジェクト編集 - CP STUDIO." />
            
            <div className="p-8 max-w-[1200px] mx-auto space-y-12">
                {/* ヘッダーエリア */}
                <header className="flex justify-between items-end border-b-8 border-slate-900 pb-8">
                    <div className="flex items-center gap-6">
                        <Link href={route('creator.project.index')} className="p-4 bg-white border-4 border-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900">
                                Edit <span className="text-cyan-400">Project</span>
                            </h1>
                            <p className="text-sm font-bold text-slate-500 uppercase italic mt-1 tracking-widest">プロジェクトの構成と約束の管理</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* 左側：メイン設定エリア */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleUpdate} className="space-y-8">
                            {/* 基本情報セクション */}
                            <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-10 shadow-[12px_12px_0px_#000] space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                                    <Save size={20} className="text-cyan-500" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-900">Basic Settings / 基本設定</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">Project Title / タイトル (JA)</label>
                                        <input 
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-4 focus:ring-cyan-400/20"
                                        />
                                        {errors.title && <p className="text-pink-500 text-[10px] font-black italic ml-2">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">Description / 詳細説明</label>
                                        <textarea 
                                            rows="6"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-cyan-400/20"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">Target / 目標金額 (JPY)</label>
                                        <input 
                                            type="number"
                                            value={data.target_amount}
                                            onChange={e => setData('target_amount', e.target.value)}
                                            className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">Status / ステータス</label>
                                        <select 
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-black appearance-none"
                                        >
                                            <option value={10}>DRAFT / 下書き</option>
                                            <option value={20}>ACTIVE / 公開中</option>
                                            <option value={30}>SUCCESS / 成功</option>
                                            <option value={50}>CANCELLED / 中止</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">End Date / 募集終了日</label>
                                    <input 
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-black"
                                    />
                                </div>
                            </section>

                            {/* 商品選択セクション */}
                            <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-10 shadow-[12px_12px_0px_#000] space-y-6">
                                <div className="flex items-center gap-3">
                                    <Package size={20} className="text-cyan-500" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] italic">Products / 関連アイテム</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map(product => (
                                        <label 
                                            key={product.id}
                                            className={`flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer transition-all ${data.product_ids.includes(product.id) ? 'border-cyan-400 bg-cyan-50' : 'border-slate-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={data.product_ids.includes(product.id)}
                                                    onChange={() => {
                                                        const ids = data.product_ids.includes(product.id)
                                                            ? data.product_ids.filter(id => id !== product.id)
                                                            : [...data.product_ids, product.id];
                                                        setData('product_ids', ids);
                                                    }}
                                                />
                                                <span className="font-bold text-sm uppercase">{product.translations[0]?.name}</span>
                                            </div>
                                            {data.product_ids.includes(product.id) && <CheckCircle2 size={16} className="text-cyan-500" />}
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.3em] hover:bg-cyan-400 hover:text-slate-900 transition-all shadow-[12px_12px_0px_#A5F3FC] active:translate-y-2 active:shadow-none"
                            >
                                {processing ? 'Saving...' : 'Save Changes / 変更を保存'}
                            </button>
                        </form>
                    </div>

                    {/* 右側：期間延長フォーム（重要アクション） */}
                    <div className="space-y-8">
                        <section className="bg-pink-50 border-4 border-pink-500 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#FDA4AF] sticky top-8">
                            <h2 className="text-xs font-black uppercase tracking-widest mb-4 text-pink-600 flex items-center gap-2">
                                <AlertCircle size={18} /> 期間延長の申請
                            </h2>
                            <p className="text-[10px] font-bold text-pink-400 uppercase mb-6 italic leading-relaxed">
                                お届け予定日を変更すると、自動的に進捗アナウンスとして支援者へ通知されます。この操作は取り消せません。
                            </p>
                            
                            <form onSubmit={handleExtend} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic">現在の予定日: {project.delivery_date}</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                                        <input 
                                            type="date"
                                            value={extensionForm.data.new_delivery_date}
                                            onChange={e => extensionForm.setData('new_delivery_date', e.target.value)}
                                            className="w-full bg-white border-4 border-slate-900 rounded-2xl pl-12 pr-4 py-3 font-black text-slate-900 focus:ring-4 focus:ring-pink-500/20 outline-none"
                                        />
                                    </div>
                                    {extensionForm.errors.new_delivery_date && <p className="text-pink-600 text-[10px] font-bold">{extensionForm.errors.new_delivery_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">延期の理由</label>
                                    <textarea 
                                        rows="5"
                                        value={extensionForm.data.reason}
                                        onChange={e => extensionForm.setData('reason', e.target.value)}
                                        className="w-full bg-white border-4 border-slate-900 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-pink-500/20"
                                        placeholder="支援者へ向けた丁寧な説明を入力してください..."
                                    ></textarea>
                                    {extensionForm.errors.reason && <p className="text-pink-600 text-[10px] font-bold">{extensionForm.errors.reason}</p>}
                                </div>

                                <button 
                                    disabled={extensionForm.processing}
                                    className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                                >
                                    <Megaphone size={16} /> 予定日を延長する
                                </button>
                            </form>
                        </section>
                    </div>

                </div>
            </div>
        </CreatorLayout>
    );
}