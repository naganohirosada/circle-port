<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\SoftDeletes;

return new class extends Migration
{
    use SoftDeletes;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ja');
            $table->string('iso_code', 2)->unique();
            $table->string('currency_code', 3);
            $table->string('lang_code', 5);
            $table->decimal('vat_rate', 5, 2)->default(0);
            $table->integer('status')->default(1); // 1:Active, 2:Inactive
            $table->timestamps();
            $table->softDeletes(); // 論理削除
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
