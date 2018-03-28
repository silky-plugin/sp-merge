'use strict';
const _path = require('path');
const _fs = require('fs-extra')
function isMatchRegExp(str, arr){
  if(!arr || arr.length == 0){return false}
  for(let i = 0, length = arr.length; i < length; i++){
    if(new RegExp(arr[i]).test(str)){
      return true
    }
  }
  return false
}

exports.registerPlugin = (cli, optionsArr)=>{
  if(!optionsArr || !optionsArr.length){
    cli.log.warn(`插件${require('./package.json').name}没有有效配置，跳过插件注册`.yellow)
    return;
  }
  
  cli.registerHook('build:end', async (buildConfig, cb)=>{
    let outdir = buildConfig.outdir;
    optionsArr.forEach((option)=>{
      let targetFilepath = _path.join(outdir, option.target + option.postfix);
      let beMergedDir = _path.join(outdir, option.suffix);
      option.source.forEach((source)=>{
        let beMergedFilePath = _path.join(beMergedDir, source + option.postfix)
        let fileContent =  _fs.readFileSync(beMergedFilePath,"utf8")
        if(_fs.existsSync(targetFilepath)){
          _fs.appendFileSync(targetFilepath, `\n;/*${source} 👉*/;`+fileContent, {encoding:"utf8"})
        }else{
          _fs.ensureFileSync(targetFilepath)
          _fs.writeFileSync(targetFilepath, `;/*${source} 👉*/;` +fileContent, {encoding:"utf8"})
        }
        if(!option.keepSource){
          _fs.unlinkSync(beMergedFilePath)
        }
      })
    })
    return
  },50)

  cli.registerHook('route:didRequest', async(req, data, content)=>{
    let realPath = data.realPath;
    for(let i = 0, length = optionsArr.length; i < length; i++){
      let option = optionsArr[i];
      let target = option.target
      //如果是非正则模式，则加入后缀， 正则模式则不用加，默认target 必须为全路径
      if(!option._regexp){
        target = target + option.postfix
      }
      if(realPath != target){
        continue
      }
      let responseContent = ""
      let sourceArr = option.source || [];
      if(option._regexp){
        let allFile = cli.utils.getAllFileInProject(true)
        let matchFileQueue = [];
        sourceArr.forEach((item)=>{
          let reg = new RegExp(item);
          allFile.forEach((filepath)=>{
            if(reg.test(filepath)){
              matchFileQueue.push(filepath)
            }
          })
        });
        matchFileQueue.forEach((filePath)=>{
          responseContent = responseContent + `;/*${_path.basename(filePath)} 👉*/;` + _fs.readFileSync(filePath)
        })
      }else{
        sourceArr.forEach((item)=>{
          let filepath = _path.join(cli.cwd(), option.suffix, item + option.postfix)
          responseContent = responseContent + `;/*${_path.basename(filepath)} 👉*/;` + _fs.readFileSync(filepath)
        })
      }
      data.status = 200
      return  responseContent
    }
    return content
  }, 1)
}