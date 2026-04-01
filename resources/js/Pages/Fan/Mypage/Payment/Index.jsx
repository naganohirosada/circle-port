import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { CreditCard, Plus, Trash2, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';

export default function Index({ payments }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;

    // 優先決済方法に設定
    const handleSetDefault = (id) => {
        router.patch(route('fan.mypage.payments.make-default', id), {}, {
            preserveScroll: true,
        });
    };

    // 決済方法の削除（論理削除）
    const handleDelete = (id) => {
        if (confirm(__('Are you sure you want to remove this payment method?'))) {
            router.delete(route('fan.mypage.payments.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <FanLayout>
            <Head title={`${__('Payment Methods')} - CirclePort`} />

            <div className="max-w-[1000px] mx-auto px-6 py-16">
                
                {/* 戻る導線 */}
                <Link 
                    href={route('fan.mypage.dashboard')} 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 mb-12 transition-colors"
                >
                    <ChevronLeft size={14} /> {__('Back to My Page')}
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 text-cyan-600 mb-2">
                            <CreditCard size={20} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">{__('Billing Settings')}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {__('Payment Methods')}
                        </h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">
                            {__('Securely manage your global payment options')}
                        </p>
                    </div>

                    <Link 
                        href={route('fan.mypage.payments.create')} 
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={18} /> {__('Add New Method')}
                    </Link>
                </div>

                {/* 支払い方法リスト */}
                <div className="space-y-6">
                    {payments.length > 0 ? (
                        payments.map((method) => (
                            <div 
                                key={method.id} 
                                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-8 md:p-10 rounded-[3rem] border-2 transition-all duration-500 ${
                                    method.is_default === 1 
                                    ? 'border-cyan-500 bg-cyan-50/30 shadow-2xl shadow-cyan-100' 
                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-8">
                                    {/* カードブランド表示（簡易版） */}
                                    <div className="w-20 h-12 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">Brand</span>
                                        <span className="text-[10px] font-black italic uppercase">{method.brand || 'CARD'}</span>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-lg font-bold text-slate-900 tracking-wider">•••• •••• •••• {method.last4}</p>
                                            {method.is_default === 1 && (
                                                <ShieldCheck size={16} className="text-cyan-500" strokeWidth={3} />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                            {__('Expires')} {method.exp_month}/{method.exp_year}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-6 md:mt-0 w-full md:w-auto border-t md:border-none pt-6 md:pt-0 border-slate-100">
                                    {method.is_default === 1 ? (
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 bg-white px-5 py-2.5 rounded-full border border-cyan-100 shadow-sm">
                                            <CheckCircle2 size={12} strokeWidth={3} /> {__('Primary')}
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => handleSetDefault(method.id)}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 transition-colors bg-slate-50 px-5 py-2.5 rounded-full hover:bg-white border border-transparent hover:border-slate-100"
                                        >
                                            {__('Set as Primary')}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(method.id)}
                                        className="p-3 text-slate-300 hover:text-pink-500 transition-colors rounded-xl hover:bg-pink-50"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* 空の状態 */
                        <div className="text-center py-32 bg-slate-50 rounded-[4rem] border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <CreditCard size={40} />
                            </div>
                            <p className="text-slate-400 font-bold mb-8">{__('No payment methods registered.')}</p>
                            <Link 
                                href={route('fan.mypage.payments.create')} 
                                className="inline-flex items-center gap-3 bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all shadow-lg shadow-slate-200"
                            >
                                {__('Add Your First Card')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* セキュリティバッジ */}
                <div className="mt-16 p-10 bg-slate-900 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="bg-cyan-500 p-4 rounded-2xl text-white shadow-xl shadow-cyan-900/20 shrink-0">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">{__('Secure Payment Processing')}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-[600px]">
                            {__('Your payment information is encrypted and processed securely through our payment partners. CirclePort does not store your full card number on our servers.')}
                        </p>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}