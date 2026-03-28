<?php

namespace App\Http\Controllers\Fan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * ファン専用ダッシュボードの表示
     * * @return \Inertia\Response
     */
    public function index(): Response
    {
        return Inertia::render('Fan/Dashboard', [
            'status' => session('status'),
        ]);
    }
}