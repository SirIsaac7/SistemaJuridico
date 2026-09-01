<?php

namespace Tests;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Feature tests behave like one browser: repeated requests keep the
        // same persistent device cookie unless a test explicitly replaces it.
        $this->withCookie(
            (string) config('device_access.cookie.name'),
            'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        );
    }

    public function actingAs(Authenticatable $user, $guard = null)
    {
        $this->withCookie(
            (string) config('session.cookie'),
            sha1('test-session-'.$user->getAuthIdentifier()),
        );

        return parent::actingAs($user, $guard);
    }
}
