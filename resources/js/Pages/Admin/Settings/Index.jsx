import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, settings }) {
    // データをフラットな配列にして useForm に渡す
    const allSettings = Object.values(settings).flat();
    
    const { data, setData, patch, processing } = useForm({
        settings: allSettings.map(s => ({
            id: s.id,
            key: s.key,
            value: s.value,
            description: s.description,
            group: s.group
        }))
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.settings.update'));
    };

    const handleValueChange = (id, newValue) => {
        setData('settings', data.settings.map(s => 
            s.id === id ? { ...s, value: newValue } : s
        ));
    };

    return (
        <AdminLayout user={auth.user} header="為替・手数料マスタ設定">
            <Head title="マスタ設定" />

            <div className="max-w-4xl mx-auto py-8 px-4">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {Object.keys(settings).map((groupName) => (
                        <div key={groupName} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {groupName.toUpperCase()} SETTINGS
                                </h3>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                {data.settings.filter(s => s.group === groupName).map((item) => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div className="md:col-span-1">
                                            <label className="text-sm font-black text-gray-700 block">
                                                {item.description}
                                            </label>
                                            <code className="text-[10px] text-gray-400 font-mono">{item.key}</code>
                                        </div>
                                        <div className="md:col-span-2 relative">
                                            <input
                                                type="text"
                                                value={item.value}
                                                onChange={(e) => handleValueChange(item.id, e.target.value)}
                                                className="w-full bg-gray-50 border-gray-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-mono font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            設定を一括保存する
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}