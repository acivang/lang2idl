import * as fileStream from 'fs';
import * as utils from './utils';
import { MissingFileError } from '../../utils/error';
import { log } from '../../utils/log';

export class packageTool {

  getPackageParam(type: string, typeFile: string): string {
    if(!typeFile){
      // throw new MissingFileError(`type of ${type}`);
      log.error(`there was not found file for ${type}`);
      return '';
    }
    let packageParam: string;
    let code: string = fileStream.readFileSync(typeFile).toString();
    packageParam = `${utils.getPackage(code)}.${type}`;
    return packageParam;
  }

}