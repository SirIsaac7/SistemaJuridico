<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmail extends BaseVerifyEmail implements ShouldQueueAfterCommit
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct()
    {
        $this->onQueue('mail')->afterCommit();
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $viewData = [
            'name' => $notifiable->name,
            'verificationUrl' => $this->verificationUrl($notifiable),
            'brandIconUrl' => asset('assets/landing/normativa-virtual-email.png'),
            'expiresInMinutes' => (int) config('auth.verification.expire', 60),
            'year' => now()->year,
        ];

        return (new MailMessage)
            ->subject('Verifica tu correo electrónico')
            ->view('mail.verify-email', $viewData)
            ->text('mail.verify-email-text', $viewData);
    }
}
