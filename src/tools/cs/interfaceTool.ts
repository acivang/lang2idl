
import * as osPath from 'path';
import * as struct from '../../utils/struct';
import * as utils from './utils';
import * as dataType from '../../utils/type';
import { Ducoment as Doc } from './docTool';
import { log } from '../../utils/log';
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

    itemInterface.package = utils.getNamespace(code);

    itemInterface.name = interfaceName = utils.getObjectName(code);

    itemInterface.doc = doc.getObjectDoc(code);

    itemInterface.meta = getMetaes(code, 'public', this.typeFilesMap);

    itemInterface.methods = getMethods(code, this.typeFilesMap);

    return itemInterface;
  }



  getInterfaces = (interfaces: any, path: string) => {

    for (let item of interfaces) {
      let usings: Array<string> = new Array();
      let usingsMap: { [key: string]: boolean } = {};
      let methods: Array<string> = new Array();
      let interfaceCodes: Array<string> = new Array();

      usings.push('using System;');
      usingsMap[`${item.package}`] = true;

      let methodCode: Array<string> = new Array();
      for (let method of item.methods) {
        let doc: Array<string> = new Array();
        let args: Array<string> = new Array();
        doc.push(`/// <summary>`);
        doc.push(`/// ${method.doc}`);
        doc.push(`/// </summary>`);
        let namespaceName: string = "";
        let methodReturn: any = method.return;
        for (let arg of method.args) {
          if (!arg.name) {
            break;
          }
          doc.push(`/// <param name='${arg.name}'>${arg.doc.replace(arg.name, '')}</param>`);
          if (arg.type.indexOf('.') < 0) {
            if (arg.typeParams && arg.typeParams.length === 1) {
              if (arg.typeParams[0].indexOf('.') < 0) {
                args.push(`${dataType.toLangType(arg.type, 'cs')}<${arg.typeParams[0]}> ${arg.name}`);
              } else {
                namespaceName = arg.typeParams[0].substring(0, arg.typeParams[0].lastIndexOf(".")).toLowerCase();
                if (!usingsMap[namespaceName]) {
                  usingsMap[namespaceName] = true;
                  usings.push(`using ${namespaceName};`);
                }
                args.push(`${dataType.toLangType(arg.type, 'cs')}<${arg.typeParams[0].substring(arg.typeParams[0].lastIndexOf(".") + 1)}> ${arg.name}`);
              }
            } else {
              args.push(`${dataType.toLangType(arg.type, 'cs')} ${arg.name}`);
            }
          } else {
            namespaceName = arg.type.substring(0, arg.type.lastIndexOf(".")).toLowerCase();
            if (!usingsMap[namespaceName]) {
              usingsMap[namespaceName] = true;
              usings.push(`using ${namespaceName};`);
            }
            args.push(` ${arg.type.substring(arg.type.lastIndexOf(".") + 1)} ${arg.name}`);
          }
        }
        if (methodReturn.doc) {
          doc.push(`/// <returns> ${methodReturn.doc}</returns>`);
        }

        let methodLine: string;
        if (methodReturn.type.indexOf(".") < 0) {
          if (methodReturn.typeParams && methodReturn.typeParams.length === 1) {
            if (methodReturn.typeParams[0].indexOf('.') < 0) {
              methodLine = `${dataType.toLangType(methodReturn.type, 'cs')}<${methodReturn.typeParams[0]}> ${method.name}(${args.join(", ")});`;
            } else {
              namespaceName = methodReturn.typeParams[0].substring(0, methodReturn.typeParams[0].lastIndexOf(".")).toLowerCase();
              if (!usingsMap[namespaceName]) {
                usingsMap[namespaceName] = true;
                usings.push(`using ${namespaceName};`);
              }
              methodLine = `${dataType.toLangType(methodReturn.type, 'cs')}<${methodReturn.typeParams[0].substring(methodReturn.typeParams[0].lastIndexOf(".") + 1)}> ${method.name}(${args.join(", ")});`;
            }
          }
          else if (methodReturn.typeParams && methodReturn.typeParams.length === 2) {
            let returnTypeParamsA: any;
            let returnTypeParamsB: any;
            if (methodReturn.typeParams[0].indexOf('.') > -1){
              namespaceName = methodReturn.typeParams[0].substring(0, methodReturn.typeParams[0].lastIndexOf(".")).toLowerCase();
              if (!usingsMap[namespaceName]) {
                usingsMap[namespaceName] = true;
                usings.push(`using ${namespaceName};`);
              }
              returnTypeParamsA = methodReturn.typeParams[0].substring(methodReturn.typeParams[0].lastIndexOf(".") + 1);
            }else{
              returnTypeParamsA = methodReturn.typeParams[0];
            }
            if (methodReturn.typeParams[1].indexOf('.') > -1){
              namespaceName = methodReturn.typeParams[1].substring(0, methodReturn.typeParams[1].lastIndexOf(".")).toLowerCase();
              if (!usingsMap[namespaceName]) {
                usingsMap[namespaceName] = true;
                usings.push(`using ${namespaceName};`);
              }
              returnTypeParamsB = methodReturn.typeParams[1].substring(methodReturn.typeParams[1].lastIndexOf(".") + 1);
            }else{
              returnTypeParamsB = methodReturn.typeParams[1];
            }
              methodLine = `${dataType.toLangType(methodReturn.type, 'cs')}<${returnTypeParamsA}, ${returnTypeParamsB}> ${method.name}(${args.join(", ")});`;
          }
          else {
            methodLine = `${dataType.toLangType(methodReturn.type, 'cs')} ${method.name}(${args.join(", ")});`;
          }
        } else {
          namespaceName = methodReturn.type.substring(0, methodReturn.type.lastIndexOf(".")).toLowerCase();
          if (!usingsMap[namespaceName]) {
            usingsMap[namespaceName] = true;
            usings.push(`using ${namespaceName};`);
          }
          let typeParams: Array<string> = new Array();
          if (methodReturn.typeParams) {
            if (methodReturn.type.toLowerCase() === 'list' || methodReturn.type.toLowerCase() === 'dictionary') {
              usings.push('System.Collections.Generic;');
            }
            for (let typeParam of methodReturn.typeParams) {
              if (typeParam.indexOf(".") > -1) {
                namespaceName = typeParam.substring(0, typeParam.lastIndexOf(".")).toLowerCase();
                typeParam = typeParam.substring(typeParam.lastIndexOf(".") + 1);
                if (!usingsMap[namespaceName]) {
                  usingsMap[namespaceName] = true;
                  usings.push(`using ${namespaceName};`);
                }
              }
              typeParams.push(typeParam);
            }

            methodLine = `${methodReturn.type.substring(methodReturn.type.lastIndexOf(".") + 1)}<${typeParams.join(", ")}> ${method.name}(${args.join(", ")});`;
          } else {

            methodLine = `${methodReturn.type.substring(methodReturn.type.lastIndexOf(".") + 1)} ${method.name}(${args.join(", ")});`;
          }
        }
        methodCode.push(`${doc.join('\n')}\n${methodLine}`)
      }
      interfaceCodes.push(usings.join("\n"));
      interfaceCodes.push(`\nnamespace ${item.package.toLowerCase()} {`);
      if (item.doc) {
        interfaceCodes.push('/// <summary>')
        interfaceCodes.push(`/// ${item.doc}`);
        interfaceCodes.push('/// </summary>')
      }
      interfaceCodes.push(`interface ${item.name}{`);
      interfaceCodes.push(methodCode.join("\n\n"));
      interfaceCodes.push(" }");
      interfaceCodes.push("}");
      let filePath: string = `${osPath.join(path, item.package.replace(/\./g, osPath.sep).toLowerCase(), item.name)}.cs`;
      fileHelper.saveFile(filePath, interfaceCodes.join("\n"));
      log.info(`file had created: ${filePath}.`);
    }
  }
}