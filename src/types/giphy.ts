import { Grid } from '@giphy/react-components';

export type IGif = Parameters<
    Required<InstanceType<typeof Grid>['props']>['onGifClick']
>[0];
