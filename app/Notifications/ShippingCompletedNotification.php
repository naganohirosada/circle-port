<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ShippingCompletedNotification extends Notification
{
    use Queueable;

    public function __construct(protected $shipping) {}

    public function via($notifiable): array { return ['mail']; }

    public function toMail($notifiable): MailMessage
    {
        $projectTitle = $this->shipping->project->translations->firstWhere('locale', 'ja')->title;

        return (new MailMessage)
            ->subject("【発送完了】商品を発送いたしました！ | {$projectTitle}")
            ->greeting("{$notifiable->name} 様")
            ->line("大変お待たせいたしました！")
            ->line("ご支援いただいたプロジェクトの商品を本日発送いたしました。")
            ->line("お手元に届くまで、今しばらくお待ちください。")
            ->action('配送状況を確認する', url('/dashboard'))
            ->line("CP STUDIO をご利用いただき、誠にありがとうございます。");
    }
}