<?php

namespace App\Services\Auth;

use Illuminate\Http\Request;

class DeviceDescriptorService
{
    /**
     * @return array{tipo_dispositivo: string, sistema_operativo: string, navegador: string}
     */
    public function detect(Request $request): array
    {
        $userAgent = (string) $request->userAgent();

        return [
            'tipo_dispositivo' => $this->deviceType($userAgent),
            'sistema_operativo' => $this->operatingSystem($request, $userAgent),
            'navegador' => $this->browser($userAgent),
        ];
    }

    private function deviceType(string $userAgent): string
    {
        if (preg_match('/iPad|Tablet|PlayBook|Silk/i', $userAgent) === 1
            || (preg_match('/Android/i', $userAgent) === 1 && preg_match('/Mobile/i', $userAgent) !== 1)) {
            return 'Tablet';
        }

        if (preg_match('/Mobile|iPhone|iPod|IEMobile|Opera Mini/i', $userAgent) === 1) {
            return 'Móvil';
        }

        return 'PC/Laptop';
    }

    private function operatingSystem(Request $request, string $userAgent): string
    {
        if (preg_match('/Windows/i', (string) $request->header('Sec-CH-UA-Platform')) === 1
            || preg_match('/Windows NT 10\.0/i', $userAgent) === 1) {
            $platformVersion = trim((string) $request->header('Sec-CH-UA-Platform-Version'), '"');
            $majorVersion = (int) str($platformVersion)->before('.')->toString();

            return $majorVersion >= 13 ? 'Windows 11' : 'Windows 10';
        }

        return match (true) {
            preg_match('/Android/i', $userAgent) === 1 => 'Android',
            preg_match('/iPhone|iPad|iPod/i', $userAgent) === 1 => 'iOS',
            preg_match('/Macintosh|Mac OS X/i', $userAgent) === 1 => 'macOS',
            preg_match('/Linux/i', $userAgent) === 1 => 'Linux',
            default => 'Otro',
        };
    }

    private function browser(string $userAgent): string
    {
        return match (true) {
            preg_match('/EdgA?|EdgiOS/i', $userAgent) === 1 => 'Edge',
            preg_match('/OPR|Opera/i', $userAgent) === 1 => 'Opera',
            preg_match('/Firefox|FxiOS/i', $userAgent) === 1 => 'Firefox',
            preg_match('/Chrome|CriOS/i', $userAgent) === 1 => 'Chrome',
            preg_match('/Safari/i', $userAgent) === 1 => 'Safari',
            default => 'Otro',
        };
    }
}
