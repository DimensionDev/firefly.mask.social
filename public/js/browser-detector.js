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
            var locale = getCookie('locale');
            var browserTips = document.createElement('div');
            browserTips.setAttribute(
                'style',
                'position: fixed; left: 0; top: 0; width: 100%; z-index: 9999; padding: 10px; text-align: center; font-size: 12px; line-height: 18px; background-color: #8e96ff !important',
            );
            browserTips.innerHTML =
                locale === 'zh-Hans'
                    ? '请使用 <a target="_blank" rel="noreferrer noopener" href="https://www.google.com/chrome/" style="color: rgb(146, 80, 255)!important; font-weight: 700;">Chrome</a> 或 <a target="_blank" rel="noreferrer noopener" href="https://firefly.land/#download" style="color: rgb(146, 80, 255); font-weight: 700;">下载</a> 我们的APP浏览'
                    : 'Please use <a target="_blank" rel="noreferrer noopener" href="https://www.google.com/chrome/" style="color: rgb(146, 80, 255)!important; font-weight: 700;">Chrome</a> or <a target="_blank" rel="noreferrer noopener" href="https://firefly.land/#download" style="color: rgb(146, 80, 255); font-weight: 700;">download</a> our app to explore';
            document.body.appendChild(browserTips);
        }
    } catch (error) {
        console.error('Failed to detect bowser, reason: ', error.message);
    }
})();
