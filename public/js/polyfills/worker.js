(() => {
    !(function () {
        'use strict';
        try {
            Response.prototype.blob = async function () {
                return new Blob([await this.arrayBuffer()], { type: this.headers.get('Content-Type')?.split(';')[0] });
            };
        } catch {}
    })();
})();
null;
