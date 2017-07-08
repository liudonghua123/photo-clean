#!/usr/bin/env node

const jsDebug = require('debug');
const debug = jsDebug('app:debug');
const info = jsDebug('app:info');
const error = jsDebug('app:error');

const processExpection = require('./handle-process-exception');
const utils = require('./utils');

// handle process unhandle exception
processExpection.handle();

const run = async () => {
    // parse the arguments
    const program = utils.parseArgs();
    // validate the arguments
    await utils.validateArgs(program);

    // parse the xlsx
    const worksheetJson = utils.parseXLSX();
    // clean the photo
    await utils.cleanPhoto(worksheetJson);
    process.exit(0);
}

run();
