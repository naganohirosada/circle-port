// resources/js/Pages/Fan/GroupOrders/Show.jsx

import React, { useMemo, useState } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import ShareSection from '@/Components/models/go/GoCreateForm/ShareSection';
import { renderDualCurrency } from '@/Utils/helpers';
import { 
    Package, Users, Info, ShieldCheck, Clock, MapPin, Rocket, 
    TrendingUp, AlertCircle, ChevronRight, Minus, Plus, CreditCard,
    AlertTriangle, Check, Home, UserCheck, Heart, CheckCircle, Globe, Sparkles
} from 'lucide-react';

export default function Show({ go, addresses = [], language, previousOrder = null, isJoined = false }) {
    const { auth, currency, locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const [isAgreed, setIsAgreed] = useState(false);
    const safeItems = go?.items || [];
    const GO_FEE_RATE = 0.05;
    
    const currentQty = go?.current_quantity || 0;
    const minQty = go?.min_quantity || 1;
    const progressPercent = Math.min(Math.round((currentQty / minQty) * 100), 100);
    const isGoalMet = currentQty >= minQty;

    const FOREX_SPREAD = currency.code === 'JPY' ? 0 : 0.05;
    const adjustedCurrency = useMemo(() => ({
        ...currency,
        rate: currency.rate * (1 + FOREX_SPREAD)
    }), [currency, FOREX_SPREAD]);

    const formattedDeadline = useMemo(() => {
        if (!go.recruitment_end_date) return '';
        const userTimezone = auth.user?.timezone?.timezone || 'UTC';
        
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: userTimezone,
            hour12: false
        }).format(new Date(go.recruitment_end_date)).replace(/\//g, '/');
    }, [go.recruitment_end_date, auth.user, locale]);

    const timeLeft = useMemo(() => {
        if (!go.recruitment_end_date) return null;
        const diff = new Date(go.recruitment_end_date) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    }, [go.recruitment_end_date]);

    const isExpired = timeLeft === 0;

    // --- フォーム管理 ---
    const { data, setData, post, processing, errors } = useForm({
        items: safeItems.map(item => {
            const product = item.product;
            const primaryImage = product?.images?.find(img => img.is_primary)?.url || product?.images?.[0]?.url;

            return { 
                id: item.id,
                product_id: item.product_id,
                variant_id: null,
                quantity: 0, 
                price: item.price || product?.price || 0,
                name: product?.translations?.find(t => t.locale === locale)?.name || item.item_name || 'Art Item',
                image: primaryImage,
                product_data: product
            };
        }),
        address_id: (addresses || [])?.find(a => a.is_default)?.id || (addresses?.[0]?.id) || '',
        tip_amount: 0,
        total_amount: 0
    });

    // 【新設】：選択された配送先住所オブジェクトのリアルタイム検知
    const activeAddress = useMemo(() => {
        return (addresses || []).find(addr => addr.id == data.address_id);
    }, [addresses, data.address_id]);

    // 【新設・5/20物理フロントガード】：配送先が日本（JP）住所かどうかの判定フラグ
    const isDomesticAddress = useMemo(() => {
        if (!activeAddress) return false;
        const code = String(activeAddress.country_code || activeAddress.country?.country_code || '').toUpperCase();
        return code === 'JP';
    }, [activeAddress]);

    const goodsTotal = useMemo(() => {
        return data.items.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    }, [data.items]);

    // 【5/20仕様・計算式完全同期】：選択された現物アイテムの「総数量」を正確に合算
    const totalPhysicalQty = useMemo(() => {
        return data.items.reduce((acc, curr) => {
            const isPhysical = curr.product_data?.product_type === 1;
            return acc + (isPhysical ? curr.quantity : 0);
        }, 0);
    }, [data.items]);

    // 倉庫中継ハンドリング費の動算（500円 × 現物アイテム総数量）
    const warehouseHandlingFee = useMemo(() => {
        return totalPhysicalQty * 500;
    }, [totalPhysicalQty]);

    // GOシステム手数料（5%）：バックエンドの仕様通り「作品代小計 ＋ 倉庫中継費」をベースに算出
    const goFee = useMemo(() => {
        const baseTotalForFee = goodsTotal + warehouseHandlingFee;
        return goodsTotal > 0 ? Math.ceil(baseTotalForFee * GO_FEE_RATE) : 0;
    }, [goodsTotal, warehouseHandlingFee]);

    // 1次決済の最終合計請求金額の計算 (チップを加算)
    const totalAmount = useMemo(() => {
        const tip = Number(data.tip_amount) || 0;
        return goodsTotal > 0 ? goodsTotal + warehouseHandlingFee + goFee + tip : 0;
    }, [goodsTotal, warehouseHandlingFee, goFee, data.tip_amount]);

    const handleQtyChange = (index, newQty) => {
        const val = Math.max(0, parseInt(newQty) || 0);
        const newItems = [...data.items];
        const product = newItems[index].product_data;
        
        if (val > 0 && product?.variations?.length > 0 && !newItems[index].variant_id) {
            alert(__('Please select a variation first.'));
            return;
        }

        newItems[index].quantity = val;
        setData('items', newItems);
    };

    const handleVariantChange = (index, variantId) => {
        const newItems = [...data.items];
        const item = newItems[index];
        const selectedVariant = item.product_data?.variations?.find(v => v.id === parseInt(variantId));

        item.variant_id = variantId ? parseInt(variantId) : null;
        if (selectedVariant) {
            item.price = selectedVariant.price;
        } else {
            item.price = go.items[index].price || item.product_data?.price || 0;
        }
        setData('items', newItems);
    };

    const getPriceDisplay = (item) => {
        if (item.variant_id) {
            return renderDualCurrency(item.price, adjustedCurrency);
        }
        
        if (item.product_data?.variations?.length > 0) {
            const prices = item.product_data.variations.map(v => Number(v.price));
            const minPrice = Math.min(...prices);
            
            const jpyMin = `¥${minPrice.toLocaleString()}`;
            if (currency.code === 'JPY') return `${jpyMin} 〜`;
            
            const locMin = renderDualCurrency(minPrice, adjustedCurrency);
            return `${jpyMin} (${locMin}) 〜`;
        }
        
        return renderDualCurrency(item.price, adjustedCurrency);
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
                    {previousOrder?.payment_status === 4 && (
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
                            
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-100/50 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-widest"><TrendingUp size={12} /> {__('Live Progress')}</span>
                                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{currentQty.toLocaleString()} <span className="text-xl text-slate-400 font-bold ml-2">/ {minQty.toLocaleString()} {__('Items')}</span></h2>
                                    </div>
                                    <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-slate-100 pl-6 md:pl-0 md:pr-6">
                                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest mb-1">{__('Time Remaining')}</span>
                                        <span className={`text-3xl font-black italic ${isExpired ? 'text-slate-300' : 'text-rose-500'}`}>{isExpired ? __('Ended') : `${timeLeft} ${__('Days')}`}</span>
                                        <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                                            {formattedDeadline} ({auth.user?.timezone?.timezone || 'UTC'})
                                        </span>
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

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 ml-2"><Package size={16} /> {__('Available Items')}</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {data.items.map((item, index) => (
                                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                                    {item.product_data && item.product_data.images && item.product_data.images.length > 0 ? (
                                                        <img src={'/storage/' + item.product_data.images[0].file_path} className="w-full h-full object-cover" alt={item.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">No Img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                                                    <p className="text-sm font-bold text-cyan-600">
                                                        {getPriceDisplay(item)}
                                                    </p>
                                                    {item.product_data?.variations?.length > 0 && (
                                                        <div className="max-w-[240px] relative mt-3">
                                                            <select 
                                                                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-4 pr-10 text-xs font-bold focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                                                                value={item.variant_id || ''}
                                                                onChange={(e) => handleVariantChange(index, e.target.value)}
                                                            >
                                                                <option value="">-- {__('Select Variation')} --</option>
                                                                {item.product_data.variations.map(v => (
                                                                    <option key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
                                                                        {v.translations?.find(t => t.locale === locale)?.variant_name || v.name_en}
                                                                        {` - ${renderDualCurrency(v.price, adjustedCurrency)}`}
                                                                        {v.stock_quantity <= 0 ? ` - ${__('Sold Out')}` : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                                        </div>
                                                    )}
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

                            {/* 【海外特化文言へシフト】：利用規約と同意説明ボード */}
                            <div className="bg-amber-50/50 rounded-[2.5rem] p-10 border border-amber-100 space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-700 flex items-center gap-3"><AlertTriangle size={18} /> {__('Important Terms & Shipping')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            {go.shipping_mode === 'bulk_to_gom' ? <Home className="text-amber-600" size={18} /> : <UserCheck className="text-amber-600" size={18} />}
                                            <h4 className="text-[11px] font-black uppercase text-amber-900">
                                                {go.shipping_mode === 'bulk_to_gom' ? __('Consolidated Port Export') : __('Direct Warehouse Forwarding')}
                                            </h4>
                                        </div>
                                        <p className="text-[11px] text-amber-800 leading-relaxed font-bold">
                                            {go.shipping_mode === 'bulk_to_gom' 
                                                ? __('All allocated items are securely consolidated at CirclePort Central Terminal before tax-free collective export for maximum freight saving.') 
                                                : __('Items are carefully verified through our central consolidation warehouse and forwarded directly to your registered international destination.')}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-[11px] font-black uppercase text-amber-900">{__('No Cancellations')}</h4>
                                        <p className="text-[11px] text-amber-800 leading-relaxed font-bold">{__('Once the box campaign achieves its goal, cancellations are strictly unavailable to ensure the shared freight split remains fair for all global participants.')}</p>
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

                        {/* RIGHT SIDE: ORDER SUMMARY */}
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
                                            <div className="flex justify-between items-center text-sm">
                                                <span>{__('Goods Total')}</span>
                                                <span className="font-black">{renderDualCurrency(goodsTotal, adjustedCurrency)}</span>
                                            </div>

                                            {/* 【5/20仕様反映】：数量に連動する倉庫中継ハンドリング費のシミュレーション行 */}
                                            {warehouseHandlingFee > 0 && (
                                                <div className="flex justify-between items-center text-sm text-cyan-400">
                                                    <span>{__('Warehouse Handling Fee')}</span>
                                                    <span className="font-black">+{renderDualCurrency(warehouseHandlingFee, adjustedCurrency)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-sm">
                                                <span>{__('GO Fee')} (5%)</span>
                                                <span className="font-black">{renderDualCurrency(goFee, adjustedCurrency)}</span>
                                            </div>

                                            {data.tip_amount > 0 && (
                                                <div className="flex justify-between items-center text-sm text-cyan-400">
                                                    <span>{__('Tip')}</span>
                                                    <span className="font-black">+{renderDualCurrency(data.tip_amount, adjustedCurrency)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                                <div>
                                                    <span className="text-xs font-black uppercase text-cyan-400 block leading-none">{__('Payable Now')}</span>
                                                    <span className="text-[8px] font-black bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit mt-1.5">
                                                        Tax-Free Export
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-3xl font-black italic block leading-none text-cyan-400">
                                                        {renderDualCurrency(totalAmount, adjustedCurrency)}
                                                    </span>
                                                    {currency.code !== 'JPY' && (
                                                        <p className="text-[8px] text-slate-500 font-medium italic mt-1 leading-tight">
                                                            * Includes 5% forex spread
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {previousOrder?.payment_status !== 4 && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{__('Shipping Destination')}</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <select className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer" value={data.address_id} onChange={e => setData('address_id', e.target.value)}>
                                                    <option value="">{__('Select Address')}</option>
                                                    {addresses.map(addr => (
                                                        <option key={addr.id} value={addr.id}>{addr.address_line1}, {addr.country?.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 【新設・5/20物理フロントガード】：日本住所が選ばれた瞬間に美しく出現する警告パネル */}
                                    {isDomesticAddress && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex gap-3 text-rose-400">
                                            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-rose-500" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-wide text-rose-500">{__('Domestic Order Prohibited')}</p>
                                                <p className="text-[9px] font-bold leading-normal text-slate-400">
                                                    {__('※CirclePort operates as an exclusive international shipping platform. Deliveries to addresses inside Japan are entirely unsupported. Please select an overseas destination.')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        {!auth.fan ? (
                                            <Link href={route('fan.login')} className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black uppercase text-sm text-center block hover:bg-cyan-500 hover:text-white transition-all shadow-lg">{__('Login to Participate')}</Link>
                                        ) : previousOrder?.payment_status === 4 ? (
                                            <button onClick={handleRetryPayment} disabled={processing || !isAgreed} className="w-full bg-rose-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-rose-600 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-30">
                                                <CreditCard size={18} />{processing ? __('Processing...') : __('Retry Payment Now')}
                                            </button>
                                        ) : isJoined ? (
                                            <div className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase text-sm text-center flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 cursor-default">
                                                <CheckCircle size={18} strokeWidth={3} />
                                                {__('Already Joined')}
                                            </div>
                                        ) : (
                                            /* 日本国内の住所が選択されている場合は、安全のためボタンを一律完全ロック（disabled）します */
                                            <button onClick={() => post(route('fan.go.join', go.id))} disabled={processing || totalAmount === 0 || isExpired || !isAgreed || isDomesticAddress} className={`w-full py-6 rounded-2xl font-black uppercase text-sm transition-all shadow-lg flex items-center justify-center gap-3 ${(!isAgreed || processing || totalAmount === 0 || isExpired || isDomesticAddress) ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-cyan-500 text-white hover:bg-white hover:text-slate-900'}`}>
                                                {isExpired ? <AlertCircle size={18} /> : <Rocket size={18} />}
                                                {isExpired ? __('Ended') : (processing ? __('Processing...') : __('Join Box'))}
                                            </button>
                                        )}
                                        {!isJoined && !isAgreed && auth.fan && <p className="text-[9px] text-rose-400 font-bold mt-4 text-center animate-pulse">{__('Please agree to terms to proceed')}</p>}
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