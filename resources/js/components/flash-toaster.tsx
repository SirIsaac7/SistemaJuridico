import { showNotification } from '@/lib/sweet-alert';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type FlashProps = SharedData & {
    errors?: Record<string, string>;
};

type InertiaPage = {
    props: FlashProps;
};

const notifiedPages = new WeakSet<object>();

function notify(page: InertiaPage) {
    if (notifiedPages.has(page)) {
        return;
    }

    notifiedPages.add(page);

    const { flash, errors } = page.props;
    const error = flash.error ?? errors?.role ?? errors?.user;

    if (error) {
        showNotification('error', error);
        return;
    }

    if (flash.success) {
        showNotification('success', flash.success);
    }
}

export function FlashToaster() {
    const page = usePage<FlashProps>();

    useEffect(() => {
        notify(page);

        return router.on('success', (event) => {
            notify(event.detail.page as unknown as InertiaPage);
        });
    }, [page]);

    return null;
}
