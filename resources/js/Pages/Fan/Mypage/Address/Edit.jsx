import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { ChevronLeft, Save } from 'lucide-react';

export default function Edit({ address, countries }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;

    // 初期値を既存の address からセット
    const { data, setData, patch, processing, errors } = useForm({
        name: address.name || '',
        phone: address.phone || '',
        country_id: address.country_id || '',
        postal_code: address.postal_code || '',
        state: address.state || '',
        city: address.city || '',
        address_line1: address.address_line1 || '',
        address_line2: address.address_line2 || '',
        is_default: address.is_default === 1,
    });

    const submit = (e) => {
        e.preventDefault();
        // 憲法：更新は PATCH メソッドを使用
        patch(route('fan.mypage.addresses.update', address.id), {
            preserveScroll: true,
        });
    };

    return (
        <FanLayout>
            <Head title={`${__('Edit Address')} - CirclePort`} />

            <div className="max-w-[800px] mx-auto px-6 py-16">
                <Link 
                    href={route('fan.mypage.addresses.index')} 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 mb-8 transition-colors"
                >
                    <ChevronLeft size={16} /> {__('Back to Addresses')}
                </Link>

                <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tight">{__('Edit Address')}</h1>

                <form onSubmit={submit} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                    
                    {/* 名前 & 電話番号 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('Recipient Name')}</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700" 
                            />
                            {errors.name && <div className="text-pink-500 text-[10px] font-bold ml-2">{errors.name}</div>}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('Phone Number')}</label>
                            <input 
                                type="text" 
                                value={data.phone} 
                                onChange={e => setData('phone', e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700" 
                            />
                            {errors.phone && <div className="text-pink-500 text-[10px] font-bold ml-2">{errors.phone}</div>}
                        </div>
                    </div>

                    {/* 国選択 */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('Country')}</label>
                        <select 
                            value={data.country_id} 
                            onChange={e => setData('country_id', e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700 appearance-none"
                        >
                            <option value="">{__('Select Country')}</option>
                            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.country_id && <div className="text-pink-500 text-[10px] font-bold ml-2">{errors.country_id}</div>}
                    </div>

                    {/* 郵便番号 & 州/県 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('Postal Code')}</label>
                            <input 
                                type="text" 
                                value={data.postal_code} 
                                onChange={e => setData('postal_code', e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700" 
                            />
                            {errors.postal_code && <div className="text-pink-500 text-[10px] font-bold ml-2">{errors.postal_code}</div>}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('State / Province')}</label>
                            <input 
                                type="text" 
                                value={data.state} 
                                onChange={e => setData('state', e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700" 
                            />
                            {errors.state && <div className="text-pink-500 text-[10px] font-bold ml-2">{errors.state}</div>}
                        </div>
                    </div>

                    {/* 市区町村 */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('City')}</label>
                        <input 
                            type="text" 
                            value={data.city} 
                            onChange={e => setData('city', e.target.value)} 
                            className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700" 
                        />
                        {errors.city && <div className="text-pink-500 text-[10px] font-bold ml-2">{errors.city}</div>}
                    </div>

                    {/* 住所1 & 2 */}
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('Address Line 1')}</label>
                            <input 
                                type="text" 
                                value={data.address_line1} 
                                onChange={e => setData('address_line1', e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700" 
                            />
                            {errors.address_line1 && <div className="text-pink-500 text-[10px] font-bold ml-2">{errors.address_line1}</div>}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{__('Address Line 2')}</label>
                            <input 
                                type="text" 
                                value={data.address_line2} 
                                onChange={e => setData('address_line2', e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-cyan-500 transition-all font-bold text-slate-700" 
                                placeholder={__('Apartment, suite, unit, etc. (optional)')}
                            />
                        </div>
                    </div>

                    {/* デフォルト設定 */}
                    <div className="flex items-center gap-4 pt-4 ml-2">
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id="is_default"
                                checked={data.is_default} 
                                onChange={e => setData('is_default', e.target.checked)}
                                className="w-6 h-6 text-cyan-600 rounded-lg border-slate-200 focus:ring-cyan-500 transition-all"
                            />
                            <label htmlFor="is_default" className="ml-3 text-sm font-bold text-slate-700 cursor-pointer">
                                {__('Set as default shipping address')}
                            </label>
                        </div>
                    </div>

                    <div className="pt-10">
                        <button 
                            disabled={processing}
                            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-cyan-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            {processing ? __('Processing...') : __('Update Address')}
                        </button>
                    </div>
                </form>
            </div>
        </FanLayout>
    );
}