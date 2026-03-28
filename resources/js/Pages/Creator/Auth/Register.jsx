import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        shop_name: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.register.store'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Head title="Creator Studio Registration" />
            
            <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-4 border-slate-900">
                
                {/* 左側：サイドバーエリア（コンセプト） */}
                <div className="md:w-1/3 bg-slate-950 p-12 text-white flex flex-col justify-between border-r-4 border-cyan-500">
                    <div>
                        <div className="w-16 h-2 bg-cyan-500 mb-8 rounded-full"></div>
                        <h2 className="text-4xl font-black leading-tight mb-6">あなたのサークルを、<br /><span className="text-cyan-400 underline decoration-8 decoration-cyan-400/30 underline-offset-4">世界へ。</span></h2>
                        <ul className="space-y-4 text-slate-400 font-bold">
                            <li className="flex items-center"><span className="text-cyan-400 mr-2 text-xl">★</span> 海外発送は国内拠点に送るだけ</li>
                            <li className="flex items-center"><span className="text-cyan-400 mr-2 text-xl">★</span> 翻訳・決済・GO管理をすべて自動化</li>
                        </ul>
                    </div>
                    <div className="text-slate-600 font-black tracking-widest text-xs">CP STUDIO PARTNER v1.0</div>
                </div>

                {/* 右側：フォームエリア */}
                <div className="md:w-2/3 p-12 md:p-16">
                    <h1 className="text-3xl font-black text-slate-800 mb-10 flex items-center">
                        <span className="bg-slate-900 text-white p-2 rounded-lg mr-4 text-xl italic">NEW</span>
                        サークル新規登録
                    </h1>
                    
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest italic">Shop / Circle Name</label>
                            <input type="text" value={data.shop_name} placeholder="例：CirclePort Studio"
                                className="w-full border-4 border-slate-100 rounded-2xl py-4 px-6 focus:border-cyan-500 ring-0 font-bold text-lg"
                                onChange={e => setData('shop_name', e.target.value)} />
                            {errors.shop_name && <div className="text-pink-500 text-xs mt-2">{errors.shop_name}</div>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 mb-3 uppercase italic">Representative Name</label>
                            <input type="text" value={data.name} placeholder="お名前"
                                className="w-full border-4 border-slate-100 rounded-2xl py-4 px-6 focus:border-cyan-500 ring-0 font-bold"
                                onChange={e => setData('name', e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 mb-3 uppercase italic">Studio Email</label>
                            <input type="email" value={data.email}
                                className="w-full border-4 border-slate-100 rounded-2xl py-4 px-6 focus:border-cyan-500 ring-0 font-bold"
                                onChange={e => setData('email', e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 mb-3 uppercase italic">Password</label>
                            <input type="password" value={data.password}
                                className="w-full border-4 border-slate-100 rounded-2xl py-4 px-6 focus:border-cyan-500 ring-0 font-bold"
                                onChange={e => setData('password', e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 mb-3 uppercase italic">Confirm Pass</label>
                            <input type="password" value={data.password_confirmation}
                                className="w-full border-4 border-slate-100 rounded-2xl py-4 px-6 focus:border-cyan-500 ring-0 font-bold"
                                onChange={e => setData('password_confirmation', e.target.value)} />
                        </div>

                        <div className="md:col-span-2 pt-6">
                            <button disabled={processing} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-2xl hover:bg-cyan-500 hover:shadow-[10px_10px_0px_#A5F3FC] transition-all transform active:scale-95 shadow-[6px_6px_0px_#334155]">
                                START CREATING! 🖊
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 text-center text-slate-400 font-bold text-sm">
                        すでにアカウントをお持ちですか？ 
                        <Link href={route('creator.login')} className="ml-2 text-cyan-600 hover:underline">ログインはこちら &raquo;</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}