import React, { useState } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function CreateRegular({ auth, pendingItems, warehouses, carriers }) {
    // ※pendingItems は Repository修正により「注文リスト」になっています
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        type: 'regular',
        warehouse_id: '',
        carrier_id: '',
        tracking_number: '',
        shipping_date: new Date().toISOString().split('T')[0],
        items: [], // [{ order_item_id: x, quantity: y }, ...]
        selected_order_ids: [], // UI管理用の選択済み注文ID
    });

    // 注文単位での選択ロジック
    const toggleOrder = (order) => {
        const isAlreadySelected = data.selected_order_ids.includes(order.id);
        
        if (isAlreadySelected) {
            // 選択解除：その注文に紐づくアイテムを全て削除
            const itemIdsToRemove = order.items.map(i => i.id);
            setData({
                ...data,
                selected_order_ids: data.selected_order_ids.filter(id => id !== order.id),
                items: data.items.filter(i => !itemIdsToRemove.includes(i.order_item_id))
            });
        } else {
            // 選択追加：その注文に紐づくアイテムを全て追加
            const newItems = order.items.map(i => ({ order_item_id: i.id, quantity: i.quantity }));
            setData({
                ...data,
                selected_order_ids: [...data.selected_order_ids, order.id],
                items: [...data.items, ...newItems]
            });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.shipping.store'));
    };

    return (
        <CreatorLayout user={auth.user}>
            <Head title="通常注文の配送登録" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-8 text-gray-800">通常注文の配送登録</h2>

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 border border-gray-100">
                        <form onSubmit={submit}>
                            {/* Step 1: 注文選択 */}
                            {step === 1 && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-medium">発送する注文を選択してください</h3>
                                        <span className="text-sm text-gray-500">選択中: {data.selected_order_ids.length} 件</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {pendingItems.map((order) => (
                                            <div 
                                                key={order.id}
                                                className={`border rounded-xl overflow-hidden transition ${data.selected_order_ids.includes(order.id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}
                                            >
                                                <div 
                                                    className={`p-4 flex items-center justify-between cursor-pointer ${data.selected_order_ids.includes(order.id) ? 'bg-indigo-50' : 'bg-gray-50'}`}
                                                    onClick={() => toggleOrder(order)}
                                                >
                                                    <div className="flex items-center">
                                                        <Checkbox checked={data.selected_order_ids.includes(order.id)} readOnly className="mr-4" />
                                                        <div>
                                                            <span className="font-bold text-gray-900">注文 #{order.id}</span>
                                                            <span className="ml-3 text-sm text-gray-500">{order.order_date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-medium text-indigo-600">
                                                        ファン: {order.fan_name}
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 bg-white divide-y divide-gray-100">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="py-2 flex items-center text-sm">
                                                            <img src={item.product_image} className="w-10 h-10 object-cover rounded mr-3" alt="" />
                                                            <div className="flex-1 text-gray-700">{item.product_name}</div>
                                                            <div className="font-medium text-gray-900">数量: {item.quantity}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <PrimaryButton 
                                            type="button" 
                                            onClick={() => setStep(2)} 
                                            disabled={data.items.length === 0}
                                        >
                                            配送情報の入力へ
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: 配送情報入力 */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="warehouse_id" value="送り先倉庫" />
                                        <select
                                            id="warehouse_id"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            value={data.warehouse_id}
                                            onChange={(e) => setData('warehouse_id', e.target.value)}
                                        >
                                            <option value="">倉庫を選択してください</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                        <InputError message={errors.warehouse_id} className="mt-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="carrier_id" value="配送業者" />
                                            <select
                                                id="carrier_id"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                                value={data.carrier_id}
                                                onChange={(e) => setData('carrier_id', e.target.value)}
                                            >
                                                <option value="">業者を選択</option>
                                                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="tracking_number" value="追跡番号 (任意)" />
                                            <TextInput
                                                id="tracking_number"
                                                className="mt-1 block w-full"
                                                value={data.tracking_number}
                                                onChange={(e) => setData('tracking_number', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-between">
                                        <SecondaryButton onClick={() => setStep(1)}>戻る</SecondaryButton>
                                        <PrimaryButton type="button" onClick={() => setStep(3)}>確認画面へ</PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: 最終確認 */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-bold mb-2">配送概要</h4>
                                        <p>タイプ: 通常配送</p>
                                        <p>倉庫: {warehouses.find(w => w.id == data.warehouse_id)?.name}</p>
                                        <p>業者: {carriers.find(c => c.id == data.carrier_id)?.name}</p>
                                        <p>追跡番号: {data.tracking_number || '未入力'}</p>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-between">
                                        <SecondaryButton onClick={() => setStep(2)}>戻る</SecondaryButton>
                                        <PrimaryButton disabled={processing}>配送を登録・ラベル印刷</PrimaryButton>
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

function StepItem({ number, title, active }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition ${active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {number}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}>{title}</span>
        </div>
    );
}