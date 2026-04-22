<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('international_shippings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fan_id')->constrained()->onDelete('cascade');
            $table->foreignId('address_id')->nullable()->constrained('addresses');
            $table->foreignId('carrier_id')->nullable()->constrained('carriers');
            $table->string('tracking_number')->nullable();
            
            // 文字列から数値（tinyint）に変更
            $table->unsignedTinyInteger('status')->default(10); // 10: PENDING
            
            $table->decimal('total_weight', 8, 2)->nullable();
            $table->integer('shipping_fee')->nullable();
            $table->json('dimensions')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('international_shippings');
    }
};
