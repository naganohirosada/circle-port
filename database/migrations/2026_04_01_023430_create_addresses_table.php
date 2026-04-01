<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->foreignId('country_id')->constrained();
            
            $table->string('name');              // 受取人氏名
            $table->string('phone');             // 電話番号
            $table->string('postal_code', 20);   // 郵便番号
            $table->string('state');             // 都道府県・州
            $table->string('city');              // 市区町村
            $table->string('address_line1');     // 住所1（番地等）
            $table->string('address_line2')->nullable(); // 住所2（建物名等）
            $table->tinyInteger('is_default')->default(0); 
            $table->softDeletes(); // 憲法：論理削除
            $table->timestamps();

            $table->index(['fan_id', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
