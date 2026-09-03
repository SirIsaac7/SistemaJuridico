import { AnimatePresence, motion } from 'framer-motion';
import {
    Cloud,
    CloudFog,
    CloudLightning,
    CloudRain,
    CloudSnow,
    CloudSun,
    Clock3,
    LoaderCircle,
    LocateFixed,
    MoonStar,
    RefreshCw,
    Sun,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface CurrentWeather {
    temperature: number;
    apparentTemperature: number;
    code: number;
    isDay: boolean;
    unit: string;
}

type WeatherState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; weather: CurrentWeather }
    | { status: 'error'; message: string };

function getWeatherPresentation(code: number, isDay: boolean): { label: string; Icon: LucideIcon } {
    if (code === 0) {
        return { label: isDay ? 'Despejado' : 'Noche despejada', Icon: isDay ? Sun : MoonStar };
    }

    if (code <= 2) return { label: 'Parcialmente nublado', Icon: CloudSun };
    if (code === 3) return { label: 'Nublado', Icon: Cloud };
    if (code === 45 || code === 48) return { label: 'Neblina', Icon: CloudFog };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        return { label: code <= 57 ? 'Llovizna' : 'Lluvia', Icon: CloudRain };
    }
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { label: 'Nieve', Icon: CloudSnow };
    if (code >= 95) return { label: 'Tormenta', Icon: CloudLightning };

    return { label: 'Clima actual', Icon: CloudSun };
}

export function LocalConditions() {
    const [now, setNow] = useState(() => new Date());
    const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'idle' });
    const requestController = useRef<AbortController | null>(null);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 30_000);

        return () => {
            window.clearInterval(timer);
            requestController.current?.abort();
        };
    }, []);

    const formattedTime = useMemo(
        () => new Intl.DateTimeFormat('es-BO', { hour: '2-digit', minute: '2-digit' }).format(now),
        [now],
    );
    const formattedDate = useMemo(
        () => new Intl.DateTimeFormat('es-BO', { weekday: 'short', day: 'numeric', month: 'short' }).format(now),
        [now],
    );

    const requestWeather = () => {
        if (!navigator.geolocation) {
            setWeatherState({ status: 'error', message: 'Ubicación no disponible' });
            return;
        }

        requestController.current?.abort();
        setWeatherState({ status: 'loading' });

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const controller = new AbortController();
                requestController.current = controller;
                const query = new URLSearchParams({
                    latitude: coords.latitude.toFixed(3),
                    longitude: coords.longitude.toFixed(3),
                    current: 'temperature_2m,apparent_temperature,weather_code,is_day',
                    timezone: 'auto',
                });

                try {
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`, {
                        signal: controller.signal,
                    });

                    if (!response.ok) throw new Error('Weather request failed');

                    const data = (await response.json()) as {
                        current?: {
                            temperature_2m?: number;
                            apparent_temperature?: number;
                            weather_code?: number;
                            is_day?: number;
                        };
                        current_units?: { temperature_2m?: string };
                    };

                    if (
                        !data.current ||
                        typeof data.current.temperature_2m !== 'number' ||
                        typeof data.current.apparent_temperature !== 'number' ||
                        typeof data.current.weather_code !== 'number'
                    ) {
                        throw new Error('Invalid weather response');
                    }

                    setWeatherState({
                        status: 'success',
                        weather: {
                            temperature: data.current.temperature_2m,
                            apparentTemperature: data.current.apparent_temperature,
                            code: data.current.weather_code,
                            isDay: data.current.is_day === 1,
                            unit: data.current_units?.temperature_2m ?? '°C',
                        },
                    });
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'AbortError') return;
                    setWeatherState({ status: 'error', message: 'No se pudo consultar el clima' });
                }
            },
            (error) => {
                setWeatherState({
                    status: 'error',
                    message: error.code === error.PERMISSION_DENIED ? 'Permite la ubicación para ver el clima' : 'Ubicación no disponible',
                });
            },
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
        );
    };

    const presentation =
        weatherState.status === 'success'
            ? getWeatherPresentation(weatherState.weather.code, weatherState.weather.isDay)
            : null;

    return (
        <div className="flex flex-wrap items-stretch gap-2 text-sm">
            <div className="flex min-w-32 items-center gap-2 rounded-xl border border-white/50 bg-white/65 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#1c2a3e]/75">
                <Clock3 className="size-5 text-[#5d87ff]" aria-hidden="true" />
                <div>
                    <p className="text-foreground font-semibold tabular-nums">{formattedTime}</p>
                    <p className="text-muted-foreground text-xs capitalize">{formattedDate}</p>
                </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
                {weatherState.status === 'success' && presentation ? (
                    <motion.button
                        key="weather-success"
                        type="button"
                        onClick={requestWeather}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex min-w-40 items-center gap-2 rounded-xl border border-white/50 bg-white/65 px-3 py-2 text-left shadow-sm backdrop-blur-sm transition hover:bg-white/85 dark:border-white/10 dark:bg-[#1c2a3e]/75 dark:hover:bg-[#24364f]"
                        title={`Sensación térmica: ${Math.round(weatherState.weather.apparentTemperature)}${weatherState.weather.unit}. Actualizar clima`}
                    >
                        <presentation.Icon className="size-6 text-[#f6b51e]" aria-hidden="true" />
                        <div>
                            <p className="text-foreground font-semibold">
                                {Math.round(weatherState.weather.temperature)}{weatherState.weather.unit}
                            </p>
                            <p className="text-muted-foreground text-xs">{presentation.label}</p>
                        </div>
                    </motion.button>
                ) : (
                    <motion.button
                        key={weatherState.status}
                        type="button"
                        onClick={requestWeather}
                        disabled={weatherState.status === 'loading'}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex min-w-40 items-center gap-2 rounded-xl border border-white/50 bg-white/65 px-3 py-2 text-left shadow-sm backdrop-blur-sm transition hover:bg-white/85 disabled:cursor-wait dark:border-white/10 dark:bg-[#1c2a3e]/75 dark:hover:bg-[#24364f]"
                    >
                        {weatherState.status === 'loading' ? (
                            <LoaderCircle className="size-5 animate-spin text-[#49beff]" aria-hidden="true" />
                        ) : weatherState.status === 'error' ? (
                            <RefreshCw className="size-5 text-[#49beff]" aria-hidden="true" />
                        ) : (
                            <LocateFixed className="size-5 text-[#49beff]" aria-hidden="true" />
                        )}
                        <span className="text-foreground text-xs font-medium">
                            {weatherState.status === 'loading'
                                ? 'Consultando clima…'
                                : weatherState.status === 'error'
                                  ? weatherState.message
                                  : 'Ver clima local'}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
