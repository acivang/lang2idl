
import * as struct from '../../utils/struct';
import * as dataType from '../../utils/type';
import { packageTool } from './packageTool';
import { MissingMethodError, MissingCommentError, CodeFormatError } from '../../utils/error';
import { FileHelper } from '../../utils/files';
import { log } from '../../utils/log';

//groovy类型字典
let groovyTypeMap: { [type: string]: boolean } = {
  ['double']: true,
  ['flout']: true,
  ['string']: true,
  ['byte']: true,
  ['short']: true,
  ['int']: true,
  ['char']: true,
  ['boolean']: true,
  ['map']: true,
  ['list']: true,
  ['void']: true,
  ['object']: true,
  ['bigdecimal']: true,
  ['biginteger']: true,
  ['integer']: true,
  ['long']: true
};
let imports: string[];
let packagetool = new packageTool();
let fileHelper = new FileHelper();

export class TypeTool {
  typeFilesMap: { [key: string]: string };

  getType = (typeCode: string): any => {
    let propType: string;
    let propTypeParams: string[] = [];

    if (typeCode.indexOf('<') > -1) { //Match List<T>, Map<TK,TV>, CustomClass<T>
      let typeTmp = typeCode.split('<');
      propType = typeTmp[0];
      typeTmp[1] = typeTmp[1].replace(/\>| /g, '');
      if (typeTmp[1].indexOf(',') > -1) {//Match Map<TK,TV>
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
      let imports: Array<string> = new Array();
      let importsMap: { [key: string]: boolean } = {};
      if (item.package) {
        let typeCodes: Array<string> = new Array();
        let propertyCodes: Array<string> = new Array();
        typeCodes.push(`package ${item.package.toLowerCase()}\n`);

        if (item.type === "class") {
          for (let property of item.properties) {
            propertyCodes.push('\n/**')
            propertyCodes.push(` * ${property.doc}`);
            propertyCodes.push(' */')
            if (property.type.indexOf('.') < 0) {
              if (property.typeParams) {
                let typeParams: Array<string> = new Array();
                for (let param of property.typeParams) {
                  if (param.indexOf(".") > -1) {
                    namespaceName = param.substring(0, param.lastIndexOf(".")).toLowerCase();
                    param = param.substring(param.lastIndexOf(".") + 1);
                    if (!importsMap[namespaceName]) {
                      importsMap[namespaceName] = true;
                      imports.push(`import ${namespaceName}.*;`);
                    }
                  }
                  typeParams.push(param);
                }

                propertyCodes.push(`${dataType.toLangType(property.type.toLowerCase(), 'groovy')}<${typeParams.join(", ")}> ${property.name};`);

              } else {
                propertyCodes.push(`${dataType.toLangType(property.type.toLowerCase(), 'groovy')} ${property.name};`);
              }
            } else {
              namespaceName = property.type.substring(0, property.type.lastIndexOf("."));
              if (!importsMap[namespaceName]) {
                importsMap[namespaceName] = true;
                imports.push(`import ${namespaceName};`);
              }
              if (property.typeParams) {
                let typeParams: Array<string> = new Array();
                for (let param of property.typeParams) {
                  if (param.indexOf(".") > -1) {
                    namespaceName = param.substring(0, param.lastIndexOf(".")).toLowerCase();
                    param = param.substring(param.lastIndexOf(".") + 1);
                    if (!importsMap[namespaceName]) {
                      importsMap[namespaceName] = true;
                      imports.push(`import ${namespaceName}.*;`);
                    }
                  }
                  typeParams.push(param);
                }

                propertyCodes.push(`${dataType.toLangType(property.type.toLowerCase(), 'groovy')}<${typeParams.join(", ")}> ${property.name};`);

              } else {
                propertyCodes.push(`${property.type.substring(property.type.lastIndexOf(".") + 1)} ${property.name};`);
              }
            }
          }
        } else if (item.type === "enum") {
          for (let property of item.properties) {
            propertyCodes.push('\n/**')
            propertyCodes.push(` * ${property.doc}`);
            propertyCodes.push(' */')
            propertyCodes.push(`${property.name},`);
          }
        }
        typeCodes.push(imports.join('\n'));
        if (item.doc) {
          typeCodes.push('/**');
          typeCodes.push(` * ${item.doc}`);
          typeCodes.push(' */');
        }
        if (item.type === "class") {
          typeCodes.push(`class ${item.name}{`);
        } else if (item.type === "enum") {
          typeCodes.push(`enum ${item.name}{`);
        }
        typeCodes.push(propertyCodes.join('\n'));
        typeCodes.push("}");
        // typeCodes.push("}");

        let directory: string = `${path}${item.package.replace(/\./g, '/')}/`.toLowerCase();
        let filePath: string = `${directory}${item.name}.groovy`;
        fileHelper.saveFile(filePath, typeCodes.join("\n"));
        log.info(`file had created: ${filePath}.`);
      }
    }
  }

  private getTypePackage(type: string): string {
    if (groovyTypeMap[type.toLowerCase()]) {
      return type;
    }

    return packagetool.getPackageParam(type, this.typeFilesMap[type.toLowerCase()]);
  }
}
