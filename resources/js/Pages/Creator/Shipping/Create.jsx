import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    ChevronLeft, 
    Plus, 
    Trash2, 
    Package, 
    AlertCircle,
    CheckCircle,
    MapPin
} from 'lucide-react';

export default function Create({ products, warehouses }) {
    const { data, setData, post, processing, errors } = useForm({
        warehouse_id: '',
        items: [{ product_id: '', variant_id: '', quantity: 1 }]
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', variant_id: '', quantity: 1 }]);
    };

    const removeItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        if (field === 'product_id') {
            newItems[index]['variant_id'] = '';
        }
        
        setData('items', newItems);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.shipping.store'));
    };

    return (
        <CreatorLayout>
            <Head title="配送登録 - CP STUDIO." />

            <div className="p-8 max-w-[900px] mx-auto space-y-10">
                {/* ページヘッダー */}
                <header className="flex justify-between items-end border-b-8 border-slate-900 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Link 
                                href={route('creator.shipping.index')} 
                                className="text-[10px] font-black uppercase text-slate-400 hover:text-cyan-500 transition-colors flex items-center gap-1 group"
                            >
                                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                                配送一覧へ戻る
                            </Link>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                            Create <span className="text-cyan-400 underline decoration-8 decoration-slate-900 underline-offset-8">Shipment</span>
                        </h1>
                        <p className="text-sm font-bold mt-4 text-slate-500 uppercase italic tracking-widest">
                            倉庫へ発送するアイテムと配送先を登録
                        </p>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-12">
                    
                    {/* ステップ1: 配送先選択 */}
                    <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_#000] overflow-hidden">
                        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
                            <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center text-slate-900 font-black italic">1</div>
                            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={18} className="text-cyan-400" /> 配送先の倉庫を選択
                            </h2>
                        </div>
                        <div className="p-8 bg-slate-50/50">
                            <div className="relative">
                                <select 
                                    value={data.warehouse_id}
                                    onChange={(e) => setData('warehouse_id', e.target.value)}
                                    className={`w-full bg-white border-4 border-slate-900 rounded-2xl px-6 py-4 font-black text-sm outline-none transition-all focus:ring-8 focus:ring-cyan-400/10 appearance-none ${errors.warehouse_id ? 'border-pink-500' : 'hover:border-cyan-400'}`}
                                >
                                    <option value="">配送先を選択してください</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} — {w.address}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronLeft size={20} className="-rotate-90 text-slate-400" />
                                </div>
                            </div>
                            {errors.warehouse_id && (
                                <p className="text-pink-500 text-[10px] font-black uppercase mt-3 ml-2 italic flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.warehouse_id}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* ステップ2: アイテムリスト */}
                    <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_#000] overflow-hidden">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center text-slate-900 font-black italic">2</div>
                                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Package size={18} className="text-cyan-400" /> 梱包アイテムリスト
                                </h2>
                            </div>
                            <button 
                                type="button"
                                onClick={addItem}
                                className="bg-cyan-400 text-slate-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-white transition-all flex items-center gap-2 shadow-[4px_4px_0px_#fff] active:translate-y-0.5 active:shadow-none"
                            >
                                <Plus size={16} strokeWidth={3} /> アイテムを追加
                            </button>
                        </div>

                        <div className="p-8 space-y-6 bg-slate-50/30">
                            {data.items.map((item, index) => {
                                const selectedProduct = (products || []).find(p => p.id == item.product_id);
                                return (
                                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-white border-2 border-slate-200 p-6 rounded-[2rem] hover:border-slate-900 transition-colors relative group">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Product</label>
                                            <select 
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-slate-900 transition-colors"
                                            >
                                                <option value="">商品を選択</option>
                                                {(products || []).map(p => (
                                                    <option key={p.id} value={p.id}>{p.translations?.[0]?.name || '名称未設定'}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Variation</label>
                                            <select 
                                                value={item.variant_id}
                                                onChange={(e) => updateItem(index, 'variant_id', e.target.value)}
                                                disabled={!item.product_id}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-slate-900 disabled:opacity-30 transition-colors"
                                            >
                                                <option value="">選択</option>
                                                {(selectedProduct?.variants || []).map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.translations?.[0]?.variant_name || v.sku || `Variant #${v.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="w-28 space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Qty</label>
                                            <input 
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-black text-center text-sm outline-none focus:border-slate-900 transition-colors"
                                            />
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="mb-1 p-3 text-slate-300 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
                                            disabled={data.items.length === 1}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                );
                            })}

                            {errors.items && (
                                <div className="flex items-center gap-3 text-pink-500 font-black text-[11px] uppercase italic p-5 bg-pink-50 border-2 border-pink-100 rounded-2xl">
                                    <AlertCircle size={18} /> アイテムの入力内容に不備があります
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 送信ボタンエリア */}
                    <div className="flex flex-col items-end gap-4 pt-4">
                        <button 
                            type="submit"
                            disabled={processing}
                            className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-cyan-500 transition-all shadow-[10px_10px_0px_#A5F3FC] active:translate-y-1 active:shadow-none flex items-center gap-4 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : (
                                <>
                                    <CheckCircle size={24} strokeWidth={3} />
                                    配送プランを確定する
                                </>
                            )}
                        </button>
                        <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                            ※ 確定後、パッキングリストの印刷が可能になります
                        </p>
                    </div>
                </form>
            </div>
        </CreatorLayout>
    );
}