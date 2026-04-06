import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
    MapPin, CreditCard, Loader2, ArrowLeft, CheckSquare, Square 
} from 'lucide-react';

export default function Index({ cart = { items: [] }, shippingAddresses, paymentMethods }) {
    const { language, auth, checkout_settings } = usePage().props;
    const [isProcessing, setIsProcessing] = useState(false);
    
    // 状態管理：配送先・支払い方法・選択された商品のキー
    const [selectedAddressId, setSelectedAddressId] = useState(auth.user.default_shipping_address_id || '');
    const [selectedPaymentId, setSelectedPaymentId] = useState(auth.user.default_payment_method_id || '');
    const [selectedKeys, setSelectedKeys] = useState([]);

    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 初期表示時に全選択にする
    useEffect(() => {
        if (cart.items) {
            setSelectedKeys(cart.items.map(item => item.cart_key));
        }
    }, [cart.items]);

    // --- 計算ロジック (憲法第1条: サーバー共有の定数を使用) ---
    const totals = useMemo(() => {
        const { tax_rate, fee_rate, shipping_fee } = checkout_settings;
        
        // オプショナルチェイニング (?.) を使い、items が無い場合は空配列として扱います
        const items = cart?.items || [];
        const selectedItems = items.filter(item => selectedKeys.includes(item.cart_key));
        
        const itemTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
        
        if (itemTotal === 0) {
            return { itemTotal: 0, shipping: 0, tax: 0, fee: 0, grandTotal: 0, selectedItems: [] };
        }

        const shipping = shipping_fee;
        const tax = Math.floor((itemTotal + shipping) * tax_rate);
        const fee = Math.ceil((itemTotal + shipping + tax) * fee_rate);
        const grandTotal = itemTotal + shipping + tax + fee;

        return { itemTotal, shipping, tax, fee, grandTotal, selectedItems };
    }, [cart.items, selectedKeys, checkout_settings]);

    // チェックボックス操作
    const toggleSelect = (key) => {
        setSelectedKeys(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const toggleSelectAll = () => {
        if (selectedKeys.length === cart.items.length) {
            setSelectedKeys([]);
        } else {
            setSelectedKeys(cart.items.map(item => item.cart_key));
        }
    };

    // カート操作 (数量更新・削除)
    const updateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        router.patch(route('fan.cart.update', cartKey), { quantity: newQty }, { preserveScroll: true });
    };

    const removeItem = (cartKey) => {
        router.delete(route('fan.cart.remove', cartKey), { preserveScroll: true });
    };

    // 注文実行
    const handleCheckout = () => {
        if (isProcessing) return;
        if (totals.selectedItems.length === 0) {
            alert(__('Please select at least one item.'));
            return;
        }
        if (!selectedAddressId || !selectedPaymentId) {
            alert(__('Please select both shipping address and payment method.'));
            return;
        }

        setIsProcessing(true);

        router.post(route('fan.checkout.store'), {
            shipping_address_id: selectedAddressId,
            payment_method_id: selectedPaymentId,
            selected_cart_keys: selectedKeys, // どのセッションキーを決済するか
            cart_data: {
                items: totals.selectedItems.map(item => ({
                    id: item.product_id,
                    variation_id: item.variation_id ?? null,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: totals.itemTotal,
                shipping: totals.shipping,
                tax: totals.tax,
                fee: totals.fee,
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
                        {/* 左側：商品リスト */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* 全選択トグル */}
                            <button 
                                onClick={toggleSelectAll}
                                className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors pb-4 border-b border-slate-100 w-full"
                            >
                                {selectedKeys.length === cart.items.length ? (
                                    <CheckSquare size={20} className="text-cyan-600" />
                                ) : (
                                    <Square size={20} />
                                )}
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {__('Select All')} ({selectedKeys.length} / {cart.items.length})
                                </span>
                            </button>

                            {cart.items.map((item) => (
                                <div key={item.cart_key} className={`flex gap-6 pb-8 border-b border-slate-100 group transition-opacity ${!selectedKeys.includes(item.cart_key) ? 'opacity-50' : 'opacity-100'}`}>
                                    <button onClick={() => toggleSelect(item.cart_key)} className="mt-10">
                                        {selectedKeys.includes(item.cart_key) ? (
                                            <CheckSquare size={20} className="text-cyan-600" />
                                        ) : (
                                            <Square size={20} className="text-slate-300" />
                                        )}
                                    </button>
                                    
                                    <div className="w-24 h-32 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 relative">
                                        <img src={item.image} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 mb-1">{item.name}</h3>
                                            {item.variation_name && (
                                                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{item.variation_name}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden scale-90 origin-left">
                                                <button onClick={() => updateQuantity(item.cart_key, item.quantity - 1)} className="p-2 text-slate-400"><Minus size={14} /></button>
                                                <span className="px-3 text-sm font-bold text-slate-700">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cart_key, item.quantity + 1)} className="p-2 text-slate-400"><Plus size={14} /></button>
                                            </div>
                                            <button onClick={() => removeItem(item.cart_key)} className="text-slate-300 hover:text-pink-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="text-right py-1 min-w-[100px]">
                                        <p className="text-base font-light text-slate-900">¥{item.subtotal.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 右側：注文サマリー (ダークカード) */}
                        <div className="lg:col-span-5">
                            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white sticky top-12 shadow-2xl transition-all">
                                <h2 className="text-xl font-bold mb-10">{__('Order Summary')}</h2>
                                
                                <div className="space-y-6 mb-10">
                                    {/* 配送先選択 */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <MapPin size={12} className="text-cyan-500" /> {__('Shipping to')}
                                        </label>
                                        <select 
                                            value={selectedAddressId}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                            className="w-full bg-slate-800 border-none rounded-xl text-sm p-4 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer text-slate-200"
                                        >
                                            <option value="">{__('Select an address')}</option>
                                            {shippingAddresses.map(addr => (
                                                <option key={addr.id} value={addr.id}>{addr.label}: {addr.address_line1}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 決済方法選択 */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <CreditCard size={12} className="text-cyan-500" /> {__('Pay with')}
                                        </label>
                                        <select 
                                            value={selectedPaymentId}
                                            onChange={(e) => setSelectedPaymentId(e.target.value)}
                                            className="w-full bg-slate-800 border-none rounded-xl text-sm p-4 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer text-slate-200"
                                        >
                                            <option value="">{__('Select a card')}</option>
                                            {paymentMethods.map(pm => (
                                                <option key={pm.id} value={pm.id}>{pm.brand.toUpperCase()} **** {pm.last4}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="h-px bg-slate-800 my-4" />

                                    {/* 金額内訳詳細 */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>{__('Subtotal')} ({totals.selectedItems.length} {__('items')})</span>
                                            <span className="text-white">¥{totals.itemTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>{__('Domestic Shipping')}</span>
                                            <span className="text-white">¥{totals.shipping.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>{__('Tax')} (10%)</span>
                                            <span className="text-white">¥{totals.tax.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800 pb-4">
                                            <span>{__('System Fee')} (7.5%)</span>
                                            <span className="text-white">¥{totals.fee.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">{__('Total')}</span>
                                        <span className="text-4xl font-light">¥{totals.grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCheckout}
                                    disabled={isProcessing || totals.itemTotal === 0}
                                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                                        (isProcessing || totals.itemTotal === 0) ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-900 hover:bg-cyan-400'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>{__('Complete Order')} <ArrowRight size={20} /></>
                                    )}
                                </button>

                                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-cyan-800" /> Secure Checkout
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 mb-8 font-medium">{__('Your cart is empty')}</p>
                        <Link href={route('fan.products.index')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                            {__('Continue Shopping')}
                        </Link>
                    </div>
                )}
            </div>
        </FanLayout>
    );
}