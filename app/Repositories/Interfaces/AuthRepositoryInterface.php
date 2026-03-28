<?php

namespace App\Repositories\Interfaces;

interface AuthRepositoryInterface
{
    /**
     * ユーザー登録とログインの両方を処理するメソッド
     * @param array $data ユーザー登録に必要なデータ（例: name, email, password, country_id）
     * @return mixed 登録されたユーザー情報やトークンなどの認証
     */
    public function create(array $data);
    /**
     * メールアドレスでユーザーを検索するメソッド
     * @param string $email 検索するメールアドレス
     * @return mixed 見つかったユーザー情報やnullなどの結果
     */
    public function findByEmail(string $email);
}