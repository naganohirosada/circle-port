import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    Search, Users, RotateCcw, 
    ChevronDown, ChevronUp, Filter,
    CheckCircle2, XCircle, 
    ChevronRight, LayoutGrid, Box
} from 'lucide-react';

export default function Index({ 
    products = { data: [] }, 
    groupOrders = { data: [] }, 
    categories = [], 
    tags = [], 
    filters,
    currentLocale 
}) {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 折りたたみ状態の管理
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data, setData, get, processing, reset } = useForm({
        name: filters.name || '',
        category_id: filters.category_id || '',
        sub_category_id: filters.sub_category_id || '',
        tag_id: filters.tag_id || '',
        product_type: filters.product_type || '',
        stock_status: filters.stock_status || '',
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        mode: filters.mode || 'artwork', 
    });

    const getT = (item, field) => {
        if (!item || !item.translations) return '';
        const t = item.translations.find(t => t.locale === currentLocale) || 
                  item.translations.find(t => t.locale === 'en') || 
                  item.translations[0];
        return t ? t[field] : '';
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        setIsFilterOpen(false); 
        get(route('fan.products.index'), { preserveState: true, replace: true });
    };

    const switchMode = (newMode) => {
        setData('mode', newMode);
        router.get(route('fan.products.index'), { ...filters, mode: newMode }, { preserveState: true });
    };
    const activeTab = "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all bg-white text-cyan-600 shadow-sm";
    const inactiveTab = "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all text-slate-400 hover:text-slate-600";

    return (
        <FanLayout>
            <Head title={__('Explore')} />

            {/* --- 1. STICKY SEARCH & NAV --- 
                【重要】top-[64px] はメインヘッダーの高さに合わせて調整してください。
                z-40 でカードより前面、かつヘッダーより背面に配置。
            */}
            <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
                    
                    {/* Mode Switcher & Quick Search (常時表示) */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Artwork / Group Order 切替 */}
                        <div className="flex justify-center mb-12">
                            <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
                                <Link href={route('fan.products.index')} className={activeTab}>
                                    <LayoutGrid size={14} /> {__('Artwork')}
                                </Link>
                                <Link href={route('fan.go.index')} className={inactiveTab}>
                                    <Users size={14} /> {__('Group Order')}
                                </Link>
                            </div>
                        </div>

                        {/* クイック検索 & フィルターボタン */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text"
                                    placeholder={__('Quick search...')}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-cyan-500"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${isFilterOpen ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                            >
                                <Filter size={14} />
                                {isFilterOpen ? __('Close') : __('Filters')}
                                {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* --- COLLAPSIBLE DETAILED FILTERS --- */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-[600px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                        <form onSubmit={handleSearch} className="pt-4 border-t border-slate-100 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                
                                {/* 1. Product Type */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">{__('Product Type')}</label>
                                    <select className="w-full bg-slate-50 border-none rounded-xl text-xs font-black uppercase py-3 focus:ring-cyan-500" value={data.product_type} onChange={e => setData('product_type', e.target.value)}>
                                        <option value="">{__('All Types')}</option>
                                        <option value="1">📦 {__('Physical')}</option>
                                        <option value="2">💾 {__('Digital')}</option>
                                    </select>
                                </div>

                                {/* 2. Availability */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">{__('Availability')}</label>
                                    <select className="w-full bg-slate-50 border-none rounded-xl text-xs font-black uppercase py-3 focus:ring-cyan-500" value={data.stock_status} onChange={e => setData('stock_status', e.target.value)}>
                                        <option value="">{__('Any Status')}</option>
                                        <option value="1">{__('In Stock')}</option>
                                        <option value="2">{__('Sold Out')}</option>
                                    </select>
                                </div>

                                {/* 3. Category */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">{__('Category')}</label>
                                    <select className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold py-3 focus:ring-cyan-500" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                        <option value="">{__('Select Category')}</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{getT(c, 'name')}</option>)}
                                    </select>
                                </div>

                                {/* 4. Sub Category */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">{__('Sub Category')}</label>
                                    <select className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold py-3 focus:ring-cyan-500 disabled:opacity-30" value={data.sub_category_id} onChange={e => setData('sub_category_id', e.target.value)} disabled={!data.category_id}>
                                        <option value="">{__('Select Sub')}</option>
                                        {categories.find(c => c.id == data.category_id)?.sub_categories?.map(sc => (
                                            <option key={sc.id} value={sc.id}>{getT(sc, 'name')}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* --- 追加：5. Tags --- */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                                        {__('Tags')}
                                    </label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold py-3 focus:ring-cyan-500" 
                                        value={data.tag_id} 
                                        onChange={e => setData('tag_id', e.target.value)}
                                    >
                                        <option value="">{__('All Tags')}</option>
                                        {tags.map(tag => (
                                            <option key={tag.id} value={tag.id}>
                                                #{getT(tag, 'name') || tag.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 6. Price Range */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">{__('Price Range')}</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" placeholder="Min" className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold py-3 focus:ring-cyan-500" value={data.min_price} onChange={e => setData('min_price', e.target.value)} />
                                        <input type="number" placeholder="Max" className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold py-3 focus:ring-cyan-500" value={data.max_price} onChange={e => setData('max_price', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Actions (SEARCH BUTTON AT BOTTOM) */}
                            <div className="flex items-center gap-3">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                                >
                                    {__('Apply Search Filters')}
                                </button>
                                <button type="button" onClick={() => { reset(); router.get(route('fan.products.index')) }} className="p-4 text-slate-400 hover:text-rose-500 bg-slate-100 rounded-2xl transition-all">
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* --- 2. MAIN CONTENT GRID --- */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {(data.mode === 'go' ? groupOrders.data : products.data).map((item) => {
                        // 在庫判定: デジタルは常に在庫あり、現物はトータル在庫を参照
                        const isAvailable = item.product_type === 2 || (item.total_stock > 0);

                        return (
                            <Link 
                                key={item.id} 
                                href={route(data.mode === 'go' ? 'fan.group_orders.show' : 'fan.products.show', item.id)} 
                                className="group block"
                            >
                                {/* Thumbnail Area */}
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                                    <img 
                                        src={item.images?.[0] ? `/storage/${item.images[0].file_path}` : '/images/no-image.jpg'} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        loading="lazy" 
                                    />
                                    {/* Overlay Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${item.product_type === 1 ? 'bg-white/90 text-slate-900 border-white' : 'bg-cyan-600/90 text-white border-cyan-500'}`}>
                                            {item.product_type === 1 ? __('Physical') : __('Digital')}
                                        </span>
                                        {!isAvailable && (
                                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-sm">
                                                {__('Sold Out')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="mt-5 px-1 space-y-3">
                                    {/* Hierarchy & Tags */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center text-[9px] font-black text-cyan-600 uppercase tracking-widest">
                                            <span>{getT(item.category, 'name')}</span>
                                            {item.sub_category && (
                                                <>
                                                    <ChevronRight size={10} className="mx-1 text-slate-300" />
                                                    <span className="text-slate-400">{getT(item.sub_category, 'name')}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags?.slice(0, 2).map(tag => (
                                                <span key={tag.id} className="text-[8px] font-bold text-slate-400 italic lowercase bg-slate-50 px-2 py-0.5 rounded">#{tag.name}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Product Name */}
                                    <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[2.5rem] uppercase">
                                        {getT(item, 'name')}
                                    </h3>

                                    {/* Price & Stock Status */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <p className="text-base font-black text-slate-900">
                                            ¥{Number(item.display_min_price || item.price).toLocaleString()}
                                            {item.has_multiple_prices && <span className="ml-0.5 text-xs text-slate-400">~</span>}
                                        </p>
                                        <div className={`flex items-center gap-1 ${isAvailable ? 'text-emerald-500' : 'text-slate-300'}`}>
                                            {isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            <span className="text-[9px] font-black uppercase">
                                                {isAvailable ? __('In Stock') : __('Sold Out')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* --- 3. EMPTY STATE --- */}
                {((data.mode === 'artwork' && products.data.length === 0) || (data.mode === 'go' && groupOrders.data.length === 0)) && (
                    <div className="py-40 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner">
                            <Box className="text-slate-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-widest">{__('No matches found')}</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">{__('Try adjusting your search filters')}</p>
                    </div>
                )}
            </div>
        </FanLayout>
    );
}