import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Show({ auth, shipping }) {
    const { data, setData, post, processing, errors } = useForm({
        total_weight: shipping.total_weight || '',
        dimensions: {
            length: shipping.dimensions?.length || '',
            width: shipping.dimensions?.width || '',
            height: shipping.dimensions?.height || '',
        },
        shipping_fee: shipping.shipping_fee || '',
        carrier_id: shipping.carrier_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.international-shippings.update-packing', shipping.id));
    };

    return (
        <AdminLayout user={auth.user} header={`国際配送梱包管理 #${shipping.id}`}>
            <Head title={`国際配送 #${shipping.id}`} />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* 左側：入力フォーム */}
                <div className="w-full lg:w-2/5">
                    <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                        <h3 className="text-lg font-bold border-b pb-4 mb-4">梱包詳細入力</h3>
                        
                        <div>
                            <InputLabel value="宛先（ファン）" />
                            <p className="text-lg font-bold">{shipping.fan?.name} 様</p>
                            <p className="text-sm text-gray-500">{shipping.address?.country?.translations?.[0]?.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="total_weight" value="総重量 (g)" />
                                <TextInput
                                    id="total_weight"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.total_weight}
                                    onChange={(e) => setData('total_weight', e.target.value)}
                                    placeholder="例: 1250"
                                />
                                <InputError message={errors.total_weight} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="shipping_fee" value="確定国際送料 (JPY)" />
                                <TextInput
                                    id="shipping_fee"
                                    type="number"
                                    className="mt-1 block w-full border-indigo-300 bg-indigo-50"
                                    value={data.shipping_fee}
                                    onChange={(e) => setData('shipping_fee', e.target.value)}
                                    placeholder="例: 3500"
                                />
                                <InputError message={errors.shipping_fee} className="mt-2" />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <InputLabel value="箱のサイズ (cm)" />
                            <div className="grid grid-cols-3 gap-3 mt-2">
                                <TextInput
                                    placeholder="縦"
                                    value={data.dimensions.length}
                                    onChange={(e) => setData('dimensions', { ...data.dimensions, length: e.target.value })}
                                />
                                <TextInput
                                    placeholder="横"
                                    value={data.dimensions.width}
                                    onChange={(e) => setData('dimensions', { ...data.dimensions, width: e.target.value })}
                                />
                                <TextInput
                                    placeholder="高"
                                    value={data.dimensions.height}
                                    onChange={(e) => setData('dimensions', { ...data.dimensions, height: e.target.value })}
                                />
                            </div>
                        </div>

                        <PrimaryButton disabled={processing} className="w-full justify-center py-4 text-lg rounded-xl shadow-lg bg-indigo-600">
                            梱包完了・送料を確定する
                        </PrimaryButton>
                    </form>
                </div>

                {/* 右側：内容物リスト */}
                <div className="w-full lg:w-3/5">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-bold text-gray-800">箱に入れる商品リスト ({shipping.items.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {shipping.items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded border flex-shrink-0 overflow-hidden">
                                        {item.order_item?.product?.images?.[0]?.url ? (
                                            <img src={item.order_item.product.images[0].url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">NO IMG</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 truncate">
                                            {item.order_item?.product?.translations?.[0]?.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            OID: #{item.order_item?.order_id} / 
                                            VAR: {item.order_item?.variation?.translations?.[0]?.name || 'Default'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-indigo-600">×{item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}