import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { Package, Calendar, ChevronRight, Users, Box } from 'lucide-react';

export default function GroupOrders({ groupOrders, language }) {
    const __ = (key) => (language && language[key]) ? language[key] : key;

    return (
        <FanLayout>
            <Head title={`${__('My Hosted Projects')} - CirclePort`} />

            <div className="max-w-6xl mx-auto px-8 py-16">
                {/* ヘッダー */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        {__('Organized Projects')}
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                        {__('Manage your active group orders and recruitment status')}
                    </p>
                </div>

                {groupOrders.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                        <Box className="mx-auto text-slate-300 mb-6" size={48} />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                            {__('No projects found')}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {groupOrders.map((go) => (
                            <Link 
                                key={go.id}
                                href={route('fan.go.show', go.id)}
                                className="group bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center gap-8 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-100 transition-all duration-500"
                            >
                                {/* クリエイターアイコン */}
                                {go.creator.image_url ? (
                                    // 画像がある場合
                                    <img 
                                        src={go.creator.image_url} 
                                        alt={go.creator.name} // アクセシビリティのためにaltを追加
                                        className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-50 group-hover:ring-cyan-100 transition-all"
                                    />
                                ) : (
                                    // 画像がない場合のダミー：イニシャルを表示
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-slate-50 group-hover:ring-cyan-100 transition-all text-slate-400 font-black text-3xl uppercase tracking-tighter">
                                        {/* クリエイター名の最初の1文字、または2文字を取得 */}
                                        {go.creator.name ? go.creator.name.substring(0, 1) : 'C'}
                                    </div>
                                )}

                                {/* メイン情報 */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${go.status_color}-50 text-${go.status_color}-600`}>
                                            {go.status_label}
                                        </span>
                                        {go.is_private && (
                                            <span className="bg-slate-900 text-white p-1 rounded-md">
                                                <Users size={12} />
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
                                        {go.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-6 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-300" />
                                            {new Date(go.recruitment_end_date).toLocaleDateString()} {__('Deadline')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={14} className={go.participants_count >= go.max_participants && go.max_participants > 0 ? 'text-cyan-500' : 'text-slate-300'} />
                                            <span className="flex items-center gap-1">
                                                <span className={go.participants_count >= go.max_participants && go.max_participants > 0 ? 'text-cyan-600 font-black' : 'text-slate-600'}>
                                                    {go.participants_count}
                                                </span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-slate-500">
                                                    {go.max_participants > 0 ? go.max_participants : '∞'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package size={14} className="text-slate-300" />
                                            {go.items_count} {__('Items')}
                                        </div>
                                    </div>
                                </div>

                                {/* アクション */}
                                <div className="shrink-0 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </FanLayout>
    );
}