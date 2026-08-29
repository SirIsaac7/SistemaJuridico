<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WelcomeTest extends TestCase
{
    public function test_guest_can_visit_the_landing_page(): void
    {
        $this->withoutVite();

        $response = $this->get('/');

        $response->assertInertia(fn (Assert $page) => $page->component('welcome'));
    }
}
