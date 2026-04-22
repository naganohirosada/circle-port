<?php

namespace App\Repositories\Eloquent\Carrier;

use App\Models\Carrier;
use App\Repositories\Interfaces\CarrierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CarrierRepository implements CarrierRepositoryInterface
{
    public function all(): Collection
    {
        return Carrier::orderBy('id', 'asc')->get();
    }

    public function findById(int $id): Carrier
    {
        return Carrier::findOrFail($id);
    }

    public function create(array $data): Carrier
    {
        return Carrier::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Carrier::findOrFail($id)->update($data);
    }

    public function delete(int $id): bool
    {
        return Carrier::findOrFail($id)->delete();
    }
}