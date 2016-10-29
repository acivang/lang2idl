import * as fileStream from 'fs';

import * as dataType from './utils/type';
import * as struct from './utils/struct';
import { Tools }from './utils/tools';

const rpcPackage: string = 'org.nofdev.rpc.';

export function convert(path: string): void {
  let isDir: boolean = false;
  let tools = new Tools();
  let idl = struct.idlStruct();
  let fils: string[] = tools.getAllFiles(path);

  for (let file of fils) {

    if (file.lastIndexOf('.groovy') < 0) {
      continue;
    }
    let code = fileStream.readFileSync(file).toString();
    if (file.lastIndexOf('Facade.groovy') > -1) {

      let itemInterface = getInterface(code);
      idl.interfaces.push(itemInterface);

    } else if (file.lastIndexOf('.groovy') > -1) {

      let itemType = getType(code);
      idl.types.push(itemType);

    }
  }

  if (idl.types.length === 0) {
    idl.types.push({});
  }
  let jsonIdl: any = JSON.stringify(idl);
  fileStream.writeFile(path + `idl.json`, jsonIdl);

  console.log(`json idl file had created at ${ path }`);

  jsonIdl = `export let jsonIdl = ${jsonIdl}`;
  fileStream.writeFile(path + `idl.ts`, jsonIdl);
  console.log(`idl typescript file file had created at ${ path }`);
}

function getInterface(code: string): any {

  let itemInterface = struct.interfaceStruct();
  let dicTypes = [''];

  itemInterface.package = code.match(/package((\s*?.*?)*?)\n/)[0].replace(/package |\n/g, '');
  itemInterface.name = code.match(/interface((\s*?.*?)*?)Facade/)[0].replace('interface ', '');
  let interfaceDoc = code.match(/\/\*\*((\s*?.*?)*?)interface/);
  if (interfaceDoc && interfaceDoc.length > 2) {
    itemInterface.doc = interfaceDoc[1].substring(0, interfaceDoc[1].indexOf('*/')).replace(/\*|\n|\/| |/g, '');
  } else {
    throw new Error(`no comment for the interface: ${itemInterface.name}`);
  }

  let metaes = code.match(/\*\/((\s*?.*?)*?)interface/);
  if (metaes) {
    metaes = metaes[0].match(/@((\s*?.*?)*?)\n/g);
  }
  for (let i in metaes) {
    itemInterface.meta.push({
      type: rpcPackage + metaes[i].replace(/\n|@/g, ''),
      args: {}
    });
  }

  let methodCode = code.match(/\{((\s*?.*?)*?)\}/g);
  if (!methodCode) {
    throw new Error(`no methods for the interface: ${itemInterface.name}`);
  }
  let methods = methodCode[0].match(/\/\*\*((\s*?.*?)*?)\)/g);
  for (let i in methods) {
    let method = getMethod(methods[i], itemInterface.package, code);
    itemInterface.methods.push(method);
  }

  if (itemInterface.meta.length === 0) {
    itemInterface.meta.push({});
  }

  return itemInterface;
}

