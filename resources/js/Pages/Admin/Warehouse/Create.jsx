import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        postal_code: '',
        address: '',
        recipient_name: '',
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.warehouses.store'));
    };

    return (
        <AdminLayout user={auth.user} header="倉庫の新規登録">
            <Head title="倉庫登録" />

            <div className="w-full bg-white shadow-sm rounded-xl border border-gray-200">
                <form onSubmit={submit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 左カラム */}
                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="倉庫名" className="text-lg font-bold" />
                                <TextInput id="name" className="mt-2 block w-full text-lg" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="例: 東京物流センター" />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="postal_code" value="郵便番号" />
                                    <TextInput id="postal_code" className="mt-2 block w-full" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} placeholder="000-0000" />
                                    <InputError message={errors.postal_code} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" value="電話番号" />
                                    <TextInput id="phone" className="mt-2 block w-full" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="03-xxxx-xxxx" />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="address" value="住所" />
                                <TextInput id="address" className="mt-2 block w-full" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="都道府県・市区町村・番地" />
                                <InputError message={errors.address} className="mt-2" />
                            </div>
                        </div>

                        {/* 右カラム */}
                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="recipient_name" value="受取人" className="text-lg font-bold" />
                                <TextInput id="recipient_name" className="mt-2 block w-full text-lg" value={data.recipient_name} onChange={(e) => setData('recipient_name', e.target.value)} placeholder="例: 山田 太郎" />
                                <InputError message={errors.recipient_name} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-100">
                        <Link href={route('admin.warehouses.index')}>
                            <SecondaryButton className="px-8 py-3">キャンセル</SecondaryButton>
                        </Link>
                        <PrimaryButton className="px-10 py-3" disabled={processing}>倉庫を登録する</PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}