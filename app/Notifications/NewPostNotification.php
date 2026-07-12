<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPostNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Post $post,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $authorName = $this->post->user->name ?? 'Someone';

        return (new MailMessage)
            ->subject("New post from {$authorName}")
            ->line("A new post was shared by {$authorName}.")
            ->action('View Post', url('/'))
            ->line('Thank you for using our application!');
    }
}
