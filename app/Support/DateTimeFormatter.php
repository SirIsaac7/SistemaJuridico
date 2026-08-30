<?php

namespace App\Support;

use Carbon\CarbonInterface;

class DateTimeFormatter
{
    public static function forDisplay(?CarbonInterface $dateTime): ?string
    {
        return $dateTime
            ?->copy()
            ->setTimezone(config('app.display_timezone'))
            ->format('d/m/Y H:i');
    }
}
