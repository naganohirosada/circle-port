import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    Package, Calendar, Users, MapPin, 
    ArrowLeft, ExternalLink, Info, CheckCircle2 
} from 'lucide-react';

export default function GroupOrderDetail({ go, language }) {
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const labelStyle = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block";

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        
        // 正しくない日付データの場合はハイフンを返す
        if (isNaN(date.getTime())) return '---';

        // language.locale (例: 'ja', 'en', 'th') があればそれを使用、なければブラウザ設定
        const locale = language?.locale || 'ja-JP';
        
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            // 時刻も必要な場合は以下を追加
            // hour: '2-digit',
            // minute: '2-digit'
        });
    };

    return (
        <FanLayout>
            <Head title={`${go.title} - ${__('Management')}`} />

            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* 戻るボタン & ヘッダー */}
                <div className="mb-10">
                    <Link href={route('fan.go.managed')} className="flex items-center gap-2 text-slate-400 hover:text-cyan-600 font-bold transition-colors mb-6 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {__('Back to List')}
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${go.status_color}-50 text-${go.status_color}-600 border border-${go.status_color}-100`}>
                                    {go.status_label}
                                </span>
                                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white">
                                    {go.shipping_mode === 'bulk' ? __('Bulk Shipping') : __('Individual Shipping')}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{go.title}</h1>
                        </div>
                        
                        <div className="flex gap-4">
                            <button className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-slate-300 transition-all">
                                {__('Edit Project')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:col-span-12 grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* 左カラム：メイン情報 */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* アイテムリスト */}
                        <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Package className="text-cyan-500" size={24} />
                                {__('Items to Collect')}
                            </h3>
                            <div className="grid gap-4">
                                {go.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div>
                                            <div className="font-black text-slate-900 uppercase tracking-wide">{item.item_name}</div>
                                            <div className="text-xs text-slate-400 font-bold uppercase mt-1">
                                                Limit: {item.stock_limit} / Price: ¥{item.price.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-xl font-black text-slate-900">
                                            ¥{item.price.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 参加者リスト（住所の出し分け） */}
                        <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                            <div className="p-10 border-b border-slate-50">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <Users className="text-cyan-500" size={24} />
                                    {__('Participant List')} ({go.participants_count})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">{__('Fan')}</th>
                                            {go.shipping_mode === 'bulk' && (
                                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">{__('Shipping Address')}</th>
                                            )}
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 text-right">{__('Joined Date')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {go.participants.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                                            {p.fan.image_url ? <img src={p.fan.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase">{p.fan.name[0]}</div>}
                                                        </div>
                                                        <span className="font-black text-slate-900 uppercase text-sm">{p.fan.name}</span>
                                                    </div>
                                                </td>
                                                {go.shipping_mode === 'bulk' && (
                                                    <td className="px-8 py-6">
                                                        {p.fan.default_address ? (
                                                            <div className="text-xs font-bold text-slate-600 leading-relaxed">
                                                                <div>{p.fan.default_address.postal_code}</div>
                                                                <div>{p.fan.default_address.prefecture}{p.fan.default_address.city}{p.fan.default_address.address1}</div>
                                                                <div className="text-slate-400">{p.fan.default_address.name}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-amber-500 uppercase">{__('No Address Set')}</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* 右カラム：サイドバー */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* プロジェクト概要 */}
                        <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-xl">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-6 block">{__('Project Brief')}</label>
                            
                            <div className="space-y-8">
                                <div>
                                    <div className={labelStyle}>{__('Target Creator')}</div>
                                    <div className="flex items-center gap-3">
                                        {go.creator.image_url ? (
                                            // クリエイター画像がある場合
                                            <img 
                                                src={go.creator.image_url} 
                                                alt={go.creator.name} 
                                                className="w-8 h-8 rounded-full object-cover" 
                                            />
                                        ) : (
                                            // 画像がない場合のダミー：イニシャルを表示
                                            // 背景をSlate 700、文字をSlate 400に設定（黒背景カード用）
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-black text-base uppercase">
                                                {go.creator.name ? go.creator.name.substring(0, 1) : 'C'}
                                            </div>
                                        )}
                                        <span className="font-black uppercase tracking-widest text-sm text-white">{go.creator.name}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={labelStyle}>{__('Recruitment Period')}</div>
                                    <div className="font-black text-sm uppercase tracking-wider text-white">
                                        {formatDate(go.recruitment_start_date)} — {formatDate(go.recruitment_end_date)}
                                    </div>
                                </div>
                                <div>
                                    <div className={labelStyle}>{__('Description')}</div>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed whitespace-pre-wrap">
                                        {go.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* クイック統計 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6">
                                <div className={labelStyle}>{__('Goal')}</div>
                                <div className="text-2xl font-black text-slate-900">
                                    {go.participants_count}<span className="text-slate-300 text-sm ml-1">/ {go.max_participants || '∞'}</span>
                                </div>
                            </div>
                            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6">
                                <div className={labelStyle}>{__('Total Value')}</div>
                                <div className="text-2xl font-black text-slate-900">
                                    <span className="text-sm">¥</span>{(go.participants_count * go.items[0]?.price).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}