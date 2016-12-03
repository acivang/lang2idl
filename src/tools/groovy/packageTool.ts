import * as fileStream from 'fs';
import * as utils from './utils';
import { MissingFileError } from '../../utils/error';

export class packageTool {

  getPackageParam(type: string, typeFile: string): string {
    if(!typeFile){
      throw new MissingFileError(`type of ${type}`);
    }
    let packageParam: string;
    let code: string = fileStream.readFileSync(typeFile).toString();
    packageParam = `${utils.getPackage(code)}.${type}`;
    return packageParam;
  }

}