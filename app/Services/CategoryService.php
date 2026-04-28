<?php
namespace App\Services;

use App\Models\Category;

class CategoryService
{
    /**
     * すべてのカテゴリを翻訳付きで取得
     */
    public function getAll()
    {
        return Category::with(['translations', 'subCategories.translations'])
            ->get();
    }
}