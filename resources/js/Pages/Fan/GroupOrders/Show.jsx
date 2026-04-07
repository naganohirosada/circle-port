import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    Package, ShoppingCart, Calendar, Users, 
    Info, ShieldCheck, Clock, MapPin, Rocket, CheckCircle2, JapaneseYen 
} from 'lucide-react';

export default function Show({ go, addresses = [], language }) {
    const { auth } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const safeItems = go?.items || [];
    const progress = Math.min((go?.participants_count / (go?.max_participants || 100)) * 100, 100);

    const { data, setData, post, processing } = useForm({
        items: safeItems.map(item => ({ 
            id: item?.id,
            product_id: item?.product_id,
            variant_id: item?.product_variant_id || null,
            quantity: 0, 
            price: item?.price || 0 
        })),
        address_id: (addresses || [])?.find(a => a.is_default)?.id || (addresses?.[0]?.id) || '',
        total_amount: 0
    });

    const handleQtyChange = (itemId, qty) => {
        const val = Math.max(0, parseInt(qty) || 0);
        const newItems = data.items.map(i => i.id === itemId ? { ...i, quantity: val } : i);
        const total = newItems.reduce((acc, i) => acc + (i.quantity * i.price), 0);
        setData(prev => ({ ...prev, items: newItems, total_amount: total }));
    };

    return (
        <FanLayout>
            <Head title={`${go?.title} - CirclePort`} />
            
            <div className="max-w-7xl mx-auto px-6 py-12">
                
                {/* 1. ヒーローセクション */}
                <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            {go?.is_private && (
                                <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck size={12} /> {__('Private')}
                                </span>
                            )}
                            <span className="bg-cyan-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-cyan-200">
                                {go?.status_label}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <Clock size={12} /> {__('Ends on')} {go?.recruitment_end_date ? new Date(go.recruitment_end_date).toLocaleDateString() : '--'}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            {go?.title}
                        </h1>
                        
                        <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2 text-slate-900 font-black">
                                    <Users size={18} className="text-cyan-500" />
                                    <span className="text-2xl">{go?.participants_count}</span>
                                    <span className="text-slate-400 text-sm uppercase">/ {go?.max_participants || '∞'} {__('Joined')}</span>
                                </div>
                                <span className="text-cyan-600 font-black text-sm">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-4 bg-slate-200 rounded-full overflow-hidden p-1">
                                <div 
                                    className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex items-center gap-5 shadow-xl shadow-slate-200/40">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-100 overflow-hidden shrink-0">
                            {go?.creator?.image_url ? (
                                <img src={go.creator.image_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-cyan-600 text-2xl">
                                    {go?.creator?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{__('Creator')}</p>
                            <h4 className="font-black text-slate-900 uppercase text-lg leading-tight">{go?.creator?.name}</h4>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* メリット：日本国内送料シェアの説明 */}
                        <div className="bg-cyan-50 border-2 border-cyan-100 rounded-[2.5rem] p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="flex items-center gap-2 text-cyan-900 font-black uppercase text-xs mb-3">
                                    <JapaneseYen size={16} className="bg-cyan-500 text-white rounded-full p-0.5" />
                                    {__('GO_COST_ADVANTAGE_TITLE')}
                                </h4>
                                <p className="text-xs font-medium text-cyan-700 leading-relaxed max-w-xl">
                                    {__('GO_COST_ADVANTAGE_DESC')}
                                </p>
                            </div>
                            <ShoppingCart size={120} className="absolute -right-8 -bottom-8 text-cyan-500 opacity-10 rotate-12" />
                        </div>

                        {/* 配送モードの説明 */}
                        <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${
                            go?.shipping_mode === 'individual' ? 'bg-white border-cyan-500 shadow-xl shadow-cyan-100' : 'bg-slate-50 border-slate-100'
                        }`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${go?.shipping_mode === 'individual' ? 'bg-cyan-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                                        {go?.shipping_mode === 'individual' ? <Rocket size={20} /> : <Users size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm text-slate-900 leading-none">
                                            {go?.shipping_mode === 'individual' ? __('Individual Shipping') : __('Bulk Shipping')}
                                        </h4>
                                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mt-1">
                                            {go?.shipping_mode === 'individual' ? __('Fast & Direct') : __('Cost Optimized')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs font-medium leading-relaxed text-slate-600">
                                {go?.shipping_mode === 'individual' ? __('INDIVIDUAL_SHIPPING_DESC') : __('BULK_SHIPPING_DESC')}
                            </p>
                            {go?.shipping_mode === 'individual' && (
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-cyan-700 bg-cyan-100/50 p-3 rounded-xl border border-cyan-100">
                                    <CheckCircle2 size={12} />
                                    {__('Note: Local delivery fees in your country are waived for this mode.')}
                                </div>
                            )}
                        </div>

                        {/* 二次決済の説明 */}
                        <div className={`p-8 rounded-[2.5rem] border-2 flex items-start gap-5 ${
                            go?.is_secondary_payment_required ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                        }`}>
                            <div className={`p-3 rounded-2xl shrink-0 ${go?.is_secondary_payment_required ? 'bg-amber-200 text-amber-600' : 'bg-emerald-200 text-emerald-600'}`}>
                                <Info size={24} />
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-sm mb-1 tracking-tight">
                                    {go?.is_secondary_payment_required ? __('Secondary Payment Required') : __('All-in Price')}
                                </h4>
                                <p className="text-xs font-medium leading-relaxed opacity-80">
                                    {go?.is_secondary_payment_required 
                                        ? __('Shipping and customs fees will be calculated and charged after the items arrive at our warehouse.')
                                        : __('International shipping and fees are included. No additional payment is required later.')
                                    }
                                </p>
                            </div>
                        </div>

                        {/* アイテムリスト */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                <Package size={16} className="text-cyan-500" /> {__('Available Items')}
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {safeItems.map((item) => (
                                    <div key={item.id} className="group bg-white border-2 border-slate-50 p-6 rounded-[2rem] hover:border-cyan-200 transition-all flex items-center justify-between shadow-sm hover:shadow-md">
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900 uppercase group-hover:text-cyan-600 transition-colors">{item.item_name}</p>
                                            <p className="text-cyan-500 font-black">¥{(item.price || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                                            <input 
                                                type="number" min="0" placeholder="0"
                                                className="w-16 bg-transparent border-none text-center font-black text-slate-900 focus:ring-0 outline-none"
                                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* GOについて */}
                        <section className="mt-16 pt-16 border-t border-slate-100">
                            <div className="bg-slate-50 rounded-[3rem] p-12 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">
                                        {__('What is a Group Order?')}
                                    </h3>
                                    <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                                        {__('GO_DESCRIPTION_TEXT')}
                                    </p>
                                </div>
                                <Rocket className="absolute -right-10 -bottom-10 text-slate-200/50 w-64 h-64 -rotate-12" />
                            </div>
                        </section>
                    </div>

                    {/* 右：注文サマリー */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-8 bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl">
                            <div className="flex items-center gap-2 mb-8">
                                <ShieldCheck size={20} className="text-cyan-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{__('Secure Checkout')}</span>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{__('Total')}</span>
                                    <span className="text-5xl font-black text-slate-900">¥{data.total_amount.toLocaleString()}</span>
                                </div>
                                
                                <div className="pt-8 border-t border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                                        <MapPin size={12} /> {__('Delivery Address')}
                                    </p>
                                    {auth.user ? (
                                        addresses?.length > 0 ? (
                                            <select 
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-xs font-black uppercase outline-none focus:border-cyan-500 transition-all"
                                                value={data.address_id}
                                                onChange={e => setData('address_id', e.target.value)}
                                            >
                                                {addresses.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Link href={route('fan.mypage.addresses.create')} className="block text-center py-4 border-2 border-dashed border-slate-200 rounded-2xl text-cyan-600 font-black text-[10px] uppercase hover:bg-cyan-50 transition-all">
                                                + {__('Add New Address')}
                                            </Link>
                                        )
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 text-[10px] font-black uppercase text-center">
                                            {__('Please login to continue')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {auth.user ? (
                                <button 
                                    onClick={() => post(route('fan.go.join', go.id))}
                                    disabled={processing || data.total_amount === 0}
                                    className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-cyan-600 transition-all shadow-xl disabled:opacity-30 disabled:hover:bg-slate-900 flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart size={18} /> {__('Confirm Participation')}
                                </button>
                            ) : (
                                <Link 
                                    href={route('login')}
                                    className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm text-center block"
                                >
                                    {__('Login to Participate')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}