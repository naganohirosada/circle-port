import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Register({ countries }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        country_id: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fan.register.store'));
    };

    return (
        <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center p-6 font-sans">
            <Head title="Join CirclePort!" />
            
            <div className="w-full max-w-md bg-white border-[6px] border-indigo-600 rounded-[3rem] shadow-[12px_12px_0px_#A5B4FC] p-10 relative overflow-hidden">
                {/* 装飾用アイコン */}
                <div className="absolute -top-4 -right-4 text-6xl opacity-20">★</div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-indigo-600 tracking-tighter">JOIN US! (^_~)</h1>
                    <p className="font-bold text-pink-500 mt-2">Get your passport to Japan's Indie Art!</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <input type="text" placeholder="Your Name" value={data.name}
                            className="w-full px-6 py-4 bg-indigo-50 border-4 border-indigo-100 rounded-2xl font-bold focus:border-indigo-600 transition-all"
                            onChange={e => setData('name', e.target.value)} />
                        {errors.name && <div className="text-pink-500 text-xs mt-1 font-bold">{errors.name}</div>}
                    </div>

                    <div>
                        <select value={data.country_id} 
                            className="w-full px-6 py-4 bg-indigo-50 border-4 border-indigo-100 rounded-2xl font-bold focus:border-indigo-600 transition-all"
                            onChange={e => setData('country_id', e.target.value)}>
                            <option value="">Where do you live?</option>
                            {countries.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                        </select>
                    </div>

                    <div>
                        <input type="email" placeholder="Email Address" value={data.email}
                            className="w-full px-6 py-4 bg-indigo-50 border-4 border-indigo-100 rounded-2xl font-bold focus:border-indigo-600"
                            onChange={e => setData('email', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input type="password" placeholder="Pass" value={data.password}
                            className="w-full px-6 py-4 bg-indigo-50 border-4 border-indigo-100 rounded-2xl font-bold focus:border-indigo-600"
                            onChange={e => setData('password', e.target.value)} />
                        <input type="password" placeholder="Confirm" value={data.password_confirmation}
                            className="w-full px-6 py-4 bg-indigo-50 border-4 border-indigo-100 rounded-2xl font-bold focus:border-indigo-600"
                            onChange={e => setData('password_confirmation', e.target.value)} />
                    </div>

                    <button disabled={processing} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-2xl hover:bg-pink-500 hover:shadow-[6px_6px_0px_#F9A8D4] transition-all transform active:scale-95">
                        SIGN UP! 🚀
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href={route('fan.login')} className="text-indigo-400 font-bold hover:text-pink-500 underline decoration-2">Already a member? Log in!</Link>
                </div>
            </div>
        </div>
    );
}