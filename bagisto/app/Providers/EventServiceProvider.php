<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Log;
use Webkul\Checkout\Contracts\CartItem;
use Webkul\Checkout\Models\Cart;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    // protected $listen = [
    //     Registered::class => [
    //         SendEmailVerificationNotification::class,
    //     ],
    // ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        Event::listen('checkout.cart.add.after', function (Cart $cart) {
            $count = 0;
            foreach($cart->items()->get() as $item) {
                $count += $item->quantity;
            }

            Log::info("EVENT: Cart {$cart->id} has {$count} items");
        });

        Event::listen('checkout.cart.out_of_stock', function ($name) {
            Log::info("EVENT: Item \"{$name}\" is out of stock");
        });

        Event::listen('checkout.order.save.after', function () {
            Log::info("New order placed!");
        });
    }
}