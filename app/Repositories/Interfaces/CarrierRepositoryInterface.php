<?php

namespace App\Repositories\Interfaces;

use App\Models\Carrier;
use Illuminate\Database\Eloquent\Collection;

interface CarrierRepositoryInterface
{
    public function all(): Collection;
    public function findById(int $id): Carrier;
    public function create(array $data): Carrier;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}