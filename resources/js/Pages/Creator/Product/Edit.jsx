import React, { useState, useEffect } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm } from '@inertiajs/react';
import { Star } from 'lucide-react'; // アイコン追加

export default function Edit({ product, categories, hs_codes }) {
    const [previews, setPreviews] = useState([]);
    
    // 初期設定されているサムネイルIDを探す
    const initialThumbnail = product.images.find(img => img.is_main); // 例:is_mainカラムがメイン画像

    const { data, setData, post, processing, errors, transform } = useForm({
        _method: 'PUT',
        name_ja: product.translations.find(t => t.locale === 'ja')?.name || '',
        description_ja: product.translations.find(t => t.locale === 'ja')?.description || '',
        category_id: product.category_id || '',
        sub_category_id: product.sub_category_id || '',
        status: product.status,
        has_variants: !!product.has_variants,
        price: product.price || '',
        stock_quantity: product.stock_quantity || '',
        weight_g: product.weight_g || '',
        material_ja: product.translations.find(t => t.locale === 'ja')?.material || '',
        hs_code_id: product.hs_code_id || '',
        new_images: [],
        delete_image_ids: [],
        // サムネイル設定用のキー ('uploaded_{id}' または 'new_{index}')
        thumbnail_key: initialThumbnail ? `uploaded_${initialThumbnail.id}` : null,
        variations: product.variations.length > 0 
            ? product.variations.map(v => ({
                id: v.id,
                variant_name_ja: v.translations.find(t => t.locale === 'ja')?.variant_name || '',
                price: v.price,
                stock_quantity: v.stock_quantity,
                weight_g: v.weight_g,
                material_ja: v.translations.find(t => t.locale === 'ja')?.material || '',
                hs_code_id: v.hs_code_id
            }))
            : [{ variant_name_ja: '', price: '', stock_quantity: '', weight_g: '', material_ja: '', hs_code_id: '' }]
    });

    useEffect(() => {
        transform((data) => {
            const baseData = { ...data };
            if (!data.has_variants) {
                baseData.variations = [];
            } else {
                baseData.variations = data.variations.filter(v => v.variant_name_ja.trim() !== '');
            }
            return baseData;
        });
    }, [data.has_variants, data.variations]);

    const subCategories = categories.find(c => c.id == data.category_id)?.sub_categories || [];

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const currentNewImages = [...data.new_images];
        const updatedNewImages = [...currentNewImages, ...files];
        setData('new_images', updatedNewImages);
        
        const filePreviews = files.map(file => URL.createObjectURL(file));
        const newPreviews = [...previews, ...filePreviews];
        setPreviews(newPreviews);

        // もし画像が1枚も設定されていない（既存画像が全て削除済み、新規アップロードが初めて）なら、サムネイルにする
        const hasExistingImages = product.images.filter(img => !data.delete_image_ids.includes(img.id)).length > 0;
        if (!data.thumbnail_key && !hasExistingImages && updatedNewImages.length > 0) {
            // 新規画像の最初のインデックスは「既存画像の数」になるため、ここではdataステート更新タイミングの関係で少し複雑。
            // 削除処理側で調整する方が安全。ここでは未設定なら'new_0'にする簡易的な対応に留める（削除関数側で補正）
            setData('thumbnail_key', 'new_0'); 
        }
    };

    // サムネイルを設定する関数
    const setThumbnail = (key) => {
        setData('thumbnail_key', key);
    };

    // 新規画像を削除する関数
    const removeNewImage = (index) => {
        const updatedNewImages = data.new_images.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        
        // メモリ解放
        URL.revokeObjectURL(previews[index]);

        let nextThumbnailKey = data.thumbnail_key;
        
        if (data.thumbnail_key && data.thumbnail_key.startsWith('new_')) {
            const currentThumbIndex = parseInt(data.thumbnail_key.split('_')[1]);

            if (index === currentThumbIndex) {
                // サムネイル画像を削除した場合
                // 既存画像が残っているならそっちを優先、なければ新規の1枚目
                const remainingExisting = product.images.filter(img => !data.delete_image_ids.includes(img.id));
                if (remainingExisting.length > 0) {
                    nextThumbnailKey = `uploaded_${remainingExisting[0].id}`;
                } else {
                    nextThumbnailKey = updatedNewImages.length > 0 ? 'new_0' : null;
                }
            } else if (index < currentThumbIndex) {
                // サムネイルより前の画像を削除した場合、インデックスをずらす
                nextThumbnailKey = `new_${currentThumbIndex - 1}`;
            }
        }

        setData(prev => ({
            ...prev,
            new_images: updatedNewImages,
            thumbnail_key: nextThumbnailKey
        }));
        setPreviews(updatedPreviews);
    };

    // 既存画像の削除/復元トグル（サムネイル設定との連動）
    const toggleDeleteExistingImage = (id) => {
        let newDeleteIds;
        let nextThumbnailKey = data.thumbnail_key;

        if (data.delete_image_ids.includes(id)) {
            // 復元
            newDeleteIds = data.delete_image_ids.filter(deleteId => deleteId !== id);
        } else {
            // 削除
            newDeleteIds = [...data.delete_image_ids, id];
            
            // もし削除する画像がサムネイルなら、設定を解除して代替画像を探す
            if (data.thumbnail_key === `uploaded_${id}`) {
                const remainingExisting = product.images.filter(img => !newDeleteIds.includes(img.id) && img.id !== id);
                if (remainingExisting.length > 0) {
                    // 他の既存画像があればそれを
                    nextThumbnailKey = `uploaded_${remainingExisting[0].id}`;
                } else if (data.new_images.length > 0) {
                    // なければ新規画像の1枚目をサムネイルにする
                    nextThumbnailKey = 'new_0';
                } else {
                    nextThumbnailKey = null;
                }
            }
        }

        setData(prev => ({
            ...prev,
            delete_image_ids: newDeleteIds,
            thumbnail_key: nextThumbnailKey
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.products.update', product.id));
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...data.variations];
        newVariants[index][field] = value;
        setData('variations', newVariants);
    };

    const addVariant = () => {
        setData('variations', [...data.variations, { variant_name_ja: '', price: '', stock_quantity: '', weight_g: '', material_ja: '', hs_code_id: '' }]);
    };

    const removeVariant = (index) => {
        setData('variations', data.variations.filter((_, i) => i !== index));
    };

    return (
        <CreatorLayout>
            <Head title="作品編集 - CirclePort" />
            
            <form onSubmit={submit} className="p-8 max-w-6xl mx-auto space-y-10 pb-24 text-slate-900">
                <header className="flex justify-between items-end border-b-8 border-slate-900 pb-8">
                    <div>
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                            作品 <span className="text-cyan-400">編集</span>
                        </h1>
                        <p className="text-xl font-bold mt-4 bg-slate-900 text-white inline-block px-4 py-1 skew-x-[-10deg]">登録した情報を更新します。</p>
                    </div>
                    <button disabled={processing} className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black text-3xl hover:bg-cyan-400 shadow-[12px_12px_0px_#A5F3FC] transition-all">
                        {processing ? '更新中...' : '変更を保存する ✅'}
                    </button>
                </header>

                {Object.keys(errors).length > 0 && (
                    <div className="bg-pink-100 border-4 border-pink-500 p-8 rounded-[3rem] shadow-[8px_8px_0px_#000]">
                        <h2 className="text-pink-600 font-black text-2xl mb-4 italic uppercase text-center">入力内容に不備があります ⚠️</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-inside list-disc text-pink-500 font-bold text-sm">
                            {Object.keys(errors).map((key) => <li key={key}>{errors[key]}</li>)}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-8">
                        <section className="bg-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#000]">
                            <h3 className="text-2xl font-black mb-8 italic underline decoration-cyan-400 decoration-8 text-slate-900 uppercase tracking-widest">1. 基本設定</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest">作品名</label>
                                    <input type="text" value={data.name_ja} onChange={e => setData('name_ja', e.target.value)} className={`w-full border-4 rounded-2xl p-4 font-bold text-xl outline-none transition-all ${errors.name_ja ? 'border-pink-500 bg-pink-50' : 'border-slate-100 focus:border-cyan-400'}`} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic">カテゴリー</label>
                                        <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full border-4 rounded-2xl p-4 font-bold outline-none border-slate-100">
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ja}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic">詳細カテゴリー</label>
                                        <select value={data.sub_category_id} onChange={e => setData('sub_category_id', e.target.value)} className="w-full border-4 border-slate-100 rounded-2xl p-4 font-bold outline-none">
                                            <option value="">詳細を選択</option>
                                            {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name_ja}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-black text-slate-400 text-xs mb-2 uppercase italic">作品説明</label>
                                    <textarea value={data.description_ja} onChange={e => setData('description_ja', e.target.value)} className="w-full border-4 border-slate-100 rounded-2xl p-4 font-bold min-h-[150px] outline-none focus:border-cyan-400" />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        <section className="bg-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#F9A8D4]">
                            <h3 className="text-2xl font-black mb-8 italic underline decoration-pink-400 decoration-8 text-slate-900 uppercase">2. メディア管理（サムネイル設定）</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {/* 既存画像プレビュー */}
                                {product.images.map((img) => {
                                    const imgKey = `uploaded_${img.id}`;
                                    const isDeleted = data.delete_image_ids.includes(img.id);
                                    const isThumbnail = data.thumbnail_key === imgKey;

                                    return (
                                        <div key={img.id} className={`relative aspect-square rounded-xl border-4 overflow-hidden ${isDeleted ? 'opacity-20' : ''} ${isThumbnail ? 'border-cyan-400' : 'border-slate-100'}`}>
                                            <img src={img.url} className="w-full h-full object-cover" />
                                            {/* サムネイル設定アイコン (削除予定画像には表示しない) */}
                                            {!isDeleted && (
                                                <button type="button" onClick={() => setThumbnail(imgKey)} className={`absolute top-1 left-1 p-1 rounded-full transition-all ${isThumbnail ? 'bg-cyan-400 text-white' : 'bg-white/80 text-slate-400 hover:bg-white hover:text-cyan-400'}`}>
                                                    <Star size={16} fill={isThumbnail ? 'currentColor' : 'none'} />
                                                </button>
                                            )}
                                            {/* 削除/復元ボタン */}
                                            <button type="button" onClick={() => toggleDeleteExistingImage(img.id)} className={`absolute top-1 right-1 rounded-full w-6 h-6 text-xs font-black transition-colors ${isDeleted ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-white/80 text-pink-500 hover:bg-white hover:text-pink-600'}`}>
                                                {isDeleted ? '↺' : '✕'}
                                            </button>
                                        </div>
                                    );
                                })}
                                {/* 新規画像プレビュー */}
                                {previews.map((url, i) => {
                                    const imgKey = `new_${i}`;
                                    const isThumbnail = data.thumbnail_key === imgKey;
                                    return (
                                        <div key={i} className={`relative aspect-square rounded-xl border-4 overflow-hidden shadow-sm animate-pulse ${isThumbnail ? 'border-cyan-400' : 'border-slate-100'}`}>
                                            <img src={url} className="w-full h-full object-cover" />
                                            {/* サムネイル設定アイコン */}
                                            <button type="button" onClick={() => setThumbnail(imgKey)} className={`absolute top-1 left-1 p-1 rounded-full transition-all ${isThumbnail ? 'bg-cyan-400 text-white' : 'bg-white/80 text-slate-400 hover:bg-white hover:text-cyan-400'}`}>
                                                <Star size={16} fill={isThumbnail ? 'currentColor' : 'none'} />
                                            </button>
                                            {/* 削除アイコン */}
                                            <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-white/80 text-pink-500 rounded-full w-6 h-6 text-xs font-black hover:bg-white hover:text-pink-600 transition-colors">✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-6 text-center relative hover:bg-slate-50 mt-4 cursor-pointer group transition-all">
                                <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <p className="font-black text-slate-400 uppercase italic group-hover:text-cyan-400">画像を追加</p>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_#E2E8F0] space-y-6">
                            <h3 className="text-2xl font-black italic underline decoration-slate-200 decoration-8 text-slate-400 uppercase tracking-tighter tracking-tight">3. 配送・通関情報</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-black text-slate-400 text-[10px] uppercase italic">素材・材質</label>
                                    <input type="text" value={data.material_ja} onChange={e => setData('material_ja', e.target.value)} className="w-full border-b-4 border-slate-50 p-2 font-bold focus:border-cyan-400 outline-none" />
                                </div>
                                <div>
                                    <label className="block font-black text-slate-400 text-[10px] uppercase italic">HSコード</label>
                                    <select value={data.hs_code_id} onChange={e => setData('hs_code_id', e.target.value)} className={`w-full border-b-4 p-2 font-bold bg-transparent outline-none ${errors.hs_code_id ? 'border-pink-500' : 'border-slate-50 focus:border-cyan-400'}`}>
                                        <option value="">HSコードを選択</option>
                                        {hs_codes.map(hs => <option key={hs.id} value={hs.id}>{hs.name_ja}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <section className="bg-yellow-50 p-10 rounded-[4rem] border-4 border-slate-900 shadow-[15px_15px_0px_#000]">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-6">
                            <input type="checkbox" id="has_variants" checked={data.has_variants} onChange={e => setData('has_variants', e.target.checked)} className="w-10 h-10 rounded-xl border-4 border-slate-900 text-cyan-400 focus:ring-0 cursor-pointer" />
                            <label htmlFor="has_variants" className="text-3xl font-black italic cursor-pointer uppercase tracking-tighter">バリエーション管理</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="font-black text-slate-400 italic text-xs uppercase tracking-widest text-slate-400 italic">ステータス:</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className="border-4 border-slate-900 rounded-xl p-2 font-black text-sm outline-none">
                                <option value="2">公開中</option><option value="3">非公開</option><option value="1">下書き</option>
                            </select>
                        </div>
                    </div>

                    {!data.has_variants ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className={`p-8 rounded-[2.5rem] border-4 border-slate-900 flex flex-col justify-center ${errors.price ? 'border-pink-500 bg-pink-50' : 'bg-white'}`}>
                                <label className="font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest italic uppercase">価格 (JPY)</label>
                                <div className="flex items-center"><span className="text-4xl font-black mr-2">¥</span><input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full text-5xl font-black outline-none bg-transparent" /></div>
                            </div>
                            <div className={`p-8 rounded-[2.5rem] border-4 border-slate-900 ${errors.stock_quantity ? 'border-pink-500 bg-pink-50' : 'bg-white'}`}>
                                <label className="font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest italic uppercase">在庫数</label>
                                <input type="number" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} className="w-full text-5xl font-black outline-none bg-transparent" />
                            </div>
                            <div className="p-8 rounded-[2.5rem] border-4 border-slate-900 bg-white">
                                <label className="font-black text-slate-400 text-xs mb-2 uppercase italic tracking-widest italic uppercase">重量 (g)</label>
                                <input type="number" value={data.weight_g} onChange={e => setData('weight_g', e.target.value)} className="w-full text-5xl font-black outline-none bg-transparent" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {data.variations.map((v, i) => (
                                <div key={i} className={`p-8 rounded-[3rem] border-4 border-slate-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 bg-white relative shadow-[8px_8px_0px_#000] transition-all ${errors[`variants.${i}.variant_name_ja`] ? 'border-pink-500' : ''}`}>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic">名称</label>
                                        <input value={v.variant_name_ja} onChange={e => updateVariant(i, 'variant_name_ja', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50 focus:border-cyan-400" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-tighter italic">価格 (¥)</label>
                                        <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50 focus:border-cyan-400" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-tighter italic uppercase">在庫</label>
                                        <input type="number" value={v.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50 focus:border-cyan-400" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-tighter italic uppercase">重量(g)</label>
                                        <input type="number" value={v.weight_g} onChange={e => updateVariant(i, 'weight_g', e.target.value)} className="w-full font-black text-lg outline-none border-b-4 border-slate-50 focus:border-cyan-400" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-tighter italic uppercase">HSコード</label>
                                        <select value={v.hs_code_id} onChange={e => updateVariant(i, 'hs_code_id', e.target.value)} className="w-full font-black text-xs outline-none border-b-4 border-slate-50 bg-transparent">
                                            <option value="">選択</option>
                                            {hs_codes.map(hs => <option key={hs.id} value={hs.id}>{hs.name_ja}</option>)}
                                        </select>
                                    </div>
                                    <button type="button" onClick={() => removeVariant(i)} className="bg-pink-100 text-pink-500 rounded-full font-black h-10 self-end uppercase text-[10px] italic">削除</button>
                                </div>
                            ))}
                            <button type="button" onClick={addVariant} className="bg-slate-900 text-white px-10 py-4 rounded-full font-black hover:bg-cyan-500 transition-all">+ バリエーションを追加</button>
                        </div>
                    )}
                </section>
            </form>
        </CreatorLayout>
    );
}