<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            
            // プロジェクト内での表示順
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();

            // 同じプロジェクトに同じ商品が重複登録されないように
            $table->unique(['project_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_product');
    }
};