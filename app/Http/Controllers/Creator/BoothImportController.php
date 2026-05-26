<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Creator\BoothImportService;
use Inertia\Inertia;

class BoothImportController extends Controller
{
    protected $importService;

    public function __construct(BoothImportService $importService)
    {
        $this->importService = $importService;
    }

    public function index()
    {
        return Inertia::render('Creator/Product/BoothImport', [
            'status' => session('status'),
            'error' => session('error')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120', // 最大5MB
        ]);

        $creator = auth()->user()->creator;
        if (!$creator) {
            return redirect()->back()->with('error', 'Creator profile not found.');
        }

        try {
            $result = $this->importService->importFromCsv(
                $request->file('csv_file'),
                $creator->id
            );

            return redirect()->route('creator.products.index')->with(
                'status',
                "Successfully imported {$result['imported']} artworks! (Skipped rows: {$result['skipped']})"
            );

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to parse BOOTH CSV format. Please ensure the column structure is valid.');
        }
    }
}