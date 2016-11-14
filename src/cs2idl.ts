import * as fileStream from 'fs';

import * as dataType from './utils/type';
import * as struct from './utils/struct';
import { FileHelper } from './utils/files';
import { log } from './utils/log';
import { InterfaceTools } from './tools/cs/interfaceTool';
import { getClasses } from './tools/cs/classTool';
import { getEnums } from './tools/cs/enumTool';

const namespace: string = 'org.nofdev.rpc.';

let usings: string = '';

let typeFilesMap: { [key: string]: string } = {};

export function convert(path: string): void {

  let facadeFiles: string[] = [];
  let typeFiles: string[] = [];
  let fileHelper = new FileHelper();
  let interfaceTools = new InterfaceTools();
  let idl = struct.idlStruct();
  let files: string[] = fileHelper.getAllFiles(path);

  for (let file of files) {
    if (file.lastIndexOf('.cs') < 0) {
      continue;
    }
    if (file.toLowerCase().lastIndexOf('facade.cs') > -1) {
      facadeFiles.push(file);

    } else if (file.toLowerCase().lastIndexOf('.cs') > -1) {

      typeFiles.push(file);
      let key: string = file.substring(file.lastIndexOf('/') + 1, file.indexOf('.')).toLowerCase();
      typeFilesMap[key] = file;

    }

  }

  interfaceTools.typeFilesMap = typeFilesMap;
  for (let file of typeFiles) {
    let typeCode = fileStream.readFileSync(file).toString();
    let itemType = getType(typeCode);
    idl.types.push(itemType);
  }

  for (let file of facadeFiles) {
    let facadeCode = fileStream.readFileSync(file).toString();
    let itemInterface = interfaceTools.getInterface(facadeCode);
    idl.interfaces.push(itemInterface);
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