
import * as struct from '../../utils/struct';
import { Ducoment as Doc } from './docTool';
import * as utils from './utils';
import { TypeTool } from './typeTool';
import { MissingMethodError, MissingCommentError, CodeFormatError } from '../../utils/error';


let doc = new Doc();
let typetool = new TypeTool();
let className: string;

export let getMethods = (code: string, typeFilesMap: { [key: string]: string }): any => {
  let methods: any = [];
  this.className = utils.getObjectName(code);
  typetool.typeFilesMap = typeFilesMap;
  let methodCode = code.substring(code.indexOf("{"));
  if (!methodCode) {
    throw new MissingMethodError(`${utils.getObjectName(code)}.groovy/.java`);
  }

  methodCode = methodCode.replace(/({|})\r?\n|\r?\n}|\r?\n}/g, '');
  let methodBlocks = methodCode.split(/\)\;?\r?\n/);

  for (let block of methodBlocks) {
    if(!block){
      continue;
    }
    let method = getMethod(block+')');
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
  if (!method.doc || (method.return.type !== "void" && !method.return.doc)) {
    throw new MissingCommentError(`${method.name}`);
  }

  let argsDoces = doc.getMethodArgsDoc(methodCode);
  let argsTmp = methodCode.match(/\(((\s*?.*?)*?)\)/g)[0].replace(/\(|\)/g, '');
  if (argsTmp.length > 0) {
    let args = argsTmp.split(',');
    if (args.length !== argsDoces.length) {
      throw new MissingCommentError(`method of "${method.name}"'s args in class of ${this.className}`);
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
        let docTmp = argsDoces[i].replace(/@param |\r?\n/g, '').split('eg.');
        methodArg.doc = docTmp[0];
        if (docTmp.length === 2) {
          methodArg.eg = docTmp[1];
        }
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