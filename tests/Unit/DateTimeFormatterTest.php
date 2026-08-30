<?php

namespace Tests\Unit;

use App\Support\DateTimeFormatter;
use Carbon\CarbonImmutable;
use Tests\TestCase;

class DateTimeFormatterTest extends TestCase
{
    public function test_it_displays_utc_dates_in_the_configured_timezone(): void
    {
        config(['app.display_timezone' => 'America/La_Paz']);

        $dateTime = CarbonImmutable::parse('2026-08-30 00:30:00', 'UTC');

        $this->assertSame('29/08/2026 20:30', DateTimeFormatter::forDisplay($dateTime));
    }

    public function test_it_accepts_an_empty_date(): void
    {
        $this->assertNull(DateTimeFormatter::forDisplay(null));
    }
}
