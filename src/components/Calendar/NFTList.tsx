import { Trans } from '@lingui/macro';
import { EmptyStatus, Image, LoadingStatus } from '@masknet/shared';
import { makeStyles } from '@masknet/theme';
import { IconButton, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { type ReactNode, useCallback, useMemo } from 'react';

import DiscordRoundIcon from '@/assets/discord-round.svg';
import WebsiteIcon from '@/assets/website.svg';
import TwitterIcon from '@/assets/x.svg';
import { CountdownTimer } from '@/components/Calendar/CountDownTimer.js';

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '506px',
        width: '100%',
        overflowY: 'scroll',
        position: 'relative',
        gap: '10px',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        marginBottom: '50px',
    },
    paddingWrap: {
        paddingRight: '12px',
    },
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        color: theme.palette.maskColor.second,
        whiteSpace: 'nowrap',
    },
    eventCard: {
        display: 'flex',
        padding: '8px 0',
        flexDirection: 'column',
        gap: '8px',
        fontWeight: 700,
        lineHeight: '16px',
        fontSize: '12px',
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'none',
        },
    },
    eventHeader: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
    },
    projectWrap: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        color: theme.palette.maskColor.main,
    },
    projectName: {
        color: theme.palette.maskColor.main,
        fontSize: '12px',
        fontWeight: 700,
        lineHeight: '16px',
    },
    logo: {
        borderRadius: '50%',
        overflow: 'hidden',
    },
    eventTitle: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    second: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    poster: {
        borderRadius: '8px',
        width: '100%',
        height: '156px',
        objectFit: 'cover',
    },
    dateDiv: {
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        padding: '10px 0',
    },
    socialLinks: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
}));

interface NFTListProps {
    list: Record<string, any[]>;
    isLoading: boolean;
    empty: boolean;
    date: Date;
}

const socialIcons: Record<string, ReactNode> = {
    twitter: <TwitterIcon width={18} height={18} />,
    discord: <DiscordRoundIcon width={20} height={18} color="#000" />,
    website: <WebsiteIcon width={20} height={18} />,
};

const sortPlat = (_: any, b: { type: string }) => {
    if (b.type === 'website') return -1;
    else return 0;
};

export function NFTList({ list, isLoading, empty, date }: NFTListProps) {
    const { classes, cx } = useStyles();
    const listAfterDate = useMemo(() => {
        const listAfterDate: string[] = [];
        for (const key in list) {
            if (new Date(key) >= date) {
                listAfterDate.push(key);
            }
        }
        return listAfterDate;
    }, [list, date]);

    const listRef = useCallback((el: HTMLDivElement | null) => {
        el?.scrollTo({ top: 0 });
    }, []);
    return (
        <div className={classes.container} ref={listRef} key={date.toISOString()}>
            <div className={classes.paddingWrap}>
                {isLoading && !list?.length ? (
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <LoadingStatus />
                    </div>
                ) : !empty && listAfterDate.length ? (
                    listAfterDate.map((key) => {
                        return (
                            <div key={key}>
                                <Typography className={classes.dateDiv}>
                                    {dayjs(new Date(key)).format('MMM dd,yyy')}
                                </Typography>
                                {list[key].map((v) => (
                                    <Link
                                        key={v.event_url}
                                        className={classes.eventCard}
                                        href={v.event_url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <div className={classes.eventHeader}>
                                            <div className={classes.projectWrap}>
                                                <Image
                                                    src={v.project.logo}
                                                    classes={{ container: classes.logo }}
                                                    size={24}
                                                    alt={v.project.name}
                                                />
                                                <Typography className={classes.projectName}>
                                                    {v.project.name}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Typography className={classes.eventTitle}>{v.project.description}</Typography>
                                        <div className={classes.eventHeader}>
                                            <CountdownTimer targetDate={new Date(v.event_date)} />
                                            <div className={classes.socialLinks}>
                                                {v.project.links
                                                    .sort(sortPlat)
                                                    .map((platform: { type: string; url: string }) => {
                                                        return (
                                                            <IconButton
                                                                style={{ width: '20px', height: '20px' }}
                                                                key={platform.type}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(platform.url);
                                                                }}
                                                            >
                                                                {socialIcons[platform.type]}
                                                            </IconButton>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                        <div className={classes.eventHeader}>
                                            <Typography className={classes.second}>
                                                <Trans>Total</Trans>
                                            </Typography>
                                            <Typography className={classes.eventTitle}>
                                                {Number(v.ext_info.nft_info.total).toLocaleString('en-US')}
                                            </Typography>
                                        </div>
                                        <div className={classes.eventHeader}>
                                            <Typography className={classes.second}>
                                                <Trans>Price</Trans>
                                            </Typography>
                                            <Typography className={classes.eventTitle}>
                                                {v.ext_info.nft_info.token}
                                            </Typography>
                                        </div>
                                        <div className={classes.eventHeader}>
                                            <Typography className={classes.second}>
                                                <Trans>Date</Trans>
                                            </Typography>
                                            <Typography className={classes.eventTitle}>
                                                {dayjs(new Date(v.event_date)).format('MMM dd, yyyy HH:mm')}
                                            </Typography>
                                        </div>
                                        <Image className={classes.poster} src={v.poster_url} alt="poster" />
                                    </Link>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <EmptyStatus className={classes.empty}>
                        <Trans>No content for the last two weeks.</Trans>
                    </EmptyStatus>
                )}
            </div>
        </div>
    );
}