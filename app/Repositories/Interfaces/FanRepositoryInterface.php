<?php
namespace App\Repositories\Interfaces;

interface FanRepositoryInterface {
    public function updateProfile(int $fanId, array $userData, array $fanData);
    public function getProfile(int $fanId);
}