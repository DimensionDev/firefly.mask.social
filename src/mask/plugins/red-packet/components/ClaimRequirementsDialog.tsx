/* eslint-disable @next/next/no-img-element */
import { t, Trans } from '@lingui/macro';
import { getEnumAsArray } from '@masknet/kit';
import { Alert, TokenIcon } from '@masknet/shared';
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base';
import { useChainContext } from '@masknet/web3-hooks-base';
import type { FungibleToken, NonFungibleCollection } from '@masknet/web3-shared-base';
import { ChainId, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import {
    Box,
    Button,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
} from '@mui/material';
import { Fragment, type FunctionComponent, type SVGAttributes, useCallback, useState } from 'react';
import { isAddress } from 'viem';

import EthIcon from '@/assets/eth-linear.svg';
import FarcasterIcon from '@/assets/farcaster-fill.svg';
import LensIcon from '@/assets/lens-fill.svg';
import NFTIcon from '@/assets/nft.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Source } from '@/constants/enum.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { type GeneratedIcon, Icons } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import { type FireflyRedpacketSettings, RequirementType } from '@/mask/plugins/red-packet/types.js';
import {
    ChannelSelectModalRef,
    NonFungibleTokenCollectionSelectModalRef,
    TokenSelectorModalRef,
} from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        minHeight: 460,
    },
    list: {
        padding: theme.spacing(1.5, 0),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1),
    },
    icon: {
        color: 'var(--color-light-main)',
        minWidth: 20,
        width: 20,
        height: 20,
        marginRight: theme.spacing(1),
    },
    title: {
        color: 'var(--color-light-main)',
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '22px',
        margin: 0,
    },
    checkbox: {
        '& > .MuiBox-root': {
            width: 20,
            height: 20,
        },
    },
    select: {
        background: theme.palette.maskColor.input,
        padding: theme.spacing(1.5),
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
        margin: theme.spacing(0, 1.5),
    },
    selectText: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 300,
        lineHeight: '22px',
    },
    collection: {
        display: 'flex',
        alignItems: 'center',
        columnGap: theme.spacing(1),
    },
    assetIcon: {
        width: 24,
        height: 24,
        borderRadius: 500,
    },
    assetName: {
        fontSize: 15,
        color: 'var(--color-light-main)',
        lineHeight: '20px',
        fontWeight: 700,
    },
    footer: {
        bottom: 0,
        position: 'sticky',
        padding: theme.spacing(2),
        boxSizing: 'border-box',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: theme.palette.maskColor.bottomBg,
    },
}));

interface ClaimRequirementsDialogProps {
    onNext: (settings: FireflyRedpacketSettings) => void;
    origin?: RequirementType[];
}

function wrapIcon(SvgIcon: FunctionComponent<SVGAttributes<SVGElement>>): GeneratedIcon {
    return function WrappedIcon({ size }: { size: number }) {
        return <SvgIcon style={{ width: size, height: size }} />;
    } as GeneratedIcon;
}

export const REQUIREMENT_ICON_MAP: Record<RequirementType, GeneratedIcon> = {
    [RequirementType.Follow]: Icons.AddUser,
    [RequirementType.Like]: Icons.Like,
    [RequirementType.Repost]: Icons.Repost,
    [RequirementType.Comment]: Icons.Comment,
    [RequirementType.NFTHolder]: wrapIcon(NFTIcon),
    [RequirementType.TokenHolder]: wrapIcon(EthIcon),
    [RequirementType.FarcasterChannelMember]: wrapIcon(FarcasterIcon),
    [RequirementType.LensClubMember]: wrapIcon(LensIcon),
};

export const REQUIREMENT_TITLE_MAP: Record<RequirementType, React.ReactNode> = {
    [RequirementType.Follow]: t`Follow me`,
    [RequirementType.Like]: t`Like`,
    [RequirementType.Repost]: t`Repost`,
    [RequirementType.Comment]: t`Comment`,
    [RequirementType.NFTHolder]: t`NFT holder`,
    [RequirementType.TokenHolder]: t`Token holder`,
    [RequirementType.FarcasterChannelMember]: t`Farcaster channel member`,
    [RequirementType.LensClubMember]: t`Lens club member`,
};

