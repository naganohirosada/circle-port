import React from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name_ja: '',
        description_ja: '',
        category_id: categories[0]?.id || '',
        status: 2,
        has_variants: false,
        price: '',
        stock_quantity: '',
        weight_g: '',
        images: [],
        variants: [{ variant_name_ja: '', price: '', stock_quantity: '', weight_g: '' }]
    });

    const addVariant = () => setData('variants', [...data.variants, { variant_name_ja: '', price: '', stock_quantity: '', weight_g: '' }]);
    const removeVariant = (i) => setData('variants', data.variants.filter((_, idx) => idx !== i));
    
    const submit = (e) => {
        e.preventDefault();
        post(route('creator.products.store'));
    };

    return (
        <CreatorLayout>
            <Head title="Release New Artwork" />
            <form onSubmit={submit} className="p-12 max-w-5xl mx-auto space-y-10">
                <header className="flex justify-between items-end">
                    <h1 className="text-6xl font-black italic text-slate-900 tracking-tighter">NEW RELEASE <span className="text-cyan-400">!</span></h1>
                    <button disabled={processing} className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-2xl hover:bg-pink-500 shadow-[8px_8px_0px_#A5F3FC] transition-all">
                        {processing ? 'TRANSLATING...' : 'GO GLOBAL 🌎'}
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Basic Info */}
                    <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#000] space-y-6">
                        <div>
                            <label className="block font-black text-slate-400 mb-2 uppercase italic text-xs tracking-widest">Japanese Title</label>
                            <input type="text" value={data.name_ja} onChange={e => setData('name_ja', e.target.value)} className="w-full border-4 border-slate-100 rounded-2xl p-4 font-bold text-lg focus:border-cyan-400 outline-none" />
                            {errors.name_ja && <p className="text-red-500 font-bold mt-2 text-sm">{errors.name_ja}</p>}
                        </div>
                        <div>
                            <label className="block font-black text-slate-400 mb-2 uppercase italic text-xs tracking-widest">Description</label>
                            <textarea value={data.description_ja} onChange={e => setData('description_ja', e.target.value)} className="w-full border-4 border-slate-100 rounded-2xl p-4 font-bold min-h-[150px] focus:border-cyan-400 outline-none" />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#F9A8D4]">
                        <h3 className="font-black text-xl mb-4 italic tracking-tight">PICTURES</h3>
                        <input type="file" multiple onChange={e => setData('images', Array.from(e.target.files))} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:font-black file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer" />
                        {errors.images && <p className="text-red-500 font-bold mt-2 text-sm">{errors.images}</p>}
                        <div className="mt-4 flex gap-2 overflow-x-auto">
                            {data.images.map((file, i) => (
                                <div key={i} className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 animate-pulse border-2 border-slate-200" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing & Variations */}
                <div className="bg-yellow-50 p-10 rounded-[3.5rem] border-4 border-slate-900">
                    <div className="flex items-center gap-4 mb-8">
                        <input type="checkbox" id="has_v" checked={data.has_variants} onChange={e => setData('has_variants', e.target.checked)} className="w-8 h-8 rounded border-4" />
                        <label htmlFor="has_v" className="text-2xl font-black italic cursor-pointer">HAS VARIATIONS? (Size, Color, etc.)</label>
                    </div>

                    {!data.has_variants ? (
                        <div className="grid grid-cols-3 gap-6">
                            <div><label className="block font-black text-xs mb-1">PRICE (JPY)</label><input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full p-4 rounded-xl border-2 font-bold" /></div>
                            <div><label className="block font-black text-xs mb-1">STOCK</label><input type="number" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} className="w-full p-4 rounded-xl border-2 font-bold" /></div>
                            <div><label className="block font-black text-xs mb-1">WEIGHT (g)</label><input type="number" value={data.weight_g} onChange={e => setData('weight_g', e.target.value)} className="w-full p-4 rounded-xl border-2 font-bold" /></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.variants.map((v, i) => (
                                <div key={i} className="flex gap-4 items-end bg-white p-6 rounded-[2rem] border-2 border-slate-200">
                                    <div className="flex-1">
                                        <input placeholder="Variant Name (e.g. Blue / L)" value={v.variant_name_ja} onChange={e => {
                                            const vrs = [...data.variants]; vrs[i].variant_name_ja = e.target.value; setData('variants', vrs);
                                        }} className="w-full border-b-2 border-slate-100 p-2 font-bold outline-none focus:border-cyan-400" />
                                    </div>
                                    <input type="number" placeholder="¥" className="w-24 p-2 border-b-2" value={v.price} onChange={e => {
                                        const vrs = [...data.variants]; vrs[i].price = e.target.value; setData('variants', vrs);
                                    }} />
                                    <button type="button" onClick={() => removeVariant(i)} className="text-red-400 font-black hover:text-red-600 transition-colors">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={addVariant} className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-sm hover:scale-105 transition-transform">+ ADD VARIATION</button>
                        </div>
                    )}
                </div>
            </form>
        </CreatorLayout>
    );
}