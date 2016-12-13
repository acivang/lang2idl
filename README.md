"use strict";
const struct = require('../../utils/struct');
const docTool_1 = require('./docTool');
const utils = require('./utils');
const TypeTool_1 = require('./typeTool');
const error_1 = require('../../utils/error');
let doc = new docTool_1.Ducoment();
let typetool = new TypeTool_1.TypeTool();
exports.getMethods = (code, typeFilesMap) => {
    let methods = [];
    typetool.typeFilesMap = typeFilesMap;
    let methodCode = code.substring(code.indexOf("{"));
    if (!methodCode) {
        throw new error_1.MissingMethodError(`${utils.getObjectName(code)}.groovy/.java`);
    }
    methodCode = methodCode.replace(/({|})\n\n|\n}|\n\n}/g, '');
    let methodBlocks = methodCode.split('\n\n'); //methodCode.split(';');
    for (let block of methodBlocks) {
        let method = getMethod(block);
        methods.push(method);
    }
    return methods;
};
let getMethod = (methodCode) => {
    let method = struct.methodStruct();
    let methodName = methodCode.match(/[a-zA-Z](w?.)*\(/);
    if (!methodName) {
        throw new error_1.CodeFormatError(`can't get method name from ${methodCode}`);
    }
    if (methodName[0].indexOf('<') > -1) {
        method.name = methodName[0].match(/(>[ ]|>)(w?.)*\(/)[0].replace(/> |>|\(/g, '');
    } else {
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
        throw new error_1.MissingCommentError(`${method.name}`);
    }
    let argsDoces = doc.getMethodArgsDoc(methodCode);
    let argsTmp = methodCode.match(/\(((\s*?.*?)*?)\)/g)[0].replace(/\(|\)/g, '');
    if (argsTmp.length > 0) {
        let args = argsTmp.split(',');
        if (args.length !== argsDoces.length) {
            throw new error_1.MissingCommentError(`${method.name}`);
        }
        for (let i in args) {
            let methodArg = {
                name: '',
                type: '',
                doc: ''
            };
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
};
//# sourceMappingURL=methodTool.js.map

      The comments that not start with '@' is method's comments.
      Start with '@author' is the author of code block.
      Start with '@param' are args comments.
      Start with '@return' is the method return result comments.


4. ### About import

      <del>If import other package, must not use '\*' in import code line, because the converter need match the custom type's package, use '\*' can't match it nicety. </del>


5. ### About property(groovy)

      <del>Property code must end with ';' for split property code block in groovy.</del>