export function ClaimRequirementsDialog(props: ClaimRequirementsDialogProps) {
    const [selectedRules, setSelectedRules] = useState(props.origin ?? [RequirementType.Follow]);
    const [selectedCollection, setSelectedCollection] = useState<NonFungibleCollection<ChainId, SchemaType>>();
    const { classes } = useStyles();
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>();

    const selectCollection = useCallback(async () => {
        const picked = await NonFungibleTokenCollectionSelectModalRef.openAndWaitForClose({
            selected: selectedCollection,
        });
        if (picked) setSelectedCollection(picked);
    }, [selectedCollection]);

    const [token, setToken] = useState<FungibleToken<ChainId, SchemaType>>();
    const selectToken = async () => {
        const picked = await TokenSelectorModalRef.openAndWaitForClose({
            address: account,
            isSelected(item) {
                const address = isAddress(item.id) ? item.id : ZERO_ADDRESS;
                return isSameEthereumAddress(address, token?.address) && item.chainId === token?.chainId;
            },
        });
        if (picked) {
            setToken(picked);
        }
    };

    const [channel, setChannel] = useState<Channel>();
    const selectChannel = useCallback(async () => {
        const picked = await ChannelSelectModalRef.openAndWaitForClose({
            source: Source.Farcaster,
            selected: channel,
        });
        if (picked) setChannel(picked);
    }, [channel]);

    const [club, setClub] = useState<Channel>();
    const selectClub = useCallback(async () => {
        const picked = await ChannelSelectModalRef.openAndWaitForClose({
            source: Source.Lens,
            selected: club,
        });
        if (picked) setClub(picked);
    }, [club]);

    const disabled = selectedRules.includes(RequirementType.NFTHolder) && !selectedCollection;

    return (
        <>
            <Box className={classes.container}>
                <Alert open>
                    <Trans>You can set one or multiple rules to be eligible to win a Lucky Drop.</Trans>
                </Alert>
                <List dense className={classes.list}>
                    {getEnumAsArray(RequirementType).map(({ value }) => {
                        const checked = selectedRules.includes(value);
                        const Icon = REQUIREMENT_ICON_MAP[value];
                        const title = REQUIREMENT_TITLE_MAP[value];
                        const item = (
                            <ListItem key={value}>
                                <ListItemIcon className={classes.icon}>
                                    <Icon size={20} />
                                </ListItemIcon>
                                <ListItemText classes={{ primary: classes.title }} primary={title} />
                                <ListItemSecondaryAction>
                                    <Checkbox
                                        classes={{ root: classes.checkbox }}
                                        checked={checked}
                                        onChange={(_, checked) => {
                                            if (checked === false && value === RequirementType.NFTHolder)
                                                setSelectedCollection(undefined);
                                            setSelectedRules(
                                                checked
                                                    ? [...selectedRules, value]
                                                    : selectedRules.filter((x) => x !== value),
                                            );
                                        }}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        );
                        if (!checked) return item;
                        if (value === RequirementType.NFTHolder) {
                            return (
                                <Fragment key={value}>
                                    {item}
                                    <Box className={classes.select} onClick={selectCollection}>
                                        {selectedCollection ? (
                                            <Box className={classes.collection}>
                                                {selectedCollection.iconURL ? (
                                                    <img
                                                        width={24}
                                                        height={24}
                                                        alt={selectedCollection.name}
                                                        className="rounded-full"
                                                        src={selectedCollection.iconURL}
                                                    />
                                                ) : null}
                                                {selectedCollection?.name ? (
                                                    <Typography className={classes.assetName}>
                                                        {selectedCollection.name}
                                                    </Typography>
                                                ) : null}
                                            </Box>
                                        ) : (
                                            <Typography className={classes.selectText}>
                                                <Trans>Select NFT collection to gate access</Trans>
                                            </Typography>
                                        )}
                                        <Icons.ArrowDrop size={18} />
                                    </Box>
                                </Fragment>
                            );
                        } else if (value === RequirementType.TokenHolder) {
                            return (
                                <Fragment key={value}>
                                    {item}
                                    <Box className={classes.select} onClick={selectToken}>
                                        {token ? (
                                            <Box className={classes.collection}>
                                                <TokenIcon
                                                    alt={token.name}
                                                    address={token.address}
                                                    className={classes.assetIcon}
                                                    logoURL={token.logoURL}
                                                />
                                                {token.name ? (
                                                    <Typography className={classes.assetName}>{token.name}</Typography>
                                                ) : null}
                                            </Box>
                                        ) : (
                                            <Typography className={classes.selectText}>
                                                <Trans>Select token to gate access</Trans>
                                            </Typography>
                                        )}
                                        <Icons.ArrowDrop size={18} />
                                    </Box>
                                </Fragment>
                            );
                        } else if (value === RequirementType.FarcasterChannelMember) {
                            return (
                                <Fragment key={value}>
                                    {item}
                                    <Box className={classes.select} onClick={selectChannel}>
                                        {channel ? (
                                            <Box className={classes.collection}>
                                                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                                <img
                                                    className={classes.assetIcon}
                                                    width={24}
                                                    height={24}
                                                    src={channel.imageUrl}
                                                />
                                                <Typography className={classes.assetName}>{channel.name}</Typography>
                                            </Box>
                                        ) : (
                                            <Typography className={classes.selectText}>
                                                <Trans>Select /channel to gate access</Trans>
                                            </Typography>
                                        )}
                                        <Icons.ArrowDrop size={18} />
                                    </Box>
                                </Fragment>
                            );
                        } else if (value === RequirementType.LensClubMember) {
                            return (
                                <Fragment key={value}>
                                    {item}
                                    <Box className={classes.select} onClick={selectClub}>
                                        {club ? (
                                            <Box className={classes.collection}>
                                                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                                <img
                                                    className={classes.assetIcon}
                                                    width={24}
                                                    height={24}
                                                    src={club.imageUrl}
                                                />
                                                <Typography className={classes.assetName}>{club.name}</Typography>
                                            </Box>
                                        ) : (
                                            <Typography className={classes.selectText}>
                                                <Trans>Select /club to gate access</Trans>
                                            </Typography>
                                        )}
                                        <Icons.ArrowDrop size={18} />
                                    </Box>
                                </Fragment>
                            );
                        }
                        return item;
                    })}
                </List>
                <div className="text-right">
                    <ClickableButton
                        className="text-base font-bold text-highlight hover:bg-transparent"
                        onClick={() => setSelectedRules(EMPTY_LIST)}
                    >
                        <Trans>Clear all requirements</Trans>
                    </ClickableButton>
                </div>
            </Box>
            <Box className={classes.footer}>
                <Button
                    disabled={disabled}
                    fullWidth
                    onClick={() =>
                        props.onNext({
                            requirements: selectedRules,
                            nftHolderContract: selectedCollection?.address,
                            nftCollectionName: selectedCollection?.name,
                            nftChainId: selectedCollection?.chainId,
                        })
                    }
                >
                    <Trans>Next</Trans>
                </Button>
            </Box>
        </>
    );
}
