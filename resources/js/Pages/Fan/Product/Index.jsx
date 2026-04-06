import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    Search, Users, Tag, JapaneseYen, RotateCcw, 
    Filter, Box, Rocket, Globe, Calendar, Package 
} from 'lucide-react';

export default function Index({ 
    products = { data: [] },    // productsがなくても { data: [] } を使う
    groupOrders = { data: [] }, // groupOrdersがなくても { data: [] } を使う
    categories = [], 
    filters,
}) {    // locale（現在の言語設定）と language（翻訳データ）を取得
    const { language, locale } = usePage().props;
    
    // 翻訳用ヘルパー関数
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // フォームの状態管理（検索条件 + 表示モード）
    const { data, setData, get, processing, reset } = useForm({
        name: filters.name || '',
        creator: filters.creator || '',
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        category_id: filters.category_id || '',
        sub_category_id: filters.sub_category_id || '',
        // モード管理: 'artwork' (作品) or 'go' (共同購入)
        mode: filters.mode || 'artwork', 
    });

    // 選択されたメインカテゴリに紐づくサブカテゴリを抽出
    const subCategories = categories.find(c => c.id == data.category_id)?.sub_categories || [];

    // 検索実行
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        get(route('fan.products.index'), { preserveState: true });
    };

    // カテゴリ変更時の処理（サブカテゴリをリセット）
    const handleCategoryChange = (e) => {
        const id = e.target.value;
        setData(prev => ({ ...prev, category_id: id, sub_category_id: '' }));
    };

    // モード切り替え（切り替え時に自動検索）
    const handleModeChange = (newMode) => {
        if (data.mode === newMode) return;
        
        // 状態を更新してから get を呼ぶ
        const newData = { ...data, mode: newMode };
        setData('mode', newMode);
        get(route('fan.products.index'), { 
            data: newData,
            preserveState: true 
        });
    };

    // --- ヘルパー関数群 ---
    
    // カテゴリ等の翻訳名を取得
    const getLocalizedName = (item) => {
        if (!item) return '';
        const t = item.translations?.find(t => t.locale === locale) || 
                item.translations?.find(t => t.locale === 'en') ||
                item.translations?.[0];
        return t ? t.name : (item.name_en || item.name_ja || '');
    };

    // 商品名等の翻訳を取得
    const getTranslation = (product, field) => {
        const t = product.translations?.find(t => t.locale === locale) || 
                product.translations?.find(t => t.locale === 'en') || 
                product.translations?.[0];
        return t ? t[field] : '-';
    };

    // 商品サムネイルの取得
    const getThumbnail = (product) => {
        const primary = product.images?.find(img => img.is_primary) || product.images?.[0];
        return primary ? primary.url : '/images/no-image.jpg';
    };

    return (
        <FanLayout>
            <Head title={`${data.mode === 'go' ? __('Group Orders') : __('Artworks')} - CirclePort`} />
            
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                
                {/* 1. モードセレクター：コンパクトなセグメントコントロール */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200/50 shadow-inner">
                        {/* 作品一覧へのリンク */}
                        <Link 
                            href={route('fan.products.index')} 
                            className={`flex items-center gap-2.5 px-8 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                data.mode === 'artwork' 
                                ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Box size={16} /> {__('Artworks')}
                        </Link>

                        {/* 共同購入一覧へのリンク */}
                        <Link 
                            href={route('fan.go.index')} 
                            className={`flex items-center gap-2.5 px-8 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                data.mode === 'go' 
                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200/50' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Rocket size={16} /> {__('Group Orders')}
                        </Link>
                    </div>
                </div>

                {/* 2. 検索・フィルターセクション */}
                <form 
                    onSubmit={handleSearch} 
                    className="mb-16 bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/40 space-y-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 作品名/プロジェクト名検索 */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Search size={12} className="text-cyan-600" /> {data.mode === 'go' ? __('Search Projects') : __('Artwork Title')}
                            </label>
                            <input 
                                type="text"
                                placeholder={__('Search by keyword...')}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-6 text-sm font-medium transition-all focus:bg-white focus:border-cyan-500 outline-none"
                            />
                        </div>

                        {/* クリエイター検索 */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Users size={12} className="text-cyan-600" /> {__('Creator')}
                            </label>
                            <input 
                                type="text"
                                placeholder={__('Search by creator name...')}
                                value={data.creator}
                                onChange={e => setData('creator', e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-6 text-sm font-medium transition-all focus:bg-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-6 pt-8 border-t border-slate-50">
                        {/* カテゴリー選択 */}
                        <div className="flex-1 min-w-[300px] space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Tag size={12} className="text-cyan-600" /> {__('Categories')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <select 
                                    value={data.category_id} 
                                    onChange={handleCategoryChange} 
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-[11px] font-black uppercase outline-none focus:border-cyan-500"
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
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-[11px] font-black uppercase outline-none disabled:opacity-30"
                                >
                                    <option value="">{__('Sub Category')}</option>
                                    {subCategories.map(sc => (
                                        <option key={sc.id} value={sc.id}>{getLocalizedName(sc)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 価格帯 */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <JapaneseYen size={12} className="text-cyan-600" /> {__('Price Range')}
                            </label>
                            <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-cyan-500 transition-all">
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    value={data.min_price} 
                                    onChange={e => setData('min_price', e.target.value)} 
                                    className="w-24 border-none bg-transparent focus:ring-0 text-xs font-black text-center py-3" 
                                />
                                <span className="text-slate-200">|</span>
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    value={data.max_price} 
                                    onChange={e => setData('max_price', e.target.value)} 
                                    className="w-24 border-none bg-transparent focus:ring-0 text-xs font-black text-center py-3" 
                                />
                            </div>
                        </div>

                        {/* 操作ボタン */}
                        <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={() => { reset(); get(route('fan.products.index')); }} 
                                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-pink-500 transition-colors"
                            >
                                <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" /> {__('Reset')}
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="bg-slate-900 text-white px-8 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase hover:bg-cyan-600 transition-all shadow-lg flex items-center gap-3"
                            >
                                <Filter size={14} /> {__('Apply')}
                            </button>
                        </div>
                    </div>
                </form>

                {/* 3. コンテンツ表示エリア */}
                {data.mode === 'go' ? (
                    // --- 共同購入（GO）モードのグリッド ---
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {groupOrders.data.length === 0 ? (
                            <div className="col-span-full py-24 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-300 font-black uppercase tracking-widest text-sm">
                                {__('No active group orders found')}
                            </div>
                        ) : (
                            groupOrders.data.map((go) => (
                                <Link 
                                    key={go.id} 
                                    href={route('fan.go.show', go.id)} 
                                    className="group bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 hover:border-cyan-500 hover:shadow-2xl transition-all duration-500 flex flex-col xl:flex-row gap-8"
                                >
                                    {/* プレビュー画像 */}
                                    <div className="w-full xl:w-40 aspect-square shrink-0 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100">
                                        <img 
                                            src={go.creator?.image_url || '/images/no-image.jpg'} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                                        />
                                    </div>

                                    {/* 詳細情報 */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-${go.status_color}-50 text-${go.status_color}-600 border border-${go.status_color}-100`}>
                                                {go.status_label}
                                            </span>
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={10} /> {new Date(go.end_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-cyan-600 transition-colors uppercase leading-tight">
                                            {go.title}
                                        </h3>

                                        {/* 募集進捗プログレスバー */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                                                <span>{__('Progress')}</span>
                                                <span>{go.participants_count} / {go.max_participants || '∞'}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
                                                <div 
                                                    className="h-full bg-cyan-500 rounded-full transition-all duration-1000" 
                                                    style={{ width: `${Math.min((go.participants_count / (go.max_participants || 100)) * 100, 100)}%` }} 
                                                />
                                            </div>
                                        </div>

                                        {/* 下部情報：クリエイター & 価格 */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                                    <img src={go.creator?.image_url} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{go.creator?.name}</span>
                                            </div>
                                            <div className="text-lg font-black text-slate-900">
                                                ¥{Number(go.items[0]?.price || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    // --- 通常作品（Artwork）モードのグリッド ---
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {products.data.length === 0 ? (
                            <div className="col-span-full py-24 text-center text-slate-300 font-black uppercase tracking-widest text-sm">
                                {__('No artworks found')}
                            </div>
                        ) : (
                            products.data.map((product) => (
                                <Link key={product.id} href={route('fan.products.show', product.id)} className="group">
                                    {/* 作品画像 */}
                                    <div className="aspect-[3/4] overflow-hidden bg-slate-50 mb-6 rounded-[1.5rem] border-2 border-slate-50 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                                        <img 
                                            src={getThumbnail(product)} 
                                            alt={getTranslation(product, 'name')} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                                        />
                                    </div>

                                    {/* 作品情報詳細 */}
                                    <div className="space-y-3 px-1">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                            <Tag size={10} className="text-cyan-500" /> {getLocalizedName(product.category)}
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[2.5rem] uppercase">
                                            {getTranslation(product, 'name')}
                                        </h3>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                                    <img src={product.creator?.image_url} className="w-full h-full object-cover" />
                                                </div>
                                                {product.creator?.name}
                                            </div>
                                            <p className="text-lg font-black text-slate-900">
                                                ¥{Number(product.price).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </FanLayout>
    );
}