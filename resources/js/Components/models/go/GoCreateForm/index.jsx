import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import BasicSection from './BasicSection';
import ItemSection from './ItemSection';
import { Loader2, Rocket } from 'lucide-react';

export default function GoCreateForm() {
    const { 
        language, 
        creators, 
        initial_creator, 
        initial_item, 
        initial_products 
    } = usePage().props;

    const __ = (key) => (language && language[key]) ? language[key] : key;

    // 商品リストの状態管理
    const [availableProducts, setAvailableProducts] = useState(initial_products || []);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        creator_id: initial_creator?.id || '',
        title: '',
        description: '',
        recruitment_start_date: '',
        recruitment_end_date: '',
        // --- 仕様統合：配送モードと限定公開フラグ ---
        shipping_mode: 'individual', // 'individual' or 'bulk'
        is_private: false,           // 公開/限定
        allowed_fans: [],            // 招待済みファンリスト
        // ----------------------------------------
        is_secondary_payment_required: true,
        items: initial_item ? [{
            item_id: initial_item.id,
            item_name: initial_item.name,
            variation_id: null,
            price: initial_item.price,
            stock_limit: 100,
            is_locked: true
        }] : []
    });

    // クリエイター選択時の商品取得
    const handleCreatorChange = async (id) => {
        setData(prev => ({ ...prev, creator_id: id, items: [] }));
        
        if (!id) {
            setAvailableProducts([]);
            return;
        }

        setIsLoadingProducts(true);
        try {
            const response = await axios.get(route('fan.api.creators.products', id));
            setAvailableProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
            setAvailableProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // --- 新規追加：ファン検索ロジック (招待制用) ---
    const handleFanSearch = async (uniqueId) => {
        if (!uniqueId) return;
        
        try {
            // APIエンドポイントは Laravel側で作成する 'fan.api.fans.search' を想定
            const response = await axios.get(route('fan.api.fans.search'), { 
                params: { unique_id: uniqueId } 
            });
            
            if (response.data && response.data.id) {
                // すでに追加されていないか重複チェック
                if (data.allowed_fans.find(f => f.id === response.data.id)) {
                    // 重複時は何もしない、またはトースト通知など
                    return;
                }
                // 招待リストに追加
                setData('allowed_fans', [...data.allowed_fans, response.data]);
            } else {
                alert(__('Fan not found'));
            }
        } catch (error) {
            console.error("Fan search failed", error);
            alert(__('Error searching for fan'));
        }
    };

    const handleRemoveFan = (id) => {
        setData('allowed_fans', data.allowed_fans.filter(f => f.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            allowed_fans: data.allowed_fans.map(f => f.id) 
        };

        post(route('fan.go.store'), {
            transform: (data) => ({
                ...data,
                allowed_fans: data.allowed_fans.map(fan => fan.id),
            }),
            onSuccess: () => {
                // 成功時の処理
            },
            onError: (errors) => {
                console.error("Validation failed:", errors);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-600">
                        <span className="opacity-50">{__('GO Management')}</span>
                        <span className="opacity-50">/</span>
                        <span>{__('Project Setup')}</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">
                        {__('Launch New Box')}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7 space-y-12">
                    <BasicSection 
                        data={data} 
                        setData={setData} 
                        errors={errors} 
                        __={__}
                        creators={creators} 
                        isCreatorFixed={!!initial_creator}
                        handleCreatorChange={handleCreatorChange}
                        onFanSearch={handleFanSearch}
                        onRemoveFan={handleRemoveFan}
                    />
                </div>
                <div className="lg:col-span-5 space-y-12">
                    <ItemSection 
                        data={data} 
                        setData={setData} 
                        errors={errors} 
                        __={__}
                        availableProducts={availableProducts}
                        isLoadingProducts={isLoadingProducts}
                    />
                    <div className="pt-10">
                        <button 
                            type="submit"
                            disabled={processing || !data.creator_id || data.items.length === 0}
                            className="w-full bg-slate-900 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-4 hover:bg-cyan-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200"
                        >
                            {processing ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} />}
                            <span className="text-lg">
                                {processing ? __('Processing...') : __('Launch Group Order')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}