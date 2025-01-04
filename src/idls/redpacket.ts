/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/redpacket.json`.
 */
export type Redpacket = {
    address: 'CXT16oAAbmgpPZsL2sGmfSUNrATk3AsFVU18thTUVNxx';
    metadata: {
        name: 'redpacket';
        version: '0.1.0';
        spec: '0.1.0';
        description: 'Created with Anchor';
    };
    instructions: [
        {
            name: 'claimWithNativeToken';
            discriminator: [223, 197, 45, 181, 137, 221, 247, 204];
            accounts: [
                {
                    name: 'signer';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'redPacket';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'red_packet.creator';
                                account: 'redPacket';
                            },
                            {
                                kind: 'account';
                                path: 'red_packet.create_time';
                                account: 'redPacket';
                            },
                        ];
                    };
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
                {
                    name: 'instructions';
                    docs: [
                        'https://github.com/GuidoDipietro/solana-ed25519-secp256k1-sig-verification/blob/master/programs/solana-ed25519-sig-verification/src/lib.rs',
                        'https://solana.stackexchange.com/questions/16487/about-verify-signature-with-ed25519-issue?rq=1',
                    ];
                    address: 'Sysvar1nstructions1111111111111111111111111';
                },
                {
                    name: 'ed25519Program';
                    address: 'Ed25519SigVerify111111111111111111111111111';
                },
            ];
            args: [];
        },
        {
            name: 'claimWithSplToken';
            discriminator: [171, 83, 166, 29, 54, 177, 129, 69];
            accounts: [
                {
                    name: 'signer';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'redPacket';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'red_packet.creator';
                                account: 'redPacket';
                            },
                            {
                                kind: 'account';
                                path: 'red_packet.create_time';
                                account: 'redPacket';
                            },
                        ];
                    };
                },
                {
                    name: 'tokenMint';
                },
                {
                    name: 'tokenAccount';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'signer';
                            },
                            {
                                kind: 'account';
                                path: 'tokenProgram';
                            },
                            {
                                kind: 'account';
                                path: 'tokenMint';
                            },
                        ];
                        program: {
                            kind: 'const';
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89,
                            ];
                        };
                    };
                },
                {
                    name: 'vault';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'redPacket';
                            },
                            {
                                kind: 'account';
                                path: 'tokenProgram';
                            },
                            {
                                kind: 'account';
                                path: 'tokenMint';
                            },
                        ];
                        program: {
                            kind: 'const';
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89,
                            ];
                        };
                    };
                },
                {
                    name: 'tokenProgram';
                },
                {
                    name: 'associatedTokenProgram';
                    address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
                {
                    name: 'instructions';
                    docs: [
                        'https://github.com/GuidoDipietro/solana-ed25519-secp256k1-sig-verification/blob/master/programs/solana-ed25519-sig-verification/src/lib.rs',
                        'https://solana.stackexchange.com/questions/16487/about-verify-signature-with-ed25519-issue?rq=1',
                    ];
                    address: 'Sysvar1nstructions1111111111111111111111111';
                },
                {
                    name: 'ed25519Program';
                    address: 'Ed25519SigVerify111111111111111111111111111';
                },
            ];
            args: [];
        },
        {
            name: 'createRedPacketWithNativeToken';
            discriminator: [16, 157, 226, 236, 116, 123, 246, 111];
            accounts: [
                {
                    name: 'signer';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'redPacket';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'signer';
                            },
                            {
                                kind: 'arg';
                                path: 'createTime';
                            },
                        ];
                    };
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
            ];
            args: [
                {
                    name: 'totalNumber';
                    type: 'u64';
                },
                {
                    name: 'totalAmount';
                    type: 'u64';
                },
                {
                    name: 'createTime';
                    type: 'u64';
                },
                {
                    name: 'duration';
                    type: 'u64';
                },
                {
                    name: 'ifSpiltRandom';
                    type: 'bool';
                },
                {
                    name: 'pubkeyForClaimSignature';
                    type: 'pubkey';
                },
            ];
        },
        {
            name: 'createRedPacketWithSplToken';
            discriminator: [109, 49, 79, 30, 198, 129, 172, 106];
            accounts: [
                {
                    name: 'signer';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'redPacket';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'signer';
                            },
                            {
                                kind: 'arg';
                                path: 'createTime';
                            },
                        ];
                    };
                },
                {
                    name: 'tokenMint';
                },
                {
                    name: 'tokenAccount';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'signer';
                            },
                            {
                                kind: 'account';
                                path: 'tokenProgram';
                            },
                            {
                                kind: 'account';
                                path: 'tokenMint';
                            },
                        ];
                        program: {
                            kind: 'const';
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89,
                            ];
                        };
                    };
                },
                {
                    name: 'vault';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'redPacket';
                            },
                            {
                                kind: 'account';
                                path: 'tokenProgram';
                            },
                            {
                                kind: 'account';
                                path: 'tokenMint';
                            },
                        ];
                        program: {
                            kind: 'const';
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89,
                            ];
                        };
                    };
                },
                {
                    name: 'tokenProgram';
                },
                {
                    name: 'associatedTokenProgram';
                    address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
            ];
            args: [
                {
                    name: 'totalNumber';
                    type: 'u64';
                },
                {
                    name: 'totalAmount';
                    type: 'u64';
                },
                {
                    name: 'createTime';
                    type: 'u64';
                },
                {
                    name: 'duration';
                    type: 'u64';
                },
                {
                    name: 'ifSpiltRandom';
                    type: 'bool';
                },
                {
                    name: 'pubkeyForClaimSignature';
                    type: 'pubkey';
                },
            ];
        },
        {
            name: 'withdrawWithNativeToken';
            discriminator: [211, 242, 128, 105, 170, 138, 67, 20];
            accounts: [
                {
                    name: 'signer';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'redPacket';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'red_packet.creator';
                                account: 'redPacket';
                            },
                            {
                                kind: 'account';
                                path: 'red_packet.create_time';
                                account: 'redPacket';
                            },
                        ];
                    };
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
                {
                    name: 'instructions';
                    docs: [
                        'https://github.com/GuidoDipietro/solana-ed25519-secp256k1-sig-verification/blob/master/programs/solana-ed25519-sig-verification/src/lib.rs',
                        'https://solana.stackexchange.com/questions/16487/about-verify-signature-with-ed25519-issue?rq=1',
                    ];
                    address: 'Sysvar1nstructions1111111111111111111111111';
                },
                {
                    name: 'ed25519Program';
                    address: 'Ed25519SigVerify111111111111111111111111111';
                },
            ];
            args: [];
        },
        {
            name: 'withdrawWithSplToken';
            discriminator: [146, 55, 174, 205, 179, 107, 70, 124];
            accounts: [
                {
                    name: 'signer';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'redPacket';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'red_packet.creator';
                                account: 'redPacket';
                            },
                            {
                                kind: 'account';
                                path: 'red_packet.create_time';
                                account: 'redPacket';
                            },
                        ];
                    };
                },
                {
                    name: 'tokenMint';
                },
                {
                    name: 'tokenAccount';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'signer';
                            },
                            {
                                kind: 'account';
                                path: 'tokenProgram';
                            },
                            {
                                kind: 'account';
                                path: 'tokenMint';
                            },
                        ];
                        program: {
                            kind: 'const';
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89,
                            ];
                        };
                    };
                },
                {
                    name: 'vault';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'account';
                                path: 'redPacket';
                            },
                            {
                                kind: 'account';
                                path: 'tokenProgram';
                            },
                            {
                                kind: 'account';
                                path: 'tokenMint';
                            },
                        ];
                        program: {
                            kind: 'const';
                            value: [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89,
                            ];
                        };
                    };
                },
                {
                    name: 'tokenProgram';
                },
                {
                    name: 'associatedTokenProgram';
                    address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
                {
                    name: 'instructions';
                    docs: [
                        'https://github.com/GuidoDipietro/solana-ed25519-secp256k1-sig-verification/blob/master/programs/solana-ed25519-sig-verification/src/lib.rs',
                        'https://solana.stackexchange.com/questions/16487/about-verify-signature-with-ed25519-issue?rq=1',
                    ];
                    address: 'Sysvar1nstructions1111111111111111111111111';
                },
                {
                    name: 'ed25519Program';
                    address: 'Ed25519SigVerify111111111111111111111111111';
                },
            ];
            args: [];
        },
    ];
    accounts: [
        {
            name: 'redPacket';
            discriminator: [51, 197, 171, 232, 223, 81, 121, 248];
        },
    ];
    errors: [
        {
            code: 6000;
            name: 'invalidRedPacketId';
            msg: 'Invalid red packet id.';
        },
        {
            code: 6001;
            name: 'invalidCreateTime';
            msg: 'Invalid create time.';
        },
        {
            code: 6002;
            name: 'invalidExpiryTime';
            msg: 'Invalid expiry time.';
        },
        {
            code: 6003;
            name: 'invalidTotalNumberOrAmount';
            msg: 'Invalid total number or amount.';
        },
        {
            code: 6004;
            name: 'invalidTokenType';
            msg: 'Invalid token type.';
        },
        {
            code: 6005;
            name: 'invalidTokenAmount';
            msg: 'Invalid token amount.';
        },
        {
            code: 6006;
            name: 'invalidAccountForNativeToken';
            msg: 'Invalid account for native token.';
        },
        {
            code: 6007;
            name: 'invalidInitialParamsForTokenAccount';
            msg: 'Invalid initial params for token account.';
        },
        {
            code: 6008;
            name: 'redPacketExpired';
            msg: 'The red packet has expired.';
        },
        {
            code: 6009;
            name: 'invalidSignature';
            msg: 'Invalid signature.';
        },
        {
            code: 6010;
            name: 'invalidClaimAmount';
            msg: 'The claim amount is invalid.';
        },
        {
            code: 6011;
            name: 'redPacketNotExpired';
            msg: 'The red packet has not yet expired.';
        },
        {
            code: 6012;
            name: 'redPacketClaimed';
            msg: 'The red packet has been claimed.';
        },
        {
            code: 6013;
            name: 'redPacketAllClaimed';
            msg: 'All the red packet has been claimed.';
        },
        {
            code: 6014;
            name: 'unauthorized';
            msg: 'You are not authorized to perform this action.';
        },
        {
            code: 6015;
            name: 'redPacketWithdrawn';
            msg: 'The red packet has been withdrawn.';
        },
    ];
    types: [
        {
            name: 'redPacket';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'creator';
                        type: 'pubkey';
                    },
                    {
                        name: 'totalNumber';
                        type: 'u64';
                    },
                    {
                        name: 'claimedNumber';
                        type: 'u64';
                    },
                    {
                        name: 'totalAmount';
                        type: 'u64';
                    },
                    {
                        name: 'claimedAmount';
                        type: 'u64';
                    },
                    {
                        name: 'createTime';
                        type: 'u64';
                    },
                    {
                        name: 'duration';
                        type: 'u64';
                    },
                    {
                        name: 'tokenType';
                        type: 'u8';
                    },
                    {
                        name: 'tokenAddress';
                        type: 'pubkey';
                    },
                    {
                        name: 'ifSpiltRandom';
                        type: 'bool';
                    },
                    {
                        name: 'claimedUsers';
                        type: {
                            vec: 'pubkey';
                        };
                    },
                    {
                        name: 'claimedAmountRecords';
                        type: {
                            vec: 'u64';
                        };
                    },
                    {
                        name: 'withdrawStatus';
                        type: 'u8';
                    },
                    {
                        name: 'pubkeyForClaimSignature';
                        type: 'pubkey';
                    },
                ];
            };
        },
    ];
    constants: [
        {
            name: 'redPacketSpiltEqual';
            type: 'bool';
            value: 'false';
        },
        {
            name: 'redPacketSpiltRandom';
            type: 'bool';
            value: 'true';
        },
        {
            name: 'redPacketUseCustomToken';
            type: 'u8';
            value: '1';
        },
        {
            name: 'redPacketUseNativeToken';
            type: 'u8';
            value: '0';
        },
        {
            name: 'redPacketWithdrawStatusClaimed';
            type: 'u8';
            value: '1';
        },
        {
            name: 'redPacketWithdrawStatusNotWithdraw';
            type: 'u8';
            value: '0';
        },
    ];
};
