const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:8090';

const context = [
    "/file",
    "/directory",
    "/user",
    "/playlist",
    "/playlistsong",
    "/favoriteartist",
    "/artist",
    "/song",
];

const onError = (err, req, resp, target) => {
    console.error(`${err.message}`);
}

module.exports = function (app) {
    app.use('/api', (req, res, next) => {
        req.Url = req.query.Url || 'https://zvon.top/';
        createProxyMiddleware({
            target: req.Url,
            changeOrigin: true,
            followRedirects: true,
            pathRewrite: {
                '^/api': '',
            },
        })(req, res, next);
    });
    app.use('/fileproxy', createProxyMiddleware({
        target: 'https://dl3s5.zvon.top/',
        changeOrigin: true,
        secure: false,
        followRedirects: true,
        pathRewrite: { '^/fileproxy': '' },
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('Referer', 'https://zvon.top/');
            proxyReq.setHeader('Origin', 'https://zvon.top');
            proxyReq.setHeader('Host', 'dl3s5.zvon.top');
        }
    }));





    const appProxy = createProxyMiddleware(context, {
        proxyTimeout: 10000,
        target: target,
        onError: onError,
        secure: false,
        headers: {
            Connection: 'Keep-Alive'
        }
    });

    app.use(appProxy);
};
