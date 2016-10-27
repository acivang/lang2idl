
import * as fileStream from 'fs';
import * as dataType from './utils/type';


export function convert(path: string): void {

  if (!fileStream.existsSync(path)) {
    throw new Error(`no such file or directory, open '${path}'`);
  }

  let code: any = fileStream.readFileSync(path).toString();
  if (!code) {
    throw new Error(`nothing is in the file of '${path}'`);
  }
  try {
    code = JSON.parse(code);
  }
  catch (error) {
    throw error;
  }

  let interfaces: any = code.interfaces;
  let types: any = code.types;

  for (let i: number = 0; i < interfaces.length; i++) {
    let item: any = interfaces[i];
    let references: Array<string> = new Array();
    let referencesDic: { [key: string]: boolean } = {};
    let methods: Array<string> = new Array();
    let interfaceCodes: Array<string> = new Array();
    interfaceCodes.push(`namespace ${item.package}{`);
    if (item.doc) {
      interfaceCodes.push(`//${item.doc}`);
    }
    interfaceCodes.push(`interface ${item.name}{`);
    let methodCode: Array<string> = new Array();
    for (let j: number = 0; j < item.methods.length; j++) {
      let method = item.methods[j];
      let doc: Array<string> = new Array();
      let args: Array<string> = new Array();
      doc.push(`//${method.doc}`);
      let namespaceName: string = "";
      for (let l: number = 0; l < method.args.length; l++) {
        let arg: any = method.args[l];
        doc.push(`//${arg.doc}`);
        if (arg.type.indexOf('.') < 0) {
          args.push(`${arg.name}: ${arg.type}`);
        } else {
          namespaceName = arg.type.substring(0, arg.type.lastIndexOf("."));
          if (!referencesDic[namespaceName]) {
            referencesDic[namespaceName] = true;
            references.push(`/// <reference path="${namespaceName}.ts" />`);
          }
          args.push(`${arg.name}: ${arg.type.substring(arg.type.lastIndexOf(".") + 1)}`);
        }
      }
      methodCode.push(doc.join("\n"));
      if (method.return.type.type.indexOf(".") < 0) {
        methodCode.push(`${method.name}(${args.join(", ")}): Promise<${method.return.type.type}>`)
      } else {
        namespaceName = method.return.type.type.substring(0, method.return.type.type.lastIndexOf("."));
        if (!referencesDic[namespaceName]) {
          referencesDic[namespaceName] = true;
          references.push(`/// <reference path="${namespaceName}.ts" />`);
        }
        let typeParams: Array<string> = new Array();
        if (method.return.type.typeParams) {
          for (let m: number = 0; m < method.return.type.typeParams.length; m++) {
            let typeParam: any = method.return.type.typeParams[m];
            if (typeParam.indexOf(".") > -1) {
              namespaceName = typeParam.substring(0, typeParam.lastIndexOf("."));
              typeParam = typeParam.substring(typeParam.lastIndexOf(".") + 1);
              if (!referencesDic[namespaceName]) {
                referencesDic[namespaceName] = true;
                references.push(`/// <reference path="${namespaceName}.ts" />`);
              }
            }
            typeParams.push(typeParam);
          }

          methodCode.push(`${method.name}(${args.join(", ")}): Promise<${method.return.type.type.substring(method.return.type.type.lastIndexOf(".") + 1)}<${typeParams.join(", ")}>>`);
        } else {

          methodCode.push(`${method.name}(${args.join(", ")}): Promise<${method.return.type.type.substring(method.return.type.type.lastIndexOf(".") + 1)}>`);
        }
      }
    }
    interfaceCodes.push(references.join("\n"));
    interfaceCodes.push(methodCode.join(";\n"));
    interfaceCodes.push("}");
    interfaceCodes.push("}");
    console.log(interfaceCodes.join("\n"));
    path = path.substring(0, path.lastIndexOf('/')+1);
    fileStream.writeFileSync(path + 'result.ts', interfaceCodes.join("\n"));
  }

  for (let i: number = 0; i < types.length; i++) {
    let item: any = types[i];
    if (item.package) {
      let typeCodes: Array<string> = new Array();
      typeCodes.push(`namespace ${item.package}{`);
      if (item.doc) {
        typeCodes.push(`//${item.doc}`);
      }
      typeCodes.push(`class ${item.name}{`);
      for (let property of item.properties) {
        typeCodes.push(`//${property.doc}`);
        typeCodes.push(`public ${property.name}: ${property.type};`);
        typeCodes.push("\n");
      }
      typeCodes.push("}");
      typeCodes.push("}");

      console.log(typeCodes.join("\n"));
    }
  }

}