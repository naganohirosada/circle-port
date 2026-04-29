import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { Users, Package, Rocket, ChevronRight, LayoutGrid, Box } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function Show({ creator, artworks, groupOrders, isFollowing, language, filters }) {
    const __ = (key) => language?.[key] || key;
    const [activeTab, setActiveTab] = useState(filters.tab || 'artwork');

    const { post, processing } = useForm();
    const toggleFollow = () => post(route('fan.creator.follow', creator.id), { preserveScroll: true });

    // --- X風：スリムヘッダーとダミー画像の設定 ---
    const coverImage = creator.cover_image 
        ? `/storage/${creator.cover_image}` 
        : "https://placehold.jp/24/eeeeee/cccccc/1500x500.png?text=%20";

    const profileImage = creator.profile_image 
        ? `/storage/${creator.profile_image}` 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random&size=200`;

    const placeholderImage = "https://placehold.jp/24/cccccc/ffffff/400x300.png?text=No%20Image";

    return (
        <FanLayout>
            <Head title={`${creator.name} (@${creator.shop_name || creator.id})`} />

            {/* --- 1. X風スリムカバー (高さをさらに抑制) --- */}
            <div 
                className="w-full bg-slate-100 relative" 
                style={{ height: 'clamp(120px, 15vw, 180px)' }} // 最小120px、最大180pxで可変
            >
                <img src={coverImage} className="w-full h-full object-cover" alt="" />
            </div>

            {/* --- 2. プロフィール情報 (一切の被り・崩れを排除) --- */}
            <div className="bg-white">
                <div className="max-w-5xl mx-auto px-4 md:px-6 relative">
                    
                    {/* アイコンとボタンの行 */}
                    <div className="flex justify-between items-end h-16 md:h-20">
                        {/* アイコンを境界線上に配置 */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm -mt-12 md:-mt-16 z-20">
                            <img src={profileImage} className="w-full h-full object-cover" alt="" />
                        </div>

                        {/* アクションボタン */}
                        <div className="pb-2">
                            <button 
                                onClick={toggleFollow}
                                disabled={processing}
                                className={`px-5 py-1.5 md:px-7 md:py-2 rounded-full font-black text-sm transition-all border ${
                                    isFollowing 
                                    ? 'bg-white text-slate-900 border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600' 
                                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-md'
                                }`}
                            >
                                {isFollowing ? __('Following') : __('Follow')}
                            </button>
                        </div>
                    </div>

                    {/* クリエイター名・ID・自己紹介 (余白を十分に確保) */}
                    <div className="mt-4 pb-10 space-y-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                                {creator.name}
                            </h1>
                            <p className="text-slate-500 font-bold text-sm tracking-tight">
                                @{creator.shop_name || 'id_' + creator.id}
                            </p>
                        </div>

                        {/* テーブル定義に合わせた自己紹介項目 (creator.profile) */}
                        <div className="max-w-2xl">
                            <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                                {creator.profile || __("Welcome to my shop!")}
                            </p>
                        </div>

                        {/* フォロワー・アートワーク数 */}
                        <div className="flex gap-5 text-sm pt-2">
                            <div className="flex items-center gap-1 group cursor-pointer">
                                <span className="font-black text-slate-900">{creator.followers_count || 0}</span>
                                <span className="text-slate-500 font-medium">{__('Followers')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-black text-slate-900">{creator.products_count || 0}</span>
                                <span className="text-slate-500 font-medium">{__('Artworks')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. タブナビゲーション (中央寄せをやめ、X風に左寄せ) --- */}
            <div className="max-w-5xl mx-auto px-4 md:px-6">
                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setActiveTab('artwork')}
                        className={`px-6 md:px-10 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                            activeTab === 'artwork' ? 'text-slate-900' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        {__('Artwork')}
                        {activeTab === 'artwork' && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 rounded-full" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('go')}
                        className={`px-6 md:px-10 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                            activeTab === 'go' ? 'text-slate-900' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        {__('Group Order')}
                        {activeTab === 'go' && <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 rounded-full" />}
                    </button>
                </div>

                {/* --- 4. 一覧コンテンツ (余白をたっぷり確保) --- */}
                <div className="py-12 min-h-[500px]">
                    {activeTab === 'artwork' ? (
                        <div className="space-y-12">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                                {artworks.data.map(art => (
                                    <Link key={art.id} href={route('fan.products.show', art.id)} className="group block">
                                        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3 group-hover:shadow-lg transition-all duration-300 border border-slate-100">
                                            <img 
                                                src={art.images?.[0] ? `/storage/${art.images[0].file_path}` : placeholderImage} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                            />
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 leading-tight">{art.translations?.[0]?.name}</h3>
                                        <p className="text-slate-900 font-black mt-1 text-sm">¥{Number(art.price).toLocaleString()}</p>
                                    </Link>
                                ))}
                            </div>
                            <div className="flex justify-center pt-10 border-t border-slate-50">
                                <Pagination links={artworks.links} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {groupOrders.data.map(go => (
                                    <Link key={go.id} href={route('fan.go.detail', go.id)} className="bg-white border border-slate-100 rounded-2xl overflow-hidden group hover:shadow-xl transition-all p-4">
                                        <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4">
                                            <img src={go.images?.[0] ? `/storage/${go.images[0].file_path}` : placeholderImage} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="font-black text-slate-900 line-clamp-1 text-base">{go.title}</h3>
                                        <div className="mt-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5"><Users size={14} className="text-cyan-500" /> {go.participants_count} {__('Participants')}</div>
                                            <ChevronRight size={16} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="flex justify-center pt-10 border-t border-slate-50">
                                <Pagination links={groupOrders.links} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FanLayout>
    );
}