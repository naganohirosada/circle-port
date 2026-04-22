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
        tracking_url: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.carriers.store'));
    };

    return (
        <AdminLayout user={auth.user} header="配送業者の新規登録">
            <Head title="配送業者登録" />

            <div className="w-full bg-white shadow-sm rounded-xl border border-gray-200">
                <form onSubmit={submit} className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="max-w-xl">
                            <InputLabel htmlFor="name" value="配送業者名" className="text-lg font-bold" />
                            <TextInput id="name" className="mt-2 block w-full text-lg" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="例: ヤマト運輸、日本郵便" />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tracking_url" value="追跡URLテンプレート (任意)" />
                            <TextInput id="tracking_url" className="mt-2 block w-full" value={data.tracking_url} onChange={(e) => setData('tracking_url', e.target.value)} placeholder="https://tracking.example.com/item?num=" />
                            <p className="mt-2 text-sm text-gray-500">※番号の直前までのURLを入力してください</p>
                            <InputError message={errors.tracking_url} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-100">
                        <Link href={route('admin.carriers.index')}>
                            <SecondaryButton className="px-8 py-3">キャンセル</SecondaryButton>
                        </Link>
                        <PrimaryButton className="px-10 py-3" disabled={processing}>業者を登録する</PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}