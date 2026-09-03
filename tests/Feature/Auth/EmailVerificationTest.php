<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\VerifyEmail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('auth/verify-email')
            ->where('auth.user.email', $user->email));
    }

    public function test_email_can_be_verified_from_another_device_without_authorizing_it(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake([Verified::class]);

        $response = $this->get($this->verificationUrl($user));

        $response
            ->assertRedirect(route('verification.success', absolute: false))
            ->assertSessionHas('email_verification_completed', true);
        $this->assertGuest();
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertDatabaseCount('dispositivos_usuario', 0);
        Event::assertDispatched(Verified::class, fn (Verified $event): bool => $event->user->is($user));
    }

    public function test_email_is_not_verified_with_invalid_hash(): void
    {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('wrong-email')]
        );

        $this->get($verificationUrl)->assertForbidden();

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_email_is_not_verified_with_expired_signature(): void
    {
        $user = User::factory()->unverified()->create();
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinute(),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );
        $this->travel(2)->minutes();

        $this->get($verificationUrl)->assertForbidden();

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_unverified_user_is_redirected_from_protected_content(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('verification.notice', absolute: false));
    }

    public function test_verification_email_can_be_resent(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->post('/email/verification-notification')
            ->assertRedirect()
            ->assertSessionHas('status', 'verification-link-sent');

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_verification_success_screen_requires_completed_verification(): void
    {
        $this->get('/email-verified')->assertRedirect(route('home', absolute: false));
    }

    public function test_guest_sees_confirmation_after_verifying_email(): void
    {
        $user = User::factory()->unverified()->create();
        $this->get($this->verificationUrl($user));

        $this->get('/email-verified')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('auth/email-verified')
            ->where('canContinue', false));
    }

    private function verificationUrl(User $user): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );
    }
}
