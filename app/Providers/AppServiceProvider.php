<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\Eloquent\Creator\ProductRepository;
use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\Eloquent\Cart\SessionCartRepository;
use App\Repositories\Eloquent\Address\AddressRepository;
use App\Repositories\Interfaces\AddressRepositoryInterface;
use App\Repositories\Interfaces\PaymentRepositoryInterface;
use App\Repositories\Eloquent\Payment\PaymentRepository;
use App\Repositories\Interfaces\FanRepositoryInterface;
use App\Repositories\Eloquent\Fan\FanRepository;
use App\Repositories\Eloquent\Order\OrderRepository;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Repositories\Eloquent\GroupOrder\GroupOrderRepository;
use App\Repositories\Interfaces\CountryRepositoryInterface;
use App\Repositories\Eloquent\CountryRepository;
use App\Repositories\Interfaces\CreatorRepositoryInterface;
use App\Repositories\Eloquent\Creator\CreatorRepository;
use App\Repositories\Interfaces\ProductionRepositoryInterface;
use App\Repositories\Eloquent\Creator\ProductionRepository;
use App\Repositories\Interfaces\SalesRepositoryInterface;
use App\Repositories\Eloquent\Creator\SalesRepository;
use App\Repositories\Interfaces\DomesticShippingRepositoryInterface;
use App\Repositories\Eloquent\Creator\DomesticShippingRepository;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use App\Repositories\Eloquent\Creator\ProjectRepository;
use App\Repositories\Interfaces\InternationalShippingRepositoryInterface;
use App\Repositories\Eloquent\Admin\InternationalShippingRepository;
use App\Repositories\Interfaces\CarrierRepositoryInterface;
use App\Repositories\Eloquent\Carrier\CarrierRepository;
use App\Repositories\Interfaces\PaymentMethodRepositoryInterface;
use App\Repositories\Eloquent\Payment\PaymentMethodRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(CartRepositoryInterface::class, SessionCartRepository::class);
        $this->app->bind(AddressRepositoryInterface::class, AddressRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, PaymentRepository::class);
        $this->app->bind(FanRepositoryInterface::class, FanRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->bind(GroupOrderRepositoryInterface::class, GroupOrderRepository::class);
        $this->app->bind(CountryRepositoryInterface::class, CountryRepository::class);
        $this->app->bind(CreatorRepositoryInterface::class, CreatorRepository::class);
        $this->app->bind(ProductionRepositoryInterface::class, ProductionRepository::class);
        $this->app->bind(SalesRepositoryInterface::class, SalesRepository::class);
        $this->app->bind(DomesticShippingRepositoryInterface::class, DomesticShippingRepository::class);
        $this->app->bind(ProjectRepositoryInterface::class, ProjectRepository::class);
        $this->app->bind(InternationalShippingRepositoryInterface::class, InternationalShippingRepository::class);
        $this->app->bind(CarrierRepositoryInterface::class, CarrierRepository::class);
        $this->app->bind(PaymentMethodRepositoryInterface::class,PaymentMethodRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
