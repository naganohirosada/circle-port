import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { formatCurrency } from '@/Utils/helpers';
import { 
    ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
    MapPin, CreditCard, Loader2, ArrowLeft, CheckSquare, Square,
    Heart, Info
} from 'lucide-react';

export default function Index({ cart = { items: [] }, shippingAddresses, paymentMethods }) {
    const { language, auth, checkout_settings, currency } = usePage().props;
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [selectedAddressId, setSelectedAddressId] = useState(auth.user.default_shipping_address_id || '');
    const [selectedPaymentId, setSelectedPaymentId] = useState(auth.user.default_payment_method_id || '');
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [tips, setTips] = useState({});

    const __ = (key) => (language && language[key]) ? language[key] : key;

    useEffect(() => {
        if (cart.items) {
            setSelectedKeys(cart.items.map(item => item.cart_key));
        }
    }, [cart.items]);

    // --- 【修正】より安全なグルーピングロジック ---
    const groupedItems = useMemo(() => {
        const items = cart?.items || [];
        const groups = {};

        items.forEach(item => {
            const creator = item.creator || { 
                id: 'default', 
                name: __('Items'), 
                image: null 
            };
            const creatorId = creator.id ?? 'default';

            if (!groups[creatorId]) {
                groups[creatorId] = { creator, items: [] };
            }
            groups[creatorId].items.push(item);
        });

        return groups;
    }, [cart.items]);

    const totals = useMemo(() => {
        const { tax_rate, fee_rate, go_fee_rate, shipping_fee } = checkout_settings;
        const items = cart?.items || [];
        const selectedItems = items.filter(item => selectedKeys.includes(item.cart_key));
        
        const itemTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
        
        if (itemTotal === 0) {
            return { itemTotal: 0, shipping: 0, tax: 0, fee: 0, tipTotal: 0, grandTotal: 0, selectedItems: [], isGoOrder: false, feeLabel: __('System Fee (8%)') };
        }

        const isGoOrder = selectedItems.some(item => item.group_order_id);
        const appliedFeeRate = isGoOrder ? go_fee_rate : fee_rate;
        const feeLabel = isGoOrder ? __('GO Order Fee (5%)') : __('System Fee (8%)');

        const shipping = shipping_fee;
        const tax = Math.floor((itemTotal + shipping) * tax_rate);
        const fee = Math.ceil((itemTotal + shipping + tax) * appliedFeeRate);
        const tipTotal = Object.values(tips).reduce((sum, val) => sum + (Number(val) || 0), 0);
        
        const grandTotal = itemTotal + shipping + tax + fee + tipTotal;

        return { itemTotal, shipping, tax, fee, tipTotal, grandTotal, selectedItems, isGoOrder, feeLabel };
    }, [cart.items, selectedKeys, checkout_settings, tips]);

    const toggleSelect = (key) => {
        setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const toggleSelectAll = () => {
        if (selectedKeys.length === cart.items.length) {
            setSelectedKeys([]);
        } else {
            setSelectedKeys(cart.items.map(item => item.cart_key));
        }
    };

    const updateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        router.patch(route('fan.cart.update', cartKey), { quantity: newQty }, { preserveScroll: true });
    };

    const removeItem = (cartKey) => {
        router.delete(route('fan.cart.remove', cartKey), { preserveScroll: true });
    };

    const handleTipChange = (creatorId, amount) => {
        setTips(prev => ({ ...prev, [creatorId]: amount }));
    };

    const handleCheckout = () => {
        if (isProcessing) return;
        if (totals.selectedItems.length === 0) return;
        if (!selectedAddressId || !selectedPaymentId) {
            alert(__('Please select shipping address and payment method.'));
            return;
        }

        setIsProcessing(true);
        router.post(route('fan.checkout.store'), {
            shipping_address_id: selectedAddressId,
            payment_method_id: selectedPaymentId,
            selected_cart_keys: selectedKeys,
            tips: tips,
            cart_data: {
                items: totals.selectedItems.map(item => ({
                    id: item.product_id,
                    variation_id: item.variation_id ?? null,
                    quantity: item.quantity,
                    price: item.price,
                    group_order_id: item.group_order_id || null,
                })),
                subtotal: totals.itemTotal,
                shipping: totals.shipping,
                tax: totals.tax,
                fee: totals.fee,
                tip_total: totals.tipTotal,
                total: totals.grandTotal,
            }
        }, {
            onFinish: () => setIsProcessing(false),
            onError: (err) => alert(Object.values(err).join('\n'))
        });
    };

    return (
        <FanLayout>
            <Head title={`${__('Shopping Cart')} - CirclePort`} />

            <div className="max-w-[1200px] mx-auto px-6 py-16">
                <Link href={route('fan.products.index')} className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 w-fit">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">{__('Back to Shop')}</span>
                </Link>

                <h1 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-4">
                    <ShoppingBag size={32} className="text-cyan-600" />
                    {__('Shopping Cart')}
                </h1>

                {cart.items?.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-7 space-y-12">
                            <button onClick={toggleSelectAll} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 pb-4 border-b border-slate-100 w-full">
                                {selectedKeys.length === cart.items.length ? <CheckSquare size={20} className="text-cyan-600" /> : <Square size={20} />}
                                <span className="text-xs font-black uppercase tracking-widest">{__('Select All')}</span>
                            </button>

                            {Object.values(groupedItems).map(({ creator, items }) => (
                                <div key={creator.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {creator.image && (
                                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-white">
                                                    <img src={creator.image} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{creator.name}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {items.map((item) => (
                                            <div key={item.cart_key} className={`flex gap-6 transition-opacity ${!selectedKeys.includes(item.cart_key) ? 'opacity-50' : 'opacity-100'}`}>
                                                <button onClick={() => toggleSelect(item.cart_key)} className="mt-8">
                                                    {selectedKeys.includes(item.cart_key) ? <CheckSquare size={18} className="text-cyan-600" /> : <Square size={18} className="text-slate-300" />}
                                                </button>
                                                <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 mb-1">{item.name}</h3>
                                                        {item.variation_name && <p className="text-[9px] font-black text-cyan-600 uppercase">{item.variation_name}</p>}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden scale-90 origin-left">
                                                            <button onClick={() => updateQuantity(item.cart_key, item.quantity - 1)} className="px-2 py-1 text-slate-400"><Minus size={12} /></button>
                                                            <span className="px-2 text-xs font-bold text-slate-700">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.cart_key, item.quantity + 1)} className="px-2 py-1 text-slate-400"><Plus size={12} /></button>
                                                        </div>
                                                        <button onClick={() => removeItem(item.cart_key)} className="text-slate-300 hover:text-pink-500"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                <div className="text-right py-1 min-w-[80px]">
                                                    <p className="text-sm font-black text-slate-900">{formatCurrency(item.subtotal, currency)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* チップセクション：IDが 'default' の場合は非表示にするなどの調整も可能 */}
                                    {creator.id !== 'default' && (
                                        <div className="bg-cyan-50/30 p-6 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Heart size={14} className="text-cyan-500 fill-cyan-500" />
                                                <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">{__('Support this creator')}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {[500, 1000, 2000].map(amt => (
                                                    <button key={amt} type="button" onClick={() => handleTipChange(creator.id, amt)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${tips[creator.id] === amt ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>+¥{amt.toLocaleString()}</button>
                                                ))}
                                                <div className="relative flex-1 min-w-[140px]">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">¥</span>
                                                    <input type="number" placeholder={__('Custom')} value={tips[creator.id] || ''} onChange={(e) => handleTipChange(creator.id, e.target.value)} className="w-full pl-7 pr-3 py-2 border-slate-200 rounded-xl text-xs font-bold focus:ring-cyan-500 focus:border-cyan-500" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 右側サマリー（省略せず全表示） */}
                        <div className="lg:col-span-5">
                            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white sticky top-12 shadow-2xl">
                                <h2 className="text-xl font-bold mb-10">{__('Order Summary')}</h2>
                                <div className="space-y-6 mb-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><MapPin size={12} className="text-cyan-500" /> {__('Shipping to')}</label>
                                        <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)} className="w-full bg-slate-800 border-none rounded-xl text-sm p-4 text-slate-200 cursor-pointer">
                                            <option value="">{__('Select Address')}</option>
                                            {shippingAddresses.map(addr => <option key={addr.id} value={addr.id}>{addr.label}: {addr.address_line1}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><CreditCard size={12} className="text-cyan-500" /> {__('Pay with')}</label>
                                        <select value={selectedPaymentId} onChange={(e) => setSelectedPaymentId(e.target.value)} className="w-full bg-slate-800 border-none rounded-xl text-sm p-4 text-slate-200 cursor-pointer">
                                            <option value="">{__('Select Card')}</option>
                                            {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.brand.toUpperCase()} **** {pm.last4}</option>)}
                                        </select>
                                    </div>
                                    <div className="h-px bg-slate-800 my-4" />
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm text-slate-400"><span>{__('Subtotal')}</span><span>{formatCurrency(totals.itemTotal, currency)}</span></div>
                                        <div className="flex justify-between text-sm text-slate-400"><span>{__('Domestic Shipping')}</span><span>{formatCurrency(totals.shipping, currency)}</span></div>
                                        <div className="flex justify-between text-sm text-slate-400"><span>{__('Tax')}</span><span>{formatCurrency(totals.tax, currency)}</span></div>
                                        <div className="flex justify-between text-sm text-slate-400"><span>{totals.feeLabel}</span><span>{formatCurrency(totals.fee, currency)}</span></div>
                                        {totals.tipTotal > 0 && <div className="flex justify-between text-sm text-cyan-400 font-bold pt-2 border-t border-slate-800"><span><Heart size={12} className="inline mr-1" /> {__('Support')}</span><span>{formatCurrency(totals.tipTotal, currency)}</span></div>}
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                                        <span className="text-sm font-black uppercase">{__('Total')}</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-black italic text-cyan-400">{formatCurrency(totals.grandTotal, currency)}</span>
                                            {currency.code !== 'JPY' && <p className="text-[10px] text-slate-500 font-bold mt-1">(≈ ¥{Number(totals.grandTotal).toLocaleString()})</p>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleCheckout} disabled={isProcessing || totals.itemTotal === 0} className={`w-full py-6 rounded-2xl font-black uppercase flex items-center justify-center gap-3 transition-all ${ (isProcessing || totals.itemTotal === 0) ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-900 hover:bg-cyan-400' }`}>
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <>{__('Complete Order')} <ArrowRight size={20} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 mb-8 font-medium">{__('Your cart is empty')}</p>
                        <Link href={route('fan.products.index')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">{__('Continue Shopping')}</Link>
                    </div>
                )}
            </div>
        </FanLayout>
    );
}