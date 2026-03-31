import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { Search, Users, Tag, JapaneseYen, RotateCcw, Filter } from 'lucide-react';

export default function Index({ products, categories, filters }) {
    // locale（現在の言語設定）と language（翻訳データ）を取得
    const { language, locale } = usePage().props;
    
    // 翻訳用ヘルパー関数
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const { data, setData, get, processing, reset } = useForm({
        name: filters.name || '',
        creator: filters.creator || '',
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        category_id: filters.category_id || '',
        sub_category_id: filters.sub_category_id || '',
    });

    const subCategories = categories.find(c => c.id == data.category_id)?.sub_categories || [];

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('fan.products.index'), { preserveState: true });
    };

    const handleCategoryChange = (e) => {
        const id = e.target.value;
        setData(prev => ({ ...prev, category_id: id, sub_category_id: '' }));
    };

    // カテゴリ・サブカテゴリの翻訳名を取得する共通ヘルパー
    const getLocalizedName = (item) => {
        if (!item) return '';
        const t = item.translations?.find(t => t.locale === locale) || 
                item.translations?.find(t => t.locale === 'en') ||
                item.translations?.[0];

        return t ? t.name : (item.name_en || item.name_ja || '');
    };

    // 商品タイトルの翻訳取得
    const getTranslation = (product, field) => {
        const t = product.translations?.find(t => t.locale === locale) || 
                product.translations?.find(t => t.locale === 'en') || 
                product.translations?.[0];
        return t ? t[field] : '-';
    };

    const getThumbnail = (product) => {
        const primary = product.images?.find(img => img.is_primary) || product.images?.[0];
        return primary ? primary.url : '/images/no-image.jpg';
    };

    return (
        <FanLayout>
            <Head title={`${__('Artworks')} - CirclePort`} />
            
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                
                {/* 検索・フィルターセクション */}
                <form 
                    onSubmit={handleSearch} 
                    className="mb-16 bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 space-y-10"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* 1. 作品名検索 */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                                <Search size={14} className="text-cyan-600" /> {__('Artwork Title')}
                            </label>
                            <input 
                                type="text"
                                placeholder={__('Search by keyword...')}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 px-6 text-sm font-medium transition-all focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none placeholder-slate-300"
                            />
                        </div>

                        {/* 2. クリエイター検索 */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                                <Users size={14} className="text-cyan-600" /> {__('Creator')}
                            </label>
                            <input 
                                type="text"
                                placeholder={__('Search by creator name...')}
                                value={data.creator}
                                onChange={e => setData('creator', e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 px-6 text-sm font-medium transition-all focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none placeholder-slate-300"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-8 pt-8 border-t border-slate-100">
                        {/* 3. カテゴリー選択 */}
                        <div className="flex-1 min-w-[300px] space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                                <Tag size={14} className="text-cyan-600" /> {__('Categories')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <select 
                                    value={data.category_id}
                                    onChange={handleCategoryChange}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-xs font-bold transition-all focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none"
                                >
                                    <option value="">{__('Main Category')}</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{getLocalizedName(c)}</option>
                                    ))}
                                </select>
                                <select 
                                    value={data.sub_category_id}
                                    onChange={e => setData('sub_category_id', e.target.value)}
                                    disabled={!data.category_id}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-xs font-bold transition-all focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <option value="">{__('Sub Category')}</option>
                                    {subCategories.map(sc => (
                                        <option key={sc.id} value={sc.id}>{getLocalizedName(sc)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 4. 価格帯検索 */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                                <JapaneseYen size={14} className="text-cyan-600" /> {__('Price Range')} (JPY)
                            </label>
                            <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all">
                                <input 
                                    type="number" 
                                    placeholder={__('Min')} 
                                    value={data.min_price}
                                    onChange={e => setData('min_price', e.target.value)}
                                    className="w-24 border-none bg-transparent focus:ring-0 text-xs font-bold text-center py-3"
                                />
                                <span className="text-slate-300 font-light">|</span>
                                <input 
                                    type="number" 
                                    placeholder={__('Max')} 
                                    value={data.max_price}
                                    onChange={e => setData('max_price', e.target.value)}
                                    className="w-24 border-none bg-transparent focus:ring-0 text-xs font-bold text-center py-3"
                                />
                            </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex items-center gap-4 ml-auto lg:ml-0">
                            <button 
                                type="button" 
                                onClick={() => { reset(); get(route('fan.products.index')); }}
                                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-pink-500 transition-colors"
                            >
                                <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" /> {__('Reset')}
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="bg-slate-900 text-white px-10 py-4 rounded-xl text-xs font-black tracking-[0.2em] uppercase hover:bg-cyan-600 active:scale-95 transition-all shadow-lg shadow-slate-200 flex items-center gap-3"
                            >
                                <Filter size={16} /> {__('Apply Filters')}
                            </button>
                        </div>
                    </div>
                </form>

                {/* 商品グリッド */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {products.data.map((product) => (
                        <Link key={product.id} href={route('fan.products.show', product.id)} className="group">
                            {/* 画像コンテナ：バッジを削除してスッキリ */}
                            <div className="aspect-[4/5] overflow-hidden bg-slate-50 mb-6 relative rounded-lg border border-slate-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                <img 
                                    src={getThumbnail(product)} 
                                    alt={getTranslation(product, 'name') || __('No Image')} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            </div>

                            {/* 情報エリア */}
                            <div className="space-y-3 px-1">
                                {/* タイトル */}
                                <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[2.8rem]">
                                    {getTranslation(product, 'name')}
                                </h3>

                                {/* カテゴリーラベル：画像の外、タイトルの下に配置 */}
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <Tag size={12} className="text-cyan-600" />
                                    {getLocalizedName(product.category)}
                                </div>

                                {/* クリエイター & 価格 */}
                                <div className="flex items-center justify-between items-end pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                            {/* クリエイターアイコンがあればここに配置 */}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {product.creator?.name || __('Local Artist')}
                                        </p>
                                    </div>
                                    <p className="text-lg font-light text-slate-900">
                                        ¥{Number(product.price).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </FanLayout>
    );
}