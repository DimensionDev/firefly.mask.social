import { HomeIcon } from '@heroicons/react/24/outline';

export interface NavigationItem {
    id: string;
    name: React.ReactNode;
    icon: typeof HomeIcon;
    href: string;
    selected?: boolean;
}
