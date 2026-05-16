// resources/js/Pages/Fan/Product/Show.jsx

import React, { useState, useMemo } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import ReviewForm from '@/Components/models/product/ReviewForm';
import { renderDualCurrency, __ } from '@/Utils/helpers';
import { 
    Tag, ShoppingBag, ChevronRight, Check, 
    Loader2, Megaphone, Plus, Minus, Share2, AlertCircle, 
    Box, Laptop, Star, MessageSquare, Image as ImageIcon , User
} from 'lucide-react';

export default function Show({ product, auth }) {
    const { language, locale, currency } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const FOREX_SPREAD = currency.code === 'JPY' ? 0 : 0.05;
    const adjustedCurrency = useMemo(() => ({
        ...currency,
        rate: currency.rate * (1 + FOREX_SPREAD)
    }), [currency, FOREX_SPREAD]);

    const isDigital = product.product_type === 2;
    
    // 【追加】バリエーションがあるかどうかを判定
    const hasVariations = product.variations && product.variations.length > 0;

    // 価格範囲の計算
    const priceRange = useMemo(() => {
        if (!hasVariations) return null;
        const prices = product.variations.map(v => Number(v.price));
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }, [product.variations, hasVariations]);

    // カート用フォーム
    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        variation_id: null,
        quantity: 1,
    });

    const [selectedVariation, setSelectedVariation] = useState(null);
    const [displayPrice, setDisplayPrice] = useState(
        hasVariations ? null : product.price
    );

    const [activeImage, setActiveImage] = useState(
        product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url || '/images/no-image.jpg'
    );

    // 【追加】バリエーションがあるのに選択されていない状態を判定
    const isSelectionMissing = hasVariations && !selectedVariation;

    // 商品・カテゴリ等の一般翻訳取得
    const getTranslation = (item, field) => {
        const t = item?.translations?.find(t => t.locale === locale) || 
                item?.translations?.find(t => t.locale === 'en') || 
                item?.translations?.[0];
        return t ? t[field] : '-';
    };

    const getVariationLabel = (variation) => {
        if (!variation) return null;
        const translated = getTranslation(variation, 'variant_name');
        return translated !== '-' ? translated : variation.variant_name || getTranslation(variation, 'name');
    };

    const selectedVariationName = selectedVariation ? getVariationLabel(selectedVariation) : null;

    const getReviewComment = (review) => {
        if (!review.translations || review.translations.length === 0) return null;
        const t = review.translations.find(t => t.locale === locale) || 
                review.translations.find(t => t.locale === 'en') || 
                review.translations[0];
        return t ? t.comment : null;
    };

    const handleVariationSelect = (variation) => {
        setSelectedVariation(variation);
        setDisplayPrice(variation.price);
        setData(prev => ({ ...prev, variation_id: variation.id, quantity: 1 })); 
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        // 【追加】ガードを念のため処理内でも実行
        if (isSelectionMissing) return;
        post(route('fan.cart.add'), { preserveScroll: true });
    };

    const maxQuantity = selectedVariation ? selectedVariation.stock : product.stock_quantity;
    const isOutOfStock = !isDigital && (selectedVariation ? selectedVariation.stock <= 0 : product.stock_quantity <= 0);

    // 平均評価の算出
    const averageRating = product.reviews?.length > 0
        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
        : 0;

    return (
        <FanLayout>
            <Head>
                <title>{`${getTranslation(product, 'name')} - CirclePort`}</title>
            </Head>

            <div className="max-w-[1200px] mx-auto px-6 py-12">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12">
                    <Link href={route('fan.products.index')} className="hover:text-cyan-600">{__('Artworks')}</Link>
                    <ChevronRight size={12} />
                    <span className="text-slate-900">{getTranslation(product.category, 'name')}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    {/* 画像ギャラリー */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl group">
                            <img src={activeImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${isDigital ? 'bg-cyan-600/90 text-white border-cyan-500' : 'bg-white/90 text-slate-900 border-white'}`}>
                                    {isDigital ? <><Laptop size={12} className="inline mr-2" />{__('Digital')}</> : <><Box size={12} className="inline mr-2" />{__('Physical')}</>}
                                </span>
                            </div>
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                                {product.images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImage(img.url)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img.url ? 'border-cyan-500 scale-105' : 'border-transparent opacity-60'}`}>
                                        <img src={img.url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 商品購入情報 */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-600">
                                    <Tag size={14} /> {getTranslation(product.category, 'name')}
                                </div>
                                <div className="flex items-center gap-2 text-cyan-400">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-xs font-black text-slate-900">{averageRating}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">({product.reviews?.length} Reviews)</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{getTranslation(product, 'name')}</h1>
                            <Link 
                                href={route('fan.creator.show', product.creator.id)}
                                className="inline-flex items-center gap-4 p-2 pr-6 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    {product.creator?.image ? (
                                        <img src={`/storage/${product.creator.image}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"><User size={20} /></div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{__('Created by')}</span>
                                    <span className="text-sm font-black text-slate-900 group-hover:text-cyan-600 transition-colors">{product.creator?.name}</span>
                                </div>
                                <ChevronRight size={16} className="ml-2 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                            <div className="min-h-[4rem] pt-4">
                                {selectedVariationName && (
                                    <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-500 mb-2">
                                        {selectedVariationName}
                                    </div>
                                )}
                                
                                {displayPrice !== null ? (
                                    <div className="text-5xl font-black text-slate-900 tracking-tighter">
                                        {renderDualCurrency(displayPrice, adjustedCurrency)}
                                    </div>
                                ) : (
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                                        {currency.code === 'JPY' ? (
                                            <>¥{priceRange.min.toLocaleString()} <span className="text-slate-300">~</span></>
                                        ) : (
                                            <>
                                                ¥{priceRange.min.toLocaleString()} ({renderDualCurrency(priceRange.min, adjustedCurrency)})
                                                <span className="ml-2 text-slate-300 text-xl font-bold">~</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {currency.code !== 'JPY' && (
                                    <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase italic">
                                        * {__('Price in your currency includes a 5% exchange spread.')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* バリエーション */}
                        {hasVariations && (
                            <div className="space-y-6 pt-8 border-t border-slate-100">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{__('Select Variation')}</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.variations.map((v) => (
                                        <button 
                                            key={v.id} 
                                            disabled={!isDigital && v.stock <= 0} 
                                            onClick={() => handleVariationSelect(v)} 
                                            className={`relative p-5 rounded-2xl border-2 text-left transition-all ${selectedVariation?.id === v.id ? 'border-cyan-500 bg-white shadow-xl shadow-cyan-100/50 scale-[1.02]' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm font-black uppercase">{getVariationLabel(v)}</span>
                                                    <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                                                        {v.stock <= 0 && !isDigital 
                                                            ? __('Sold Out') 
                                                            : renderDualCurrency(v.price, adjustedCurrency)
                                                        }
                                                    </div>
                                                </div>
                                                {selectedVariation?.id === v.id && <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={4} /></div>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 購入アクション */}
                        <div className="pt-8 space-y-6 border-t border-slate-100">
                            {!isOutOfStock && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{__('Quantity')}</span>
                                    <div className="flex items-center bg-slate-100 rounded-2xl p-1 px-2 border border-slate-200">
                                        <button onClick={() => setData('quantity', Math.max(1, data.quantity - 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><Minus size={16} /></button>
                                        <span className="w-12 text-center font-black text-sm">{data.quantity}</span>
                                        <button onClick={() => setData('quantity', isDigital ? data.quantity + 1 : Math.min(maxQuantity, data.quantity + 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><Plus size={16} /></button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-4">
                                {/* 【修正】disabled 属性に isSelectionMissing（バリエーション未選択）を追加 */}
                                <button 
                                    onClick={handleAddToCart} 
                                    disabled={processing || isOutOfStock || isSelectionMissing} 
                                    className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-[0.98] ${
                                        (isOutOfStock || isSelectionMissing) ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-cyan-600'
                                    }`}
                                >
                                    {isOutOfStock ? <AlertCircle size={20} /> : <ShoppingBag size={20} />}
                                    {/* 【修正】テキストを動的に変更：売り切れ > バリエーション未選択 > カートに入れる */}
                                    {isOutOfStock ? __('Sold Out') : isSelectionMissing ? __('Please Select Variation') : __('Add to Cart')}
                                </button>
                                
                                {/* 【追加】バリエーション未選択時に表示する警告メッセージ */}
                                {isSelectionMissing && !isOutOfStock && (
                                    <p className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase italic justify-center animate-pulse">
                                        <AlertCircle size={12} />
                                        {__('Please select a variation to continue')}
                                    </p>
                                )}

                                <Link href={route('fan.go.create', { item_id: product.id })} className="w-full border-2 border-slate-900 text-slate-900 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-900 hover:text-white transition-all active:scale-[0.98]">
                                    <Megaphone size={20} /> {__('Create GO with this item')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* レビューセクション (変更なし) */}
                <div className="pt-24 border-t border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-12">
                            <div className="flex items-center gap-4">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Community Reviews</h3>
                                <div className="bg-cyan-50 text-cyan-600 px-4 py-1 rounded-full text-xs font-black italic">
                                    {averageRating} / 5.0
                                </div>
                            </div>
                            <div className="space-y-10">
                                {product.reviews?.length > 0 ? (
                                    product.reviews.map((review) => {
                                        const comment = getReviewComment(review);
                                        return (
                                            <div key={review.id} className="group space-y-4 border-b border-slate-50 pb-10 last:border-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.fan?.name || 'Guest')}&background=random`} alt="" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">{review.fan?.name || 'Anonymous Fan'}</p>
                                                            <div className="flex text-cyan-400 mt-0.5">
                                                                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed pl-16 italic min-h-[1.5rem]">
                                                    {comment ? `"${comment}"` : <span className="text-slate-300 italic">{__('No comment provided')}</span>}
                                                </p>
                                                {review.images?.length > 0 && (
                                                    <div className="flex gap-3 pl-16">
                                                        {review.images.map((img) => (
                                                            <div key={img.id} className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 cursor-zoom-in group/img">
                                                                <img src={`/storage/${img.image_path}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt="" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{__('No reviews yet. Be the first to share your thoughts!')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                {auth.user ? (
                                    <ReviewForm productId={product.id} language={language} />
                                ) : (
                                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl">
                                        <div className="w-16 h-16 bg-cyan-500/20 rounded-3xl flex items-center justify-center text-cyan-400 mx-auto">
                                            <Star size={32} fill="currentColor" />
                                        </div>
                                        <p className="text-white font-black text-lg leading-tight uppercase tracking-tighter">
                                            {__('Join the community to write a review!')}
                                        </p>
                                        <Link href={route('login')} className="block w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-cyan-400 transition-all">
                                            {__('Login to Review')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}