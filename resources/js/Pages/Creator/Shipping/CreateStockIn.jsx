import React, { useState } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function CreateStockIn({ auth, products = [], warehouses = [], carriers = [] }) {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        type: 'stock_in',
        warehouse_id: '',
        carrier_id: '',
        tracking_number: '',
        shipping_date: new Date().toISOString().split('T')[0],
        items: [], // [{ product_id: x, product_variant_id: y, quantity: z }]
    });

    // 数量入力時の同期処理
    const handleQtyChange = (product, variant, qtyStr) => {
        const qty = parseInt(qtyStr, 10) || 0;
        const pId = product.id;
        const vId = variant ? variant.id : null;

        // 既存配列から同一アイテムを排除
        const filtered = data.items.filter(i => !(i.product_id === pId && i.product_variant_id === vId));

        if (qty > 0) {
            setData('items', [...filtered, {
                product_id: pId,
                product_variant_id: vId,
                quantity: qty,
                // UI確認用の付加メタデータ
                _name: product.display_name + (variant ? ` (${variant.display_name})` : ''),
                _image: product.images?.[0]?.file_path
            }]);
        } else {
            setData('items', filtered);
        }
    };

    const getItemQty = (pId, vId) => {
        const found = data.items.find(i => i.product_id === pId && i.product_variant_id === vId);
        return found ? found.quantity : '';
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.store'));
    };

    return (
        <CreatorLayout user={auth.user}>
            <Head title="倉庫一括配送の納品プラン作成" />

            <div className="py-12 pb-32">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href={route('creator.shipping.index')} className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700">← 配送・納品管理に戻る</Link>
                        <h2 className="text-3xl font-black mt-2 text-gray-900 tracking-tight">📦 倉庫への新規納品プラン登録</h2>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Create stocking checklist list for centralized warehouse fulfillment</p>
                    </div>

                    <div className="bg-white shadow-sm rounded-[2rem] p-8 border border-gray-100">
                        <form onSubmit={submit}>
                            
                            {/* Step 1: 納品作品と数量の選択 */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                        <h3 className="text-md font-black text-gray-800">1. 納品する作品とパッキング数量を入力してください</h3>
                                        <span className="text-xs bg-indigo-50 text-indigo-600 font-black px-4 py-2 rounded-xl">選択中: {data.items.length} 種類</span>
                                    </div>

                                    {products.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400 font-bold text-sm bg-gray-50 rounded-2xl">
                                            💡 倉庫一括配送（WAREHOUSE）に設定されている物理作品が見つかりません。
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {products.map((product) => (
                                                <div key={product.id} className="py-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            {product.images?.[0] && (
                                                                <img src={`/storage/${product.images[0].file_path}`} className="w-12 h-12 object-cover rounded-2xl border border-gray-100 shadow-sm" />
                                                            )}
                                                            <div>
                                                                <h4 className="font-black text-gray-900 text-sm">{product.display_name}</h4>
                                                                <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU: {product.sku}</p>
                                                            </div>
                                                        </div>

                                                        {/* バリエーションがない場合の直接数量インプット */}
                                                        {product.variations.length === 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">パッキング数:</span>
                                                                <input type="number" min="0" placeholder="0" value={getItemQty(product.id, null)} onChange={e => handleQtyChange(product, null, e.target.value)}
                                                                    className="w-24 text-center bg-gray-50 border-transparent focus:ring-indigo-500 rounded-xl font-black text-sm p-2" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* バリエーション展開がある場合 */}
                                                    {product.variations.length > 0 && (
                                                        <div className="ml-16 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-3">
                                                            {product.variations.map((v) => (
                                                                <div key={v.id} className="flex items-center justify-between text-xs">
                                                                    <span className="font-bold text-gray-600">↳ {v.display_name}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <input type="number" min="0" placeholder="0" value={getItemQty(product.id, v.id)} onChange={e => handleQtyChange(product, v, e.target.value)}
                                                                            className="w-24 text-center bg-white border-gray-200 focus:ring-indigo-500 rounded-xl font-black text-xs p-1.5 shadow-sm" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-8 flex justify-end">
                                        <PrimaryButton type="button" onClick={() => setStep(2)} disabled={data.items.length === 0}>
                                            配送情報の入力へ →
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: 送り先倉庫・業者の入力 */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="border-b border-gray-50 pb-4">
                                        <h3 className="text-md font-black text-gray-800">2. 国内発送・入庫情報インプット</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel htmlFor="warehouse_id" value="納品先・送り先ポート倉庫" />
                                            <select id="warehouse_id" className="mt-1 block w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4 focus:ring-indigo-500"
                                                value={data.warehouse_id} onChange={(e) => setData('warehouse_id', e.target.value)}>
                                                <option value="">倉庫を選択してください</option>
                                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.location || '日本国内'})</option>)}
                                            </select>
                                            <InputError message={errors.warehouse_id} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="shipping_date" value="発送予定日" />
                                            <input type="date" id="shipping_date" className="mt-1 block w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4 focus:ring-indigo-500"
                                                value={data.shipping_date} onChange={(e) => setData('shipping_date', e.target.value)} />
                                            <InputError message={errors.shipping_date} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div>
                                            <InputLabel htmlFor="carrier_id" value="利用配送業者" />
                                            <select id="carrier_id" className="mt-1 block w-full bg-gray-50 border-transparent rounded-2xl font-bold p-4 focus:ring-indigo-500"
                                                value={data.carrier_id} onChange={(e) => setData('carrier_id', e.target.value)}>
                                                <option value="">配送業者を選択</option>
                                                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <InputError message={errors.carrier_id} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="tracking_number" value="送り状・追跡伝票番号 (任意)" />
                                            <TextInput id="tracking_number" className="mt-1 block w-full p-4" value={data.tracking_number} onChange={(e) => setData('tracking_number', e.target.value)} placeholder="例: 1234-5678-9012" />
                                            <InputError message={errors.tracking_number} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="mt-10 flex justify-between border-t border-gray-50 pt-6">
                                        <SecondaryButton onClick={() => setStep(1)}>戻る</SecondaryButton>
                                        <PrimaryButton type="button" onClick={() => setStep(3)} disabled={!data.warehouse_id || !data.carrier_id}>
                                            パッキング内容の最終確認へ
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: パッキングパッキングリスト最終確認 */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="border-b border-gray-50 pb-4">
                                        <h3 className="text-md font-black text-gray-800">3. 納品概要・パッキングチェックリスト確認</h3>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-4 text-xs font-bold text-gray-600">
                                        <p>📦 配送種別: <span className="text-indigo-600 font-black">新規作品・追加在庫納品 (Stock-In)</span></p>
                                        <p>🏢 納品先ポート: <span className="text-gray-900 font-black">{warehouses.find(w => w.id == data.warehouse_id)?.name}</span></p>
                                        <p>🚚 配送業者: <span className="text-gray-900 font-black">{carriers.find(c => c.id == data.carrier_id)?.name}</span></p>
                                        <p>番号 伝票追跡番号: <span className="text-indigo-600 font-mono font-black">{data.tracking_number || '未入力'}</span></p>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">📦 同梱パッキングリスト</h4>
                                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                                            {data.items.map((item, index) => (
                                                <div key={index} className="p-4 flex justify-between items-center text-xs font-bold">
                                                    <span className="text-gray-700">{item._name}</span>
                                                    <span className="bg-gray-100 text-gray-900 font-black px-4 py-1.5 rounded-lg text-sm">数量: {item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-10 flex justify-between border-t border-gray-50 pt-6">
                                        <SecondaryButton onClick={() => setStep(2)}>内容を修正する</SecondaryButton>
                                        <button type="submit" disabled={processing}
                                            className="bg-indigo-600 text-white font-black text-xs px-12 py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all">
                                            {processing ? 'プラン送信中...' : '納品プランを確定してラベル印刷へ'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}