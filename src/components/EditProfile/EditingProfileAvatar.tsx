import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';

import { Avatar } from '@/components/Avatar.js';

export function EditingProfileAvatar({ pfp, name }: { pfp: string; name: string }) {
    const { control } = useFormContext();
    const value = useWatch({ control, name }) as FileList;
    const { data } = useQuery({
        queryKey: ['editing-profile-avatar', value],
        queryFn() {
            return value[0] ? URL.createObjectURL(value[0]) : undefined;
        },
    });
    return <Avatar src={data || pfp} size={108} alt="avatar" />;
}
