import * as fileStream from 'fs';
import * as osPath from 'path';
import * as dataType from './utils/type';
import * as struct from './utils/struct';
import { FileHelper } from './utils/files';
import { log } from './utils/log';
import { InterfaceTool } from './tools/cs/interfaceTool';
import { getClasses } from './tools/cs/classTool';
import { getEnums } from './tools/cs/enumTool';

const namespace: string = 'org.nofdev.rpc.';

let usings: string = '';

let typeFilesMap: { [key: string]: string } = {};

export function convert(path: string): void {

  let facadeFiles: string[] = [];
  let typeFiles: string[] = [];
  let fileHelper = new FileHelper();
  let interfaceTools = new InterfaceTool();
  let idl = struct.idlStruct();
  let files: string[] = fileHelper.getAllFiles(path);

  for (let file of files) {
    if (osPath.extname(file) !== '.cs') {
      continue;
    }

    let fileName: string = osPath.basename(file, '.cs').toLowerCase();
    if (fileName.endsWith('facade')) {
      facadeFiles.push(file);

    } else {//if (osPath.dirname(file).endsWith('dto') || fileName.endsWith('dto')) {

      typeFiles.push(file);
      typeFilesMap[fileName] = file;

    }

  }

  if(facadeFiles.length === 0 && typeFiles.length === 0){
    log.info(`there are not found any cs files!`);
    return;
  }

  interfaceTools.typeFilesMap = typeFilesMap;
  for (let file of typeFiles) {
    let typeCode = fileStream.readFileSync(file).toString();
    let itemType = getType(typeCode);
    if (itemType) {
      idl.types.push(itemType);
    }
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
  let filePath: string = osPath.join(path, 'idl.json');
  fileStream.writeFile(filePath, jsonIdl, () => {
    log.info(`idl json file had created: ${path}idl.json`);
  });

}

function getType(code: string): any {
  if (/class ((\s*.)*?)DTO/.test(code)) {
    return getClasses(code, typeFilesMap);
  } else if (code.indexOf('enum ') > -1) {
    return getEnums(code, typeFilesMap);
  }
}