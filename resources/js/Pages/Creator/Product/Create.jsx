import React, { useState, useEffect } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function Create({ auth, categories, hs_codes, tags, ips = [] }) {
    const [activeTab, setActiveTab] = useState('ja');
    const [subCategories, setSubCategories] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [selectedIpData, setSelectedIpData] = useState(null);

    const languages = [
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'en', label: '英語', flag: '🇺🇸' },
        { code: 'zh', label: '中国語', flag: '🇨🇳' },
        { code: 'th', label: 'タイ語', flag: '🇹🇭' },
        { code: 'id', label: 'インドネシア語', flag: '🇮🇩' },
        { code: 'vi', label: 'ベトナム語', flag: '🇻🇳' },
        { code: 'fr', label: 'フランス語', flag: '🇫🇷' },
        { code: 'de', label: 'ドイツ語', flag: '🇩🇪' },
        { code: 'ko', label: '韓国語', flag: '🇰🇷' },
    ];

    const initialLangObj = { ja: '', en: '', zh: '', th: '', id: '', vi: '', fr: '', de: '', ko: '' };

    const { data, setData, post, processing, errors } = useForm({
        product_type: 1, 
        name: { ja: '', en: '', zh: '', th: '', id: '', vi: '', fr: '', de: '', ko: '' },
        material: { ja: '', en: '', zh: '', th: '', id: '', vi: '', fr: '', de: '', ko: '' },
        description: { ja: '', en: '', zh: '', th: '', id: '', vi: '', fr: '', de: '', ko: '' },
        category_id: '',
        sub_category_id: '',
        domestic_shipping_method: 10,       
        domestic_direct_shipping_fee: '',
        price: '',
        stock: '', 
        weight: '', 
        hs_code_id: '',
        tag_ids: [],
        images: [],
        digital_file: null,
        variations: [],
        has_variants: false,
        ip_id: '',
        is_guideline_certified: false,
    });

    useEffect(() => {
        if (data.category_id) {
            const selected = categories.find(c => c.id == data.category_id);
            setSubCategories(selected?.sub_categories || []);
            if (selected?.default_hs_code_id) {
                setData(prev => ({ ...prev, hs_code_id: selected.default_hs_code_id }));
            }
        } else {
            setSubCategories([]);
        }
    }, [data.category_id]);

    useEffect(() => {
        if (data.sub_category_id) {
            const selectedSub = subCategories.find(sc => sc.id == data.sub_category_id);
            if (selectedSub?.default_hs_code_id) {
                setData('hs_code_id', selectedSub.default_hs_code_id);
            }
        }
    }, [data.sub_category_id]);

    useEffect(() => {
        if (data.ip_id) {
            const found = ips.find(item => item.id == data.ip_id);
            setSelectedIpData(found || null);
        } else {
            setSelectedIpData(null);
        }
    }, [data.ip_id, ips]);

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
        } catch (e) { 
            alert('翻訳エラーが発生しました'); 
        } finally { 
            setIsTranslating(false); 
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData('images', [...data.images, ...files]);
        setImagePreviews([...imagePreviews, ...files.map(f => URL.createObjectURL(f))]);
    };

    const addVariant = () => {
        setData('variations', [...data.variations, {
            variant_name: { ...initialLangObj },
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

                    {data.product_type === 2 && (
                        <section className="bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 p-8 space-y-4">
                            <h3 className="text-lg font-black text-indigo-900 italic tracking-widest uppercase">02. 配信ファイル</h3>
                            <div className={`bg-white p-10 rounded-[2rem] border-2 border-dashed ${errors.digital_file ? 'border-rose-500' : 'border-indigo-200'} text-center`}>
                                <input type="file" onChange={e => setData('digital_file', e.target.files[0])} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="cursor-pointer block">
                                    <div className="text-5xl mb-4 text-indigo-200">📂</div>
                                    <p className="font-black text-indigo-600 uppercase tracking-widest">ファイルをアップロード</p>
                                    {data.digital_file && <p className="mt-2 text-[10px] font-bold text-indigo-600">{data.digital_file.name}</p>}
                                </label>
                            </div>
                            <InputError message={errors.digital_file} />
                        </section>
                    )}

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
                        <InputError message={errors.tag_ids} className="mt-2" />
                    </section>

                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-8">
                        <h3 className="text-lg font-black text-gray-800 italic uppercase tracking-widest">05. 基本スペック</h3>
                        
                        <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                    🛡️ 二次創作マスタ統制スロット
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium">運営が管理する公式マスタから対象IPを選択してください。上限数およびURLはシステムにより一律自動執行されます。</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">二次創作対象IP・キャラクター</label>
                                    <select 
                                        className="w-full bg-slate-950 border-slate-800 focus:border-cyan-500 rounded-2xl font-bold p-3.5 text-xs text-white shadow-sm"
                                        value={data.ip_id} 
                                        onChange={e => setData('ip_id', e.target.value)}
                                    >
                                        <option value="">オリジナル作品（IP指定なし）</option>
                                        {ips.map(ip => (
                                            <option key={ip.id} value={ip.id}>{ip.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.ip_id} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">生涯累計販売上限数（読み取り専用）</label>
                                    <div className="w-full bg-slate-950/60 border border-slate-800/40 rounded-2xl font-black p-3.5 text-xs text-slate-400 shadow-inner">
                                        {selectedIpData ? `${selectedIpData.max_sale_limit} 個` : '制限なし'}
                                    </div>
                                    {selectedIpData && (
                                        <p className="mt-1.5 text-[9px] text-cyan-400/80 font-bold ml-1">
                                            ✅ 運営により生涯通算の上限キャップが完全自動追跡されています。
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">公式ガイドラインURL（検証ソース）</label>
                                    <div className="w-full bg-slate-950/60 border border-slate-800/40 rounded-2xl font-bold p-3.5 text-xs text-slate-500 truncate shadow-inner font-mono">
                                        {selectedIpData ? (
                                            <a href={selectedIpData.guideline_url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 underline hover:text-cyan-400">
                                                {selectedIpData.guideline_url} 🔗
                                            </a>
                                        ) : '---'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-400 text-[10px] leading-relaxed font-mono space-y-2">
                                <p className="font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                                    ⚠️ サイト運営事業者（CirclePort）からの法的免責・仲介ステートメント
                                </p>
                                <p>
                                    CirclePort（以下、本プラットフォーム）は、国内クリエイターと海外消費者間の越境売買、および免税通関・中継物流手続きをデジタルに仲介・支援する「取引の場を提供するシステム事業者」です。海外ファンとの間で成立する売買契約の直接の当事者・販売主体は出品者であるサークル様自身であり、本プラットフォームは商品の所有権、商標、著作権の保証、およびガイドライン違反に関する一切の直接責任を負いません。
                                </p>
                                <p>
                                    また、国際航空便（DHL/FedEx）の保安基準に基づき、リチウムイオンバッテリー、引火性液体（香水・オイル等）、スプレー缶、特定の成人向け表現物などの「各国の禁制品・国際危険物」に該当する物品の海外輸出は法律で厳密に禁止されています。違反が発覚した場合、サークルアカウントは即座に永久停止処分となり、没収に伴う損害全額が賠償請求の対象となります。
                                </p>
                            </div>

                            <label className="flex items-start gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer shadow-sm hover:border-cyan-500 transition-colors">
                                <input type="checkbox" checked={data.is_guideline_certified} onChange={e => setData('is_guideline_certified', e.target.checked)} className="rounded text-cyan-500 focus:ring-cyan-500 w-4 h-4 border-slate-700 bg-slate-900 mt-0.5" />
                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-tight leading-normal">
                                    私は、上記の本プラットフォームの仲介的地位を完全に理解し、版権元の二次創作ガイドライン、各国禁制品規制、およびcircle-port of 販売規約を100%遵守して自己の全責任においてこの作品を出品することを誓約します。
                                </span>
                            </label>
                            <InputError message={errors.is_guideline_certified} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
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
                                    <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block ml-1 tracking-widest">
                                        配送・通関用分類 (HSコード)
                                    </label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4 focus:ring-2 focus:ring-indigo-500 appearance-none" 
                                            value={data.hs_code_id} 
                                            onChange={e => setData('hs_code_id', e.target.value)}
                                        >
                                            <option value="">カテゴリから自動設定されます</option>
                                            {hs_codes.map(h => (
                                                <option key={h.id} value={h.id}>{h.code} - {h.name_ja}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputError message={errors.hs_code_id} />
                                </div>
                            </div>
                        )}

                        {data.product_type === 1 && (
                            <div className="pt-8 border-t border-gray-100 space-y-6 bg-slate-50/50 p-6 rounded-3xl">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">📦 日本国内向けの配送設定</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block ml-1 tracking-widest">配送アプローチ</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button type="button" onClick={() => setData('domestic_shipping_method', 10)}
                                                className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center flex flex-col items-center gap-2 ${data.domestic_shipping_method === 10 ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>🏢 倉庫一括配送</button>
                                            <button type="button" onClick={() => setData('domestic_shipping_method', 20)}
                                                className={`p-4 rounded-2xl border-2 font-black text-xs transition-all text-center flex flex-col items-center gap-2 ${data.domestic_shipping_method === 20 ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>🚲 自社・自己発送</button>
                                        </div>
                                    </div>
                                    {data.domestic_shipping_method === 20 && (
                                        <div>
                                            <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block ml-1 tracking-widest">自己発送の全国一律配送料 (JPY)</label>
                                            <input type="number" value={data.domestic_direct_shipping_fee} onChange={e => setData('domestic_direct_shipping_fee', e.target.value)} className="w-full bg-white border-gray-200 rounded-2xl font-black p-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-lg font-black text-gray-800 italic uppercase">06. バリエーション設定</h3>
                            <button type="button" onClick={addVariant} className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-800 transition-all">+ 追加</button>
                        </div>
                        <div className="p-8 space-y-4">
                            <InputError message={errors.variations} className="mb-4" />
                            {data.variations.map((v, i) => (
                                <div key={i} className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 relative group">
                                    <button type="button" onClick={() => removeVariant(i)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1">名称 ({activeTab.toUpperCase()})</label>
                                            <input type="text" value={v.variant_name[activeTab]} onChange={e => updateVariant(i, activeTab, e.target.value, true)} className="w-full bg-white border-gray-100 rounded-xl font-bold text-sm" />
                                            <InputError message={errors[`variations.${i}.variant_name.${activeTab}`]} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1">価格 (JPY)</label>
                                            <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="w-full bg-white border-gray-100 rounded-xl font-black text-sm" />
                                            <InputError message={errors[`variations.${i}.price`]} />
                                        </div>
                                        {data.product_type === 1 && (
                                            <div className="md:col-span-1">
                                                <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1">在庫</label>
                                                <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} className="w-full bg-white border-gray-100 rounded-xl font-black text-sm" />
                                                <InputError message={errors[`variations.${i}.stock`]} />
                                            </div>
                                        )}
                                        {data.product_type === 1 && (
                                            <div className="md:col-span-2">
                                                <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1 text-[8px]">重量(g)</label>
                                                <input type="number" value={v.weight} onChange={e => updateVariant(i, 'weight', e.target.value)} className="w-full bg-white border-gray-100 rounded-xl font-black text-sm" />
                                                <InputError message={errors[`variations.${i}.weight`]} />
                                            </div>
                                        )}
                                        {data.product_type === 1 && (
                                            <div className={data.product_type === 1 ? "md:col-span-5" : "md:col-span-3"}>
                                                <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1">HSコード</label>
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
                                                    <label className="text-[9px] font-black text-indigo-600 uppercase mb-1 block ml-1">配信ファイル</label>
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

                    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-8 py-4 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <Link href={route('creator.products.index')} className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest px-4 py-2 text-center">キャンセル / 戻る</Link>
                        <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-16 py-4 rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 transition-all">審査に出す</button>
                    </div>
                </form>
            </div>
        </CreatorLayout>
    );
}