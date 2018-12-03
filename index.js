#!/usr/bin/env node
let Client = require('ssh2-sftp-client');
let sftp = new Client();
var path = require("path");
var fs = require('fs');
var configFile = process.cwd() + "/.kila";

var allConfigFile = process.env.HOME + "/.kila";

var _paths = process.cwd().split('/');


var configs = {

}
var argvs = process.argv.splice(2);


var module = argvs[0] || _paths[_paths.length - 1]//模块名称


var host = argvs[1]//模块名称
var username = argvs[2]//模块名称
var password = argvs[3]//模块名称
var basicUrl = argvs[4]//模块名称
var uploadDir = argvs[5] || '/dist'//模块名称

var strConfigs={};
// 有没有全局变量，如果有全局变量就去全局变量获取
if (module == "config") {

    let _isexists = fs.existsSync(configFile);
    if (_isexists) {
        strConfigs = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    }
    var _writeConfigs = { host: host, username: username, password: password, basicUrl: basicUrl, uploadDir: uploadDir };
    Object.assign(strConfigs,{sftp:_writeConfigs})
    
    fs.writeFileSync(configFile, JSON.stringify(strConfigs))
    console.log('写入配置文件:', _writeConfigs)
    return;
} else if (module == "configs") {




    let _isexists = fs.existsSync(allConfigFile);
    if (_isexists) {
        strConfigs = JSON.parse(fs.readFileSync(allConfigFile, 'utf-8'));
    }
    var _writeConfigs = { host: host, username: username, password: password, basicUrl: basicUrl, uploadDir: uploadDir };
    Object.assign(strConfigs,{sftp:_writeConfigs})
    fs.writeFileSync(allConfigFile, JSON.stringify(strConfigs))
    console.log('写入全局配置文件:', _writeConfigs)
    return;
}

let _isexists = fs.existsSync(configFile);

if (_isexists) {
    strConfigs = JSON.parse(fs.readFileSync(configFile, 'utf-8')).sftp;
} else if (fs.existsSync(allConfigFile)) {
    strConfigs = JSON.parse(fs.readFileSync(allConfigFile, 'utf-8')).sftp;
}

if (!strConfigs) {
    console.log('kilaftp inti host username  password basicUrl')
    return;
}

configs = strConfigs;



var BASIC_URL = configs.basicUrl;

var cmdPath = process.cwd() + (configs.uploadDir || "/dist");


var remoteDir = module//模块名称

if (!remoteDir) {
    console.log('输入sftp路径');
    return;
}

var BASIC_URL = BASIC_URL + remoteDir;


//var remoteDir =argvs[1] //解压路径

console.log('本地路径:' + cmdPath + "\r\n远程路径:" + BASIC_URL)
/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */

async function pushSync(filedir, remoteFilePath) {

    var promise = new Promise((r) => {

        sftp.put(filedir, remoteFilePath, true, 'utf-8').then(() => {

            console.log('puth:', remoteFilePath);

            r(true);
        });
    })
    var value = await promise;
    return value;
}


async function existsSync(remoteDir) {

    var promise = new Promise((r) => {
        sftp.exists(remoteDir).then(isexists => {


            r(isexists);
        });
    });
    var value = await promise;
    return value;
}

async function mkdirSync(remoteDir) {
    var promise = new Promise((r) => {
        sftp.mkdir(remoteDir, true).then(() => {

            r(true);
        });
    });
    var value = await promise;
    return value;
}

async function fileDisplay(filePath) {

    var files = fs.readdirSync(filePath);


    //files.forEach(async function (filename) {

    for (let i = 0; i < files.length; i++) {

        var filename = files[i];
        //获取当前文件的绝对路径
        var filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        var stats = fs.statSync(filedir)//,function(eror,stats){

        var isFile = stats.isFile();//是文件
        var isDir = stats.isDirectory();//是文件夹

        if (isFile) {
            var remoteFilePath = filedir.replace(cmdPath, '');

            remoteFilePath = BASIC_URL + remoteFilePath;

            await pushSync(filedir, remoteFilePath);


        }
        if (isDir) {
            var remoteFilePath = filedir.replace(cmdPath, '');

            var remoteDir = BASIC_URL + remoteFilePath;

            const isexists = await existsSync(remoteDir);
            //await sftp.exists(remoteDir).then(isexists => {

            if (!isexists) {

                await mkdirSync(remoteDir);

                await fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
            } else {
                await fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件 
            }
        }
    }
    //});

    //if(!files){
    console.log('end:', filePath);
    //}

    return new Promise(r => {
        r(true);
    })

}



 function start() {

   /* const isBexistsASIC_URL = await existsSync(BASIC_URL)
    if (!isBexistsASIC_URL) {
       // await mkdirSync(BASIC_URL);
    }*/

    sftp.connect({
        host: configs.host,
        //port: '8080',
        username: configs.username,
        password: configs.password
    }).then(() => {
        return sftp.list(BASIC_URL);
    }).then(async (data) => {
        console.log(data, 'the data info');

        await fileDisplay(cmdPath);

        console.log('put completed');
        sftp.end();



    }).catch((err) => {
        console.log(err, 'catch error');
    });
    sftp.on('end', () => {
        console.log('end event');
    });
    sftp.on('close', () => {
        console.log('close event');
    });
}

start();
