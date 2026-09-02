import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProteccionCaptura } from '@/features/libros/components/proteccion-captura';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Minus, Pause, Play, Plus, Search } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { type FormEvent, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface VisorProps {
    materia: {
        id: number;
        nombre: string;
    };
    archivo: {
        id: number;
        titulo: string;
        tipo: 'pdf' | 'imagen' | 'video';
        mime_type: string;
        contenido_url: string;
    };
}

function Watermark() {
    return (
        <div className="pointer-events-none absolute inset-0 z-20 grid grid-cols-2 content-around overflow-hidden opacity-20 select-none sm:grid-cols-3">
            {Array.from({ length: 15 }, (_, index) => (
                <span key={index} className="flex -rotate-12 flex-col px-3 text-center text-xs font-bold text-white mix-blend-difference">
                    <span>Documento protegido — Sistema Jurídico</span>
                    <span>Contenido de uso personal</span>
                </span>
            ))}
        </div>
    );
}

function useReadingFocus() {
    const [focusY, setFocusY] = useState(50);

    function followPointer(event: ReactPointerEvent<HTMLElement>) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (bounds.height === 0) return;

        const relativeY = ((event.clientY - bounds.top) / bounds.height) * 100;
        setFocusY(Math.min(88, Math.max(12, relativeY)));
    }

    return { focusY, followPointer };
}

function ReadingFocus({ focusY }: { focusY: number }) {
    return (
        <div className="pointer-events-none absolute inset-0 z-10 [--focus-half:36px] sm:[--focus-half:42px] lg:[--focus-half:48px]">
            <div
                className="absolute inset-x-0 top-0 border-b border-slate-500/20 bg-white/5 backdrop-blur-[6px] dark:border-white/15 dark:bg-slate-950/5"
                style={{ height: `max(0px, calc(${focusY}% - var(--focus-half)))` }}
            />
            <div
                className="absolute inset-x-0 bottom-0 border-t border-slate-500/20 bg-white/5 backdrop-blur-[6px] dark:border-white/15 dark:bg-slate-950/5"
                style={{ height: `max(0px, calc(${100 - focusY}% - var(--focus-half)))` }}
            />
        </div>
    );
}

