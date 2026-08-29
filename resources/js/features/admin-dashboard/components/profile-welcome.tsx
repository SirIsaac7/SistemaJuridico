import supportImage from '../assets/customer-support-img.png';
import userImage from '../assets/user-1.jpg';

interface ProfileWelcomeProps {
    userName: string;
}

export function ProfileWelcome({ userName }: ProfileWelcomeProps) {
    return (
        <section className="relative flex min-h-24 items-center justify-between overflow-hidden rounded-lg bg-[#49beff]/12 p-6 dark:bg-[#49beff]/20">
            <div className="flex items-center gap-3">
                <img src={userImage} alt="Perfil de usuario" width={50} height={50} className="size-[50px] rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-foreground text-lg font-semibold">¡Bienvenido de nuevo, {userName}! 👋</h1>
                    <p className="text-muted-foreground text-sm">Revisa el resumen de la actividad jurídica</p>
                </div>
            </div>

            <img
                src={supportImage}
                alt="Asistencia del Sistema Jurídico"
                width={145}
                height={95}
                className="absolute right-8 bottom-0 hidden sm:block"
            />
        </section>
    );
}
