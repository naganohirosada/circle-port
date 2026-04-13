<?php
namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Services\Creator\SalesService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SalesController extends Controller
{
    protected $salesService;

    public function __construct(SalesService $salesService)
    {
        $this->salesService = $salesService;
    }

    public function index()
    {
        $data = $this->salesService->getCreatorSalesSummary(Auth::id());

        return Inertia::render('Creator/Sales/Index', [
            'salesData' => $data['payments'],
            'summary' => $data['summary']
        ]);
    }
}