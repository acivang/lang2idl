import * as fileStream from 'fs';
import * as utils from './utils';

export class packageTool {

  getPackageParam(type: string, typeFile: string): string {
    let packageParam: string;
    let code: string = fileStream.readFileSync(typeFile).toString();
    packageParam = `${utils.getPackage(code)}.${type}`;
    return packageParam;
  }

}