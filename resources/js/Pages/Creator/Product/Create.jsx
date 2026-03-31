import React, { useState, useEffect } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm } from '@inertiajs/react';
import { Star } from 'lucide-react'; // アイコン追加

export default function Create({ categories, hs_codes }) {
    const [previews, setPreviews] = useState([]);

    const { data, setData, post, processing, errors, transform } = useForm({
        name_ja: '',
        description_ja: '',
        category_id: '',
        sub_category_id: '',
        status: 2, 
        has_variants: false,
        price: '',
        stock_quantity: '',
        weight_g: '',
        material_ja: '',
        hs_code_id: '',
        images: [],
        variants: [{ variant_name_ja: '', price: '', stock_quantity: '', weight_g: '', material_ja: '', hs_code_id: '' }],
        // サムネイル設定用のキー ('new_0' のような形式)
        thumbnail_key: null 
    });

    useEffect(() => {
        transform((data) => {
            const baseData = { ...data };
            if (!data.has_variants) {
                delete baseData.variants;
            } else {
                baseData.variants = data.variants.filter(v => v.variant_name_ja.trim() !== '');
            }
            return baseData;
        });
    }, [data.has_variants, data.variants]);

    const subCategories = categories.find(c => c.id == data.category_id)?.sub_categories || [];

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const currentImages = [...data.images];
        const newImages = [...currentImages, ...files];
        
        setData('images', newImages);
        
        // プレビュー生成
        const filePreviews = files.map(file => URL.createObjectURL(file));
        const newPreviews = [...previews, ...filePreviews];
        setPreviews(newPreviews);

        // 画像が初めて追加された、またはサムネイルが未設定の場合、1枚目をサムネイルにする
        if (!data.thumbnail_key && newImages.length > 0) {
            setData('thumbnail_key', 'new_0');
        }
    };

    // サムネイルを設定する関数
    const setThumbnail = (key) => {
        setData('thumbnail_key', key);
    };

    // 画像を削除する関数（サムネイルだったら設定を解除）
    const removeImage = (index) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        
        // プレビューBlob URLのメモリ解放
        URL.revokeObjectURL(previews[index]);

        let nextThumbnailKey = data.thumbnail_key;
        
        const currentThumbIndex = data.thumbnail_key ? parseInt(data.thumbnail_key.split('_')[1]) : -1;

        if (index === currentThumbIndex) {
            // サムネイル画像を削除した場合
            nextThumbnailKey = newImages.length > 0 ? 'new_0' : null;
        } else if (index < currentThumbIndex) {
            // サムネイルより前の画像を削除した場合、インデックスをずらす
            nextThumbnailKey = `new_${currentThumbIndex - 1}`;
        }

        setData(prev => ({
            ...prev,
            images: newImages,
            thumbnail_key: nextThumbnailKey
        }));
        setPreviews(newPreviews);
    };

    const handleParentCategoryChange = (id) => {
        setData(prev => ({ ...prev, category_id: id, sub_category_id: '' }));
    };

    const addVariant = () => {
        setData('variants', [...data.variants, { variant_name_ja: '', price: '', stock_quantity: '', weight_g: '', material_ja: '', hs_code_id: '' }]);
    };

    const removeVariant = (index) => {
        setData('variants', data.variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...data.variants];
        newVariants[index][field] = value;
        setData('variants', newVariants);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.products.store'));
    };

    return (
        <CreatorLayout>
            <Head title="作品登録 - CirclePort" />
            
            <form onSubmit={submit} className="p-8 max-w-6xl mx-auto space-y-10 pb-24 text-slate-900">
                <header className="flex justify-between items-end border-b-8 border-slate-900 pb-8">
                    <div>
                        <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none">世界へ <span className="text-cyan-400">公開</span></h1>
                        <p className="text-xl font-bold mt-4 bg-slate-900 text-white inline-block px-4 py-1 skew-x-[-10deg]">世界中のファンへ届けましょう。</p>
                    </div>
                    <button disabled={processing} className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black text-3xl hover:bg-pink-500 hover:-translate-y-2 shadow-[12px_12px_0px_#A5F3FC] transition-all disabled:opacity-50">
                        {processing ? '保存中...' : '世界へ公開 🌎'}
                    </button>
                </header>

                {Object.keys(errors).length > 0 && (
                    <div className="bg-pink-100 border-4 border-pink-500 p-8 rounded-[3rem] shadow-[8px_8px_0px_#000]">
                        <h2 className="text-pink-600 font-black text-2xl mb-4 italic text-center">入力内容に不備があります ⚠️</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-inside list-disc">
                            {Object.keys(errors).map((key) => <li key={key} className="text-pink-500 font-bold text-sm">{errors[key]}</li>)}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-8">
                        <section className="bg-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#000]">
                            <h3 className="text-2xl font-black mb-8 italic underline decoration-cyan-400 decoration-8 uppercase font-sans">1. 基本情報</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest">作品名 (日本語)</label>
                                    <input type="text" value={data.name_ja} onChange={e => setData('name_ja', e.target.value)} className={`w-full border-4 rounded-2xl p-4 font-bold text-xl outline-none transition-all ${errors.name_ja ? 'border-pink-500 bg-pink-50' : 'border-slate-100 focus:border-cyan-400'}`} placeholder="例：幻想世界の銀河アクリルスタンド" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic">カテゴリー</label>
                                        <select value={data.category_id} onChange={e => handleParentCategoryChange(e.target.value)} className="w-full border-4 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-cyan-400">
                                            <option value="">選択してください</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ja}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic">詳細カテゴリー</label>
                                        <select value={data.sub_category_id} onChange={e => setData('sub_category_id', e.target.value)} disabled={!data.category_id} className="w-full border-4 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-cyan-400 disabled:bg-slate-50">
                                            <option value="">詳細を選択</option>
                                            {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name_ja}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic">作品の説明 (日本語)</label>
                                    <textarea value={data.description_ja} onChange={e => setData('description_ja', e.target.value)} className={`w-full border-4 rounded-2xl p-4 font-bold min-h-[200px] outline-none transition-all ${errors.description_ja ? 'border-pink-500 bg-pink-50' : 'border-slate-100 focus:border-cyan-400'}`} placeholder="作品のストーリーや、こだわりを教えてください。" />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        <section className="bg-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#F9A8D4]">
                            <h3 className="text-2xl font-black mb-8 italic underline decoration-pink-400 decoration-8 uppercase">2. メディア（サムネイル設定）</h3>
                            <div className="space-y-6">
                                <div className={`border-4 border-dashed rounded-[2rem] p-10 text-center relative hover:bg-slate-50 transition-all group ${errors.images ? 'border-pink-500 bg-pink-50' : 'border-slate-100'}`}>
                                    <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <p className="font-black text-slate-400 italic group-hover:text-cyan-400 uppercase tracking-widest">画像をアップロード</p>
                                </div>
                                {errors.images && <p className="text-pink-500 font-black text-xs italic">{errors.images}</p>}
                                <div className="grid grid-cols-3 gap-3">
                                    {previews.map((url, i) => {
                                        const imgKey = `new_${i}`;
                                        const isThumbnail = data.thumbnail_key === imgKey;
                                        return (
                                            <div key={i} className={`relative aspect-square rounded-xl border-4 overflow-hidden shadow-sm group ${isThumbnail ? 'border-cyan-400' : 'border-slate-100'}`}>
                                                <img src={url} className="w-full h-full object-cover" />
                                                {/* サムネイル設定アイコン */}
                                                <button type="button" onClick={() => setThumbnail(imgKey)} className={`absolute top-1 left-1 p-1 rounded-full transition-all ${isThumbnail ? 'bg-cyan-400 text-white' : 'bg-white/80 text-slate-400 hover:bg-white hover:text-cyan-400'}`}>
                                                    <Star size={16} fill={isThumbnail ? 'currentColor' : 'none'} />
                                                </button>
                                                {/* 削除アイコン */}
                                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/80 text-pink-500 rounded-full w-6 h-6 text-xs font-black hover:bg-white hover:text-pink-600 transition-colors">✕</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {!data.has_variants && (
                            <section className="bg-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#E2E8F0] space-y-6">
                                <h3 className="text-2xl font-black italic underline decoration-slate-200 decoration-8 text-slate-400 uppercase tracking-tighter">3. 配送・通関情報</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-black text-slate-400 text-[10px] uppercase italic">素材・材質</label>
                                        <input type="text" value={data.material_ja} onChange={e => setData('material_ja', e.target.value)} className="w-full border-b-4 border-slate-50 p-2 font-bold focus:border-cyan-400 outline-none" placeholder="例：アクリル" />
                                    </div>
                                    <div>
                                        <label className="block font-black text-slate-400 text-[10px] uppercase italic">HSコード (必須)</label>
                                        <select value={data.hs_code_id} onChange={e => setData('hs_code_id', e.target.value)} className={`w-full border-b-4 p-2 font-bold bg-transparent outline-none ${errors.hs_code_id ? 'border-pink-500' : 'border-slate-50'}`}>
                                            <option value="">HSコードを選択</option>
                                            {hs_codes.map(hs => <option key={hs.id} value={hs.id}>{hs.name_ja}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                <section className="bg-yellow-50 p-10 rounded-[4rem] border-4 border-slate-900 shadow-[15px_15px_0px_#000]">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-6">
                            <input type="checkbox" id="has_variants" checked={data.has_variants} onChange={e => setData('has_variants', e.target.checked)} className="w-12 h-12 rounded-xl border-4 border-slate-900 text-cyan-400 cursor-pointer" />
                            <label htmlFor="has_variants" className="text-4xl font-black italic cursor-pointer tracking-tighter uppercase">バリエーションを設定</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="font-black text-slate-400 italic text-xs uppercase tracking-widest text-slate-400">公開設定:</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className="border-4 border-slate-900 rounded-xl p-2 font-black text-sm outline-none">
                                <option value="2">公開中</option>
                                <option value="3">非公開</option>
                                <option value="1">下書き</option>
                            </select>
                        </div>
                    </div>

                    {!data.has_variants ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className={`p-8 rounded-[2.5rem] border-4 border-slate-900 flex flex-col justify-center ${errors.price ? 'border-pink-500 bg-pink-50' : 'bg-white'}`}>
                                <label className="font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest text-slate-400">価格 (¥ JPY)</label>
                                <div className="flex items-center"><span className="text-4xl font-black mr-2">¥</span><input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full text-5xl font-black outline-none bg-transparent" placeholder="0" /></div>
                            </div>
                            <div className={`p-8 rounded-[2.5rem] border-4 border-slate-900 ${errors.stock_quantity ? 'border-pink-500 bg-pink-50' : 'bg-white'}`}>
                                <label className="font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest text-slate-400">在庫数</label>
                                <input type="number" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} className="w-full text-5xl font-black outline-none bg-transparent" placeholder="0" />
                            </div>
                            <div className={`p-8 rounded-[2.5rem] border-4 border-slate-900 ${errors.weight_g ? 'border-pink-500 bg-pink-50' : 'bg-white'}`}>
                                <label className="font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest text-slate-400">重量 (g)</label>
                                <input type="number" value={data.weight_g} onChange={e => setData('weight_g', e.target.value)} className="w-full text-5xl font-black outline-none bg-transparent" placeholder="0" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {data.variants.map((v, i) => (
                                <div key={i} className={`p-8 rounded-[3rem] border-4 border-slate-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 bg-white relative shadow-[8px_8px_0px_#000] transition-all ${errors[`variants.${i}.variant_name_ja`] ? 'border-pink-500' : ''}`}>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic">名称</label>
                                        <input value={v.variant_name_ja} onChange={e => updateVariant(i, 'variant_name_ja', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50 focus:border-cyan-400" placeholder="例: Mサイズ" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic text-pink-500">価格 (¥)</label>
                                        <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic">在庫</label>
                                        <input type="number" value={v.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-tighter">重量(g)</label>
                                        <input type="number" value={v.weight_g} onChange={e => updateVariant(i, 'weight_g', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-tighter">HSコード</label>
                                        <select value={v.hs_code_id} onChange={e => updateVariant(i, 'hs_code_id', e.target.value)} className="w-full font-black text-xs outline-none border-b-4 border-slate-50 bg-transparent">
                                            <option value="">選択</option>
                                            {hs_codes.map(hs => <option key={hs.id} value={hs.id}>{hs.name_ja}</option>)}
                                        </select>
                                    </div>
                                    <button type="button" onClick={() => removeVariant(i)} className="bg-pink-100 text-pink-500 w-full h-10 rounded-full font-black hover:bg-pink-500 hover:text-white transition-all uppercase text-[10px] self-end italic">削除</button>
                                </div>
                            ))}
                            <button type="button" onClick={addVariant} className="bg-slate-900 text-white px-10 py-4 rounded-full font-black hover:bg-cyan-500 shadow-[6px_6px_0px_#DDD] transition-all">+ バリエーションを追加</button>
                        </div>
                    )}
                </section>
            </form>
        </CreatorLayout>
    );
}