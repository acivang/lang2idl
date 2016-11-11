import * as fileStream from 'fs';
import * as utils from './utils';

export class namespaceTool {

  getNamespaceParam(type: string, typeFile: string): string {
    let namespaceParam: string;
    let code: string = fileStream.readFileSync(typeFile).toString();
    namespaceParam = `${utils.getNamespace(code)}.${type}`;
    return namespaceParam;
  }

}