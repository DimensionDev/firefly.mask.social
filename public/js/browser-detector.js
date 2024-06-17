(function () {
    if (!window.bowser) return;

    try {
        function getCookie(field) {
            var pair = document.cookie.split('; ').filter(function (x) {
                return x.indexOf(field + '=') === 0;
            })[0];
            if (!pair) return '';
            var value = pair.split('=')[1];
            return value;
        }

        var browser = window.bowser.getParser(window.navigator.userAgent);
        var isValidBrowser = browser.satisfies({
            ios: {
                safari: '>=16',
            },
            macos: {
                safari: '>=16',
            },
            mobile: {
                safari: '>=16',
                'android browser': '>103',
            },
            chrome: '>=103',
            firefox: '>=100',
            opera: '>=89',
            edge: '>=103',
        });

        if (!isValidBrowser) {
            const showTip = (isDarkMode) => {
                var locale = getCookie('locale');
                const isCN = locale === 'zh-Hans';
                const bgColor = isDarkMode ? 'var(--color-dark-bottom)' : 'white';

                const id = 'browser-tips';
                const oldTips = document.getElementById(id);
                if (oldTips) {
                    oldTips.remove();
                }
                const browserTips = document.createElement('div');
                browserTips.setAttribute('id', id);

                browserTips.setAttribute(
                    'style',
                    `position: fixed; left: 0; top: 0; width: 100%; z-index: 9999; padding: 10px; text-align: center; font-size: 12px; line-height: 18px; background-color: ${bgColor} !important`,
                );

                const keywordColor = isDarkMode ? 'var(--color-light-main)' : 'rgb(146, 80, 255)';
                const keywordTag = (link, name) =>
                    `<a target="_blank" rel="noreferrer noopener" href="${link}" 
                        style="color:${keywordColor} !important;
                        font-weight: bold;"
                     >${name}</a>`;

                const chromeLinkTag = keywordTag('https://www.google.com/chrome/', 'Chrome');
                const downloadLinkTag = keywordTag('https://firefly.land/#download', isCN ? '下载' : 'download');
                browserTips.innerHTML = isCN
                    ? `请使用 ${chromeLinkTag} 或 ${downloadLinkTag} 我们的APP浏览`
                    : `Please use ${chromeLinkTag} or ${downloadLinkTag} our app to explore more`;
                document.body.appendChild(browserTips);
                document.body.classList.add('group', 'not-support');
            };

            //watch dark mode change
            const htmlElement = document.querySelector('html');
            showTip(htmlElement.classList.contains('dark'));
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isDark = mutation.target.classList.contains('dark');
                        if (isDark) {
                            showTip(true);
                        } else {
                            showTip(false);
                        }
                    }
                });
            });
            observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });
        }
    } catch (error) {
        console.error('Failed to detect bowser, reason: ', error.message);
    }
})();
