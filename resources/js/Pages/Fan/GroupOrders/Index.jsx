import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    Search, Users, RotateCcw, 
    ChevronDown, ChevronUp, Filter,
    ChevronRight, LayoutGrid, Box,
    Rocket, TrendingUp, Clock, CreditCard, Truck, User
} from 'lucide-react';

export default function Index({ groupOrders, filters = {}, language }) {
    const __ = (key) => language?.[key] || key;
    const items = groupOrders?.data || [];

    // フィルターパネルの開閉状態
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 検索フォームの状態管理（Artwork版と同じ構成）
    const { data, setData, get, processing, reset } = useForm({
        name: filters?.name || '',
        creator_name: filters?.creator_name || '',
        is_secondary_payment_required: filters?.is_secondary_payment_required || '',
        shipping_mode: filters?.shipping_mode || '',
    });

    // 検索実行
    const handleSearch = (e) => {
        e?.preventDefault();
        setIsFilterOpen(false);
        get(route('fan.go.index'), { preserveState: true, replace: true });
    };

    // 残り日数計算ヘルパー
    const getTimeLeft = (endDate) => {
        if (!endDate) return null;
        const diff = new Date(endDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    // タブのスタイル定義
    const activeTab = "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all bg-white text-cyan-600 shadow-sm";
    const inactiveTab = "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all text-slate-400 hover:text-slate-600";

    const placeholderImage = "https://placehold.jp/24/cccccc/ffffff/400x300.png?text=No%20Image";

    return (
        <FanLayout>
            <Head title={__('Group Orders')} />

            {/* --- 1. スティッキー検索 & ナビゲーションエリア --- */}
            <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* モード切替タブ (Link遷移) */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto shadow-inner">
                            <Link href={route('fan.products.index')} className={inactiveTab}>
                                <LayoutGrid size={14} />
                                {__('Artwork')}
                            </Link>
                            <Link href={route('fan.go.index')} className={activeTab}>
                                <Users size={14} />
                                {__('Group Order')}
                            </Link>
                        </div>

                        {/* クイック検索 & フィルターボタン */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text"
                                    placeholder={__('Search group name...')}
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

                    {/* 詳細フィルターパネル (商品一覧と同じデザイン) */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-[600px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                        <form onSubmit={handleSearch} className="pt-4 border-t border-slate-100 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                {/* クリエイター名検索 */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1">
                                        <User size={10} /> {__('Creator Name')}
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder={__('Search by creator...')}
                                        className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold py-3 focus:ring-cyan-500"
                                        value={data.creator_name}
                                        onChange={e => setData('creator_name', e.target.value)}
                                    />
                                </div>

                                {/* 2次決済の有無 */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1">
                                        <CreditCard size={10} /> {__('Secondary Payment')}
                                    </label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-xl text-xs font-black uppercase py-3 focus:ring-cyan-500"
                                        value={data.is_secondary_payment_required}
                                        onChange={e => setData('is_secondary_payment_required', e.target.value)}
                                    >
                                        <option value="">{__('All Status')}</option>
                                        <option value="1">{__('Required')}</option>
                                        <option value="0">{__('Not Required')}</option>
                                    </select>
                                </div>

                                {/* 配送モード */}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1">
                                        <Truck size={10} /> {__('Shipping Mode')}
                                    </label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-xl text-xs font-black uppercase py-3 focus:ring-cyan-500"
                                        value={data.shipping_mode}
                                        onChange={e => setData('shipping_mode', e.target.value)}
                                    >
                                        <option value="">{__('All Modes')}</option>
                                        <option value="1">{__('Direct Shipping')}</option>
                                        <option value="2">{__('Consolidated')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                                >
                                    {__('Apply Search Filters')}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { reset(); get(route('fan.go.index')) }}
                                    className="p-4 text-slate-400 hover:text-rose-500 bg-slate-100 rounded-2xl transition-all"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* --- 2. メインコンテンツグリッド (GO専用デザイン) --- */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {items.length > 0 ? items.map((item) => {
                        const progress = item.max_participants > 0 
                            ? Math.min(Math.round((item.participants_count / item.max_participants) * 100), 100) 
                            : 0; // 定員が設定されていない、または0の場合は進捗0%（または100%として扱う）

                        // 残り時間の取得
                        const daysLeft = getTimeLeft(item.recruitment_end_date);
                        
                        return (
                            <Link 
                                key={item.id} 
                                href={route('fan.go.detail', item.id)}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col"
                            >
                                {/* 画像エリア */}
                                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                    <img 
                                        src={item.images?.[0] ? `/storage/${item.images[0].file_path}` : placeholderImage} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                                            {item.creator?.name}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* 情報エリア */}
                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="font-black text-slate-900 mb-2 line-clamp-2 h-10 leading-tight group-hover:text-cyan-600 transition-colors uppercase italic">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400">
                                            <Users size={12} className="text-cyan-500" /> {item.participants_count || 0} {__('Participants')}
                                        </div>
                                    </div>

                                    {/* プログレスバー */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <span className="flex items-center gap-1"><TrendingUp size={10} /> {__('Progress')}</span>
                                            <span className="text-cyan-600">{progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* 下部ステータス */}
                                    <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 italic">
                                            <Clock size={14} className={daysLeft <= 3 ? 'text-rose-500' : 'text-slate-400'} />
                                            <span className={daysLeft <= 3 ? 'text-rose-500' : ''}>
                                                {daysLeft === 0 ? __('Ended') : `${daysLeft} ${__('Days Left')}`}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    }) : (
                        <div className="col-span-full py-40 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner">
                                <Box className="text-slate-200" size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-widest">{__('No matches found')}</h3>
                            <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">{__('Try adjusting your search filters')}</p>
                        </div>
                    )}
                </div>
            </div>
        </FanLayout>
    );
}