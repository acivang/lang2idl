import * as fileStream from 'fs';

import * as dataType from './utils/type';
import * as struct from './utils/struct';
import { FileHelper } from './utils/files';
import { log } from './utils/log';
import { InterfaceTools } from './tools/groovy/interfaceTool';
import { getClasses } from './tools/groovy/classTool';
import { getEnums } from './tools/groovy/enumTool';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from './utils/error';

let typeFilesMap: { [key: string]: string } = {};

export function convert(path: string): void {
  
  let facadeFiles: string[] = [];
  let typeFiles: string[] = [];
  let fileHelper = new FileHelper();
  let interfaceTools = new InterfaceTools();

  let idl = struct.idlStruct();
  let files: string[] = fileHelper.getAllFiles(path);

  for (let file of files) {

    if (file.lastIndexOf('.groovy') < 0) {
      continue;
    }
    if (file.lastIndexOf('Facade.groovy') > -1) {
      facadeFiles.push(file);
    } else if (file.lastIndexOf('.groovy') > -1) {
      typeFiles.push(file);
      let key: string = file.substring(file.lastIndexOf('/') + 1, file.indexOf('.')).toLowerCase();
      typeFilesMap[key] = file;
    }

  }
  
  interfaceTools.typeFilesMap = typeFilesMap;

  for (let file of facadeFiles) {
    let interfaceCode = fileStream.readFileSync(file).toString();
    let itemInterface = interfaceTools.getInterface(interfaceCode);
    idl.interfaces.push(itemInterface);
  }

  for (let file of typeFiles) {
    let typeCode = fileStream.readFileSync(file).toString();
    let itemType = getType(typeCode);
    if (itemType) {
      idl.types.push(itemType);
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
    return getClasses(code, typeFilesMap);
  } else if (code.indexOf('enum ') > -1) {
    return getEnums(code, typeFilesMap);
  }
}