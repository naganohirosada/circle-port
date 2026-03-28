import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-[#FDF2F8] p-8 font-sans">
            <Head title="Fan Dashboard" />
            
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-12 bg-white p-8 rounded-[2.5rem] border-[6px] border-indigo-600 shadow-[10px_10px_0px_#A5B4FC]">
                    <div>
                        <h1 className="text-4xl font-black text-indigo-600 tracking-tighter">
                            HELLO, {auth.user.name.toUpperCase()}! ✨
                        </h1>
                        <p className="font-bold text-pink-500 mt-2 italic text-lg">Your passport to Japan's Indie Art is ready!</p>
                    </div>
                    <Link href={route('fan.logout')} method="post" as="button" 
                        className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-lg hover:bg-pink-500 hover:scale-110 transition-all shadow-[4px_4px_0px_#4338CA]">
                        LOGOUT (T_T)
                    </Link>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Status Card: Group Orders */}
                    <div className="bg-white p-8 rounded-[2rem] border-4 border-indigo-100 shadow-xl relative overflow-hidden group hover:border-indigo-600 transition-all">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="font-black text-xl text-indigo-600 mb-2 italic underline decoration-pink-300">My Group Orders</h3>
                        <p className="text-slate-400 font-bold">Track your treasures from Japan.</p>
                        <div className="absolute -bottom-4 -right-4 text-indigo-50 text-8xl font-black group-hover:text-indigo-100 transition-all">GO</div>
                    </div>

                    {/* Status Card: Followed Circles */}
                    <div className="bg-white p-8 rounded-[2rem] border-4 border-indigo-100 shadow-xl relative overflow-hidden group hover:border-indigo-600 transition-all">
                        <div className="text-4xl mb-4">🎨</div>
                        <h3 className="font-black text-xl text-indigo-600 mb-2 italic underline decoration-yellow-300">Favorite Circles</h3>
                        <p className="text-slate-400 font-bold">Followed {auth.user.followed_count || 0} artists.</p>
                        <div className="absolute -bottom-4 -right-4 text-indigo-50 text-8xl font-black group-hover:text-indigo-100 transition-all">ART</div>
                    </div>

                    {/* Status Card: Savings */}
                    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                        <div className="text-4xl mb-4">💰</div>
                        <h3 className="font-black text-xl mb-2 italic">Shipping Savings</h3>
                        <p className="font-bold opacity-80">Bundle items to save more!</p>
                        <div className="mt-4 text-3xl font-black">SAVE $24.00</div>
                    </div>
                </div>
            </div>
        </div>
    );
}