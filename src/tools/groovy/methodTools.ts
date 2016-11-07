
import * as struct from '../../utils/struct';
import { Ducoment } from './docTools';
import * as utils from './utils';
import * as typeTools from './typeTools';
import { MissingMethodError, MissingCommentError, CodeFormatError } from '../../utils/error';


let doc = new Ducoment();

//groovy类型字典
// let groovyTypeMap: { [type: string]: boolean } = {
//   ['double']: true,
//   ['flout']: true,
//   ['String']: true,
//   ['byte']: true,
//   ['short']: true,
//   ['int']: true,
//   ['char']: true,
//   ['Boolean']: true,
//   ['Map']: true,
//   ['List']: true,
//   ['void']: true,
//   ['Object']: true
// };


export let getMethods = (code: string): any => {
  let methods: any = [];

  let methodCode = code.substring(code.indexOf("{"));
  if (!methodCode) {
    throw new MissingMethodError(`${utils.getObjectName(code)}.groovy/.java`);
  }

  let methodBlocks = methodCode.split(';');

  for (let block of methodBlocks) {
    let method = getMethod(block, code);
    methods.push(method);
  }

  return methods;
}

let getMethod = (methodCode: string, code: string) => {

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

  let typeWithTypeParams = typeTools.getType(method.return.type, code);
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
  method.doc = doc.getObjectDoc(methodCode);

  let docReturn = methodCode.match(/\@return((\s*?.*?)*?)\n/);
  if (docReturn) {
    method.return.doc = docReturn[0].replace(/@return |\n/g, '');
  }
  let argsDoces = doc.getMethodArgsDoc(methodCode);
  let argsTmp = methodCode.match(/\(((\s*?.*?)*?)\)/g)[0].replace(/\(|\)/g, '');
  if (argsTmp.length > 0) {
    let args = argsTmp.split(',');
    if (args.length !== argsDoces.length) {
      throw new MissingCommentError(`Missing comments on method of ${method.name}`);
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
      let argType = typeTools.getType(paramType, code);
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