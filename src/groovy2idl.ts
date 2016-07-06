import * as fileStream  from 'fs';

let rpcPackage: string = 'org.nofdev.rpc.';

export function convert(path: string) {
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
    var method = getMethod(methods[i]);
    itemInterface.methods.push(method);
  }

  return itemInterface;
}

function getMethod(code: string): any {
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
    var methodArg = {
      name: '',
      type: '',
      doc: ''
    }
    var tmp = args[i].split(' ');
    methodArg.type = tmp[0];
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
    var tmp = properties[i].replace('\n', '').split(' ');
    var property = {
      name: tmp[1],
      type: tmp[0],
      doc: propertyDoc[i].match(/\* ((\s*?.*?)*?)\n/g)[0].replace(/\* |\n/g, '')
    };
    itemType.properties.push(property);
  }

  return itemType;
}