import * as fileStream from 'fs';
import * as osPath from 'path';
import * as dataType from './utils/type';
import * as struct from './utils/struct';
import { FileHelper } from './utils/files';
import { log } from './utils/log';
import { InterfaceTool } from './tools/groovy/interfaceTool';
import { getClasses } from './tools/groovy/classTool';
import { getEnums } from './tools/groovy/enumTool';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from './utils/error';

let typeFilesMap: { [key: string]: string } = {};

export function convert(path: string): void {

  let facadeFiles: string[] = [];
  let typeFiles: string[] = [];
  let fileHelper = new FileHelper();
  let interfaceTool = new InterfaceTool();

  let idl = struct.idlStruct();
  let files: string[] = fileHelper.getAllFiles(path);

  for (let file of files) {

    if (osPath.extname(file) !== '.groovy') {
      continue;
    }
    let fileName: string = osPath.basename(file, '.groovy').toLowerCase();
    if (fileName.indexOf('facade') > -1) {
      facadeFiles.push(file);
    } else {
      typeFiles.push(file);
      typeFilesMap[fileName] = file;
    }

  }

  interfaceTool.typeFilesMap = typeFilesMap;

  for (let file of facadeFiles) {
    let interfaceCode = fileStream.readFileSync(file).toString();
    let itemInterface = interfaceTool.getInterface(interfaceCode);
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
  let filePath: string = osPath.join(path, 'idl.json');
  fileStream.writeFile(filePath, jsonIdl, () => {
    log.info(`idl json file had created: ${ filePath }`);
  });

  jsonIdl = `export let jsonIdl = ${jsonIdl}`;
  filePath = osPath.join(path, 'idl.ts');
  fileStream.writeFile(filePath, jsonIdl, () => {
    log.info(`idl ts file had created: ${ filePath }`);
  });
}


function getType(code: string): any {
  if (/class ((\s*.)*?)DTO/.test(code)) {
    return getClasses(code, typeFilesMap);
  } else if (code.indexOf('enum ') > -1) {
    return getEnums(code, typeFilesMap);
  }
}