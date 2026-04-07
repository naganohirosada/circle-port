import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    Search, Users, Tag, JapaneseYen, RotateCcw, 
    Filter, Box, Rocket, Globe, Calendar, Package 
} from 'lucide-react';

export default function Index({ groupOrders, categories = [], filters }) {
    const { language, locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const { data, setData, get, processing, reset } = useForm({
        name: filters.name || '',
        creator: filters.creator || '',
        category_id: filters.category_id || '',
        mode: 'go', // GOモード固定
    });

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        get(route('fan.go.index'), { preserveState: true });
    };

    const getLocalizedName = (item) => {
        if (!item) return '';
        const t = item.translations?.find(t => t.locale === locale) || 
                item.translations?.find(t => t.locale === 'en') ||
                item.translations?.[0];
        return t ? t.name : (item.name_en || item.name_ja || '');
    };

    return (
        <FanLayout>
            <Head title={`${__('Group Orders')} - CirclePort`} />
            
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                
                {/* 1. モードセレクター */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200/50 shadow-inner">
                        <Link 
                            href={route('fan.products.index')} 
                            className="flex items-center gap-2.5 px-8 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <Box size={16} /> {__('Artworks')}
                        </Link>
                        <div className="flex items-center gap-2.5 px-8 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.15em] bg-cyan-500 text-white shadow-lg shadow-cyan-200/50">
                            <Rocket size={16} /> {__('Group Orders')}
                        </div>
                    </div>
                </div>

                {/* 2. 検索フォーム */}
                <form 
                    onSubmit={handleSearch} 
                    className="mb-16 bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/40 space-y-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Search size={12} className="text-cyan-600" /> {__('Search Projects')}
                            </label>
                            <input 
                                type="text"
                                placeholder={__('Search by keyword...')}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-6 text-sm font-medium transition-all focus:bg-white focus:border-cyan-500 outline-none"
                            />
                        </div>
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

                    <div className="flex flex-wrap items-end justify-between gap-6 pt-8 border-t border-slate-50">
                        <div className="flex-1 max-w-sm space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Tag size={12} className="text-cyan-600" /> {__('Categories')}
                            </label>
                            <select 
                                value={data.category_id} 
                                onChange={e => setData('category_id', e.target.value)} 
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-[11px] font-black uppercase outline-none focus:border-cyan-500"
                            >
                                <option value="">{__('All Categories')}</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{getLocalizedName(c)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={() => { reset(); get(route('fan.go.index')); }} 
                                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-pink-500 transition-colors"
                            >
                                <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" /> {__('Reset')}
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="bg-slate-900 text-white px-10 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase hover:bg-cyan-600 transition-all shadow-lg flex items-center gap-3"
                            >
                                <Filter size={14} /> {__('Apply Filters')}
                            </button>
                        </div>
                    </div>
                </form>

                {/* 3. コンテンツ表示エリア */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {groupOrders?.data?.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-300 font-black uppercase tracking-widest text-sm">
                            {__('No active group orders found')}
                        </div>
                    ) : (
                        groupOrders.data.map((go) => (
                            <Link 
                                key={go.id} 
                                href={route('fan.go.detail', go.id)} 
                                className="group bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 hover:border-cyan-500 hover:shadow-2xl transition-all duration-500 flex flex-col xl:flex-row gap-8"
                            >
                                <div className="w-full xl:w-40 aspect-square shrink-0 rounded-3xl overflow-hidden border border-slate-100">
                                    {go.creator?.image_url ? (
                                        // クリエイター画像がある場合
                                        <img 
                                            src={go.creator.image_url} 
                                            alt={go.creator.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                                        />
                                    ) : (
                                        // 画像がない場合のダミー：イニシャルを表示
                                        // 白背景カード内なので、背景 slate-100 / 文字 slate-400 に設定
                                        // ホバー時のアニメーションも img タグと統一
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-6xl uppercase group-hover:scale-110 transition-all duration-700">
                                            {go.creator?.name ? go.creator.name.substring(0, 1) : '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-${go.status_color}-50 text-${go.status_color}-600 border border-${go.status_color}-100`}>
                                            {go.status_label}
                                        </span>
                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={10} /> {new Date(go.end_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-cyan-600 transition-colors uppercase leading-tight">{go.title}</h3>
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
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden">
                                                <img src={go.creator?.image_url} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{go.creator?.name}</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900">
                                            ¥{Number(go.items?.[0]?.price || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </FanLayout>
    );
}