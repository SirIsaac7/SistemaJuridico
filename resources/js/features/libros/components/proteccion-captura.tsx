import { ShieldCheck } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

const CLIPBOARD_MESSAGE = 'Documento protegido — Sistema Jurídico.\nContenido de uso personal.';

interface ProteccionCapturaProps {
    children: ReactNode;
}

export function ProteccionCaptura({ children }: ProteccionCapturaProps) {
    const [paused, setPaused] = useState(false);
    const resumeTimer = useRef<number | null>(null);

    useEffect(() => {
        function clearResumeTimer() {
            if (resumeTimer.current !== null) {
                window.clearTimeout(resumeTimer.current);
                resumeTimer.current = null;
            }
        }

        function pause() {
            clearResumeTimer();
            setPaused(true);
        }

        function resume(delay = 350) {
            clearResumeTimer();
            resumeTimer.current = window.setTimeout(() => {
                if (!document.hidden && document.hasFocus()) setPaused(false);
            }, delay);
        }

        function replaceClipboard() {
            if (!navigator.clipboard?.writeText) return;
            void navigator.clipboard.writeText(CLIPBOARD_MESSAGE).catch(() => undefined);
        }

        function pauseTemporarily() {
            pause();
            replaceClipboard();
            resume(1600);
        }

        function handleKeyDown(event: KeyboardEvent) {
            const key = event.key.toLowerCase();
            const isSaveOrPrint = (event.ctrlKey || event.metaKey) && ['p', 's'].includes(key);
            const isPrintScreen = event.key === 'PrintScreen';
            const isSystemKey = event.key === 'Meta' || event.code === 'MetaLeft' || event.code === 'MetaRight';

            if (isSaveOrPrint || isPrintScreen) event.preventDefault();
            if (isSaveOrPrint || isPrintScreen || isSystemKey) pauseTemporarily();
        }

        function handleCopy(event: ClipboardEvent) {
            event.preventDefault();
            event.clipboardData?.setData('text/plain', CLIPBOARD_MESSAGE);
            replaceClipboard();
        }

        function handleVisibility() {
            if (document.hidden) pause();
            else resume();
        }

        function handleBeforePrint() {
            pause();
            replaceClipboard();
        }

        function handleFocus() {
            resume();
        }

        function handleAfterPrint() {
            resume();
        }

        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('blur', pause);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);
        document.addEventListener('copy', handleCopy, true);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearResumeTimer();
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('blur', pause);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
            document.removeEventListener('copy', handleCopy, true);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    return (
        <>
            <div className="contents print:hidden">{children}</div>

            {paused && (
                <div className="bg-background text-foreground fixed inset-0 z-[100] grid place-items-center text-center print:hidden">
                    <div>
                        <ShieldCheck className="mx-auto size-12 text-[#5d87ff]" />
                        <p className="mt-4 font-bold">Vista en pausa</p>
                        <p className="text-muted-foreground mt-1 text-sm">Regresa al visor para continuar con la lectura.</p>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[110] hidden place-items-center bg-white text-center text-black print:grid">
                <div>
                    <ShieldCheck className="mx-auto size-12" />
                    <p className="mt-4 font-bold">Documento protegido — Sistema Jurídico</p>
                    <p className="mt-1 text-sm">Contenido de uso personal.</p>
                </div>
            </div>
        </>
    );
}
