import * as fileStream  from 'fs';

import * as type from './utile/type';

let rpcPackage: string = 'org.nofdev.rpc.';

export function convert(path: string): void {
  var isDir: boolean = false;
  if (path.lastIndexOf('.groovy') < 0 || path.lastIndexOf('*.groovy') > 0) {
    isDir = true;
  }
  if (!fileStream.existsSync(path)) {
    throw new Error(`no such file or directory, open '${path}'`);
  }
  var filesPath: string[];
  if (isDir) {
    filesPath = fileStream.readdirSync(path);
  } else {
    filesPath = [path];
  }
  var idl = { meta: {}, interfaces: [{}], types: [{}] };
  idl.interfaces.pop();
  idl.types.pop();
  for (var index in filesPath) {
    var file = filesPath[index];
    if (file.lastIndexOf('DTO.groovy') < 0 && file.lastIndexOf('Facade.groovy') < 0) {
      continue;
    }
    var code = fileStream.readFileSync(path + file).toString();
    if (file.lastIndexOf('Facade.groovy') > -1) {

      var itemInterface = getInterface(code);
      idl.interfaces.push(itemInterface);

    } else if (file.lastIndexOf('DTO.groovy') > -1) {

      var itemType = getType(code);
      idl.types.push(itemType);
    }

  }
  console.log(JSON.stringify(idl));
}

function getInterface(code: string): any {

  var itemInterface = {
    package: '',
    name: '',
    doc: '',
    meta: [{
      type: '',
      args: {}
    }],
    methods: [{}]
  };
  itemInterface.meta.pop();
  itemInterface.methods.pop();
  var itemMethod = {
    name: '',
    doc: '',
    throws: [{}],
    return: {},
    args: [{}]
  };
  itemMethod.throws.pop();
  itemMethod.args.pop();
  var dicTypes = [''];

  itemInterface.package = code.match(/package((\s*?.*?)*?)\n/)[0].replace(/package |\n/g, '');
  itemInterface.name = code.match(/interface((\s*?.*?)*?)Facade/)[0].replace('interface ', '');
  var interfaceDoc = code.match(/\/\*\*((\s*?.*?)*?)interface/);
  if (interfaceDoc && interfaceDoc.length > 2) {
    itemInterface.doc = interfaceDoc[1].substring(0, interfaceDoc[1].indexOf('*/')).replace(/\*|\n|\/| |/g, '');
  } else {
    throw new Error(`no comment for the interface: ${itemInterface.name}`);
  }

  var metaes = code.match(/\*\/((\s*?.*?)*?)interface/);
  if (metaes) {
    metaes = metaes[0].match(/@((\s*?.*?)*?)\n/g);
  }
  for (var i in metaes) {
    itemInterface.meta.push({
      type: rpcPackage + metaes[i].replace(/\n|@/g, ''),
      args: {}
    });
  }

  var methodCode = code.match(/\{((\s*?.*?)*?)\}/g);
  if (!methodCode) {
    throw new Error(`no methods for the interface: ${itemInterface.name}`);
  }
  var methods = methodCode[0].match(/\/\*\*((\s*?.*?)*?)\)/g);
  for (var i in methods) {
    var method = getMethod(methods[i], itemInterface.package);
    itemInterface.methods.push(method);
  }

  return itemInterface;
}

function getMethod(code: string, packageName: string): any {
  var method = {
    name: '',
    doc: '',
    throws: [{}],
    return: {
      type: '',
      doc: ''
    },
    args: [{}]
  }

  method.args.pop();

  var methodName = code.match(/[a-zA-Z](w?.)*\(/);
  if (!methodName) {
    throw new Error(`code format error: ${code}`);
  }
  method.name = methodName[0].match(/[ ](w?.)*\(/)[0].replace(/ |\(/g, '');
  method.return.type = methodName[0].match(/[a-zA-Z](w?.)* /)[0].replace(' ', '');
  method.return.type = getTypeParam(method.return.type, code, packageName);

  var doces = code.match(/\*((\s*?.*?)*?)\n/g)
  if (!doces) {
    throw new Error(`no document for the method: ${method.name}`);
  }
  method.doc = doces[1].replace(/\* |\n/g, '');

  var docReturn = code.match(/\@return((\s*?.*?)*?)\n/);
  method.return.doc = docReturn[0].replace(/@return |\n/g, '');

  var argsDoc = code.match(/\@param((\s*?.*?)*?)\n/g);
  var args = code.match(/\(((\s*?.*?)*?)\)/g)[0].replace(/\(|\)/g, '').split(',');

  for (var i in args) {
    var methodArg: any = {
      name: '',
      type: '',
      doc: ''
    }
    var tmp = args[i].split(' ');
    var paramType = tmp[0];
    if (paramType.length === 0) {
      paramType = tmp[1];
    }
    var argType = getTypeParam(paramType, code);
    methodArg.type = argType.type;
    if (argType.typeParams) {
      methodArg.typeParams = argType.typeParams;
    }
    methodArg.name = tmp[1];
    methodArg.doc = argsDoc[i].replace(/@param |\n/g, '');
    method.args.push(methodArg);
  }

  return method;
}


function getType(code: string): any {

  var itemType = {
    package: '',
    name: '',
    doc: '',
    meta: {},
    properties: [{}]
  };
  itemType.properties.pop();

  itemType.package = code.match(/package((\s*?.*?)*?)\n/g)[0].replace(/package |\n/g, '');
  var typeDoc = code.match(/\/\*\*((\s*?.*?)*?)class/);
  if (typeDoc.length > 2) {
    itemType.doc = typeDoc[1].replace(/\*|\n|\/| /g, '');
  }
  itemType.name = code.match(/class((\s*?.*?)*?)DTO/g)[0].replace('class ', '');

  var propertiesTmp = code.match(/\{((\s*?.*?)*?)\}/)[0];
  var properties = propertiesTmp.match(/[a-zA-Z]((\s*?.*?)*?)\n/g);
  var propertyDoc = propertiesTmp.match(/\/\*\*((\s*?.*?)*?)\//g);
  if (!properties) {
    throw new Error(`no properties for: ${itemType.name}`);
  }
  if (!propertyDoc) {
    throw new Error(`no property's comment for: ${itemType.name}`);
  }
  if (properties.length != propertyDoc.length) {
    throw new Error(`lost some properties comment: ${itemType.name}`);
  }
  for (var i in properties) {
    var property = {};
    var tmp = properties[i].replace('\n', '').split(' ');

    var typeParam = getTypeParam(tmp[0], code);

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

function getTypeParam(typeCode: string, code: string, packageName?: string): any {
  var propType = type.toIdlType(typeCode);
  var propTypeParams = [""];
  propTypeParams.pop();
  if (!propType) {//无类型或非数据类型，非数据类型需要处理
    if (typeCode.indexOf('<') > -1) {
      var typeTmp = typeCode.split('<');
      propType = typeTmp[0];
      typeTmp[1] = typeTmp[1].replace(/\>| /g, '');
      if (typeTmp[1].indexOf(',') > -1) {
        var tmpPropTypeParams = typeTmp[1].split(',');
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

  var packageReg = new RegExp(`import ((\s*?.*?)*?)${type}`);
  var thisPackage = code.match(packageReg);
  if (thisPackage) {
    return thisPackage[0].split(' ')[1];
  }

  return `${packageName}.` + type;
}