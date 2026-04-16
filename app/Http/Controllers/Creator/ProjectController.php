<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Product;
use App\Services\Creator\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Creator\StoreProjectRequest;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Creator\UpdateProjectRequest;

class ProjectController extends Controller
{
    public function __construct(protected ProjectService $projectService) {}

    public function index()
    {
        $projects = Project::where('creator_id', auth()->id())
            ->with(['translations' => fn($q) => $q->where('locale', 'ja')])
            ->latest()
            ->get();

        return Inertia::render('Creator/Project/Index', [
            'projects' => $projects
        ]);
    }

    public function create()
    {
        // プロジェクトに紐付けるための商品一覧を取得
        $products = Product::where('creator_id', auth()->id())
            ->with(['translations' => fn($q) => $q->where('locale', 'ja')])
            ->get();

        return Inertia::render('Creator/Project/Create', [
            'products' => $products
        ]);
    }

    public function store(StoreProjectRequest $request)
    {
        // $request->validated() で検証済みのデータのみを取得
        $this->projectService->saveProject($request->validated());

        return redirect()
            ->route('creator.project.index')
            ->with('success', 'プロジェクトを始動しました！');
    }

    public function edit(Project $project)
    {
        // 所有権チェック
        if ($project->creator_id !== Auth::id()) {
            abort(403);
        }

        $project->load(['translations', 'products']);

        $products = Product::where('creator_id', Auth::id())
            ->with(['translations' => fn($q) => $q->where('locale', 'ja')])
            ->get();

        return Inertia::render('Creator/Project/Edit', [
            'project' => $project,
            'products' => $products,
        ]);
    }

    /**
     * 期間延長の実行
     */
    public function extend(Request $request, Project $project)
    {
        $request->validate([
            'new_delivery_date' => 'required|date|after:today',
            'reason'            => 'required|string|min:20',
        ]);

        $this->projectService->extendDeliveryDate(
            $project, 
            $request->new_delivery_date, 
            $request->reason
        );

        return back()->with('success', 'お届け予定日を更新し、支援者へアナウンスを公開しました。');
    }

    /**
     * プロジェクトの更新処理
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        // 1. 所有権チェック
        if ($project->creator_id !== Auth::id()) {
            abort(403);
        }
        $this->projectService->saveProject($request->validated(), $project->id);

        // 3. 一覧へリダイレクト
        return redirect()
            ->route('creator.project.index')
            ->with('success', 'プロジェクト設定を更新しました！');
    }
}