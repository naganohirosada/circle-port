import React from 'react';
import { Plus, X, Package, Lock, Loader2 } from 'lucide-react';

export default function ItemSection({ data, setData, errors, __, availableProducts, isLoadingProducts }) {
    const inputStyle = "w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-cyan-500 outline-none font-bold text-sm transition-all";

    // アイテムの追加
    const addItem = () => {
        setData('items', [...data.items, { item_id: '', item_name: '', price: 0, stock_limit: 100, is_locked: false }]);
    };

    // アイテムの削除（ロックされているものは不可）
    const removeItem = (index) => {
        if (data.items[index].is_locked) return;
        setData('items', data.items.filter((_, i) => i !== index));
    };

    // 各フィールドの更新
    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        // ロックされているアイテムの名前とIDは変更不可
        if (newItems[index].is_locked && (field === 'item_id' || field === 'item_name')) return;
        
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const getPriceDisplay = (item) => {
        // 1. 選択中の商品オブジェクトを特定
        const product = availableProducts?.find(p => p.id === item.item_id);
        
        if (product && product.variations && product.variations.length > 0) {
            const prices = product.variations.map(v => v.price ?? product.price ?? 0);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // 最小と最大が異なる場合は範囲表示
            if (minPrice !== maxPrice) {
                return `${minPrice.toLocaleString()} ~ ${maxPrice.toLocaleString()}`;
            }
            return minPrice.toLocaleString();
        }
        
        // 3. バリアントがない場合は、商品の単一価格を表示
        const singlePrice = item.price ?? product?.price ?? 0;
        return singlePrice.toLocaleString();
    };

    // 商品選択時の連動処理
    const handleProductSelect = (index, productId) => {
        const product = availableProducts?.find(p => p.id == productId);
        if (!product) return;

        const newItems = [...data.items];

        // product.variants (リポジトリの戻り値に合わせて修正)
        // ※ もしDBリレーション名が variants ならここを variants に統一
        const targetVariants = product.variants || product.variations;

        if (targetVariants && targetVariants.length > 0) {
            const variationItems = targetVariants.map(variant => {
                // 翻訳からバリエーション名を取得
                const vName = variant.translations?.find(t => t.locale === 'en')?.variant_name 
                        || variant.variant_name 
                        || variant.name // 汎用的な fallback
                        || '';

                return {
                    item_id: product.id,
                    variation_id: variant.id,
                    // ★ item_name が抜けていたため追加（これが無いとフォームに表示されず、保存もできない）
                    item_name: `${product.name} - ${vName}`, 
                    price: variant.price ?? product.price ?? 0,
                    stock_limit: 100,
                    is_locked: false
                };
            });
            // 現在の行をバリエーションリストで置き換え
            newItems.splice(index, 1, ...variationItems);
        } else {
            // 通常商品の処理
            newItems[index] = { 
                ...newItems[index], 
                item_id: product.id,
                variation_id: null,
                item_name: product.name || '', 
                price: product.price ?? 0,
                is_locked: false
            };
        }
        setData('items', newItems);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                    {__('Target Items')}
                </label>
                <button 
                    type="button" 
                    onClick={addItem} 
                    disabled={!data.creator_id || isLoadingProducts} 
                    className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-4 py-2 rounded-lg border border-cyan-100 uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                    {isLoadingProducts ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : (
                        <Plus size={12} />
                    )}
                    {__('Add Item')}
                </button>
            </div>

            <div className="space-y-6">
                {data.items.map((item, index) => (
                    <div key={index} className={`p-6 rounded-3xl border-2 relative group transition-all ${item.is_locked ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className={item.is_locked ? 'text-slate-300' : 'text-cyan-500'} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {__('Item Configuration')}
                                    </span>
                                </div>
                                {item.is_locked && (
                                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase">
                                        <Lock size={10} />
                                        {__('Fixed')}
                                    </div>
                                )}
                            </div>

                            {item.is_locked ? (
                                <div className="p-4 rounded-xl bg-white border border-slate-200 font-bold text-slate-900">
                                    {item.item_name}
                                </div>
                            ) : (
                                <div className="relative">
                                    <select 
                                        value={item.item_id} 
                                        onChange={(e) => handleProductSelect(index, e.target.value)} 
                                        className={`${inputStyle} appearance-none`}
                                        disabled={isLoadingProducts}
                                    >
                                        <option value="">
                                            {isLoadingProducts ? __('Loading products...') : __('SELECT AN ITEM')}
                                        </option>
                                        {availableProducts?.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {isLoadingProducts && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        {__('Price')}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">¥</span>
                                        <input 
                                            // 文字列（~）を表示するため type="text" に変更
                                            type="text" 
                                            // ヘルパー関数を使用して表示値を決定
                                            value={getPriceDisplay(item)}
                                            // バリエーション価格幅を表示している間は直接編集不可にする（誤入力防止）
                                            // 個別のバリエーション行として展開されている場合は、その特定の価格のみ編集可能にするロジックも可
                                            readOnly={getPriceDisplay(item).includes('~')}
                                            onChange={e => {
                                                // 数字のみを抽出して更新（範囲表示中でない場合）
                                                const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                                updateItem(index, 'price', val);
                                            }} 
                                            className={`${inputStyle} pl-8 ${getPriceDisplay(item).includes('~') ? 'bg-slate-100/50 text-slate-500' : ''}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                        {__('Max Capacity')}
                                    </span>
                                    <input 
                                        type="number" 
                                        value={item.stock_limit} 
                                        onChange={e => updateItem(index, 'stock_limit', parseInt(e.target.value))} 
                                        className={inputStyle} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 削除ボタン（固定されていないアイテムのみ） */}
                        {!item.is_locked && (
                            <button 
                                type="button" 
                                onClick={() => removeItem(index)} 
                                className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* データが空でローディングもしていない時のメッセージ（オプション） */}
            {!isLoadingProducts && data.creator_id && availableProducts?.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-[11px] font-bold text-amber-600 uppercase tracking-widest text-center">
                    {__('No items found for this creator')}
                </div>
            )}
        </div>
    );
}