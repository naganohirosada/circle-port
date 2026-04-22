import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, carriers, success }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('この配送業者を削除してもよろしいですか？')) {
            destroy(route('admin.carriers.destroy', id));
        }
    };

    return (
        <AdminLayout user={auth.user} header="配送業者マスタ管理">
            <Head title="配送業者一覧" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">配送業者一覧</h3>
                <Link href={route('admin.carriers.create')}>
                    <PrimaryButton>新規業者登録</PrimaryButton>
                </Link>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 font-medium">
                    {success}
                </div>
            )}

            <div className="w-full bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4">業者名</th>
                            <th className="px-6 py-4">追跡URLテンプレート</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {carriers.length > 0 ? carriers.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                                <td className="px-6 py-4 text-gray-500 truncate max-w-md">{c.tracking_url || '未設定'}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <Link href={route('admin.carriers.edit', c.id)} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                        編集
                                    </Link>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900 font-semibold">
                                        削除
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-400">登録されている配送業者はありません</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}