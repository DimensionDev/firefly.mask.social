import {
    CommentRankingFilterType,
    CustomFiltersType,
    ExploreProfilesOrderByType,
    ExplorePublicationsOrderByType,
    FeedEventItemType,
    isCreateMomokaPublicationResult,
    isRelaySuccess,
    LimitType,
    PublicationReactionType,
    PublicationType,
} from '@lens-protocol/client';
import { t } from '@lingui/macro';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { isZero } from '@masknet/web3-shared-base';
import { first, flatMap, uniqWith } from 'lodash-es';
import urlcat from 'urlcat';
import type { TypedDataDomain } from 'viem';
import { polygon } from 'viem/chains';

import { createLensClient } from '@/configs/lensClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatLensPost, formatLensPostByFeed, formatLensQuoteOrComment } from '@/helpers/formatLensPost.js';
import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { pollingWithRetry } from '@/helpers/pollWithRetry.js';
import { LensSession } from '@/providers/lens/Session.js';
import {
    type LastLoggedInProfileRequest,
    profilesManagedQuery,
    type ProfilesManagedRequest,
} from '@/providers/types/LensGraphql/profileManagers.js';
import {
    type Notification,
    NotificationType,
    type Post,
    type Profile,
    type Provider,
    type Reaction,
    ReactionType,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

export class LensSocialMedia implements Provider {
    private client = createLensClient();

    get type() {
        return SessionType.Lens;
    }

    async createSessionForProfileId(profileId: string): Promise<LensSession> {
        const walletClient = await getWalletClientRequired({
            chainId: polygon.id,
        });
        const { id, text } = await this.client.authentication.generateChallenge({
            for: profileId,
            signedBy: walletClient.account.address,
        });
        const signature = await walletClient.signMessage({
            message: text,
        });

        await this.client.authentication.authenticate({
            id,
            signature,
        });

        const now = Date.now();

        return new LensSession(
            profileId,
            '', // the LensClient maintains it
            now,
            now + 1000 * 60 * 60 * 24 * 30, // 30 days
        );
    }

    async updateSignless(enable: boolean): Promise<void> {
        const typedDataResult = await this.client.profile.createChangeProfileManagersTypedData({
            approveSignless: enable,
        });

        const { id, typedData } = typedDataResult.unwrap();
        const walletClient = await getWalletClientRequired();
        const signedTypedData = await walletClient.signTypedData({
            domain: typedData.domain as TypedDataDomain,
            types: typedData.types,
            primaryType: 'ChangeDelegatedExecutorsConfig',
            message: typedData.value,
        });

        const broadcastOnchainResult = await this.client.transaction.broadcastOnchain({
            id,
            signature: signedTypedData,
        });

        const onchainRelayResult = broadcastOnchainResult.unwrap();

        if (onchainRelayResult.__typename === 'RelayError') {
            // TODO: read error message from onchainRelayResult and show it to user
            console.warn("Couldn't update signless", onchainRelayResult);
            throw new Error("Couldn't update signless");
        }
        return;
    }

    async publishPost(post: Post): Promise<string> {
        if (!post.metadata.contentURI) throw new Error(t`No content to publish.`);

        if (post.author.signless) {
            const result = await this.client.publication.postOnMomoka({
                contentURI: post.metadata.contentURI,
            });
            const resultValue = result.unwrap();

            if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

            return resultValue.id;
        } else {
            const walletClient = await getWalletClientRequired();
            const resultTypedData = await this.client.publication.createMomokaPostTypedData({
                contentURI: post.metadata.contentURI,
            });

            const { id, typedData } = resultTypedData.unwrap();

            const signedTypedData = await walletClient.signTypedData({
                domain: typedData.domain as TypedDataDomain,
                types: typedData.types,
                primaryType: 'Post',
                message: typedData.value,
            });

            const broadcastResult = await this.client.transaction.broadcastOnMomoka({
                id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();

            if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }

            return broadcastValue.id;
        }
    }

    async mirrorPost(postId: string, options?: { onMomoka?: boolean }): Promise<string> {
        if (options?.onMomoka) {
            const result = await this.client.publication.mirrorOnMomoka({
                mirrorOn: postId,
            });
            const resultValue = result.unwrap();

            if (!isCreateMomokaPublicationResult(resultValue)) {
                const walletClient = await getWalletClientRequired();
                const resultTypedData = await this.client.publication.createMomokaMirrorTypedData({ mirrorOn: postId });
                const { id, typedData } = resultTypedData.unwrap();
                const signedTypedData = await walletClient.signTypedData({
                    domain: typedData.domain as TypedDataDomain,
                    types: typedData.types,
                    primaryType: 'Mirror',
                    message: typedData.value,
                });

                const broadcastResult = await this.client.transaction.broadcastOnMomoka({
                    id,
                    signature: signedTypedData,
                });

                const broadcastValue = broadcastResult.unwrap();

                if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                    throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
                }
            }
        } else {
            const result = await this.client.publication.mirrorOnchain({
                mirrorOn: postId,
            });
            const resultValue = result.unwrap();

            if (!isRelaySuccess(resultValue)) {
                const walletClient = await getWalletClientRequired();
                const resultTypedData = await this.client.publication.createOnchainMirrorTypedData({
                    mirrorOn: postId,
                });

                const { id, typedData } = resultTypedData.unwrap();

                const signedTypedData = await walletClient.signTypedData({
                    domain: typedData.domain as TypedDataDomain,
                    types: typedData.types,
                    primaryType: 'Mirror',
                    message: typedData.value,
                });

                const broadcastResult = await this.client.transaction.broadcastOnchain({
                    id,
                    signature: signedTypedData,
                });

                const broadcastValue = broadcastResult.unwrap();

                if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                    throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
                }
            }
        }

        return postId;
    }

    // intro is the contentURI of the post
    async quotePost(postId: string, intro: string, signless?: boolean, onMomoka?: boolean): Promise<string> {
        if (onMomoka) {
            if (signless) {
                const result = await this.client.publication.quoteOnMomoka({
                    quoteOn: postId,
                    contentURI: intro,
                });
                const resultValue = result.unwrap();

                if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                    throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

                return resultValue.id;
            } else {
                const walletClient = await getWalletClientRequired();
                const resultTypedData = await this.client.publication.createMomokaQuoteTypedData({
                    quoteOn: postId,
                    contentURI: intro,
                });

                const { id, typedData } = resultTypedData.unwrap();

                const signedTypedData = await walletClient.signTypedData({
                    domain: typedData.domain as TypedDataDomain,
                    types: typedData.types,
                    primaryType: 'Quote',
                    message: typedData.value,
                });

                const broadcastResult = await this.client.transaction.broadcastOnMomoka({
                    id,
                    signature: signedTypedData,
                });

                const broadcastValue = broadcastResult.unwrap();

                if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                    throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
                }
                return broadcastValue.id;
            }
        } else {
            const result = await this.client.publication.quoteOnchain({
                quoteOn: postId,
                contentURI: intro,
            });

            const resultValue = result.unwrap();

            if (!isRelaySuccess(resultValue) || !resultValue.txHash) {
                const walletClient = await getWalletClientRequired();

                const resultTypedData = await this.client.publication.createOnchainQuoteTypedData({
                    quoteOn: postId,
                    contentURI: intro,
                });

                const { id, typedData } = resultTypedData.unwrap();

                const signedTypedData = await walletClient.signTypedData({
                    domain: typedData.domain as TypedDataDomain,
                    types: typedData.types,
                    primaryType: 'Quote',
                    message: typedData.value,
                });

                const broadcastResult = await this.client.transaction.broadcastOnchain({
                    id,
                    signature: signedTypedData,
                });

                const broadcastValue = broadcastResult.unwrap();

                if (
                    broadcastResult.isFailure() ||
                    broadcastValue.__typename === 'RelayError' ||
                    !broadcastValue.txHash
                ) {
                    throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
                }

                const post = await this.getPostByTxHashWithPolling(broadcastValue.txHash);
                return post.postId;
            }

            const post = await this.getPostByTxHashWithPolling(resultValue.txHash);
            return post.postId;
        }
    }

    async collectPost(postId: string): Promise<void> {
        const result = await this.client.publication.bookmarks.add({
            on: postId,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);
    }

    // comment is the contentURI of the post
    async commentPost(postId: string, comment: string, signless?: boolean, onMomoka?: boolean): Promise<string> {
        if (onMomoka) {
            if (signless) {
                const result = await this.client.publication.commentOnMomoka({
                    commentOn: postId,
                    contentURI: comment,
                });
                const resultValue = result.unwrap();

                if (result.isFailure() || resultValue.__typename === 'LensProfileManagerRelayError')
                    throw new Error(`Something went wrong: ${JSON.stringify(resultValue)}`);

                return resultValue.id;
            } else {
                const walletClient = await getWalletClientRequired();
                const resultTypedData = await this.client.publication.createMomokaCommentTypedData({
                    commentOn: postId,
                    contentURI: comment,
                });

                const { id, typedData } = resultTypedData.unwrap();

                const signedTypedData = await walletClient.signTypedData({
                    domain: typedData.domain as TypedDataDomain,
                    types: typedData.types,
                    primaryType: 'Comment',
                    message: typedData.value,
                });

                const broadcastResult = await this.client.transaction.broadcastOnMomoka({
                    id,
                    signature: signedTypedData,
                });

                const broadcastValue = broadcastResult.unwrap();

                if (broadcastResult.isFailure() || broadcastValue.__typename === 'RelayError') {
                    throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
                }
                return broadcastValue.id;
            }
        } else {
            const result = await this.client.publication.commentOnchain({
                commentOn: postId,
                contentURI: comment,
            });

            const resultValue = result.unwrap();

            if (!isRelaySuccess(resultValue) || !resultValue.txHash) {
                const walletClient = await getWalletClientRequired();

                const resultTypedData = await this.client.publication.createOnchainCommentTypedData({
                    commentOn: postId,
                    contentURI: comment,
                });

                const { id, typedData } = resultTypedData.unwrap();

                const signedTypedData = await walletClient.signTypedData({
                    domain: typedData.domain as TypedDataDomain,
                    types: typedData.types,
                    primaryType: 'Comment',
                    message: typedData.value,
                });

                const broadcastResult = await this.client.transaction.broadcastOnchain({
                    id,
                    signature: signedTypedData,
                });

                const broadcastValue = broadcastResult.unwrap();

                if (
                    broadcastResult.isFailure() ||
                    broadcastValue.__typename === 'RelayError' ||
                    !broadcastValue.txHash
                ) {
                    throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
                }

                const post = await this.getPostByTxHashWithPolling(broadcastValue.txHash);
                return post.postId;
            }

            const post = await this.getPostByTxHashWithPolling(resultValue.txHash);

            return post.postId;
        }
    }

    async upvotePost(postId: string): Promise<Reaction> {
        const result = await this.client.publication.reactions.add({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);

        return {
            reactionId: '',
            type: ReactionType.Upvote,
            timestamp: Date.now(),
        };
    }

    async unvotePost(postId: string): Promise<void> {
        const result = await this.client.publication.reactions.remove({
            for: postId,
            reaction: PublicationReactionType.Upvote,
        });

        if (result.isFailure()) throw new Error(`Something went wrong: ${JSON.stringify(result.isFailure())}`);
    }

    async getProfilesByAddress(address: string): Promise<Profile[]> {
        const request: ProfilesManagedRequest | LastLoggedInProfileRequest = {
            for: address,
        };
        const {
            data: { lastLoggedInProfile },
        } = await profilesManagedQuery(request);
        const profiles = await this.client.wallet.profilesManaged({ for: address });
        const result = profiles.items.map(formatLensProfile);
        const index = result.findIndex((profile) => profile.handle === lastLoggedInProfile?.handle?.fullHandle);
        if (index > -1) {
            const [value] = result.splice(index, 1);
            result.unshift(value);
        }
        return result;
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const result = await this.client.profile.fetch({
            forProfileId: profileId,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        const result = await this.client.profile.fetch({
            forHandle: `lens/${handle}`,
        });
        if (!result) throw new Error(t`No profile found`);

        return formatLensProfile(result);
    }

    async getPostById(postId: string): Promise<Post> {
        const result = await this.client.publication.fetch({
            forId: postId,
        });
        if (!result) throw new Error(t`No post found`);

        const post = formatLensPost(result);
        return post;
    }

    async getPostByTxHash(txHash: string): Promise<Post> {
        const result = await this.client.publication.fetch({
            forTxHash: txHash,
        });
        if (!result) throw new Error(t`No post found`);

        const post = formatLensPost(result);
        return post;
    }

    private async getPostByTxHashWithPolling(txHash: string): Promise<Post> {
        return pollingWithRetry(this.getPostByTxHash.bind(this, txHash), 10, 2000);
    }

    async getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await this.client.publication.fetchAll({
            where: {
                commentOn: { id: postId, ranking: { filter: CommentRankingFilterType.Relevant } },
                customFilters: [CustomFiltersType.Gardeners],
            },
            limit: LimitType.TwentyFive,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        if (!result) throw new Error(t`No comments found`);

        return createPageable(
            result.items.map(formatLensPost),
            indicator ?? createIndicator(),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await this.client.explore.publications({
            orderBy: ExplorePublicationsOrderByType.LensCurated,
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
            limit: LimitType.TwentyFive,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const data = await this.client.feed.fetch({
            where: {
                for: profileId,
                feedEventItemTypes: [FeedEventItemType.Post, FeedEventItemType.Comment, FeedEventItemType.Mirror],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        if (data.isFailure()) throw new Error(`Some thing went wrong ${JSON.stringify(data.isFailure())}`);

        const result = data.unwrap();
        return createPageable(
            result.items.map(formatLensPostByFeed),
            indicator ?? createIndicator(),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByCollected(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await this.client.publication.fetchAll({
            where: {
                actedBy: profileId,
                publicationTypes: [PublicationType.Post, PublicationType.Comment, PublicationType.Mirror],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            uniqWith(result.items.map(formatLensPost), (a, b) => a.postId === b.postId),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await this.client.publication.fetchAll({
            where: {
                from: [profileId],
                metadata: null,
                publicationTypes: [PublicationType.Post, PublicationType.Mirror, PublicationType.Quote],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    // TODO: Invalid
    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.client.publication.fetchAll({
            where: {
                from: [profileId],
            },
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.client.publication.fetchAll({
            where: {
                actedBy: profileId,
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.client.publication.fetchAll({
            where: {
                from: [profileId],
                publicationTypes: [PublicationType.Comment],
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        const result = await this.client.publication.fetchAll({
            where: {
                commentOn: {
                    id: postId,
                },
            },
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    getReactors!: (postId: string) => Promise<Pageable<Profile>>;

    async follow(profileId: string): Promise<void> {
        const result = await this.client.profile.follow({
            follow: [
                {
                    profileId,
                },
            ],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const result = await this.client.profile.createFollowTypedData({
                follow: [
                    {
                        profileId,
                    },
                ],
            });

            const data = result.unwrap();
            const walletClient = await getWalletClientRequired();
            const signedTypedData = await walletClient.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Follow',
                message: data.typedData.value,
            });

            const broadcastResult = await this.client.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }
        }
    }

    async unfollow(profileId: string): Promise<void> {
        const result = await this.client.profile.unfollow({
            unfollow: [profileId],
        });
        const resultValue = result.unwrap();

        if (!isRelaySuccess(resultValue)) {
            const followTypedDataResult = await this.client.profile.createUnfollowTypedData({
                unfollow: [profileId],
            });

            const data = followTypedDataResult.unwrap();
            const client = await getWalletClientRequired();
            const signedTypedData = await client.signTypedData({
                domain: data.typedData.domain as TypedDataDomain,
                types: data.typedData.types,
                primaryType: 'Unfollow',
                message: data.typedData.value,
            });

            const broadcastResult = await this.client.transaction.broadcastOnchain({
                id: data.id,
                signature: signedTypedData,
            });

            const broadcastValue = broadcastResult.unwrap();
            if (!isRelaySuccess(broadcastValue)) {
                throw new Error(`Something went wrong: ${JSON.stringify(broadcastValue)}`);
            }
        }
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await this.client.profile.followers({
            of: profileId,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await this.client.profile.following({
            for: profileId,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async isFollowedByMe(profileId: string): Promise<boolean> {
        const result = await this.client.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowedByMe.value ?? false;
    }

    async isFollowingMe(profileId: string): Promise<boolean> {
        const result = await this.client.profile.fetch({
            forProfileId: profileId,
        });

        return result?.operations.isFollowingMe.value ?? false;
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const response = await this.client.notifications.fetch({
            where: {
                customFilters: [CustomFiltersType.Gardeners],
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        });

        const result = response.unwrap();

        const data = result.items.map((item) => {
            if (item.__typename === 'MirrorNotification') {
                if (item.mirrors.length === 0) throw new Error('No mirror found');

                const time = first(item.mirrors)?.mirroredAt;
                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Mirror,
                    mirrors: item.mirrors.map((x) => formatLensProfile(x.profile)),
                    post: formatLensPost(item.publication),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            if (item.__typename === 'QuoteNotification') {
                const time = item.quote.createdAt;
                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Quote,
                    quote: formatLensPost(item.quote),
                    post: formatLensQuoteOrComment(item.quote.quoteOn),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            if (item.__typename === 'ReactionNotification') {
                if (item.reactions.length === 0) throw new Error('No reaction found');
                const time = first(flatMap(item.reactions.map((x) => x.reactions)))?.reactedAt;
                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Reaction,
                    reaction: ReactionType.Upvote,
                    reactors: item.reactions.map((x) => formatLensProfile(x.profile)),
                    post: formatLensPost(item.publication),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            if (item.__typename === 'CommentNotification') {
                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Comment,
                    comment: formatLensPost(item.comment),
                    post: formatLensQuoteOrComment(item.comment.commentOn),
                    timestamp: new Date(item.comment.createdAt).getTime(),
                };
            }

            if (item.__typename === 'FollowNotification') {
                if (item.followers.length === 0) throw new Error('No follower found');

                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Follow,
                    followers: item.followers.map(formatLensProfile),
                };
            }

            if (item.__typename === 'MentionNotification') {
                const post = formatLensPost(item.publication);

                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Mention,
                    post,
                    timestamp: new Date(item.publication.createdAt).getTime(),
                };
            }

            if (item.__typename === 'ActedNotification') {
                const time = first(item.actions)?.actedAt;
                return {
                    source: SocialPlatform.Lens,
                    notificationId: item.id,
                    type: NotificationType.Act,
                    post: formatLensPost(item.publication),
                    actions: item.actions.map((x) => formatLensProfile(x.by)),
                    timestamp: time ? new Date(time).getTime() : undefined,
                };
            }

            return;
        });

        return createPageable(
            data.filter((item) => typeof item !== 'undefined') as Notification[],
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const result = await this.client.explore.profiles({
            orderBy: ExploreProfilesOrderByType.MostFollowers,
            cursor: indicator?.id,
        });

        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const result = await this.client.search.profiles({
            query: q,
            cursor: indicator?.id,
            limit: LimitType.TwentyFive,
            where: {
                // hey.xyz passes such filters for its searching as well
                customFilters: [CustomFiltersType.Gardeners],
            },
        });
        return createPageable(
            result.items.map(formatLensProfile),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const result = await this.client.search.publications({
            query: q,
            cursor: indicator?.id,
            limit: LimitType.TwentyFive,
        });
        return createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, result.pageInfo.next) : undefined,
        );
    }

    async getThreadByPostId(postId: string) {
        const response = await fetchJSON<ResponseJSON<string[]>>(urlcat('/api/thread', { id: postId }));
        if (!response.success) return EMPTY_LIST;
        const posts = await this.client.publication.fetchAll({
            limit: LimitType.TwentyFive,
            where: {
                publicationIds: [postId, ...response.data],
            },
        });

        return posts.items.map(formatLensPost);
    }
    getAccessToken() {
        return this.client.authentication.getAccessToken();
    }
}

export const LensSocialMediaProvider = new LensSocialMedia();