function getMethod(methodCode: string, packageName: string, code: string): any {
  let method = struct.methodStruct();

  let methodName = methodCode.match(/[a-zA-Z](w?.)*\(/);
  if (!methodName) {
    throw new Error(`code format error: ${methodCode}`);
  }
  if (methodName[0].indexOf('<') > -1) {
    method.name = methodName[0].match(/(>[ ]|>)(w?.)*\(/)[0].replace(/> |>|\(/g, '');
  }
  else {
    method.name = methodName[0].match(/[ ](w?.)*\(/)[0].replace(/ |\(/g, '');
  }
  method.return.type = methodName[0].match(/[a-zA-Z](w?.)* /)[0].replace(' ', '');
  let typeWithTypeParams = getTypeParam(method.return.type, code, packageName);
  if (typeWithTypeParams.typeParams) {
    method.return.type = typeWithTypeParams.type;
    method.return.typeParams = typeWithTypeParams.typeParams;
  } else {
    method.return.type = typeWithTypeParams.type;
  }

  let doces = methodCode.match(/\*((\s*?.*?)*?)\n/g)
  if (!doces) {
    throw new Error(`no document for the method: ${method.name}`);
  }
  method.doc = doces[1].replace(/\* |\n/g, '');

  let docReturn = methodCode.match(/\@return((\s*?.*?)*?)\n/);
  if (docReturn) {
    method.return.doc = docReturn[0].replace(/@return |\n/g, '');
  }
  let argsDoc = methodCode.match(/\@param((\s*?.*?)*?)\n/g);
  let args = methodCode.match(/\(((\s*?.*?)*?)\)/g)[0].replace(/\(|\)/g, '').split(',');

  for (let i in args) {
    let methodArg: any = {
      name: '',
      type: '',
      doc: ''
    }
    let tmp = args[i].split(' ');
    let paramType = tmp[0];
    if (args[i].indexOf(' ') === 0) {
      paramType = tmp[1];
    }
    if (paramType.length === 0) {
      paramType = tmp[1];
    }
    let argType = getTypeParam(paramType, code, packageName);
    if (argType.type !== "undefined") {
      methodArg.type = argType.type;
      if (argType.typeParams) {
        methodArg.typeParams = argType.typeParams;
      }
      methodArg.name = tmp[1];
      if (args[i].indexOf(' ') === 0) {
        methodArg.name = tmp[2];
      }
      methodArg.doc = argsDoc[i].replace(/@param |\n/g, '');
      method.args.push(methodArg);
    }
  }
  if (method.args.length === 0) {
    method.args.push({});
  }
  if (method.throws.length === 0) {
    method.throws.push({});
  }
  return method;
}


function getType(code: string): any {

  let itemType = struct.typeStruct();
  if (/class ((\s*.)*)DTO/.test(code)) {
    itemType = getDTO(code);
  } else if (code.indexOf('enum ') > -1) {
    itemType = getEnum(code);
  }
  return itemType;
}

function getDTO(code: string): any {

  let itemType = struct.typeStruct();
  itemType.type = "class";
  itemType.package = code.match(/package((\s*?.*?)*?)\n/g)[0].replace(/package |\n/g, '');

  let typeDoc = code.match(/\/\*\*((\s*?.*?)*?)class/);
  if (typeDoc.length > 2) {
    itemType.doc = typeDoc[1].replace(/\*|\n|\/| /g, '');
  }
  itemType.name = code.match(/class((\s*?.*?)*?)DTO/g)[0].replace('class ', '');

  let propertiesTmp = code.match(/\{((\s*?.*?)*?)\}/)[0];
  let properties = propertiesTmp.match(/(    |  )[a-zA-Z]((\s*?.*?)*?)\n/g);
  let propertyDoc = propertiesTmp.match(/\/\*\*((\s*?.*?)*?)\//g);
  if (!properties) {
    throw new Error(`no properties for: ${itemType.name}`);
  }
  if (!propertyDoc) {
    throw new Error(`no property's comment for: ${itemType.name}`);
  }
  if (properties.length != propertyDoc.length) {
    throw new Error(`lost some properties comment: ${itemType.name}`);
  }
  for (let i in properties) {
    let property = {};
    let tmp = properties[i].replace(/    /, '').replace(/\n/, '').split(' ');

    let typeParam = getTypeParam(tmp[0], code);

    property = {
      name: tmp[1],
      type: typeParam.type,
      typeParams: typeParam.typeParams,
      doc: propertyDoc[i].match(/\* ((\s*?.*?)*?)\n/g)[0].replace(/\* |\n/g, '')
    };
    itemType.properties.push(property);
  }

  return itemType;
}

function getEnum(code: string): any {

  let itemType = struct.typeStruct();

  itemType.type = "enum";

  itemType.package = code.match(/package((\s*?.*?)*?)\n/g)[0].replace(/package |\n/g, '');

  let typeDoc = code.match(/\/\*\*((\s*?.*?)*?)enum/);
  if (typeDoc.length > 2) {
    itemType.doc = typeDoc[1].replace(/\*|\n|\/| /g, '');
  }
  itemType.name = code.match(/enum((\s*?.*?)*?){/)[0].replace(/enum|{| /g, '');

  let propertiesTmp = code.match(/\{((\s*?.*?)*?)\}/)[0];
  let properties = propertiesTmp.match(/(    |  )[a-zA-Z]((\s*?.*?)*?)\n/g);
  let propertyDoc = propertiesTmp.match(/\/\*\*((\s*?.*?)*?)\//g);
  if (!properties) {
    throw new Error(`no properties for: ${itemType.name}`);
  }
  if (!propertyDoc) {
    throw new Error(`no property's comment for: ${itemType.name}`);
  }
  if (properties.length != propertyDoc.length) {
    throw new Error(`lost some properties comment: ${itemType.name}`);
  }
  for (let i in properties) {
    let property = {
      name: properties[i].replace(/ |,|\n/g, ''),
      doc: propertyDoc[i].match(/\* ((\s*?.*?)*?)\n/g)[0].replace(/\* |\n/g, '')
    }
    itemType.properties.push(property);
  }

  return itemType;
}

function getTypeParam(typeCode: string, code: string, packageName?: string): any {
  let propType = dataType.toIdlType(typeCode);
  let propTypeParams = [""];
  propTypeParams.pop();
  if (!propType) {//无类型或非数据类型，非数据类型需要处理
    if (typeCode.indexOf('<') > -1) {
      let typeTmp = typeCode.split('<');
      propType = typeTmp[0];
      typeTmp[1] = typeTmp[1].replace(/\>| /g, '');
      if (typeTmp[1].indexOf(',') > -1) {
        let tmpPropTypeParams = typeTmp[1].split(',');
        propTypeParams.push(getTypeWithPackage(tmpPropTypeParams[0], code, packageName));
        propTypeParams.push(getTypeWithPackage(tmpPropTypeParams[1], code, packageName));
      }
      else {
        propTypeParams.push(getTypeWithPackage(typeTmp[1], code, packageName));
      }
    } else {
      propType = typeCode;
    }

    propType = getTypeWithPackage(propType, code, packageName);

  }
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

function getTypeWithPackage(type: string, code: string, packageName: string): string {

  let packageReg = new RegExp(`import ((\\w\\.?)*?)${type}`);
  let thisPackage = code.match(packageReg);
  if (thisPackage) {
    return thisPackage[0].split(' ')[1];
  }

  return `${packageName}.` + type;
}