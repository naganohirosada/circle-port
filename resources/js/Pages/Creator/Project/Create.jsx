import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { ArrowLeft, Send, Package, Info } from 'lucide-react';

export default function Create({ products }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        target_amount: '',
        delivery_date: '',
        end_date: '',
        product_ids: [],
    });

    const toggleProduct = (id) => {
        const ids = data.product_ids.includes(id)
            ? data.product_ids.filter(pId => pId !== id)
            : [...data.product_ids, id];
        setData('product_ids', ids);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.project.store'));
    };

    return (
        <CreatorLayout>
            <Head title="新規プロジェクト始動 - CP STUDIO." />

            <div className="p-8 max-w-[900px] mx-auto space-y-10">
                <header className="flex items-center gap-6 border-b-8 border-slate-900 pb-8">
                    <Link href={route('creator.project.index')} className="p-4 bg-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
                            Launch <span className="text-cyan-400">Project</span>
                        </h1>
                        <p className="text-sm font-bold text-slate-500 uppercase italic tracking-widest mt-2">新たな挑戦の定義</p>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-10">
                    {/* 基本情報 */}
                    <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-10 shadow-[12px_12px_0px_#000] space-y-8">
                        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                            <Info className="text-cyan-500" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] italic">基本情報</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">タイトル</label>
                                <input 
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-4 focus:ring-cyan-400/20"
                                    placeholder="例：究極のメカニカルキーボード製作"
                                />
                                {errors.title && <p className="text-pink-500 text-xs font-black italic ml-2">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">プロジェクト詳細</label>
                                <textarea 
                                    rows="5"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-cyan-400/20"
                                    placeholder="プロジェクトの想いや詳細を記入してください..."
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* スケジュール・目標 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#000] space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">目標と締切</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-widest">目標金額 (JPY)</label>
                                    <input 
                                        type="number"
                                        value={data.target_amount}
                                        onChange={e => setData('target_amount', e.target.value)}
                                        className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-black"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-widest">募集終了日</label>
                                    <input 
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-black"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-widest">お届け予定日</label>
                                    <input 
                                        type="date"
                                        value={data.delivery_date}
                                        onChange={e => setData('delivery_date', e.target.value)}
                                        className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 font-black"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_#A5F3FC] space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">関連アイテム</h2>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {products.map(product => (
                                    <label 
                                        key={product.id}
                                        className={`flex items-center justify-between p-4 border-4 rounded-2xl cursor-pointer transition-all ${data.product_ids.includes(product.id) ? 'border-cyan-400 bg-cyan-50' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox"
                                                className="hidden"
                                                checked={data.product_ids.includes(product.id)}
                                                onChange={() => toggleProduct(product.id)}
                                            />
                                            <span className="font-bold text-sm uppercase">{product.translations[0]?.name}</span>
                                        </div>
                                        <Package size={16} className={data.product_ids.includes(product.id) ? 'text-cyan-500' : 'text-slate-300'} />
                                    </label>
                                ))}
                            </div>
                            {errors.product_ids && <p className="text-pink-500 text-[10px] font-black italic">{errors.product_ids}</p>}
                        </section>
                    </div>

                    <button 
                        disabled={processing}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.3em] hover:bg-cyan-400 hover:text-slate-900 transition-all shadow-[12px_12px_0px_#A5F3FC] active:translate-y-2 active:shadow-none flex items-center justify-center gap-4"
                    >
                        {processing ? 'Launching...' : <><Send /> プロジェクトを始動する</>}
                    </button>
                </form>
            </div>
        </CreatorLayout>
    );
}