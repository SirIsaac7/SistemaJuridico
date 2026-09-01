<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Debug\ShouldntReport;

class DeviceAccessException extends Exception implements ShouldntReport
{
    public const DEVICE_NOT_AUTHORIZED = 'DEVICE_NOT_AUTHORIZED';

    public const ACTIVE_SESSION_EXISTS = 'ACTIVE_SESSION_EXISTS';

    public const SESSION_NOT_AUTHORIZED = 'SESSION_NOT_AUTHORIZED';

    private function __construct(
        public readonly string $errorCode,
        public readonly int $status,
        string $message,
    ) {
        parent::__construct($message);
    }

    public static function deviceNotAuthorized(): self
    {
        return new self(
            self::DEVICE_NOT_AUTHORIZED,
            403,
            'Tu cuenta ya está vinculada a otro navegador o dispositivo. Solicita un cambio de dispositivo para acceder.',
        );
    }

    public static function activeSessionExists(): self
    {
        return new self(
            self::ACTIVE_SESSION_EXISTS,
            409,
            'Ya tienes una sesión activa. Cierra tu sesión anterior antes de iniciar nuevamente.',
        );
    }

    public static function sessionNotAuthorized(): self
    {
        return new self(
            self::SESSION_NOT_AUTHORIZED,
            401,
            'Tu sesión ya no está autorizada. Inicia sesión nuevamente.',
        );
    }
}
