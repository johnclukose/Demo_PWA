(function () {
    var log = console.log.bind(console);
    var err = console.error.bind(console);

    var version = '1';
    var cacheName = 'pwa-client-v' + version;
    var dataCacheName = 'pwa-client-data-v' + version;
    var appShellFilesToCache = [
        './',
        './index.html'
    ];

    self.addEventListener('install', function (e) {
        e.waitUntil(self.skipWaiting());
        log('Service Worker: Installed');

        e.waitUntil(
            caches.open(cacheName)
                .then(function (cache) {
                    log('Service Worker: Caching App Shell');
                    return cache.addAll(appShellFilesToCache);
                })
        );
    });

    self.addEventListener('activate', function (e) {
        e.waitUntil(self.clients.claim());
        log('Service Worker: Active');

        e.waitUntil(
            caches.keys()
                .then(function (keyList) {
                    return Promise.all(keyList.map(function (key) {
                        if (key !== cacheName) {
                            log('Service Worker: Removing old cache', key);
                            return caches.delete(key);
                        }
                    }));
                })
        );
    });

    self.addEventListener('fetch', function (e) {
        // log('Service Worker: Fetch URL ', e.request.url);
        // var dataUrl = 'http://127.0.0.1:8000';

        // Match requests for data and handle them separately
        e.respondWith(
            caches.match(e.request.url)
                .then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        // if (e.request.url.indexOf(dataUrl) === 0) {
                            // response.json().then(function (json) {
                            //   console.log(json);
                            // });
                        // }
                    }

                    return fetch(e.request.clone())
                            .then(function (r2) {
                                // IMPORTANT: Clone the response. A response is a stream
                                // and because we want the browser to consume the response
                                // as well as the cache consuming the response, we need
                                // to clone it so we have two streams.
                                // if (e.request.url.indexOf(dataUrl) === 0) {
                                  // console.log('Service Worker: Fetched & Cached Response ',
                                  //   r2.clone().json().then(function (json) {
                                  //     console.log(json);
                                  //   })
                                  // );
                                // }
                                return caches.open(dataCacheName)
                                    .then(function (cache) {
                                        cache.put(e.request.url, r2.clone());
                                        // console.log('Service Worker: Fetched & Cached URL ', e.request.url);
                                        // console.log('Service Worker: Fetched & Cached Response ', r2.clone());

                                        return r2;
                                    });
                            })
                            .catch(function (error) {
                                // First try to fetch the response from server
                                // If error, then send response if present
                                // else error
                                if (response) {
                                  // console.log('Service Worker: Cached Response ', response);
                                }
                                return response || error;
                            });
                })
        );
    });

})();
