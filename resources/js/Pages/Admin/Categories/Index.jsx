// resources/js/Pages/Admin/Categories/Index.jsx

import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, ChevronRight, Globe, Box, Hash } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';

export default function Index({ auth, categories, hsCodes }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // { type: 'category'|'subcategory', data: ... }
    const [activeLangTab, setActiveTab] = useState('ja');

    const languages = [
        { code: 'ja', label: '日本語' }, { code: 'en', label: 'English' },
        { code: 'zh', label: '中国語' }, { code: 'th', label: 'タイ語' },
        { code: 'id', label: '印語' }, { code: 'vi', label: '越語' },
        { code: 'fr', label: '仏語' }, { code: 'de', label: '独語' },
        { code: 'ko', label: '韓語' }
    ];

    const { data, setData, post, put, processing, errors, reset } = useForm({
        parent_id: '', // サブカテゴリ作成時のみ使用
        names: { ja: '', en: '', zh: '', th: '', id: '', vi: '', fr: '', de: '', ko: '' },
        default_hs_code_id: '',
    });

    const openModal = (type, parent = null, item = null) => {
        reset();
        setEditingItem({ type, parent, item });
        if (item) {
            const namesObj = {};
            item.translations.forEach(t => namesObj[t.locale] = t.name);
            setData({
                parent_id: parent?.id || '',
                names: { ...data.names, ...namesObj },
                default_hs_code_id: item.default_hs_code_id || '',
            });
        } else {
            setData('parent_id', parent?.id || '');
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const url = editingItem.type === 'category' ? route('admin.categories.store') : route('admin.subcategories.store');
        // ※編集(update)ロジックは省略
        post(url, { onSuccess: () => setIsModalOpen(false) });
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="カテゴリ管理" />

            <div className="py-12 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Category & HS Code Settings</h2>
                    <button onClick={() => openModal('category')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
                        <Plus size={20} /> 新規カテゴリ作成
                    </button>
                </div>

                <div className="space-y-4">
                    {categories.map((category) => (
                        <div key={category.id} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                            {/* カテゴリ行 */}
                            <div className="p-6 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Box size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">{category.translations.find(t => t.locale === 'ja')?.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase mt-1">
                                            <Hash size={12} />
                                            HS CODE: {category.default_hs_code?.code || '未設定'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openModal('subcategory', category)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="サブカテゴリ追加"><Plus size={20} /></button>
                                    <button onClick={() => openModal('category', null, category)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Edit2 size={20} /></button>
                                </div>
                            </div>

                            {/* サブカテゴリ一覧 */}
                            {category.sub_categories?.length > 0 && (
                                <div className="border-t border-gray-50 p-4 space-y-2">
                                    {category.sub_categories.map((sub) => (
                                        <div key={sub.id} className="ml-12 p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-indigo-200 transition-all">
                                            <div className="flex items-center gap-3">
                                                <ChevronRight size={16} className="text-gray-300" />
                                                <span className="font-bold text-gray-700">{sub.translations.find(t => t.locale === 'ja')?.name}</span>
                                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full font-black text-gray-500 uppercase tracking-widest">
                                                    HS: {sub.default_hs_code?.code || '未設定'}
                                                </span>
                                            </div>
                                            <button onClick={() => openModal('subcategory', category, sub)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-indigo-600 transition-all"><Edit2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 作成・編集モーダル */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="2xl">
                <form onSubmit={submit} className="p-8">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2 italic uppercase">
                        {editingItem?.item ? 'Edit' : 'Create'} {editingItem?.type}
                    </h3>

                    {/* 多言語タブ */}
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
                        {languages.map(lang => (
                            <button key={lang.code} type="button" onClick={() => setActiveTab(lang.code)}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${activeLangTab === lang.code ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                {lang.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {/* 名称入力 */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Category Name ({activeLangTab})</label>
                            <input type="text" value={data.names[activeLangTab]} 
                                onChange={e => setData('names', { ...data.names, [activeLangTab]: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="名称を入力..." />
                        </div>

                        {/* HSコード選択 */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Default HS CODE</label>
                            <select value={data.default_hs_code_id} onChange={e => setData('default_hs_code_id', e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 font-bold">
                                <option value="">選択してください (または親カテゴリの設定を継承)</option>
                                {hsCodes.map(hs => (
                                    <option key={hs.id} value={hs.id}>[{hs.code}] {hs.name_en}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black text-sm text-gray-400 hover:text-gray-600">CANCEL</button>
                        <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-12 py-4 rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                            {editingItem?.item ? 'UPDATE' : 'SAVE'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}