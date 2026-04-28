import React, { useState, useEffect } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function Create({ auth, categories, hs_codes, tags }) {
    // 1. ステート管理
    const [activeTab, setActiveTab] = useState('ja');
    const [subCategories, setSubCategories] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);

    const languages = [
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'en', label: '英語', flag: '🇺🇸' },
        { code: 'zh', label: '中国語', flag: '🇨🇳' },
        { code: 'th', label: 'タイ語', flag: '🇹🇭' },
        { code: 'fr', label: 'フランス語', flag: '🇫🇷' },
    ];

    // 2. フォーム初期値 (product参照を完全に排除)
    const { data, setData, post, processing, errors } = useForm({
        product_type: 1, // 1:現物, 2:デジタル
        name: { ja: '', en: '', zh: '', th: '', fr: '' },
        material: { ja: '', en: '', zh: '', th: '', fr: '' },
        description: { ja: '', en: '', zh: '', th: '', fr: '' },
        category_id: '',
        sub_category_id: '',
        price: '',
        stock: '', 
        weight: '', 
        hs_code_id: '',
        tag_ids: [],
        images: [],
        digital_file: null,
        variations: [],
        has_variants: false,
    });

    // 3. カテゴリ連動
    useEffect(() => {
        if (data.category_id) {
            const selected = categories.find(c => c.id == data.category_id);
            setSubCategories(selected?.sub_categories || []);
        }
    }, [data.category_id]);

    useEffect(() => {
        setData('has_variants', data.variations.length > 0);
    }, [data.variations.length]);

    const hasErrorInTab = (lang) => {
        return Object.keys(errors).some(key => key.includes(`.${lang}`));
    };

    const handleAutoTranslate = async () => {
        if (!data.name.ja || !data.description.ja) {
            alert('日本語の内容を入力してください');
            return;
        }
        setIsTranslating(true);
        try {
            const response = await axios.post(route('creator.ai.translate'), {
                name: data.name.ja,
                description: data.description.ja,
                material: data.material.ja,
                variants: data.variations.map(v => v.variant_name.ja)
            });
            const t = response.data;
            setData(prev => ({
                ...prev,
                name: { ...prev.name, ...t.name },
                description: { ...prev.description, ...t.description },
                material: { ...prev.material, ...t.material },
                variations: prev.variations.map((v, i) => ({
                    ...v, variant_name: { ...v.variant_name, ...t.variants[i] }
                }))
            }));
        } catch (e) { alert('翻訳エラーが発生しました'); }
        finally { setIsTranslating(false); }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData('images', [...data.images, ...files]);
        setImagePreviews([...imagePreviews, ...files.map(f => URL.createObjectURL(f))]);
    };

    const addVariant = () => {
        setData('variations', [...data.variations, {
            variant_name: { ja: '', en: '', zh: '', th: '', fr: '' },
            price: data.price,
            stock: data.product_type === 1 ? '' : 9999,
            weight: data.weight,
            hs_code_id: data.hs_code_id,
            digital_file: null
        }]);
    };

    const updateVariant = (idx, field, val, isNested = false) => {
        const newVars = [...data.variations];
        isNested ? newVars[idx].variant_name[field] = val : newVars[idx][field] = val;
        setData('variations', newVars);
    };

    const removeVariant = (idx) => {
        const newVars = [...data.variations];
        newVars.splice(idx, 1);
        setData('variations', newVars);
    };

    const toggleTag = (id) => {
        const current = [...data.tag_ids];
        const idx = current.indexOf(id);
        idx > -1 ? current.splice(idx, 1) : current.push(id);
        setData('tag_ids', current);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('creator.products.store'), { forceFormData: true });
    };

    return (
        <CreatorLayout user={auth.user} header="作品登録">
            <Head title="作品登録" />
            <div className="max-w-6xl mx-auto py-8 px-4 pb-32">
                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* 00. 作品形式選択 */}
                    <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                        <h3 className="text-xl font-black italic mb-6 text-white text-center tracking-widest uppercase">00. 作品形式を選択</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <button type="button" onClick={() => setData('product_type', 1)}
                                className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${data.product_type === 1 ? 'border-indigo-500 bg-indigo-500/20' : 'border-gray-800'}`}>
                                <span className="text-4xl">📦</span>
                                <span className="font-black text-lg text-white">現物作品</span>
                            </button>
                            <button type="button" onClick={() => setData('product_type', 2)}
                                className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${data.product_type === 2 ? 'border-indigo-500 bg-indigo-500/20' : 'border-gray-800'}`}>
                                <span className="text-4xl">💾</span>
                                <span className="font-black text-lg text-white">デジタル作品</span>
                            </button>
                        </div>
                    </section>

                    {/* 01. 基本情報 */}
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex flex-wrap justify-between items-center bg-gray-50/30 gap-4">
                            <h3 className="text-lg font-black text-gray-800 italic uppercase">01. 基本情報</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1 bg-gray-200 p-1 rounded-xl">
                                    {languages.map(l => (
                                        <button key={l.code} type="button" onClick={() => setActiveTab(l.code)}
                                            className={`relative px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === l.code ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>
                                            {l.label}
                                            {hasErrorInTab(l.code) && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse"></span>}
                                        </button>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAutoTranslate} className="text-[10px] font-black bg-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-lg">✨ AI翻訳</button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1 tracking-widest">作品名</label>
                                <input type="text" value={data.name[activeTab]} onChange={e => setData('name', { ...data.name, [activeTab]: e.target.value })}
                                    className={`w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4 focus:ring-2 ${errors[`name.${activeTab}`] ? 'ring-2 ring-rose-500' : 'focus:ring-indigo-500'}`} />
                                <InputError message={errors[`name.${activeTab}`]} className="mt-1" />
                            </div>
                            {data.product_type === 1 && (
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1 tracking-widest">素材</label>
                                    <input type="text" value={data.material[activeTab]} onChange={e => setData('material', { ...data.material, [activeTab]: e.target.value })}
                                        className={`w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4 focus:ring-2 ${errors[`material.${activeTab}`] ? 'ring-2 ring-rose-500' : ''}`} placeholder="アクリル、キャンバスなど" />
                                    <InputError message={errors[`material.${activeTab}`]} className="mt-1" />
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1 tracking-widest">作品説明</label>
                                <textarea rows="6" value={data.description[activeTab]} onChange={e => setData('description', { ...data.description, [activeTab]: e.target.value })}
                                    className={`w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4 focus:ring-2 ${errors[`description.${activeTab}`] ? 'ring-2 ring-rose-500' : 'focus:ring-indigo-500'}`} />
                                <InputError message={errors[`description.${activeTab}`]} className="mt-1" />
                            </div>
                        </div>
                    </section>

                    {/* 02. デジタル作品：配信ファイル */}
                    {data.product_type === 2 && (
                        <section className="bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 p-8 space-y-4">
                            <h3 className="text-lg font-black text-indigo-900 italic tracking-widest uppercase">02. 配信ファイル</h3>
                            <div className={`bg-white p-10 rounded-[2rem] border-2 border-dashed ${errors.digital_file ? 'border-rose-500' : 'border-indigo-200'} text-center`}>
                                <input type="file" onChange={e => setData('digital_file', e.target.files[0])} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="cursor-pointer block">
                                    <div className="text-5xl mb-4">📂</div>
                                    <p className="font-black text-indigo-600 uppercase tracking-widest">ファイルをアップロード</p>
                                    {data.digital_file && <p className="mt-2 text-[10px] font-bold text-indigo-600">{data.digital_file.name}</p>}
                                </label>
                            </div>
                            <InputError message={errors.digital_file} />
                        </section>
                    )}

                    {/* 03. プレビュー画像 */}
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-8">
                        <h3 className="text-lg font-black text-gray-800 italic uppercase">03. プレビュー画像</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {imagePreviews.map((url, idx) => (
                                <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-indigo-200 shadow-lg">
                                    <img src={url} className="w-full h-full object-cover" />
                                    <div className="absolute top-1 right-1 bg-indigo-600 text-white p-1 rounded-full text-[8px] font-black uppercase shadow-lg">NEW</div>
                                </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer">
                                <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
                                <span className="text-[10px] font-black uppercase tracking-widest">+ 追加</span>
                            </label>
                        </div>
                        <InputError message={errors.images} />
                    </section>

                    {/* 04. 検索タグ */}
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-6">
                        <h3 className="text-lg font-black text-gray-800 italic uppercase">04. 検索タグ</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(t => (
                                <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                                    className={`px-5 py-2.5 rounded-[1.2rem] text-xs font-black transition-all border-2 ${data.tag_ids.includes(t.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-gray-50 text-gray-400 border-gray-50 hover:border-gray-300'}`}>
                                    # {t.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* 05. 基本スペック */}
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-8">
                        <h3 className="text-lg font-black text-gray-800 italic uppercase tracking-widest">05. 基本スペック</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1 tracking-widest">カテゴリー</label>
                                <select className="w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                    <option value="">カテゴリを選択</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_ja}</option>)}
                                </select>
                                <InputError message={errors.category_id} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1 tracking-widest">サブカテゴリー</label>
                                <select className="w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4" value={data.sub_category_id} onChange={e => setData('sub_category_id', e.target.value)} disabled={!data.category_id}>
                                    <option value="">サブカテゴリーを選択</option>
                                    {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name_ja}</option>)}
                                </select>
                                <InputError message={errors.sub_category_id} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-50">
                            <div>
                                <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block ml-1 tracking-widest">販売価格 (JPY)</label>
                                <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-2xl font-black p-4" />
                                <InputError message={errors.price} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block ml-1 tracking-widest">在庫数</label>
                                <input type="number" value={data.stock} onChange={e => setData('stock', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-2xl font-black p-4" />
                                <InputError message={errors.stock} />
                            </div>
                        </div>

                        {data.product_type === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                                <div>
                                    <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block ml-1 tracking-widest">重量(g)</label>
                                    <input type="number" value={data.weight} onChange={e => setData('weight', e.target.value)} className="w-full bg-gray-50 border-transparent rounded-2xl font-black p-4" />
                                    <InputError message={errors.weight} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block ml-1 tracking-widest">HSコード</label>
                                    <select className="w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4" value={data.hs_code_id} onChange={e => setData('hs_code_id', e.target.value)}>
                                        <option value="">選択してください</option>
                                        {hs_codes.map(h => <option key={h.id} value={h.id}>{h.code} - {h.name_ja}</option>)}
                                    </select>
                                    <InputError message={errors.hs_code_id} />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 06. バリエーション設定 */}
                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-lg font-black text-gray-800 italic uppercase">06. バリエーション設定</h3>
                            <button type="button" onClick={addVariant} className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-800 transition-all">+ 追加</button>
                        </div>
                        <div className="p-8 space-y-4">
                            <InputError message={errors.variations} className="mb-4" />
                            {data.variations.map((v, i) => (
                                <div key={i} className={`bg-gray-50/50 rounded-[2rem] p-6 border transition-all relative group ${Object.keys(errors).some(k => k.startsWith(`variations.${i}`)) ? 'border-rose-300 bg-rose-50/20' : 'border-gray-100'}`}>
                                    <button type="button" onClick={() => removeVariant(i)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1 tracking-widest">名称 ({activeTab.toUpperCase()})</label>
                                            <input type="text" value={v.variant_name[activeTab]} onChange={e => updateVariant(i, activeTab, e.target.value, true)} className="w-full bg-white border-gray-100 rounded-xl font-bold text-sm" />
                                            <InputError message={errors[`variations.${i}.variant_name.${activeTab}`]} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1 tracking-widest">価格 (JPY)</label>
                                            <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="w-full bg-white border-gray-100 rounded-xl font-black text-sm" />
                                            <InputError message={errors[`variations.${i}.price`]} />
                                        </div>
                                        {data.product_type === 1 && (
                                            <div className="md:col-span-1">
                                                <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1 tracking-widest uppercase">在庫</label>
                                                <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} className="w-full bg-white border-gray-100 rounded-xl font-black text-sm" />
                                                <InputError message={errors[`variations.${i}.stock`]} />
                                            </div>
                                        )}
                                        {data.product_type === 1 && (
                                            <div className="md:col-span-2">
                                                <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1 tracking-widest text-[8px]">重量(g)</label>
                                                <input type="number" value={v.weight} onChange={e => updateVariant(i, 'weight', e.target.value)} className="w-full bg-white border-gray-100 rounded-xl font-black text-sm" />
                                                <InputError message={errors[`variations.${i}.weight`]} />
                                            </div>
                                        )}
                                        {data.product_type === 1 && (
                                            <div className={data.product_type === 1 ? "md:col-span-5" : "md:col-span-3"}>
                                                <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1 tracking-widest">HSコード</label>
                                                <select className="w-full bg-white border-gray-100 rounded-xl font-bold text-[10px] p-2 h-[38px]" value={v.hs_code_id} onChange={e => updateVariant(i, 'hs_code_id', e.target.value)}>
                                                    <option value="">選択</option>
                                                    {hs_codes.map(h => <option key={h.id} value={h.id}>{h.code} - {h.name_ja}</option>)}
                                                </select>
                                                <InputError message={errors[`variations.${i}.hs_code_id`]} />
                                            </div>
                                        )}
                                        {data.product_type === 2 && (
                                            <div className="md:col-span-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1 tracking-widest">配信ファイル</label>
                                                    <input type="file" onChange={e => updateVariant(i, 'digital_file', e.target.files[0])} className="text-[10px] w-full" />
                                                    <InputError message={errors[`variations.${i}.digital_file`]} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 固定フッター */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-8 py-4 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <Link href={route('creator.products.index')} className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest px-4 py-2 text-center">キャンセル / 戻る</Link>
                        <div className="flex items-center gap-4">
                            {Object.keys(errors).length > 0 && <span className="text-[10px] font-black text-rose-500 uppercase">{Object.keys(errors).length}件のエラーを修正してください</span>}
                            <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-16 py-4 rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                                {processing ? '保存中...' : '審査に出す'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* AI翻訳用オーバーレイ (ロード画面) */}
                {isTranslating && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-md">
                        <div className="relative text-center">
                            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">✨</div>
                            <h4 className="text-white text-xl font-black italic mt-8 uppercase tracking-widest text-center">AI Updating Translations...</h4>
                        </div>
                    </div>
                )}
            </div>
        </CreatorLayout>
    );
}