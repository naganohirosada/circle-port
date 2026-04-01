import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, ChevronLeft, Home } from 'lucide-react';

export default function Index({ addresses }) {
    const { language } = usePage().props;
    // 憲法：多言語対応用ヘルパー
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 削除処理（論理削除）
    const handleDelete = (id) => {
        if (confirm(__('Are you sure you want to delete this address?'))) {
            router.delete(route('fan.mypage.addresses.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <FanLayout>
            <Head title={`${__('Shipping Addresses')} - CirclePort`} />

            <div className="max-w-[1000px] mx-auto px-6 py-16">
                
                {/* パンくず・戻る導線 */}
                <Link 
                    href={route('fan.mypage.dashboard')} 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 mb-12 transition-colors"
                >
                    <ChevronLeft size={14} /> {__('Back to My Page')}
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 text-cyan-600 mb-2">
                            <Home size={20} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">{__('Account Settings')}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {__('Shipping Addresses')}
                        </h1>
                    </div>

                    <Link 
                        href={route('fan.mypage.addresses.create')} 
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={18} /> {__('Add New Address')}
                    </Link>
                </div>

                {/* 住所リスト */}
                {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {addresses.map((addr) => (
                            <div 
                                key={addr.id} 
                                className={`group relative p-10 rounded-[3rem] border-2 transition-all duration-500 ${
                                    addr.is_default 
                                    ? 'border-cyan-500 bg-cyan-50/30 shadow-2xl shadow-cyan-100' 
                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`p-4 rounded-2xl ${addr.is_default === 1 ? 'bg-cyan-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                        <MapPin size={24} />
                                    </div>

                                    {addr.is_default === 1 && (
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 bg-white px-4 py-2 rounded-full border border-cyan-100 shadow-sm">
                                            <CheckCircle2 size={12} strokeWidth={3} /> {__('Default')}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{__('Recipient')}</p>
                                        <p className="text-lg font-bold text-slate-900">{addr.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{__('Address')}</p>
                                        <div className="text-sm text-slate-600 leading-relaxed font-medium">
                                            <p>{addr.postal_code}</p>
                                            <p>{addr.country?.name} {addr.state} {addr.city}</p>
                                            <p>{addr.address_line1}</p>
                                            {addr.address_line2 && <p>{addr.address_line2}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{__('Phone Number')}</p>
                                        <p className="text-sm font-bold text-slate-700">{addr.phone}</p>
                                    </div>
                                </div>

                                {/* 操作アクション */}
                                <div className="flex gap-6 mt-10 pt-8 border-t border-slate-100/50">
                                    <Link 
                                        href={route('fan.mypage.addresses.edit', addr.id)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-colors"
                                    >
                                        <Edit2 size={14} /> {__('Edit')}
                                    </Link>
                                    {!addr.is_default && (
                                        <button 
                                            onClick={() => handleDelete(addr.id)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-500 transition-colors"
                                        >
                                            <Trash2 size={14} /> {__('Delete')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 空の状態 */
                    <div className="text-center py-32 bg-slate-50 rounded-[4rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <MapPin size={40} />
                        </div>
                        <p className="text-slate-400 font-bold mb-8">{__('No addresses registered yet.')}</p>
                        <Link 
                            href={route('fan.mypage.addresses.create')} 
                            className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-lg shadow-slate-200"
                        >
                            {__('Add New Address')}
                        </Link>
                    </div>
                )}
            </div>
        </FanLayout>
    );
}