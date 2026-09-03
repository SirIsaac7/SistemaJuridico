import supportImage from '../assets/customer-support-img.png';
import userImage from '../assets/user-1.jpg';
import { LocalConditions } from './local-conditions';

interface ProfileWelcomeProps {
    userName: string;
    description?: string;
}

export function ProfileWelcome({ userName, description = 'Revisa el resumen de la actividad jurídica' }: ProfileWelcomeProps) {
    return (
        <section className="relative min-h-24 overflow-hidden rounded-lg bg-[#49beff]/12 p-6 dark:bg-[#49beff]/20">
            <div className="relative z-10 flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:pr-36">
                <div className="flex items-center gap-3">
                    <img src={userImage} alt="Perfil de usuario" width={50} height={50} className="size-[50px] rounded-full object-cover" />
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-foreground text-lg font-semibold">¡Bienvenido de nuevo, {userName}! 👋</h1>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                </div>

                <LocalConditions />
            </div>

            <img
                src={supportImage}
                alt="Asistencia de Normativa Virtual"
                width={145}
                height={95}
                className="absolute right-5 bottom-0 hidden lg:block"
            />
        </section>
    );
}
