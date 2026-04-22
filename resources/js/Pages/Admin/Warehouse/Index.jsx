import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, warehouses, success }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('この倉庫を削除してもよろしいですか？')) {
            destroy(route('admin.warehouses.destroy', id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="倉庫マスタ管理">
            <Head title="倉庫一覧" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">登録済み倉庫一覧</h3>
                <Link href={route('admin.warehouses.create')}>
                    <PrimaryButton>新規倉庫登録</PrimaryButton>
                </Link>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 font-medium">
                    {success}
                </div>
            )}

            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4">倉庫名</th>
                            <th className="px-6 py-4">郵便番号・住所</th>
                            <th className="px-6 py-4">受取人・連絡先</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {warehouses.length > 0 ? warehouses.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{w.name}</td>
                                <td className="px-6 py-4 text-gray-600">〒{w.postal_code} {w.address}</td>
                                <td className="px-6 py-4 text-gray-600">{w.recipient_name} ({w.phone})</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <Link href={route('admin.warehouses.edit', w.id)} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                        編集
                                    </Link>
                                    <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:text-red-900 font-semibold">
                                        削除
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">登録されている倉庫はありません</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}