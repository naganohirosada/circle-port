<?php
namespace App\Repositories\Interfaces;

interface PaymentRepositoryInterface {
    public function getByFanId(int $fanId);
    public function store(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
    public function resetDefault(int $fanId);
    public function findByIdAndFan(int $id, int $fanId);
}