import React, { useMemo, useState } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import ShareSection from '@/Components/models/go/GoCreateForm/ShareSection';
import { formatCurrency } from '@/Utils/helpers';
import { 
    Package, Users, Info, ShieldCheck, Clock, MapPin, Rocket, 
    TrendingUp, AlertCircle, ChevronRight, Minus, Plus, CreditCard,
    AlertTriangle, Check, Home, UserCheck, Heart
} from 'lucide-react';

export default function Show({ go, addresses = [], language, previousOrder = null }) {
    const { auth, currency } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const [isAgreed, setIsAgreed] = useState(false);
    const safeItems = go?.items || [];
    const GO_FEE_RATE = 0.05;
    
    const currentQty = go?.current_quantity || 0;
    const minQty = go?.min_quantity || 1;
    const progressPercent = Math.min(Math.round((currentQty / minQty) * 100), 100);
    const isGoalMet = currentQty >= minQty;

    const timeLeft = useMemo(() => {
        if (!go.recruitment_end_date) return null;
        const diff = new Date(go.recruitment_end_date) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    }, [go.recruitment_end_date]);

    const isExpired = timeLeft === 0;

    // --- フォーム管理 (チップ額を追加) ---
    const { data, setData, post, processing } = useForm({
        items: safeItems.map(item => ({ 
            id: item?.id,
            product_id: item?.product_id,
            variant_id: item?.product_variant_id || null,
            quantity: 0, 
            price: item?.price || 0,
            name: item?.product?.translations?.[0]?.name || 'Item'
        })),
        address_id: (addresses || [])?.find(a => a.is_default)?.id || (addresses?.[0]?.id) || '',
        tip_amount: 0, // クリエイターへのチップ
        total_amount: 0
    });

    const goodsTotal = useMemo(() => {
        return data.items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    }, [data.items]);

    const goFee = useMemo(() => {
        return Math.ceil(goodsTotal * GO_FEE_RATE);
    }, [goodsTotal]);

    // 最終合計金額の計算 (チップを加算)
    const totalAmount = useMemo(() => {
        const tip = Number(data.tip_amount) || 0;
        return goodsTotal > 0 ? goodsTotal + goFee + tip : 0;
    }, [goodsTotal, goFee, data.tip_amount]);

    const handleQtyChange = (index, newQty) => {
        const val = Math.max(0, parseInt(newQty) || 0);
        const newItems = [...data.items];
        newItems[index].quantity = val;
        setData('items', newItems);
    };

    const handleTipChange = (amount) => {
        const value = Math.max(0, parseInt(amount) || 0);
        setData('tip_amount', value);
    };

    React.useEffect(() => {
        setData('total_amount', totalAmount);
    }, [totalAmount]);

    const handleRetryPayment = () => {
        if (!previousOrder) return;
        router.post(route('fan.orders.retry', previousOrder.id));
    };

    return (
        <FanLayout>
            <Head title={`${go.title} - Group Order`} />

            <div className="min-h-screen bg-slate-50/50 pb-20">
                {/* パンくずリスト */}
                <div className="bg-white border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <Link href={route('fan.products.index')} className="hover:text-cyan-600 transition-all">{__('Explore')}</Link>
                            <ChevronRight size={10} />
                            <Link href={route('fan.go.index')} className="hover:text-cyan-600 transition-all">{__('Group Orders')}</Link>
                            <ChevronRight size={10} />
                            <span className="text-slate-900">{go.title}</span>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    {previousOrder?.payment_status === 'failed' && (
                        <div className="mb-12 bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl shadow-rose-100/50">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                                    <AlertTriangle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-rose-900 mb-1">{__('Payment Failed')}</h3>
                                    <p className="text-sm text-rose-700 font-bold">{__('Your previous payment attempt was unsuccessful. Please retry to secure your spot.')}</p>
                                </div>
                            </div>
                            <button onClick={handleRetryPayment} className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">
                                {__('Retry Now')}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-10">
                            
                            {/* 達成状況セクション */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-100/50 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-widest"><TrendingUp size={12} /> {__('Live Progress')}</span>
                                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{currentQty.toLocaleString()} <span className="text-xl text-slate-400 font-bold ml-2">/ {minQty.toLocaleString()} {__('Items')}</span></h2>
                                    </div>
                                    <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-slate-100 pl-6 md:pl-0 md:pr-6">
                                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest mb-1">{__('Time Remaining')}</span>
                                        <span className={`text-3xl font-black italic ${isExpired ? 'text-slate-300' : 'text-rose-500'}`}>{isExpired ? __('Ended') : `${timeLeft} ${__('Days')}`}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 ${isGoalMet ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-cyan-500'}`} style={{ width: `${progressPercent}%` }}>
                                            {progressPercent > 10 && <span className="text-[10px] font-black text-white">{progressPercent}%</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                        <span>0%</span>
                                        <span>{isGoalMet ? __('Goal Reached!') : `${__('Target')}: ${minQty}`}</span>
                                    </div>
                                </div>
                            </div>

                            {/* アイテムリスト */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 ml-2"><Package size={16} /> {__('Available Items')}</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {data.items.map((item, index) => (
                                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-black italic border border-slate-50">IMG</div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                                                    <p className="text-sm font-bold text-cyan-600 mt-1">¥{Number(item.price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                                                <button type="button" onClick={() => handleQtyChange(index, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"><Minus size={16} /></button>
                                                <input type="number" value={item.quantity} onChange={(e) => handleQtyChange(index, e.target.value)} className="w-12 bg-transparent border-none text-center font-black text-sm focus:ring-0" />
                                                <button type="button" onClick={() => handleQtyChange(index, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"><Plus size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- 応援チップセクション --- */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-500">
                                        <Heart size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{__('Support the Creator')}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{__('Add a tip for')} {go.creator?.name}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 items-center">
                                    {[500, 1000, 2000].map(amt => (
                                        <button 
                                            key={amt}
                                            type="button"
                                            onClick={() => handleTipChange(amt)}
                                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${data.tip_amount === amt ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-100 scale-105' : 'bg-white border-slate-200 text-slate-500 hover:border-cyan-300'}`}
                                        >
                                            +¥{amt.toLocaleString()}
                                        </button>
                                    ))}
                                    
                                    <div className="relative flex-1 min-w-[180px]">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">¥</span>
                                        <input 
                                            type="number"
                                            placeholder={__('Custom tip amount')}
                                            value={data.tip_amount || ''}
                                            onChange={(e) => handleTipChange(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium italic flex items-center gap-1.5">
                                    <Info size={12} /> {__('Tips are optional and go directly to the creator. No extra fees applied.')}
                                </p>
                            </div>

                            {/* 利用規約と同意 */}
                            <div className="bg-amber-50/50 rounded-[2.5rem] p-10 border border-amber-100 space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-700 flex items-center gap-3"><AlertTriangle size={18} /> {__('Important Terms & Shipping')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            {go.shipping_mode === 'bulk_to_gom' ? <Home className="text-amber-600" size={18} /> : <UserCheck className="text-amber-600" size={18} />}
                                            <h4 className="text-[11px] font-black uppercase text-amber-900">
                                                {go.shipping_mode === 'bulk_to_gom' ? __('Bulk Delivery to GOM') : __('Direct Individual Delivery')}
                                            </h4>
                                        </div>
                                        <p className="text-[11px] text-amber-800 leading-relaxed font-bold">
                                            {go.shipping_mode === 'bulk_to_gom' 
                                                ? __('All items will be sent to the GOM in one box. Participants split the international shipping fee for big savings!') 
                                                : __('Items are sent directly to each participant from our warehouse. Participants split the domestic shipping cost from the creator.')}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-[11px] font-black uppercase text-amber-900">{__('No Cancellations')}</h4>
                                        <p className="text-[11px] text-amber-800 leading-relaxed font-bold">{__('Once the goal is met, cancellations are not accepted to ensure the shipping split remains fair for everyone.')}</p>
                                    </div>
                                </div>
                                
                                <label className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-amber-200 cursor-pointer hover:bg-amber-100 transition-all group">
                                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isAgreed ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-amber-300'}`}>
                                        <input type="checkbox" className="hidden" checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} />
                                        {isAgreed && <Check size={18} strokeWidth={4} />}
                                    </div>
                                    <span className="text-[11px] font-black uppercase text-amber-900 tracking-tight">{__('I agree to the shipping terms and payment policy.')}</span>
                                </label>
                            </div>
                        </div>

                        {/* 注文サマリー（右サイド） */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="sticky top-24 space-y-6">
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-white/10 pb-4">{__('Order Summary')}</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">{__('Organizer')}</span><span className="flex items-center gap-2 text-cyan-400"><Users size={14} /> {go.creator?.name}</span></div>
                                            <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">{__('Deadline')}</span><span className="flex items-center gap-2 text-rose-400"><Clock size={14} /> {go.recruitment_end_date}</span></div>
                                        </div>
                                        <div className="space-y-3 pt-6 border-t border-white/10">
                                            <div className="flex justify-between items-center text-sm text-slate-400"><span>{__('Goods Total')}</span><span className="font-black text-white">¥{goodsTotal.toLocaleString()}</span></div>
                                            <div className="flex justify-between items-center text-sm text-slate-400"><span>{__('GO Order Fee (5%)')}</span><span className="font-black text-white">¥{goFee.toLocaleString()}</span></div>
                                            
                                            {/* チップ内訳の表示 */}
                                            {data.tip_amount > 0 && (
                                                <div className="flex justify-between items-center text-sm text-cyan-400">
                                                    <span className="flex items-center gap-1"><Heart size={12} fill="currentColor" /> {__('Creator Tip')}</span>
                                                    <span className="font-black">+¥{Number(data.tip_amount).toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-sm font-black text-white pt-2">
                                                <span>{__('Payable Now')}</span>
                                                <div className="text-right">
                                                    <span className="text-cyan-400 text-2xl tracking-tighter">
                                                        {formatCurrency(totalAmount, currency)}
                                                    </span>
                                                    {currency.code !== 'JPY' && (
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase">(≈ ¥{totalAmount.toLocaleString()})</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {previousOrder?.payment_status !== 'failed' && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{__('Shipping Destination')}</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <select className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-cyan-500 transition-all appearance-none" value={data.address_id} onChange={e => setData('address_id', e.target.value)}>
                                                    <option value="">{__('Select Address')}</option>
                                                    {addresses.map(addr => (
                                                        <option key={addr.id} value={addr.id}>{addr.address_line1}, {addr.country?.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        {!auth.fan ? (
                                            <Link href={route('fan.login')} className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black uppercase text-sm text-center block hover:bg-cyan-500 hover:text-white transition-all shadow-lg">{__('Login to Participate')}</Link>
                                        ) : previousOrder?.payment_status === 'failed' ? (
                                            <button onClick={handleRetryPayment} disabled={processing || !isAgreed} className="w-full bg-rose-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-rose-600 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-30">
                                                <CreditCard size={18} />{processing ? __('Processing...') : __('Retry Payment Now')}
                                            </button>
                                        ) : (
                                            <button onClick={() => post(route('fan.go.join', go.id))} disabled={processing || totalAmount === 0 || isExpired || !isAgreed} className={`w-full py-6 rounded-2xl font-black uppercase text-sm transition-all shadow-lg flex items-center justify-center gap-3 ${(!isAgreed || processing || totalAmount === 0 || isExpired) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-white hover:text-slate-900'}`}>
                                                {isExpired ? <AlertCircle size={18} /> : <Rocket size={18} />}
                                                {isExpired ? __('Ended') : (processing ? __('Processing...') : __('Join Box'))}
                                            </button>
                                        )}
                                        {!isAgreed && auth.fan && <p className="text-[9px] text-rose-400 font-bold mt-4 text-center animate-pulse">{__('Please agree to terms to proceed')}</p>}
                                    </div>
                                </div>

                                <ShareSection go={go} language={language} />

                                <div className="p-6 bg-slate-100 rounded-[2rem] border border-slate-200">
                                    <div className="flex items-center gap-3 text-slate-900 mb-2"><Info size={16} /><span className="text-[10px] font-black uppercase tracking-widest">{__('Shipping Info')}</span></div>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{__('International shipping fees will be calculated once the items arrive at our warehouse.')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}