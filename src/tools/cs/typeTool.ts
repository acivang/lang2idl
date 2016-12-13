import * as osPath from 'path';
import * as struct from '../../utils/struct';
import * as dataType from '../../utils/type';
import { namespaceTool } from './namespaceTool';
import { MissingMethodError, MissingCommentError, CodeFormatError, MissingFileError } from '../../utils/error';
import { FileHelper } from '../../utils/files';
import { log } from '../../utils/log';

//cs类型字典
let csharpTypeMap: { [type: string]: boolean } = {
  ['double']: true,
  ['flout']: true,
  ['string']: true,
  ['byte']: true,
  ['short']: true,
  ['int']: true,
  ['char']: true,
  ['bool']: true,
  ['dictionary']: true,
  ['arraylist']: true,
  ['hashtable']: true,
  ['sortedlist']: true,
  ['sorteddictionary']: true,
  ['list']: true,
  ['void']: true,
  ['object']: true,
  ['decimal']: true,
  ['biginteger']: true,
  ['integer']: true,
  ['long']: true,
  ['sbyte']: true,
  ['uint']: true,
  ['ulong']: true,
  ['ushort']: true
};
let usings: string[];
let namespacetool = new namespaceTool();
let fileHelper = new FileHelper();

export class TypeTool {
  typeFilesMap: { [key: string]: string };

  getType = (typeCode: string): any => {
    let propType: string;
    let propTypeParams: string[] = [];

    if (typeCode.indexOf('<') > -1) { //Match List<T>, Dictionary<TK,TV>, CustomClass<T>
      let typeTmp = typeCode.split('<');
      propType = typeTmp[0];
      typeTmp[1] = typeTmp[1].replace(/\>| /g, '');
      if (typeTmp[1].indexOf(',') > -1) {//Match Dictionary<TK,TV>
        let tmpPropTypeParams = typeTmp[1].split(',');
        propTypeParams.push(this.getTypePackage(tmpPropTypeParams[0]));
        propTypeParams.push(this.getTypePackage(tmpPropTypeParams[1]));
      }
      else {
        propTypeParams.push(this.getTypePackage(typeTmp[1]));
      }
    } else {
      propType = typeCode;
    }

    propType = this.getTypePackage(propType);

    if (propTypeParams.length > 0) {
      return {
        type: propType,
        typeParams: propTypeParams
      }
    }
    return {
      type: propType
    }
  }

  getTypes = (types: any, path: string) => {

    for (let item of types) {
      let namespaceName: string = "";
      let usings: Array<string> = new Array();
      let usingsMap: { [key: string]: boolean } = {};

      usings.push('using System;');
      usingsMap[`${item.package}`] = true;

      if (item.package) {
        let typeCodes: Array<string> = new Array();
        let propertyCodes: Array<string> = new Array();

        if (item.type === "class") {
          for (let property of item.properties) {
            property.type = property.type.toLowerCase();
            propertyCodes.push('\n/// <summary>')
            propertyCodes.push(`/// ${property.doc}`);
            propertyCodes.push('/// <summary>')
            if (property.type.indexOf('.') < 0) {
              if (property.typeParams) {
                if (property.type === 'list' || property.type === 'dictionary') {
                  usings.push('using System.Collections.Generic;');
                }
                let typeParams: Array<string> = new Array();
                for (let param of property.typeParams) {
                  if (param.indexOf(".") > -1) {
                    namespaceName = param.substring(0, param.lastIndexOf(".")).toLowerCase();
                    param = param.substring(param.lastIndexOf(".") + 1);
                    if (!usingsMap[namespaceName]) {
                      usingsMap[namespaceName] = true;
                      usings.push(`using ${namespaceName};`);
                    }
                  }
                  typeParams.push(param);
                }

                propertyCodes.push(`public ${dataType.toLangType(property.type, 'cs')}<${typeParams.join(", ")}> ${property.name} { get; set; }`);

              } else {
                propertyCodes.push(`public ${dataType.toLangType(property.type, 'cs')} ${property.name} { get; set; }`);
              }
            } else {
              namespaceName = property.type.substring(0, property.type.lastIndexOf("."));
              if (!usingsMap[namespaceName]) {
                usingsMap[namespaceName] = true;
                usings.push(`using ${namespaceName};`);
              }
              if (property.typeParams) {
                let typeParams: Array<string> = new Array();
                for (let param of property.typeParams) {
                  if (param.indexOf(".") > -1) {
                    namespaceName = param.substring(0, param.lastIndexOf(".")).toLowerCase();
                    param = param.substring(param.lastIndexOf(".") + 1);
                    if (!usingsMap[namespaceName]) {
                      usingsMap[namespaceName] = true;
                      usings.push(`using ${namespaceName};`);
                    }
                  }
                  typeParams.push(param);
                }

                propertyCodes.push(`public ${dataType.toLangType(property.type, 'cs')}<${typeParams.join(", ")}> ${property.name} { get; set; }`);

              } else {
                propertyCodes.push(`public ${property.type.substring(property.type.lastIndexOf(".") + 1)} ${property.name} { get; set; }`);
              }
            }
          }
        } else if (item.type === "enum") {
          for (let property of item.properties) {
            propertyCodes.push('\n/// <summary>')
            propertyCodes.push(`/// ${property.doc}`);
            propertyCodes.push('///')
            propertyCodes.push(`${property.name},`);
          }
        }
        typeCodes.push(usings.join('\n'));
        typeCodes.push(`\nnamespace ${item.package.toLowerCase()} {\n`);
        if (item.doc) {
          typeCodes.push('/// <summary>');
          typeCodes.push(`/// ${item.doc}`);
          typeCodes.push('/// </summary>');
        }
        if (item.type === "class") {
          typeCodes.push(`class ${item.name}{`);
        } else if (item.type === "enum") {
          typeCodes.push(`enum ${item.name}{`);
        }
        typeCodes.push(propertyCodes.join('\n'));
        typeCodes.push("}");
        typeCodes.push("}");

        let filePath: string = `${ osPath.join(path, item.package.replace(/\./g, osPath.sep).toLowerCase(), item.name) }.cs`;
        fileHelper.saveFile(filePath, typeCodes.join("\n"));
        log.info(`file had created: ${filePath}.`);
      }
    }
  }

  private getTypePackage(type: string): string {
    if (csharpTypeMap[type.toLowerCase()]) {
      return type;
    }
    if (!this.typeFilesMap[type.toLowerCase()]) {
      throw new MissingFileError(`${type}.cs`);
    }
    return namespacetool.getNamespaceParam(type, this.typeFilesMap[type.toLowerCase()]);
  }
}
