import * as osPath from 'path';
import * as fileStream from 'fs';
import * as dataType from '../../utils/type';
import { log } from '../../utils/log';
import { FileHelper } from '../../utils/files';

let fileHelper = new FileHelper();

export let getTypes = (types: any, path: string) => {
  let mainImports: Array<string> = new Array();
  for (let item of types) {
    if (item.package) {
      let typeCodes: Array<string> = new Array();
      // typeCodes.push(`namespace ${item.package}{\n`);
      if (item.doc) {
        typeCodes.push('/**');
        typeCodes.push(` * ${item.doc}`);
        typeCodes.push(' */');
      }
      if (item.type === "class") {
        typeCodes.push(`export class ${item.name}{`);
        for (let property of item.properties) {
          typeCodes.push('\n/**')
          typeCodes.push(` * ${property.doc}`);
          typeCodes.push(' */')
          typeCodes.push(`public ${property.name}: ${dataType.toTsType(property.type)};`);
        }
      } else if (item.type === "enum") {
        typeCodes.push(`export enum ${item.name}{`);
        for (let property of item.properties) {
          typeCodes.push('\n/**')
          typeCodes.push(` * ${property.doc}`);
          typeCodes.push(' */')
          typeCodes.push(`${property.name},`);
        }
      }
      typeCodes.push("}");

      mainImports.push(`export * from './${item.package.replace(/\./g, osPath.sep)}/${item.name.toLowerCase()}';`);
      let directory: string = `${path}/${item.package.replace(/\./g, osPath.sep)}/`;
      fileHelper.saveFile(`${directory}${item.name.toLowerCase()}.ts`, typeCodes.join("\n"));
      log.info(`file had created: ${directory}${item.name}.ts.`);
    }
  }
  return mainImports.join('\n');
}