function PdfViewer({ url }: { url: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { focusY, followPointer } = useReadingFocus();
    const [document, setDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState('1');
    const [pageInputError, setPageInputError] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const task = pdfjs.getDocument({ url, withCredentials: true });
        let active = true;

        void task.promise
            .then((loadedDocument) => {
                if (!active) return;
                setDocument(loadedDocument);
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setError('No se pudo abrir el PDF protegido.');
                setLoading(false);
            });

        return () => {
            active = false;
            void task.destroy();
        };
    }, [url]);

    useEffect(() => {
        if (!document || !canvasRef.current) return;

        let renderTask: pdfjs.RenderTask | null = null;
        let cancelled = false;

        void document.getPage(page).then((pdfPage) => {
            if (cancelled || !canvasRef.current) return;

            const viewport = pdfPage.getViewport({ scale: zoom * 1.35 });
            const pixelRatio = window.devicePixelRatio || 1;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.width = Math.floor(viewport.width * pixelRatio);
            canvas.height = Math.floor(viewport.height * pixelRatio);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;

            renderTask = pdfPage.render({
                canvasContext: context,
                canvas,
                viewport,
                transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
            });

            return renderTask.promise;
        });

        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [document, page, zoom]);

    function changePage(nextPage: number) {
        if (!document) return;

        const validPage = Math.min(document.numPages, Math.max(1, nextPage));
        setPage(validPage);
        setPageInput(String(validPage));
        setPageInputError(false);
    }

    function searchPage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!document) return;

        const requestedPage = Number(pageInput);
        if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > document.numPages) {
            setPageInputError(true);
            return;
        }

        changePage(requestedPage);
    }

    if (loading) return <div className="text-muted-foreground grid min-h-[60vh] place-items-center text-sm">Preparando PDF…</div>;
    if (error || !document) return <div className="grid min-h-[60vh] place-items-center text-sm text-red-500">{error}</div>;

    return (
        <>
            <div className="border-border bg-background flex flex-wrap items-center justify-center gap-2 border-b p-3 shadow-sm">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => changePage(page - 1)}>
                    <ChevronLeft className="size-4" /> Anterior
                </Button>
                <form onSubmit={searchPage} className="flex items-center gap-2" noValidate>
                    <label htmlFor="pdf-page" className="text-foreground text-sm font-semibold">
                        Página
                    </label>
                    <Input
                        id="pdf-page"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={document.numPages}
                        value={pageInput}
                        aria-invalid={pageInputError}
                        aria-label={`Número de página, entre 1 y ${document.numPages}`}
                        className={`h-9 w-16 text-center ${pageInputError ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                        onChange={(event) => {
                            setPageInput(event.target.value);
                            setPageInputError(false);
                        }}
                    />
                    <span className="text-muted-foreground text-sm">de {document.numPages}</span>
                    <Button type="submit" variant="outline" size="sm" aria-label="Ir a la página indicada">
                        <Search className="size-4" /> <span className="hidden sm:inline">Ir</span>
                    </Button>
                </form>
                <Button variant="outline" size="sm" disabled={page >= document.numPages} onClick={() => changePage(page + 1)}>
                    Siguiente <ChevronRight className="size-4" />
                </Button>
                <div className="ml-0 flex items-center gap-1 sm:ml-4">
                    <Button variant="outline" size="icon" disabled={zoom <= 0.7} onClick={() => setZoom((current) => Math.max(0.7, current - 0.1))}>
                        <Minus className="size-4" />
                    </Button>
                    <span className="text-muted-foreground w-14 text-center text-xs">{Math.round(zoom * 100)}%</span>
                    <Button variant="outline" size="icon" disabled={zoom >= 1.6} onClick={() => setZoom((current) => Math.min(1.6, current + 0.1))}>
                        <Plus className="size-4" />
                    </Button>
                </div>
            </div>
            <div
                className="relative flex min-h-[70vh] justify-center overflow-auto bg-[#e8eef6] p-3 sm:p-8 dark:bg-[#1d2a3d]"
                onContextMenu={(event) => event.preventDefault()}
            >
                <div
                    className="relative h-fit w-fit touch-pan-y overflow-hidden shadow-2xl"
                    onPointerDown={followPointer}
                    onPointerMove={followPointer}
                >
                    <canvas ref={canvasRef} className="block max-w-none bg-white" />
                    <ReadingFocus focusY={focusY} />
                    <Watermark />
                </div>
            </div>
        </>
    );
}

function ImageViewer({ url, title }: { url: string; title: string }) {
    const { focusY, followPointer } = useReadingFocus();

    return (
        <div
            className="relative flex min-h-[75vh] items-center justify-center overflow-auto bg-[#e8eef6] p-3 sm:p-8 dark:bg-[#1d2a3d]"
            onContextMenu={(event) => event.preventDefault()}
        >
            <div className="relative touch-pan-y overflow-hidden shadow-2xl" onPointerDown={followPointer} onPointerMove={followPointer}>
                <img src={url} alt={title} draggable={false} className="block max-h-[80vh] max-w-full select-none" />
                <ReadingFocus focusY={focusY} />
                <Watermark />
            </div>
        </div>
    );
}

function VideoViewer({ url }: { url: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    function togglePlayback() {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) void video.play();
        else video.pause();
    }

    function formatTime(seconds: number) {
        if (!Number.isFinite(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        return `${minutes}:${Math.floor(seconds % 60)
            .toString()
            .padStart(2, '0')}`;
    }

    return (
        <div className="flex min-h-[75vh] items-center justify-center bg-black p-3 sm:p-8">
            <div className="relative w-full max-w-6xl overflow-hidden bg-black shadow-2xl" onContextMenu={(event) => event.preventDefault()}>
                <video
                    ref={videoRef}
                    src={url}
                    preload="metadata"
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload noremoteplayback"
                    className="aspect-video w-full"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                    onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                    onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                />
                <Watermark />
                <div className="absolute inset-x-0 bottom-0 z-30 flex flex-wrap items-center gap-3 bg-gradient-to-t from-black/90 to-transparent px-4 pt-10 pb-4">
                    <Button type="button" size="sm" variant="outline" onClick={togglePlayback}>
                        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                        {playing ? 'Pausar' : 'Reproducir'}
                    </Button>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={Math.min(currentTime, duration || 0)}
                        aria-label="Posición del video"
                        className="min-w-36 flex-1 accent-blue-500"
                        onChange={(event) => {
                            const nextTime = Number(event.target.value);
                            if (videoRef.current) videoRef.current.currentTime = nextTime;
                            setCurrentTime(nextTime);
                        }}
                    />
                    <span className="min-w-24 text-right text-xs text-white/70">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ArchivoConcedidoVisor({ materia, archivo }: VisorProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Libros', href: '/libros' },
        { title: materia.nombre, href: `/libros/materias/${materia.id}` },
        { title: archivo.titulo, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Visor · ${archivo.titulo}`}>
                <meta name="robots" content="noindex,nofollow,noarchive" />
            </Head>

            <ProteccionCaptura>
                <main className="relative flex flex-1 flex-col bg-[#f6f9fc] dark:bg-[#152033]">
                    <header className="border-border bg-background flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <Link
                                href={`/libros/materias/${materia.id}`}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-[#5d87ff] hover:underline dark:text-blue-300"
                            >
                                <ArrowLeft className="size-3.5" /> Volver a {materia.nombre}
                            </Link>
                            <h1 className="text-foreground mt-1 truncate text-lg font-bold">{archivo.titulo}</h1>
                        </div>
                    </header>

                    {archivo.tipo !== 'video' && (
                        <div className="border-border bg-background/70 text-muted-foreground flex items-start gap-2 border-b px-4 py-2.5 text-xs">
                            <BookOpen className="mt-0.5 size-4 shrink-0 text-[#5d87ff]" />
                            <span>En computadora, mueve el cursor para enfocar la lectura. En celular o tablet, toca la zona que quieras leer.</span>
                        </div>
                    )}

                    {archivo.tipo === 'pdf' && <PdfViewer url={archivo.contenido_url} />}
                    {archivo.tipo === 'imagen' && <ImageViewer url={archivo.contenido_url} title={archivo.titulo} />}
                    {archivo.tipo === 'video' && <VideoViewer url={archivo.contenido_url} />}
                </main>
            </ProteccionCaptura>
        </AppLayout>
    );
}
