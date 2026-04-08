<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Services\Creator\CreatorDashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected CreatorDashboardService $service
    ) {}

    public function index()
    {
        $data = $this->service->getDashboardData(auth()->id());
        return Inertia::render('Creator/Dashboard', $data);
    }
}