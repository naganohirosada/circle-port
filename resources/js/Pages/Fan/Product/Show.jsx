import React, { useState, useMemo } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { 
    Tag, ShoppingBag, ChevronRight, User, Check, 
    Loader2, Megaphone, Plus, Minus, Share2, AlertCircle, 
    Box, Laptop 
} from 'lucide-react';

export default function Show({ product }) {
    const { language, locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 1. 在庫・価格の計算ロジック
    // デジタル作品(2)は常に在庫あり。現物(1)は各在庫を参照
    const isDigital = product.product_type === 2;
    
    const priceRange = useMemo(() => {
        if (!product.variations || product.variations.length === 0) return null;
        const prices = product.variations.map(v => Number(v.price));
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }, [product.variations]);

    // 2. カート投入用のフォーム初期化
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

    const handleVariationSelect = (variation) => {
        setSelectedVariation(variation);
        setDisplayPrice(variation.price);
        setData(prev => ({
            ...prev,
            variation_id: variation.id,
            quantity: 1 // バリエーション切り替え時に数量を1にリセット
        })); 
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        post(route('fan.cart.add'), {
            preserveScroll: true,
            onSuccess: () => console.log('Added to cart'),
        });
    };

    // 在庫上限の判定
    const maxQuantity = selectedVariation ? selectedVariation.stock : product.stock_quantity;
    const isOutOfStock = !isDigital && (selectedVariation ? selectedVariation.stock <= 0 : product.stock_quantity <= 0);

    return (
        <FanLayout>
            <Head>
                <title>{`${getTranslation(product, 'name')} - CirclePort`}</title>
                <meta name="description" content={getTranslation(product, 'description')} />
                <meta property="og:title" content={getTranslation(product, 'name')} />
                <meta property="og:image" content={activeImage} />
            </Head>

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
                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl shadow-slate-200/40 group">
                            <img src={activeImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                            
                            {/* デジタル/現物バッジ */}
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${isDigital ? 'bg-cyan-600/90 text-white border-cyan-500' : 'bg-white/90 text-slate-900 border-white'}`}>
                                    {isDigital ? <><Laptop size={12} className="inline mr-2" />{__('Digital')}</> : <><Box size={12} className="inline mr-2" />{__('Physical')}</>}
                                </span>
                            </div>
                        </div>

                        {product.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === img.url ? 'border-cyan-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-600">
                                    <Tag size={14} />
                                    {getTranslation(product.category, 'name')}
                                </div>
                                <button className="text-slate-300 hover:text-cyan-600 transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>

                            <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                                {getTranslation(product, 'name')}
                            </h1>

                            {/* 価格表示の改善 */}
                            <div className="min-h-[4rem] pt-4">
                                {displayPrice !== null ? (
                                    <div className="text-5xl font-black text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-500 tracking-tighter">
                                        ¥{Number(displayPrice).toLocaleString()}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                                            ¥{Number(priceRange.min).toLocaleString()} <span className="text-slate-300">~</span> ¥{Number(priceRange.max).toLocaleString()}
                                        </div>
                                        <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">{__('Select an option for exact price')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* バリエーション選択 */}
                        {product.variations?.length > 0 && (
                            <div className="space-y-6 pt-8 border-t border-slate-100">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {__('Select Variation')}
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.variations.map((v) => {
                                        const isSelected = selectedVariation?.id === v.id;
                                        const vOutOfStock = !isDigital && v.stock <= 0;
                                        
                                        return (
                                            <button
                                                key={v.id}
                                                disabled={vOutOfStock || processing}
                                                onClick={() => handleVariationSelect(v)}
                                                className={`
                                                    relative p-5 rounded-2xl border-2 text-left transition-all
                                                    ${isSelected 
                                                        ? 'border-cyan-500 bg-white shadow-xl shadow-cyan-100/50 scale-[1.02]' 
                                                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'}
                                                    ${vOutOfStock ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                                                `}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className={`text-sm font-black uppercase ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {getTranslation(v, 'name')}
                                                        </span>
                                                        <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                                                            {vOutOfStock ? __('Sold Out') : `¥${Number(v.price).toLocaleString()}`}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-cyan-200">
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

                        {/* 数量選択 & 購入アクション */}
                        <div className="pt-8 space-y-6 border-t border-slate-100">
                            {/* 数量選択UIの追加 */}
                            {!isOutOfStock && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{__('Quantity')}</span>
                                    <div className="flex items-center bg-slate-100 rounded-2xl p-1 px-2 border border-slate-200">
                                        <button 
                                            type="button"
                                            onClick={() => setData('quantity', Math.max(1, data.quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
                                        ><Minus size={16} /></button>
                                        <span className="w-12 text-center font-black text-sm">{data.quantity}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setData('quantity', isDigital ? data.quantity + 1 : Math.min(maxQuantity, data.quantity + 1))}
                                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
                                        ><Plus size={16} /></button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={processing || isOutOfStock || (product.variations?.length > 0 && !selectedVariation)}
                                    className={`
                                        w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-[0.98]
                                        ${isOutOfStock 
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                            : 'bg-slate-900 text-white hover:bg-cyan-600 shadow-slate-200'}
                                    `}
                                >
                                    {processing ? <Loader2 className="animate-spin" size={20} /> : (isOutOfStock ? <AlertCircle size={20} /> : <ShoppingBag size={20} />)}
                                    {processing ? __('Processing...') : 
                                        (isOutOfStock ? __('Sold Out') : 
                                            (product.variations?.length > 0 && !selectedVariation ? __('Select an option') : __('Add to Cart')))
                                    }
                                </button>

                                {/* 共同購入（GO）への導線 */}
                                <Link 
                                    href={route('fan.go.create', { item_id: product.id })} 
                                    className="w-full border-2 border-slate-900 text-slate-900 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-900 hover:text-white transition-all active:scale-[0.98]"
                                >
                                    <Megaphone size={20} />
                                    {__('Create GO with this item')}
                                </Link>
                            </div>
                        </div>

                        {/* 商品説明 */}
                        <div className="pt-10 border-t border-slate-100">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">{__('Artist Description')}</h3>
                            <div className="text-slate-600 leading-loose text-sm whitespace-pre-wrap font-medium">
                                {getTranslation(product, 'description')}
                            </div>
                        </div>

                        {/* クリエイター情報（リンク化） */}
                        <Link 
                            href={route('fan.creator.show', product.creator?.id || 0)}
                            className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:bg-white hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-100 transition-all duration-500"
                        >
                            <div className="w-20 h-20 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110">
                                <img src={product.creator?.image_url || '/images/default-avatar.jpg'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-600">{__('Artist')}</span>
                                <h4 className="text-xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors">{product.creator?.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{__('View Collection')} →</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}