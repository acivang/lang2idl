import * as osPath from 'path';
import * as fileStream from 'fs';
import * as dataType from '../../utils/type';
import { log } from '../../utils/log';
import { FileHelper } from '../../utils/files';

let fileHelper = new FileHelper();

export let getInterfaces = (interfaces: any, path: string): any => {
  for (let item of interfaces) {
    let imports: Array<string> = new Array();
    let importsDic: { [key: string]: boolean } = {};
    let methods: Array<string> = new Array();
    let interfaceCodes: Array<string> = new Array();
    let mainImports: Array<string> = new Array();

    let methodCode: Array<string> = new Array();
    for (let method of item.methods) {
      let doc: Array<string> = new Array();
      let args: Array<string> = new Array();

      doc.push('\n/**')
      doc.push(` * ${method.doc}`);
      doc.push(' *')
      let importName: string = "";
      for (let arg of method.args) {
        if (!arg.name) {
          break;
        }
        doc.push(` * @param ${arg.doc}`);
        if (arg.type.indexOf('.') < 0) {
          let argType: string;
          let jsonArgType: string = arg.type.toLowerCase();
          switch (jsonArgType) {
            case "map":
            case "list":
              if (!arg.typeParams) {
                throw new Error("method return type error");
              }
              if (jsonArgType === "map" && arg.typeParams.length != 2) {
                throw new Error("method return type error");
              }
              for (let param of arg.typeParams) {
                if (param.indexOf(".") > -1) {
                  let importNamespace: string = param.substring(0, param.lastIndexOf("."));
                  importName = param.substring(param.lastIndexOf(".") + 1, param.length);
                  if (!importsDic[param] && item.package !== importNamespace && dataType.canImport(importName)) {
                    importsDic[param] = true;
                    imports.push(`import { ${importName} } from './${param.replace(item.package + '.', '').replace(/\./g, '/').toLowerCase()}';`);
                  }
                } else {
                  importName = dataType.toTsType(param);
                }
              }
              if (jsonArgType === "map") {
                argType = `{ [type: string]: ${importName} }`;
              } else {
                argType = `Array<${importName}>`;
              }
              break;
            default:
              argType = dataType.toTsType(arg.type);
          }
          args.push(`${arg.name}: ${argType}`);
        } else {
          importName = arg.type.substring(arg.type.lastIndexOf(".") + 1);
          if (!importsDic[arg.type] && item.package !== arg.type.substring(0, arg.type.lastIndexOf('.'))) {
            importsDic[arg.type] = true;
            imports.push(`import { ${importName} } from './${arg.type.replace(item.package + '.', '').replace(/\./g, '/').toLowerCase()}';`);
          }
          args.push(`${arg.name}: ${importName}`);
        }
      }

      doc.push(` * @return ${method.return.doc ? method.return.doc : 'void'}`);
      doc.push(' *');
      doc.push(' */');

      let methodLine: string;
      let returnType: string;
      if (method.return.type.indexOf(".") < 0) {
        let jsonReturnType: string = method.return.type.toLowerCase();
        switch (jsonReturnType) {
          case "map":
          case "list":
            if (!method.return.typeParams) {
              throw new Error("method return type error");
            }
            if (jsonReturnType === 'map' && method.return.typeParams.length != 2) {
              throw new Error("method return type error");
            }
            for (let param of method.return.typeParams) {
              if (param.indexOf(".") > -1) {
                let importNamespace: string = param.substring(0, param.lastIndexOf("."));
                importName = param.substring(param.lastIndexOf(".") + 1, param.length);
                if (!importsDic[param] && item.package !== importNamespace && dataType.canImport(importName)) {
                  importsDic[param] = true;
                  imports.push(`import { ${importName} } from './${param.replace(item.package + '.', '').replace(/\./g, '/').toLowerCase()}';`);
                }
              } else {
                importName = param;
              }
            }
            if (jsonReturnType === 'map') {
              returnType = `{ [type: string]: ${importName} }`;
            } else {
              returnType = `Array<${importName}>`;
            }
            break;
          default:
            returnType = dataType.toTsType(method.return.type);
        }
        methodLine = `${method.name}(${args.join(", ")}): Observable<${returnType}>`;
      } else {
        importName = method.return.type.substring(method.return.type.lastIndexOf(".") + 1);
        if (!importsDic[importName] && item.package !== importName && dataType.canImport(importName)) {
          importsDic[importName] = true;
          imports.push(`import { ${importName} } from './${method.return.type.replace(item.package + '.', '').replace(/\./g, '/').toLowerCase()}';`);
        }

        if (method.return.typeParams) {
          let typeParams: Array<string> = new Array();
          for (let m: number = 0; m < method.return.typeParams.length; m++) {
            let typeParam: any = method.return.typeParams[m];
            if (typeParam.indexOf(".") > -1) {
              importName = typeParam.substring(typeParam.lastIndexOf(".") + 1, typeParam.length);
              if (!importsDic[importName] && item.package !== typeParam.substring(0, typeParam.lastIndexOf('.')) && dataType.canImport(importName)) {
                importsDic[importName] = true;
                imports.push(`import { ${importName} } from './${typeParam.replace(/\./g, '/')}';`);
              }
            }
            typeParams.push(typeParam);
          }

          methodLine = `${method.name}(${args.join(", ")}): Observable<${method.return.type.substring(method.return.type.lastIndexOf(".") + 1)}<${typeParams.join(", ")}>>`;
        } else {

          methodLine = `${method.name}(${args.join(", ")}): Observable<${method.return.type.substring(method.return.type.lastIndexOf(".") + 1)}>`;
        }
      }
      methodCode.push(`${doc.join('\n')}\n${methodLine}`)
    }
    imports.push("import {Observable} from 'rxjs/Observable';");// for Observable
    interfaceCodes.push(imports.join("\n"));
    mainImports.push(`export * from './${item.package.replace(/\./g, osPath.sep)}/${item.name.toLowerCase()}';`);
    // interfaceCodes.push(`\nnamespace ${item.package}{\n`);
    if (item.doc) {
      interfaceCodes.push('/**');
      interfaceCodes.push(` * ${item.doc}`);
      interfaceCodes.push('*/');
    }
    interfaceCodes.push(`export interface ${item.name}{`);
    interfaceCodes.push(methodCode.join(";\n\n"));
    interfaceCodes.push("}");
    // interfaceCodes.push("}");
    let directory: string  = osPath.join(path, item.package.replace(/\./g, osPath.sep));
    let filePath: string = osPath.join(directory,`${item.name.toLowerCase()}.ts`);
    fileHelper.saveFile(filePath, interfaceCodes.join("\n"));

    let json = `export let ${item.name.toLowerCase()}Json = ${JSON.stringify(interfaces)};`;
    filePath = osPath.join(directory, `${item.name.toLowerCase()}Json.ts`);
    fileStream.writeFileSync(filePath, json);
    mainImports.push(`export * from './${item.package.replace(/\./g, osPath.sep)}/${item.name.toLowerCase()}Json';`);

    log.info(`file had created: ${filePath}`);
    
    return mainImports.join('\n');
  }
}
