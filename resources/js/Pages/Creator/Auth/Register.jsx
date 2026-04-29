// resources/js/Pages/Creator/Auth/Register.jsx

import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Type, AtSign, Mail, Landmark, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        shop_name: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        x_id: '',
        pixiv_id: '',
        bluesky_id: '',
        instagram_id: '',
        booth_url: '',
        fanbox_url: '',
        bank_name: '',
        branch_name: '',
        account_type: '普通',
        account_number: '',
        account_holder: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.register.store'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 py-16">
            <Head title="サークル新規登録" />
            
            <div className="w-full max-w-4xl">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center justify-center gap-3">
                        <CheckCircle2 className="text-cyan-400" size={32} />
                        Join CirclePort Studio
                    </h2>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">
                        新しいサークルアカウントを作成
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* 基本情報 */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-2 mb-2">
                            <Type size={16} className="text-cyan-400" />
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">基本情報</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">サークル名 / ショップ名</label>
                                <input type="text" value={data.shop_name} onChange={e => setData('shop_name', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                                {errors.shop_name && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.shop_name}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">代表者名</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">メールアドレス</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                                {errors.email && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">パスワード</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">パスワード（確認）</label>
                                <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* SNS連携 */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-2 mb-2">
                            <AtSign size={16} className="text-cyan-400" />
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SNS / 外部ショップ（任意）</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">X (Twitter) ID</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">@</span>
                                    <input type="text" value={data.x_id} onChange={e => setData('x_id', e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 pl-12 pr-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pixiv ID</label>
                                <input type="text" value={data.pixiv_id} onChange={e => setData('pixiv_id', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">BOOTH URL</label>
                                <input type="url" value={data.booth_url} onChange={e => setData('booth_url', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    placeholder="https://xxx.booth.pm" />
                            </div>
                        </div>
                    </div>

                    {/* 振込先口座 */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-2 mb-2">
                            <Landmark size={16} className="text-cyan-400" />
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">売上振込先情報（任意）</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">銀行名</label>
                                <input type="text" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">支店名</label>
                                <input type="text" value={data.branch_name} onChange={e => setData('branch_name', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">口座種別</label>
                                <select value={data.account_type} onChange={e => setData('account_type', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all">
                                    <option value="普通">普通預金</option>
                                    <option value="当座">当座預金</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">口座番号</label>
                                <input type="text" value={data.account_number} onChange={e => setData('account_number', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all" />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">口座名義（カナ）</label>
                                <input type="text" value={data.account_holder} onChange={e => setData('account_holder', e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                                    placeholder="サークル ヤマダ" />
                            </div>
                        </div>
                    </div>

                    {/* 送信ボタン */}
                    <div className="pt-4 flex flex-col items-center gap-6">
                        <button 
                            type="submit"
                            disabled={processing}
                            className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${processing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-cyan-500 active:scale-[0.98]'}`}
                        >
                            {processing ? '登録中...' : 'サークルを登録する'}
                            <ArrowRight size={20} />
                        </button>
                        
                        <Link href={route('creator.login')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-500 transition-colors">
                            既にアカウントをお持ちですか？ ログインはこちら &raquo;
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}