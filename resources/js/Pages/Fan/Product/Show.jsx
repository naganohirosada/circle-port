// resources/js/Pages/Fan/Product/Show.jsx

import React, { useState, useMemo } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import ReviewForm from '@/Components/models/product/ReviewForm';
import { 
    Tag, ShoppingBag, ChevronRight, Check, 
    Loader2, Megaphone, Plus, Minus, Share2, AlertCircle, 
    Box, Laptop, Star, MessageSquare, Image as ImageIcon 
} from 'lucide-react';

export default function Show({ product, auth }) {
    const { language, locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const isDigital = product.product_type === 2;
    
    // 価格範囲の計算
    const priceRange = useMemo(() => {
        if (!product.variations || product.variations.length === 0) return null;
        const prices = product.variations.map(v => Number(v.price));
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }, [product.variations]);

    // カート用フォーム
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

    // 商品・カテゴリ等の一般翻訳取得
    const getTranslation = (item, field) => {
        const t = item?.translations?.find(t => t.locale === locale) || 
                  item?.translations?.find(t => t.locale === 'en') || 
                  item?.translations?.[0];
        return t ? t[field] : '-';
    };

    // 【追加】閲覧者の言語設定に合わせたレビューコメントを取得
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
                            <div className="min-h-[4rem] pt-4">
                                {displayPrice !== null ? (
                                    <div className="text-5xl font-black text-slate-900 tracking-tighter">¥{Number(displayPrice).toLocaleString()}</div>
                                ) : (
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter">¥{Number(priceRange.min).toLocaleString()} <span className="text-slate-300">~</span> ¥{Number(priceRange.max).toLocaleString()}</div>
                                )}
                            </div>
                        </div>

                        {/* バリエーション */}
                        {product.variations?.length > 0 && (
                            <div className="space-y-6 pt-8 border-t border-slate-100">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{__('Select Variation')}</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.variations.map((v) => (
                                        <button key={v.id} disabled={!isDigital && v.stock <= 0} onClick={() => handleVariationSelect(v)} className={`relative p-5 rounded-2xl border-2 text-left transition-all ${selectedVariation?.id === v.id ? 'border-cyan-500 bg-white shadow-xl shadow-cyan-100/50 scale-[1.02]' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}>
                                            <div className="flex justify-between items-center">
                                                <div><span className="text-sm font-black uppercase">{getTranslation(v, 'name')}</span><div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{v.stock <= 0 && !isDigital ? __('Sold Out') : `¥${Number(v.price).toLocaleString()}`}</div></div>
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
                                <button onClick={handleAddToCart} disabled={processing || isOutOfStock} className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-[0.98] ${isOutOfStock ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-cyan-600'}`}>
                                    {isOutOfStock ? <AlertCircle size={20} /> : <ShoppingBag size={20} />}
                                    {isOutOfStock ? __('Sold Out') : __('Add to Cart')}
                                </button>
                                <Link href={route('fan.go.create', { item_id: product.id })} className="w-full border-2 border-slate-900 text-slate-900 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-900 hover:text-white transition-all active:scale-[0.98]">
                                    <Megaphone size={20} /> {__('Create GO with this item')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- レビューセクション --- */}
                <div className="pt-24 border-t border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* レビューリスト */}
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
                                                        {/* fan (旧user) の情報を安全に表示 */}
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

                                                {/* 表示言語に合わせて翻訳されたコメントを表示 */}
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed pl-16 italic min-h-[1.5rem]">
                                                    {comment ? `"${comment}"` : <span className="text-slate-300 italic">{__('No comment provided')}</span>}
                                                </p>
                                                
                                                {/* レビュー画像ギャラリー */}
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

                        {/* 投稿フォームエリア */}
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
                                            レビューを書いて<br />作品を応援しよう！
                                        </p>
                                        <Link href={route('login')} className="block w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-cyan-400 transition-all">
                                            Login to Review
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