
import * as fileStream from 'fs';
import * as dataType from './utils/type';
import { log } from './utils/log';
import { getInterfaces } from './tools/ts/interfaceTools';
import { getTypes } from './tools/ts/typeTools';
import { FileHelper } from './utils/files';

let fileHelper = new FileHelper();

export function convert(path: string): void {

  if (!fileStream.existsSync(path)) {
    throw new Error(`no such file or directory, open '${path}'`);
  }

  let code: any = fileStream.readFileSync(path).toString();
  if (!code) {
    throw new Error(`nothing is in the file of '${path}'`);
  }
  try {
    code = JSON.parse(code);
  }
  catch (error) {
    throw error;
  }

  path = path.substring(0, path.lastIndexOf('/') + 1);
  let types: any = code.types;
  getInterfaces(code.interfaces, path);
  getTypes(code.types, path);
  // for (let i: number = 0; i < types.length; i++) {
  //   let item: any = types[i];
  //   if (item.package) {
  //     let typeCodes: Array<string> = new Array();
  //     // typeCodes.push(`namespace ${item.package}{\n`);
  //     if (item.doc) {
  //       typeCodes.push('/**');
  //       typeCodes.push(` * ${item.doc}`);
  //       typeCodes.push(' */');
  //     }
  //     if (item.type === "class") {
  //       typeCodes.push(`class ${item.name}{`);
  //       for (let property of item.properties) {
  //         typeCodes.push('\n/**')
  //         typeCodes.push(` * ${property.doc}`);
  //         typeCodes.push(' */')
  //         typeCodes.push(`public ${property.name}: ${dataType.toTsType(property.type)};`);
  //       }
  //     } else if (item.type === "enum") {
  //       typeCodes.push(`export enum ${item.name}{`);
  //       for (let property of item.properties) {
  //         typeCodes.push('\n/**')
  //         typeCodes.push(` * ${property.doc}`);
  //         typeCodes.push(' */')
  //         typeCodes.push(`${property.name},`);
  //       }
  //     }
  //     typeCodes.push("}");
  //     // typeCodes.push("}");

  //     let directory: string = `${path}${item.package.replace(/\./g, '/')}/`;
  //     fileHelper.saveFile(`${directory}${item.name}.ts`, typeCodes.join("\n"));
  //     log.info(`file had created: ${path}${item.name}.ts.`);
  //   }
  // }

}