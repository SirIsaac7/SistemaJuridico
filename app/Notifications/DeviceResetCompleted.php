<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeviceResetCompleted extends Notification implements ShouldQueueAfterCommit
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct()
    {
        $this->onQueue('mail')->afterCommit();
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $viewData = [
            'name' => $notifiable->name,
            'loginUrl' => route('login'),
            'brandIconUrl' => asset('assets/landing/normativa-virtual-email.png'),
            'year' => now()->year,
        ];

        return (new MailMessage)
            ->subject('Tu dispositivo fue restablecido')
            ->view('mail.device-reset-completed', $viewData)
            ->text('mail.device-reset-completed-text', $viewData);
    }
}
