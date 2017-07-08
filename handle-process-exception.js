
const jsDebug = require('debug');
const debug = jsDebug('app:debug');
const info = jsDebug('app:info');
const error = jsDebug('app:error');

const handle = () => {
    // see https://github.com/nwjs/nw.js/issues/1699#issuecomment-84861481
    // see https://nodejs.org/api/process.html
    process.on('uncaughtException', (err) => {
        error('uncaughtException', err);
    });
    process.on('unhandledRejection', (err) => {
        error('unhandledRejection', err);
    });
    process.on('rejectionHandled', (err) => {
        error('rejectionHandled', err);
    });
};

module.exports = {
    handle,
}