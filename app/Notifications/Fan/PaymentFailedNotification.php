<?php

namespace App\Notifications\Fan;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailedNotification extends Notification
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = route('fan.orders.show', $this->order->id);

        return (new MailMessage)
            ->subject(__('Action Required: Payment Failed for Group Order'))
            ->greeting(__('Hello, :name', ['name' => $notifiable->name]))
            ->line(__('The automatic payment for the Group Order ":title" has failed.', ['title' => $this->order->groupOrder->title]))
            ->line(__('This may be due to an expired card or insufficient funds.'))
            ->action(__('Update Card & Retry Payment'), $url)
            ->line(__('Please complete the payment within 3 days to ensure your participation.'))
            ->line(__('Thank you for using CirclePort.'));
    }
}