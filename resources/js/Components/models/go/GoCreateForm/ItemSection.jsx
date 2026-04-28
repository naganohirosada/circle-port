import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Search, Plus, Trash2, User, Package, CheckCircle2 } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function ItemSection({ data, setData, errors, products = [], creators = [] }) {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCreatorId, setSelectedCreatorId] = useState(data.creator_id || '');

    useEffect(() => {
        setData('creator_id', selectedCreatorId);
    }, [selectedCreatorId]);

    const addItem = (product) => {
        if (data.items.find(i => i.product_id === product.id)) return;
        
        // メイン画像を取得
        const primaryImage = product.images?.find(img => img.is_primary === 1) || product.images?.[0];
        
        const newItem = {
            product_id: product.id,
            name: product.name || product.translations?.[0]?.name || 'Unknown Product',
            price: product.price || 0,
            image: primaryImage ? `/storage/${primaryImage.file_path}` : null,
            quantity: 1
        };
        setData('items', [...data.items, newItem]);
    };

    const removeItem = (productId) => {
        setData('items', data.items.filter(i => i.product_id !== productId));
    };

    return (
        <div className="space-y-10">
            {/* クリエイター選択 */}
            <div className="space-y-4">
                <InputLabel value={__('1. Select Creator')} className="text-xs font-black uppercase tracking-widest text-slate-400" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(creators || []).map((creator) => (
                        <button
                            key={creator.id}
                            type="button"
                            onClick={() => setSelectedCreatorId(creator.id)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group
                                ${selectedCreatorId === creator.id 
                                    ? 'border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-100' 
                                    : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        >
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                                <User size={24} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight text-slate-700">{creator.name}</span>
                            {selectedCreatorId === creator.id && (
                                <CheckCircle2 size={16} className="text-cyan-500 mt-auto" />
                            )}
                        </button>
                    ))}
                </div>
                <InputError message={errors.creator_id} />
            </div>

            {/* 商品選択エリア */}
            {selectedCreatorId && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <InputLabel value={__('2. Pick Products')} className="text-xs font-black uppercase tracking-widest text-slate-400" />
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text"
                                placeholder={__('Search products...')}
                                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 text-xs font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(products || [])
                            .filter(p => p.creator_id === selectedCreatorId && (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())))
                            .map((product) => {
                                const isAdded = data.items.find(i => i.product_id === product.id);
                                // メイン画像を検索
                                const primaryImage = product.images?.find(img => img.is_primary === 1) || product.images?.[0];

                                return (
                                    <div key={product.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all 
                                        ${isAdded ? 'border-cyan-200 bg-cyan-50/30' : 'border-slate-100 bg-white'}`}>
                                        <div className="flex items-center gap-4">
                                            {/* 画像表示部分の修正 */}
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-50 shrink-0">
                                                {primaryImage ? (
                                                    <img 
                                                        src={`/storage/${primaryImage.file_path}`} 
                                                        alt={product.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package size={20} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 uppercase truncate max-w-[150px]">{product.name}</h4>
                                                <p className="text-[10px] font-bold text-cyan-600 mt-1">¥{Number(product.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => isAdded ? removeItem(product.id) : addItem(product)}
                                            className={`p-2 rounded-xl transition-all ${isAdded ? 'bg-rose-100 text-rose-500 hover:bg-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white'}`}
                                        >
                                            {isAdded ? <Trash2 size={16} /> : <Plus size={16} />}
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* 選択済みリスト */}
            {data.items.length > 0 && (
                <div className="p-6 bg-slate-900 rounded-3xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Package size={14} /> {__('Selected Items for this Box')}
                    </h4>
                    <div className="space-y-2">
                        {data.items.map((item) => (
                            <div key={item.product_id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    {item.image && <img src={item.image} className="w-6 h-6 rounded-md object-cover" alt="" />}
                                    <span className="text-xs font-bold text-white uppercase">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-cyan-400 tracking-tighter">¥{Number(item.price).toLocaleString()}</span>
                                    <button type="button" onClick={() => removeItem(item.product_id)} className="text-rose-400 hover:text-rose-300"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <InputError message={errors.items} />
        </div>
    );
}