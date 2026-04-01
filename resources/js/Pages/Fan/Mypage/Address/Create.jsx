import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { ChevronLeft, Save } from 'lucide-react';

export default function Create({ countries }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        country_id: '',
        postal_code: '',
        state: '',
        city: '',
        address_line1: '',
        address_line2: '',
        is_default: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fan.mypage.addresses.store'));
    };

    return (
        <FanLayout>
            <Head title={__('Add New Address')} />

            <div className="max-w-[800px] mx-auto px-6 py-16">
                <Link href={route('fan.mypage.addresses.index')} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 mb-8 transition-colors">
                    <ChevronLeft size={16} /> {__('Back to Addresses')}
                </Link>

                <h1 className="text-3xl font-black text-slate-900 mb-10">{__('Add New Address')}</h1>

                <form onSubmit={submit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                    
                    {/* 名前 & 電話番号 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{__('Recipient Name')}</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 transition-all" />
                            {errors.name && <div className="text-pink-500 text-xs ml-2">{errors.name}</div>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{__('Phone Number')}</label>
                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 transition-all" />
                            {errors.phone && <div className="text-pink-500 text-xs ml-2">{errors.phone}</div>}
                        </div>
                    </div>

                    {/* 国選択 */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{__('Country')}</label>
                        <select 
                            value={data.country_id} 
                            onChange={e => setData('country_id', e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 transition-all"
                        >
                            <option value="">{__('Select Country')}</option>
                            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.country_id && <div className="text-pink-500 text-xs ml-2">{errors.country_id}</div>}
                    </div>

                    {/* 住所詳細 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{__('Postal Code')}</label>
                            <input type="text" value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{__('State / Province')}</label>
                            <input type="text" value={data.state} onChange={e => setData('state', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{__('City')}</label>
                        <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{__('Address Line 1')}</label>
                        <input type="text" value={data.address_line1} onChange={e => setData('address_line1', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 transition-all" />
                    </div>

                    {/* デフォルト設定 */}
                    <div className="flex items-center gap-3 pt-4 ml-2">
                        <input 
                            type="checkbox" 
                            id="is_default"
                            checked={data.is_default} 
                            onChange={e => setData('is_default', e.target.checked)}
                            className="w-5 h-5 text-cyan-600 rounded border-slate-200 focus:ring-cyan-500"
                        />
                        <label htmlFor="is_default" className="text-sm font-bold text-slate-700 cursor-pointer">
                            {__('Set as default shipping address')}
                        </label>
                    </div>

                    <div className="pt-6">
                        <button 
                            disabled={processing}
                            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-cyan-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {processing ? __('Processing...') : __('Save Address')}
                        </button>
                    </div>
                </form>
            </div>
        </FanLayout>
    );
}