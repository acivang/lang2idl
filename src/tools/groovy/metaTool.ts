
import * as utils from './utils';
import { log } from '../../utils/log';

export let getMetaes = (code: string, endValue: string, typeFilesMap?: { [key: string]: string }) => {
  let metaes: any = [{}];
  
  let metaesStart = code.indexOf("@");
  let metaesEnd = code.indexOf(endValue);
  if (metaesStart < metaesEnd) {
    let fileName: string = utils.getObjectName(code);
    let metaBlocks: any = code.substring(metaesStart, metaesEnd);
    metaBlocks = metaBlocks.match(/@((\s*?.*?)*?)\r?\n/g);

    metaes.pop();
    for (let meta of metaBlocks) {
      meta = meta.replace(/\r?\n|@/g, '');
      if(!typeFilesMap[meta.toLowerCase()]){
        log.warning(`can't get ${ meta }'s package in file of ${ fileName }`);
      }else{
        meta = `${typeFilesMap[meta.toLowerCase()]}.${meta}`;
      }
      metaes.push({
        type: meta,
        args: {}
      });
    }
  }

  return metaes;
}