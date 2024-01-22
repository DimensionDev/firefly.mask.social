/* eslint-disable @next/next/no-img-element */

import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';

interface FireflyVsFireflyBrandingProps {}

export function FireflyVsFireflyBranding(props: FireflyVsFireflyBrandingProps) {
    return (
        <div
            style={{
                display: 'flex',
                top: 170,
                left: 0,
                right: 0,
                width: '100%',
                position: 'absolute',
            }}
        >
            {/* left logos */}
            <img
                style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 0, left: 61.5, opacity: 0.2 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 0, left: 61.5 * 2, opacity: 0.3 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 0, left: 61.5 * 3, opacity: 0.6 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />

            {/* right logos */}
            <img
                style={{ position: 'absolute', top: 0, right: 185 - 61.5 * 3, opacity: 0.1 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 0, right: 185 - 61.5 * 2, opacity: 0.2 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 0, right: 185 - 61.5, opacity: 0.3 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 0, right: 185, opacity: 0.6 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    top: 0,
                    left: 0,
                    right: 0,
                    position: 'absolute',
                }}
            >
                <img src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')} alt="Firefly" width={190} height={250} />
                <img
                    style={{ marginLeft: 132, marginRight: 132 }}
                    src={urlcat(SITE_URL, '/rp/x.png')}
                    alt="X"
                    width={60}
                    height={60}
                />
                <img src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')} alt="Firefly" width={190} height={250} />
            </div>
        </div>
    );
}
