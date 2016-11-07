
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

  path = path.substring(0, path.lastIndexOf('/') + 1);
  let interfaces: any = code.interfaces;
  let types: any = code.types;

  for (let i: number = 0; i < interfaces.length; i++) {
    let item: any = interfaces[i];
    let imports: Array<string> = new Array();
    let importsDic: { [key: string]: boolean } = {};
    let methods: Array<string> = new Array();
    let interfaceCodes: Array<string> = new Array();
    interfaceCodes.push(`namespace ${item.package}{\n`);
    if (item.doc) {
      interfaceCodes.push('/**\n');
      interfaceCodes.push(` * ${item.doc}`);
      interfaceCodes.push('*/\n');
    }
    interfaceCodes.push(`interface ${item.name}{`);
    let methodCode: Array<string> = new Array();
    for (let j: number = 0; j < item.methods.length; j++) {
      let method = item.methods[j];
      let doc: Array<string> = new Array();
      let args: Array<string> = new Array();

      doc.push('/**')
      doc.push(` * ${method.doc}`);
      doc.push(' *')
      let importName: string = "";
      for (let l: number = 0; l < method.args.length; l++) {
        let arg: any = method.args[l];
        if (!arg.name) {
          break;
        }
        doc.push(` * @param ${arg.doc}`);
        if (arg.type.indexOf('.') < 0) {
          let argType: string;
          switch (arg.type.toLowerCase()) {
            case "map":
              if (!arg.typeParams || arg.typeParams.length != 2) {
                throw new Error("method return type error");
              }
              for (let param of arg.typeParams) {
                if (param.indexOf(".") > -1) {
                  let importNamespace: string = param.substring(0, param.lastIndexOf("."));
                  importName = param.substring(param.lastIndexOf(".") + 1, param.length);
                  if (!importsDic[param] && item.package !== importNamespace && dataType.canImport(importName)) {
                    importsDic[param] = true;
                    imports.push(`import * as ${importName} from './${param.replace(/./g, '/')}';`);
                  }
                } else {
                  importName = dataType.toTsType(param);
                }
              }
              argType = `{ [type: string]: ${importName} }`;
              break;
            case "list":
              if (!arg.typeParams || arg.typeParams.length != 1) {
                throw new Error("method return type error");
              }
              let param = arg.typeParams[0];
              if (param.indexOf(".") > -1) {
                let importNamespace: string = param.substring(0, param.lastIndexOf("."));
                importName = param.substring(param.lastIndexOf(".") + 1, param.length);
                if (!importsDic[param] && item.package !== importNamespace && dataType.canImport(importName)) {
                  importsDic[param] = true;
                  imports.push(`import * as ${importName} from './${param.replace(/./g, '/')}';`);
                }
              } else {
                importName = dataType.toTsType(param);
              }
              argType = `Array<${importName}>`;
              break;
            default:
              argType = dataType.toTsType(arg.type);
          }
          args.push(`${arg.name}: ${argType}`);
        } else {
          importName = arg.type.substring(arg.type.lastIndexOf(".") + 1);
          if (!importsDic[arg.type] && item.package !== arg.type.substring(0, arg.type.lastIndexOf('.'))) {
            importsDic[arg.type] = true;
            imports.push(`import * as ${importName} from './${arg.type.replace(/./g, '/')}';`);
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
        switch (method.return.type.toLowerCase()) {
          case "map":
            if (!method.return.typeParams || method.return.typeParams.length != 2) {
              throw new Error("method return type error");
            }
            for (let param of method.return.typeParams) {
              if (param.indexOf(".") > -1) {
                let importNamespace: string = param.substring(0, param.lastIndexOf("."));
                importName = param.substring(param.lastIndexOf(".") + 1, param.length);
                if (!importsDic[param] && item.package !== importNamespace && dataType.canImport(importName)) {
                  importsDic[param] = true;
                  imports.push(`import * as ${importName} from './${param.replace(/./g, '/')}';`);
                }
              } else {
                importName = param;
              }
            }
            returnType = `{ [type: string]: ${importName} }`;
            break;
          case "list":
            if (!method.return.typeParams || method.return.typeParams.length != 1) {
              throw new Error("method return type error");
            }
            let param = method.return.typeParams[0];
            if (param.indexOf(".") > -1) {
              let importNamespace: string = param.substring(0, param.lastIndexOf("."));
              importName = param.substring(param.lastIndexOf(".") + 1, param.length);
              if (!importsDic[param] && item.package !== importNamespace && dataType.canImport(importName)) {
                importsDic[param] = true;
                imports.push(`import * as ${importName} from './${param.replace(/./g, '/')}';`);
              }
            } else {
              importName = param;
            }
            returnType = `Array<${importName}>`;
            break;
          default:
            returnType = dataType.toTsType(method.return.type);
        }
        methodLine = `${method.name}(${args.join(", ")}): Promise<${returnType}>`;
      } else {
        importName = method.return.type.substring(method.return.type.lastIndexOf(".") + 1);
        if (!importsDic[importName] && item.package !== importName && dataType.canImport(importName)) {
          importsDic[importName] = true;
          imports.push(`import * as ${importName} from './${method.return.type.replace(/./g, '/')}';`);
        }

        if (method.return.typeParams) {
          let typeParams: Array<string> = new Array();
          for (let m: number = 0; m < method.return.typeParams.length; m++) {
            let typeParam: any = method.return.typeParams[m];
            if (typeParam.indexOf(".") > -1) {
              importName = typeParam.substring(typeParam.lastIndexOf(".") + 1, typeParam.length);
              if (!importsDic[importName] && item.package !== typeParam.substring(0, typeParam.lastIndexOf('.')) && dataType.canImport(importName)) {
                importsDic[importName] = true;
                imports.push(`import * as ${importName} from './${typeParam.replace(/\./g, '/')}';`);
              }
            }
            typeParams.push(typeParam);
          }

          methodLine = `${method.name}(${args.join(", ")}): Promise<${method.return.type.substring(method.return.type.lastIndexOf(".") + 1)}<${typeParams.join(", ")}>>`;
        } else {

          methodLine = `${method.name}(${args.join(", ")}): Promise<${method.return.type.substring(method.return.type.lastIndexOf(".") + 1)}>`;
        }
      }
      methodCode.push(`${doc.join('\n')}\n${methodLine}`)
    }
    interfaceCodes.push(imports.join("\n"));
    interfaceCodes.push(methodCode.join(";\n\n"));
    interfaceCodes.push("}");
    interfaceCodes.push("}");

    fileStream.writeFileSync(`${path}${item.name}.ts`, interfaceCodes.join("\n"));
    console.log('\x1b[32m', `file had created: ${path}${item.name}.ts.`, '\x1b[0m');
  }

  for (let i: number = 0; i < types.length; i++) {
    let item: any = types[i];
    if (item.package) {
      let typeCodes: Array<string> = new Array();
      typeCodes.push(`namespace ${item.package}{\n`);
      if (item.doc) {
        typeCodes.push('/**\n');
        typeCodes.push(` * ${item.doc}`);
        typeCodes.push(' */\n');
      }
      if (item.type === "class") {
        typeCodes.push(`class ${item.name}{`);
        for (let property of item.properties) {
          typeCodes.push('/**')
          typeCodes.push(` * ${property.doc}`);
          typeCodes.push(' */')
          typeCodes.push(`public ${property.name}: ${dataType.toTsType(property.type)};`);
          typeCodes.push("\n");
        }
      } else if (item.type === "enum") {
        typeCodes.push(`export enum ${item.name}{`);
        for (let property of item.properties) {
          typeCodes.push('/**')
          typeCodes.push(` * ${property.doc}`);
          typeCodes.push(' */')
          typeCodes.push(`${property.name},`);
          typeCodes.push("\n");
        }
      }
      typeCodes.push("}");
      typeCodes.push("}");

      fileStream.writeFileSync(`${path}${item.name}.ts`, typeCodes.join("\n"));
      console.log('\x1b[32m', `file had created: ${path}${item.name}.ts.`, '\x1b[0m');
    }
  }

}