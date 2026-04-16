import React, { useState } from 'react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function CreateGo({ auth, pendingGoOrders, warehouses, carriers }) {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        type: 'go',
        warehouse_id: '',
        carrier_id: '',
        tracking_number: '',
        shipping_date: new Date().toISOString().split('T')[0],
        items: [], // { group_order_id: number, quantity: 1 }
    });

    const toggleGoOrder = (goOrder) => {
        const index = data.items.findIndex(i => i.group_order_id === goOrder.id);
        if (index > -1) {
            setData('items', data.items.filter(i => i.group_order_id !== goOrder.id));
        } else {
            setData('items', [...data.items, { group_order_id: goOrder.id, quantity: 1 }]);
        }
    };

    const isSelected = (id) => data.items.some(i => i.group_order_id === id);

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.shipping.store'));
    };

    return (
        <CreatorLayout user={auth.user}>
            <Head title="GO注文の配送登録" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* ステッパー */}
                    <div className="flex items-center justify-center mb-8 text-sm">
                        <span className={step >= 1 ? "text-indigo-600 font-bold" : "text-gray-400"}>1. GOプロジェクト選択</span>
                        <span className="mx-4">→</span>
                        <span className={step >= 2 ? "text-indigo-600 font-bold" : "text-gray-400"}>2. 配送情報入力</span>
                        <span className="mx-4">→</span>
                        <span className={step >= 3 ? "text-indigo-600 font-bold" : "text-gray-400"}>3. 完了</span>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-lg p-8">
                        <form onSubmit={submit}>
                            {/* Step 1: GO選択 */}
                            {step === 1 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-6">配送する共同購入(GO)を選択</h3>
                                    {pendingGoOrders.length === 0 ? (
                                        <p className="text-gray-500 py-10 text-center">現在、配送待ちのGO注文はありません。</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {pendingGoOrders.map((go) => (
                                                <div 
                                                    key={go.id}
                                                    className={`border-2 p-4 rounded-xl cursor-pointer transition ${isSelected(go.id) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                                                    onClick={() => toggleGoOrder(go)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-lg">{go.title || `GO #${go.id}`}</h4>
                                                        <Checkbox checked={isSelected(go.id)} readOnly />
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>参加人数: {go.participants_count}名</p>
                                                        <p>合計アイテム数: {go.total_quantity}点</p>
                                                        <p className="mt-2 text-indigo-700 font-medium">ステータス: 募集完了(発送待ち)</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-10 flex justify-end">
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
                                <div className="max-w-xl mx-auto space-y-6">
                                    <div>
                                        <InputLabel value="送り先倉庫" />
                                        <select 
                                            className="w-full border-gray-300 rounded-md"
                                            value={data.warehouse_id}
                                            onChange={e => setData('warehouse_id', e.target.value)}
                                        >
                                            <option value="">選択してください</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.address})</option>)}
                                        </select>
                                        <InputError message={errors.warehouse_id} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="利用配送業者" />
                                            <select 
                                                className="w-full border-gray-300 rounded-md"
                                                value={data.carrier_id}
                                                onChange={e => setData('carrier_id', e.target.value)}
                                            >
                                                <option value="">選択</option>
                                                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="発送日" />
                                            <TextInput 
                                                type="date"
                                                className="w-full"
                                                value={data.shipping_date}
                                                onChange={e => setData('shipping_date', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel value="追跡番号 (任意)" />
                                        <TextInput 
                                            className="w-full"
                                            placeholder="例: 1234-5678-9012"
                                            value={data.tracking_number}
                                            onChange={e => setData('tracking_number', e.target.value)}
                                        />
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <SecondaryButton onClick={() => setStep(1)}>戻る</SecondaryButton>
                                        <PrimaryButton 
                                            type="button" 
                                            onClick={() => setStep(3)}
                                            disabled={!data.warehouse_id || !data.carrier_id}
                                        >
                                            最終確認へ
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: 確認 */}
                            {step === 3 && (
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-6">配送情報の最終確認</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg text-left inline-block min-w-[400px]">
                                        <p className="mb-2"><strong>タイプ:</strong> 共同購入(GO)配送</p>
                                        <p className="mb-2"><strong>対象GO数:</strong> {data.items.length}件</p>
                                        <p className="mb-2"><strong>送り先:</strong> {warehouses.find(w => w.id == data.warehouse_id)?.name}</p>
                                        <p className="mb-2"><strong>業者:</strong> {carriers.find(c => c.id == data.carrier_id)?.name}</p>
                                        <p><strong>追跡番号:</strong> {data.tracking_number || '(なし)'}</p>
                                    </div>

                                    <div className="mt-10 flex justify-center space-x-4">
                                        <SecondaryButton onClick={() => setStep(2)}>戻る</SecondaryButton>
                                        <PrimaryButton disabled={processing}>
                                            この内容で登録し、ラベルを表示する
                                        </PrimaryButton>
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