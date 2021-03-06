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
    let imports: Array<string> = new Array();
    let importsMap: { [key: string]: boolean } = {};
    let methods: Array<string> = new Array();
    let interfaceCodes: Array<string> = new Array();

    interfaceCodes.push(`package ${item.package}{`);
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
        if (!arg.name) {
          break;
        }
        doc.push(`//${arg.doc}`);
        if (arg.type.indexOf('.') < 0) {
          args.push(`${arg.name}: ${arg.type}`);
        } else {
          namespaceName = arg.type.substring(0, arg.type.lastIndexOf("."));
          if (!importsMap[namespaceName]) {
            importsMap[namespaceName] = true;
            imports.push(`import ${namespaceName};`);
          }
          args.push(`${arg.name}: ${arg.type.substring(arg.type.lastIndexOf(".") + 1)}`);
        }
      }
      // methodCode.push(doc.join("\n"));
      let methodLine: string;
      if (method.return.type.indexOf(".") < 0) {
        methodLine = `${method.name}(${args.join(", ")}): Promise<${method.return.type}>`;
      } else {
        namespaceName = method.return.type.substring(0, method.return.type.lastIndexOf("."));
        if (!importsMap[namespaceName]) {
          importsMap[namespaceName] = true;
          imports.push(`import ${namespaceName};`);
        }
        let typeParams: Array<string> = new Array();
        if (method.return.typeParams) {
          for (let m: number = 0; m < method.return.typeParams.length; m++) {
            let typeParam: any = method.return.typeParams[m];
            if (typeParam.indexOf(".") > -1) {
              namespaceName = typeParam.substring(0, typeParam.lastIndexOf("."));
              typeParam = typeParam.substring(typeParam.lastIndexOf(".") + 1);
              if (!importsMap[namespaceName]) {
                importsMap[namespaceName] = true;
                imports.push(`import ${namespaceName};`);
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
    console.log(interfaceCodes.join("\n"));
    path = path.substring(0, path.lastIndexOf('/') + 1);
    //TODO: 根据package输出到对应目录
    fileStream.writeFileSync(`${path}${item.name}.groovy`, interfaceCodes.join("\n"));
    console.log(`${item.name}.groovy had created at ${path}.`);
  }

}