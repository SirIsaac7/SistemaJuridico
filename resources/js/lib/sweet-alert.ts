import Swal, { type SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type NotificationType = 'success' | 'error';
type ConfirmationTone = 'primary' | 'success' | 'danger';

interface ConfirmationOptions {
    title: string;
    text: string;
    confirmText: string;
    icon?: SweetAlertIcon;
    tone?: ConfirmationTone;
}

const confirmationButtonClasses: Record<ConfirmationTone, string> = {
    primary:
        'inline-flex min-w-32 items-center justify-center rounded-xl bg-[#5d87ff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4d76e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d87ff]/50',
    success:
        'inline-flex min-w-32 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
    danger: 'inline-flex min-w-32 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50',
};

export function showNotification(type: NotificationType, message: string): void {
    const isSuccess = type === 'success';

    void Swal.fire({
        toast: true,
        position: 'top-end',
        icon: type,
        title: isSuccess ? '¡Listo!' : 'No se pudo completar',
        text: message,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 3000,
        timerProgressBar: true,
        width: 400,
        background: '#ffffff',
        color: '#2a3547',
        customClass: {
            popup: `rounded-2xl border bg-white shadow-[0_18px_50px_rgba(42,53,71,0.20)] ${isSuccess ? 'border-emerald-200' : 'border-red-200'}`,
            icon: 'mr-3',
            title: 'text-left text-base font-bold',
            htmlContainer: 'text-left text-sm leading-5 text-[#5a6a85]',
            closeButton:
                'text-[#7c8fac] transition-colors hover:text-[#2a3547] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d87ff]/50',
            timerProgressBar: isSuccess ? 'bg-emerald-500' : 'bg-red-500',
        },
        didOpen: (popup) => {
            popup.addEventListener('mouseenter', Swal.stopTimer);
            popup.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });
}

export async function confirmAction({ title, text, confirmText, icon = 'warning', tone = 'primary' }: ConfirmationOptions): Promise<boolean> {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        allowOutsideClick: false,
        heightAuto: false,
        background: '#ffffff',
        color: '#2a3547',
        customClass: {
            popup: 'rounded-3xl border border-[#e5eaf2] bg-white px-6 pb-7 shadow-[0_24px_70px_rgba(42,53,71,0.28)]',
            icon: 'mt-8',
            title: 'px-4 text-2xl font-bold text-[#2a3547]',
            htmlContainer: 'mt-2 px-4 text-base leading-6 text-[#5a6a85]',
            actions: 'mt-7 gap-3',
            confirmButton: confirmationButtonClasses[tone],
            cancelButton:
                'inline-flex min-w-28 items-center justify-center rounded-xl border border-[#dfe5ef] bg-white px-5 py-3 text-sm font-semibold text-[#2a3547] transition-colors hover:bg-[#f6f9fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d87ff]/40',
            closeButton:
                'm-3 rounded-full text-[#7c8fac] transition-colors hover:bg-[#eef2f7] hover:text-[#2a3547] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d87ff]/50',
        },
    });

    return result.isConfirmed;
}
