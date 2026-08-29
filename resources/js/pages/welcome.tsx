import '@/landing/index.css';
import '@/landing/landing.css';

import Landing from '@/landing/App';
import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Normativa Virtual" />
            <Landing />
        </>
    );
}
