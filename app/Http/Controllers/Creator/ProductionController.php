<?php
namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Services\Creator\ProductionService;
use App\Models\GroupOrder;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    protected $productionService;

    public function __construct(ProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    /**
     * 製作リスト画面の表示
     */
    public function index(Request $request)
    {
        $creatorId = auth()->id();
        $goId = $request->query('group_order_id');
        
        $groupOrder = null;
        if ($goId) {
            $groupOrder = GroupOrder::where('id', $goId)
                ->where('creator_id', $creatorId)
                ->firstOrFail();
        }

        $productionList = $this->productionService->getProductionSummary($creatorId, $goId);

        return inertia('Creator/Production/Index', [
            'productionList' => $productionList,
            'groupOrder' => $groupOrder, // 特定プロジェクト表示用
            'filters' => $request->only(['group_order_id'])
        ]);
    }
}