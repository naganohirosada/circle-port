// resources/js/Pages/Creator/Settings/Profile.jsx

import React, { useEffect, useState } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, Save, Type, AlignLeft, AtSign, Mail, CheckCircle2, X } from 'lucide-react';

export default function Profile({ creator, language }) {
    const __ = (key) => language?.[key] || key;

    const { data, setData, post, processing, errors } = useForm({
        name: creator?.name ?? '',
        email: creator?.email ?? '', // creatorテーブルのカラム名に合わせる
        shop_name: creator?.shop_name ?? '',
        profile: creator?.profile ?? '',
        profile_image: creator?.profile_image ?? null,
        cover_image: creator?.cover_image ?? null,
        x_id: creator?.x_id ?? '',
        pixiv_id: creator?.pixiv_id ?? '',
        bluesky_id: creator?.bluesky_id ?? '',
        instagram_id: creator?.instagram_id ?? '',
        booth_url: creator?.booth_url ?? '',
        fanbox_url: creator?.fanbox_url ?? '',
    });

    const defaultCover = "https://placehold.jp/24/eeeeee/cccccc/1500x500.png?text=%20";
    const defaultProfile = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator?.name || 'C')}&background=random&size=200`;

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.settings.profile.update'), {
            preserveScroll: true,
            onError: (errors) => {
                // これで、どの項目がバリデーションエラーになっているかコンソールに表示されます
                console.log("バリデーションエラー内容:", errors);
            }
        });
    };

    const { flash } = usePage().props; // Inertiaのフラッシュメッセージを取得
    const [showFlash, setShowFlash] = useState(false); // 通知バーの表示フラグ

    useEffect(() => {
        if (flash.message) {
            setShowFlash(true);
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 5000); // 5秒後に自動で消える
            return () => clearTimeout(timer);
        }
    }, [flash.message]);

    return (
        <CreatorLayout>
            <Head title={__('プロフィール編集')} />

            <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showFlash ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}>
                <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl border border-cyan-500/30 flex items-center gap-4 min-w-[320px] backdrop-blur-xl">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-0.5">Success</p>
                        <p className="text-sm font-bold">{flash.message}</p>
                    </div>
                    <button onClick={() => setShowFlash(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-4xl mx-auto pb-24">
                <div className="mb-10">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
                        <Type className="text-cyan-400" size={24} />
                        Edit Profile
                    </h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        {__('ファンの目に触れるあなたの情報を編集します')}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    
                    {/* --- ビジュアル編集セクション --- */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-48 md:h-64 bg-slate-100 relative group">
                            <img 
                                src={data.cover_image ? URL.createObjectURL(data.cover_image) : (creator?.cover_image ? `/storage/${creator.cover_image}` : defaultCover)} 
                                className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                                alt="Cover"
                            />
                            <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20">
                                <div className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 border border-slate-100 shadow-2xl">
                                    <Camera className="text-cyan-500" size={18} />
                                    {__('Change Cover')}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={e => setData('cover_image', e.target.files[0])} />
                            </label>
                        </div>

                        <div className="px-10 pb-10 relative">
                            <div className="relative -mt-16 md:-mt-20 inline-block group">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white overflow-hidden bg-white shadow-2xl">
                                    <img 
                                        src={data.profile_image ? URL.createObjectURL(data.profile_image) : (creator?.profile_image ? `/storage/${creator.profile_image}` : defaultProfile)} 
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                </div>
                                <label className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-30 backdrop-blur-sm">
                                    <Camera className="text-white" size={28} />
                                    <input type="file" className="hidden" accept="image/*" onChange={e => setData('profile_image', e.target.files[0])} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* --- テキスト情報編集セクション --- */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* クリエイター名 */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest ml-1">
                                    <Type size={14} className="text-cyan-400" /> {__('Creator Name')}
                                </label>
                                <input 
                                    type="text" 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                />
                                {errors.name && <p className="text-rose-500 text-[10px] font-black uppercase ml-1 italic">{errors.name}</p>}
                            </div>

                            {/* クリエイター用メールアドレス */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest ml-1">
                                    <Mail size={14} className="text-cyan-400" /> {__('Contact Email')}
                                </label>
                                <input 
                                    type="email" 
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    placeholder="contact@example.com"
                                />
                                {errors.email && <p className="text-rose-500 text-[10px] font-black uppercase ml-1 italic">{errors.email}</p>}
                            </div>

                            {/* ショップID */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest ml-1">
                                    <AtSign size={14} className="text-cyan-400" /> {__('Shop ID')}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">@</span>
                                    <input 
                                        type="text" 
                                        value={data.shop_name}
                                        onChange={e => setData('shop_name', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 pl-12 pr-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    />
                                </div>
                                {errors.shop_name && <p className="text-rose-500 text-[10px] font-black uppercase ml-1 italic">{errors.shop_name}</p>}
                            </div>
                        </div>

                        {/* 自己紹介 */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest ml-1">
                                <AlignLeft size={14} className="text-cyan-400" /> {__('Profile')}
                            </label>
                            <textarea 
                                rows="6"
                                value={data.profile}
                                onChange={e => setData('profile', e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all resize-none"
                            />
                            {errors.profile && <p className="text-rose-500 text-[10px] font-black uppercase ml-1 italic">{errors.profile}</p>}
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-500">
                                    <AtSign size={18} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Social Links</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* X (Twitter) */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">X (Twitter) ID</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">@</span>
                                        <input type="text" value={data.x_id} onChange={e => setData('x_id', e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 pl-12 pr-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                            placeholder="Twitter_ID" />
                                    </div>
                                </div>

                                {/* Pixiv */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pixiv ID</label>
                                    <input type="text" value={data.pixiv_id} onChange={e => setData('pixiv_id', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                        placeholder="12345678" />
                                </div>

                                {/* Bluesky */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Bluesky ID</label>
                                    <input type="text" value={data.bluesky_id} onChange={e => setData('bluesky_id', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                        placeholder="handle.bsky.social" />
                                </div>

                                {/* Instagram */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Instagram ID</label>
                                    <input type="text" value={data.instagram_id} onChange={e => setData('instagram_id', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                        placeholder="insta_user" />
                                </div>

                                {/* BOOTH URL */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">BOOTH URL</label>
                                    <input type="url" value={data.booth_url} onChange={e => setData('booth_url', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                        placeholder="https://yourshop.booth.pm" />
                                </div>

                                {/* FANBOX / Fantia URL */}
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">FANBOX / Fantia URL</label>
                                    <input type="url" value={data.fanbox_url} onChange={e => setData('fanbox_url', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                        placeholder="https://yourpage.fanbox.cc" />
                                </div>
                            </div>
                        </div>

                        {/* 保存ボタン */}
                        <div className="pt-6">
                            <button 
                                type="submit"
                                disabled={processing}
                                className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${processing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-cyan-500 active:scale-[0.98]'}`}
                            >
                                <Save size={20} />
                                {processing ? __('Saving...') : __('Save Changes')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </CreatorLayout>
    );
}