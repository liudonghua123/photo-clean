
const jsDebug = require('debug');
const debug = jsDebug('app:debug');
const info = jsDebug('app:info');
const warn = jsDebug('app:warn');
const error = jsDebug('app:error');

const program = require('commander');
const path = require('path');
const fs = require('fs-extra');
const XLSX = require('xlsx');


const isFileExists = async (file) => {
    try {
        await fs.access(file, fs.constants.R_OK);
        return true;
    }
    catch(err) {
        return false;
    }
};

const parseArgs = () => {
    program
        .option('-s, --source <source>', 'XLSX data file')
        .option('-i, --inputDir <inputDir>', 'Directory of input files')
        .option('-o, --outputDir [outputDir]', 'Directory of output files')
        .option('-c, --copy', 'Copy if needed')
        .option('-t, --test', 'Test only')
        .parse(process.argv);
    return program;
};

const validateArgs = async (program) => {
    if(!program.source) {
        error(`source file should specified!`);
        process.exit(1);
    }
    if(!program.inputDir) {
        error(`input directory should specified!`);
        process.exit(1);
    }
    if(!program.outputDir) {
        program.outputDir = `${program.inputDir}-clean`;
        info(`output directory is not sepecified, use ${program.outputDir} instead`);
        if(!(await isFileExists(program.outputDir))) {
            info(`output directory is not exist, will create it`);
            try {
                !program.test && await fs.mkdir(program.outputDir);
            }
            catch (err) {
                error(`create ${program.outputDir} error!\n${err.stack}`);
                process.exit(1);
            }
        }
    }
    const sourceExists = await isFileExists(program.source)
    if(!sourceExists) {
        error(`excel file is not accessable!`);
        process.exit(1);
    }
    const inputDirExists = await isFileExists(program.inputDir)
    if(!inputDirExists) {
        error(`intput directory is not accessable!`);
        process.exit(1);
    }
    program.copy = !!program.copy;
    program.test = !!program.test;
    info(`Program arguments is:\nsource: ${program.source}\ninputDir: ${program.inputDir}\noutputDir: ${program.outputDir}\ncopy: ${program.copy}\ntest: ${program.test}`);
};

const parseXLSX = () => {
    const workbook = XLSX.readFile(program.source);
    // 获取 Excel 中所有表名
    const sheetNames = workbook.SheetNames; // 返回 ['sheet1', 'sheet2']
    // 根据表名获取对应某张表
    const worksheet = workbook.Sheets[sheetNames[0]];
    // 使用XLSX.utils.sheet_to_json转换为json对象数组
    return XLSX.utils.sheet_to_json(worksheet);
};

const cleanPhoto = async (worksheetJson) => {
    try {
        for(const {学号: xh, 报名号: bmh, 考生编号: ksbh, 身份证号: sfzh, 姓名: xm} of worksheetJson) {
            // bmh
            const bmhFileTry = path.resolve(program.inputDir, bmh + '.jpg');
            const sfzhFileTry = path.resolve(program.inputDir, sfzh + '.jpg');
            const bmhFile2Try = path.resolve(program.inputDir, '10673_17_' + bmh + '.jpg');
            const ksbhFileTry = path.resolve(program.inputDir, ksbh + '.jpg');
            let matchFile = null;
            const destinationFile = path.resolve(program.outputDir, xh + '.jpg');
            // bmh
            if(await isFileExists(`${bmhFileTry}`)) {
                matchFile = bmhFileTry;
            }
            // sfzh
            else if(await isFileExists(`${sfzhFileTry}`)) {
                matchFile = sfzhFileTry;
            }
            // 10673_17_bmh
            else if(await isFileExists(`${bmhFile2Try}`)) {
                matchFile = bmhFile2Try;
            }
            // ksbh
            else if(await isFileExists(`${ksbhFileTry}`)) {
                matchFile = ksbhFileTry;
            }
            else {
                warn(`The photo of ${xh}/${xm} not found!`);
                continue;
            }
            try {
                if(program.copy) {
                    info(`copy ${matchFile} to ${destinationFile}`);
                    !program.test && await fs.copy(matchFile, destinationFile);
                }
                else {
                    info(`move ${matchFile} to ${destinationFile}`);
                    !program.test && await fs.rename(matchFile, destinationFile);
                }
            }
            catch(err) {
                error(`${program.copy ? 'copy': 'move'} ${matchFile} to ${destinationFile} error!`);
                error(`${err.stack}`);
            }
        }
    }
    catch(err) {
        error(`${err.stack}`);
        process.exit(1);
    }
};

module.exports = {
    parseArgs,
    validateArgs,
    parseXLSX,
    cleanPhoto,
};