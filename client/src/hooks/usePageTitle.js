import { useEffect } from 'react';

export default function usePageTitle(title) {
    useEffect(() => {
        document.title = `Zowrox - ${title}`;
        return () => {
            document.title = 'Zowrox';
        };
    }, [title]);
}
