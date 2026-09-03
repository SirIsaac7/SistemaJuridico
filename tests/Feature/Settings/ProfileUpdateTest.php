<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/settings/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/settings/profile', [
                'name' => 'Test User',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/settings/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_email_address_cannot_be_updated_from_the_profile()
    {
        $user = User::factory()->create();
        $originalEmail = $user->email;

        $response = $this
            ->actingAs($user)
            ->from('/settings/profile')
            ->patch('/settings/profile', [
                'name' => 'Test User',
                'email' => 'nuevo@example.com',
            ]);

        $response
            ->assertRedirect('/settings/profile')
            ->assertSessionHasErrors([
                'email' => 'El correo electrónico no puede modificarse desde el perfil.',
            ]);

        $user->refresh();

        $this->assertSame($originalEmail, $user->email);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_profile_validation_messages_are_displayed_in_spanish()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/settings/profile')
            ->patch('/settings/profile', [
                'name' => '',
            ]);

        $response->assertRedirect('/settings/profile')->assertSessionHasErrors([
            'name' => 'Ingresa tu nombre.',
        ]);
    }

    public function test_account_deletion_endpoint_is_not_available()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/settings/profile');

        $response->assertMethodNotAllowed();

        $this->assertNotSoftDeleted($user);
    }

    public function test_appearance_settings_page_is_not_available()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/settings/appearance');

        $response->assertNotFound();
    }
}
