<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('creators', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('id');
            $table->string('thanks_card_background')->nullable()->after('logo_path');
            $table->string('thanks_card_signature')->nullable()->after('thanks_card_background');
            $table->text('thanks_card_message')->nullable()->after('thanks_card_signature');
        });
    }

    public function down()
    {
        Schema::table('creators', function (Blueprint $table) {
            $table->dropColumn(['logo_path', 'thanks_card_background', 'thanks_card_signature', 'thanks_card_message']);
        });
    }
};