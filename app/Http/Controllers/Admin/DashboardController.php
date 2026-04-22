<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending_approval_products' => 0, // 今後実装
                'arrived_packages' => 0,          // 今後実装
            ]
        ]);
    }
}