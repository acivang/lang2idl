import * as fileStream from 'fs';

import * as dataType from './utils/type';
import * as struct from './utils/struct';
import { FileHelper } from './utils/files';
import { log } from './utils/log';
import { Ducoment } from './tools/groovy/docTools';
import * as utils from './tools/groovy/utils';
import { getInterface } from './tools/groovy/interfaceTools';
import { getClass } from './tools/groovy/classTools';
import { getEnum } from './tools/groovy/enumTools';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from './utils/error';

const rpcPackage: string = 'org.nofdev.rpc.';

let ducoment = new Ducoment();
//groovy类型字典
let groovyTypeMap: { [type: string]: boolean } = {
  ['double']: true,
  ['flout']: true,
  ['String']: true,
  ['byte']: true,
  ['short']: true,
  ['int']: true,
  ['char']: true,
  ['Boolean']: true,
  ['Map']: true,
  ['List']: true,
  ['void']: true,
  ['Object']: true
};

export function convert(path: string): void {
  let isDir: boolean = false;
  let fileHelper = new FileHelper();
  let idl = struct.idlStruct();
  let fils: string[] = fileHelper.getAllFiles(path);

  for (let file of fils) {

    if (file.lastIndexOf('.groovy') < 0) {
      continue;
    }
    let code = fileStream.readFileSync(file).toString();
    if (file.lastIndexOf('Facade.groovy') > -1) {

      let itemInterface = getInterface(code);
      idl.interfaces.push(itemInterface);

    } else if (file.lastIndexOf('.groovy') > -1) {

      let itemType = getType(code);
      if (itemType) {
        idl.types.push(itemType);
      }
    }
  }

  if (idl.types.length === 0) {
    idl.types.push({});
  }
  let jsonIdl: any = JSON.stringify(idl);
  fileStream.writeFile(path + `idl.json`, jsonIdl);

  log.info(`idl json file had created: ${path}idl.json`);

  jsonIdl = `export let jsonIdl = ${jsonIdl}`;
  fileStream.writeFile(path + `idl.ts`, jsonIdl);
  log.info(`idl ts file had created: ${path}idl.ts`);
}


function getType(code: string): any {
  if (/class ((\s*.)*?)DTO/.test(code)) {
    return getClass(code);
  } else if (code.indexOf('enum ') > -1) {
    return getEnum(code);
  }
}