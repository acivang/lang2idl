
import * as struct from '../../utils/struct';
import { Ducoment as Doc } from './docTool';
import * as utils from './utils';
import {typeTool} from './typeTool';
import { MissingMethodError, MissingCommentError, CodeFormatError } from '../../utils/error';


let doc = new Doc();
let typetool = new typeTool();

export let getMethods = (code: string, typeFilesMap: { [key: string]: string }): any => {
  let methods: any = [];
  typetool.typeFilesMap = typeFilesMap;
  let methodCode = code.substring(code.indexOf("{"));
  if (!methodCode) {
    throw new MissingMethodError(`${utils.getObjectName(code)}.groovy/.java`);
  }

  methodCode = methodCode.replace(/({|})\n\n|\n}|\n\n}/g, '');
  let methodBlocks = methodCode.split('\n\n');//methodCode.split(';');

  for (let block of methodBlocks) {
    let method = getMethod(block);
    methods.push(method);
  }

  return methods;
}

let getMethod = (methodCode: string) => {

  let method = struct.methodStruct();

  let methodName = methodCode.match(/[a-zA-Z](w?.)*\(/);
  if (!methodName) {
    throw new CodeFormatError(`can't get method name from ${methodCode}`);
  }
  if (methodName[0].indexOf('<') > -1) {
    method.name = methodName[0].match(/(>[ ]|>)(w?.)*\(/)[0].replace(/> |>|\(/g, '');
  }
  else {
    method.name = methodName[0].match(/[ ](w?.)*\(/)[0].replace(/ |\(/g, '');
  }

  method.return.type = methodName[0].match(/[a-zA-Z](w?.)* /)[0].replace(/ | /g, '');

  let typeWithTypeParams = typetool.getType(method.return.type);
  if (typeWithTypeParams.typeParams) {
    method.return.type = typeWithTypeParams.type;
    method.return.typeParams = typeWithTypeParams.typeParams;
  } else {
    method.return.type = typeWithTypeParams.type;
  }

  method.doc = doc.getObjectDoc(methodCode);
  method.return.doc = doc.getMethodReturnDoc(methodCode);
  if (!method.doc || !method.return.doc) {
    throw new MissingCommentError(`${method.name}`);
  }

  let argsDoces = doc.getMethodArgsDoc(methodCode);
  let argsTmp = methodCode.match(/\(((\s*?.*?)*?)\)/g)[0].replace(/\(|\)/g, '');
  if (argsTmp.length > 0) {
    let args = argsTmp.split(',');
    if (args.length !== argsDoces.length) {
      throw new MissingCommentError(`${method.name}`);
    }
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
      let argType = typetool.getType(paramType);
      if (argType.type !== "undefined") {
        methodArg.type = argType.type;
        if (argType.typeParams) {
          methodArg.typeParams = argType.typeParams;
        }
        methodArg.name = tmp[1];
        if (args[i].indexOf(' ') === 0) {
          methodArg.name = tmp[2];
        }
        methodArg.doc = argsDoces[i].replace(/@param |\n/g, '');
        method.args.push(methodArg);
      }
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