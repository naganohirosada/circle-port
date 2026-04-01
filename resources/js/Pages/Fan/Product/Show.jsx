import React, { useState } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react'; // useForm を追加
import FanLayout from '@/Layouts/FanLayout';
import { Tag, ShoppingBag, ChevronRight, User, Check, Loader2 } from 'lucide-react'; // Loader2 追加

export default function Show({ product }) {
    const { language, locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 1. カート投入用のフォーム初期化
    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        variation_id: null,
        quantity: 1,
    });

    const [selectedVariation, setSelectedVariation] = useState(null);
    const [displayPrice, setDisplayPrice] = useState(
        product.variations?.length > 0 ? null : product.price
    );

    const [activeImage, setActiveImage] = useState(
        product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url || '/images/no-image.jpg'
    );

    const getTranslation = (item, field) => {
        const t = item?.translations?.find(t => t.locale === locale) || 
                  item?.translations?.find(t => t.locale === 'en') || 
                  item?.translations?.[0];
        return t ? t[field] : '-';
    };

    // 2. バリエーション選択時にフォームデータ(variation_id)も更新
    const handleVariationSelect = (variation) => {
        setSelectedVariation(variation);
        setDisplayPrice(variation.price);
        setData('variation_id', variation.id); 
    };

    // 3. カート追加処理 (Serviceへ送信)
    const handleAddToCart = (e) => {
        e.preventDefault();
        post(route('fan.cart.add'), {
            preserveScroll: true,
            onSuccess: () => {
                // 必要に応じてトースト通知などを表示
                console.log('Added to cart');
            },
        });
    };

    return (
        <FanLayout>
            <Head title={`${getTranslation(product, 'name')} - CirclePort`} />

            <div className="max-w-[1200px] mx-auto px-6 py-12">
                {/* パンくずリスト */}
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12">
                    <Link href={route('fan.products.index')} className="hover:text-cyan-600 transition-colors">{__('Artworks')}</Link>
                    <ChevronRight size={12} />
                    <span className="text-slate-900">{getTranslation(product.category, 'name')}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* 左側：画像ギャラリー */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl shadow-slate-200/50">
                            <img src={activeImage} className="w-full h-full object-cover" alt="" />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img.url ? 'border-cyan-500 scale-105 shadow-md' : 'border-transparent opacity-60'}`}
                                    >
                                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 右側：商品情報 */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-600">
                                <Tag size={14} />
                                {getTranslation(product.category, 'name')}
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 leading-tight">
                                {getTranslation(product, 'name')}
                            </h1>

                            <div className="min-h-[4rem] pt-4">
                                {displayPrice !== null ? (
                                    <div className="text-4xl font-light text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        ¥{Number(displayPrice).toLocaleString()}
                                    </div>
                                ) : (
                                    <div className="text-sm font-bold text-cyan-600 bg-cyan-50 inline-block px-4 py-2 rounded-lg border border-cyan-100 uppercase tracking-widest">
                                        {__('Please select a variation')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* バリエーション選択 */}
                        {product.variations?.length > 0 && (
                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {__('Variations')}
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.variations.map((v) => {
                                        const isSelected = selectedVariation?.id === v.id;
                                        const isOutOfStock = v.stock <= 0;
                                        
                                        return (
                                            <button
                                                key={v.id}
                                                disabled={isOutOfStock || processing}
                                                onClick={() => handleVariationSelect(v)}
                                                className={`
                                                    relative p-5 rounded-2xl border-2 text-left transition-all
                                                    ${isSelected 
                                                        ? 'border-cyan-500 bg-white shadow-lg shadow-cyan-100' 
                                                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'}
                                                    ${isOutOfStock ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}
                                                `}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className={`text-sm font-black ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {getTranslation(v, 'name')}
                                                        </span>
                                                        <div className="text-[10px] text-slate-400 mt-1 font-bold">
                                                            {isOutOfStock ? __('Sold Out') : `¥${Number(v.price).toLocaleString()}`}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                                                            <Check size={14} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 購入ボタン */}
                        <div className="pt-6">
                            <button 
                                onClick={handleAddToCart}
                                disabled={processing || (product.variations?.length > 0 && !selectedVariation)}
                                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-cyan-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <ShoppingBag size={20} />
                                )}
                                {processing ? __('Processing...') : 
                                    (product.variations?.length > 0 && !selectedVariation 
                                        ? __('Select an option') 
                                        : __('Add to Cart'))
                                }
                            </button>
                        </div>

                        {/* 説明文 */}
                        <div className="pt-10 border-t border-slate-100">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">{__('Description')}</h3>
                            <div className="text-slate-600 leading-loose text-sm whitespace-pre-wrap">
                                {getTranslation(product, 'description')}
                            </div>
                        </div>

                        {/* クリエイター情報 */}
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                                <User size={32} className="text-slate-200" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{__('Creator')}</span>
                                <h4 className="text-lg font-bold text-slate-900">{product.creator?.name}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}