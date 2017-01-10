
import * as utils from './utils';
import { log } from '../../utils/log';

export let getMetaes = (code: string, endValue: string, typeFilesMap?: { [key: string]: string }) => {
  let metaes: any = [];
  
  let metaesStart = code.indexOf("[");
  let metaesEnd = code.indexOf(endValue);
  if (metaesStart < metaesEnd) {
    let fileName: string = utils.getObjectName(code);
    let metaBlocks: any = code.substring(metaesStart, metaesEnd);
    metaBlocks = metaBlocks.match(/\[((\s*?.*?)*?)\]/g);

    metaes.pop();
    
    for (let meta of metaBlocks) {
      meta = meta.replace(/\r?\n|\[|\]/g, '');
      if(!typeFilesMap[meta.toLowerCase()]){
        log.warning(`can't get ${ meta }'s namespace in file of ${ fileName }`);
      }else{
        meta = `${typeFilesMap[meta.toLowerCase()]}.${meta}`;
      }
      metaes.push({
        type: meta,
        args: {}
      });
    }
  }
  if(metaes.length === 0){
    metaes.push({});
  }
  return metaes;
}