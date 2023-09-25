import Script from 'next/script';

export function GA() {
    return (
        <>
            <Script async src="https://www.googletagmanager.com/gtag/js?id=G-5VSBSKJ6JM" />
            <Script id="ga">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-5VSBSKJ6JM');
                `}
            </Script>
        </>
    );
}
