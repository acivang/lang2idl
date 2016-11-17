import * as osPath from 'path';
import * as struct from '../../utils/struct';
import * as utils from './utils';
import * as dataType from '../../utils/type';
import { log } from '../../utils/log';
import { Ducoment as Doc } from './docTool';
import { FileHelper } from '../../utils/files';
import { getMethods } from './methodTool';
import { getMetaes } from './metaTool';
import { MissingCommentError, CodeFormatError } from '../../utils/error';

let interfaceName: string;
let doc = new Doc();
let fileHelper = new FileHelper();


export class InterfaceTool {
  typeFilesMap: { [key: string]: string };

  getInterface = (code: string) => {
    let itemInterface = struct.interfaceStruct();
    let dicTypes = [''];

    itemInterface.package = utils.getPackage(code);

    itemInterface.name = interfaceName = utils.getObjectName(code);

    itemInterface.doc = doc.getObjectDoc(code);

    itemInterface.meta = getMetaes(code, 'interface', this.typeFilesMap);

    itemInterface.methods = getMethods(code, this.typeFilesMap);

    return itemInterface;
  }

  getInterfaces = (interfaces: any, path: string) => {

    for (let item of interfaces) {
      let imports: Array<string> = new Array();
      let importsMap: { [key: string]: boolean } = {};
      let methods: Array<string> = new Array();
      let interfaceCodes: Array<string> = new Array();

      interfaceCodes.push(`package ${item.package.toLowerCase()}`);
      let methodCode: Array<string> = new Array();
      for (let method of item.methods) {
        let doc: Array<string> = new Array();
        let args: Array<string> = new Array();
        doc.push(`/**`);
        doc.push(` * ${method.doc}`);
        let namespaceName: string = "";
        for (let arg of method.args) {
          if (!arg.name) {
            break;
          }
          doc.push(` * @param ${arg.doc}`);
          if (arg.type.indexOf('.') < 0) {
            args.push(`${dataType.toLangType(arg.type, 'groovy')} ${arg.name}`);
          } else {
            namespaceName = arg.type.substring(0, arg.type.lastIndexOf(".")).toLowerCase();
            if (!importsMap[namespaceName]) {
              importsMap[namespaceName] = true;
              imports.push(`import ${namespaceName}.*;`);
            }
            args.push(` ${arg.type.substring(arg.type.lastIndexOf(".") + 1)} ${arg.name}`);
          }
        }
        if (method.return.doc) {
          doc.push(` * @return ${method.return.doc}`);
        }
        doc.push(` */`);

        let methodLine: string;
        if (method.return.type.indexOf(".") < 0) {
          methodLine = `${dataType.toLangType(method.return.type, 'groovy')} ${method.name}(${args.join(", ")});`;
        } else {
          namespaceName = method.return.type.substring(0, method.return.type.lastIndexOf(".")).toLowerCase();
          if (!importsMap[namespaceName]) {
            importsMap[namespaceName] = true;
            imports.push(`import ${namespaceName}.*;`);
          }
          let typeParams: Array<string> = new Array();
          if (method.return.typeParams) {
            for (let typeParam of method.return.typeParams) {
              if (typeParam.indexOf(".") > -1) {
                namespaceName = typeParam.substring(0, typeParam.lastIndexOf(".")).toLowerCase();
                typeParam = typeParam.substring(typeParam.lastIndexOf(".") + 1);
                if (!importsMap[namespaceName]) {
                  importsMap[namespaceName] = true;
                  imports.push(`import ${namespaceName}.*;`);
                }
              }
              typeParams.push(typeParam);
            }

            methodLine = `${method.return.type.substring(method.return.type.lastIndexOf(".") + 1)}<${typeParams.join(", ")}> ${method.name}(${args.join(", ")});`;
          } else {

            methodLine = `${method.return.type.substring(method.return.type.lastIndexOf(".") + 1)} ${method.name}(${args.join(", ")});`;
          }
        }
        methodCode.push(`${doc.join('\n')}\n${methodLine}`)
      }
      interfaceCodes.push(imports.join("\n"));
      if (item.doc) {
        interfaceCodes.push('/**')
        interfaceCodes.push(` * ${item.doc}`);
        interfaceCodes.push(' */')
      }
      interfaceCodes.push(`interface ${item.name}{`);
      interfaceCodes.push(methodCode.join(";\n\n"));
      interfaceCodes.push("}");
      let filePath: string = `${osPath.join(path, item.package.replace(/\./g, osPath.sep).toLowerCase(), item.name)}.groovy`;
      fileHelper.saveFile(filePath, interfaceCodes.join("\n"));
      log.info(`file had created: ${filePath}.`);
    }
  }
}