;(() => {
    if (!AbortSignal.prototype.timeout) {
        AbortSignal.prototype.timeout = function(ms) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), ms);
      
          if (this.aborted) {
            clearTimeout(timer);
            controller.abort();
          } else {
            this.addEventListener('abort', () => {
              clearTimeout(timer);
              controller.abort();
            }, {once: true});
          }
      
          return controller.signal;
        }
      }
})();
null;
