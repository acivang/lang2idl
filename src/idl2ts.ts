
import * as fileStream from 'fs';
import * as dataType from './utils/type';
import { log } from './utils/log';
import { getInterfaces } from './tools/ts/interfaceTools';
import { getTypes } from './tools/ts/typeTools';
import { FileHelper } from './utils/files';
import { MissingFileError, CodeFormatError } from './utils/error';

let fileHelper = new FileHelper();

export function convert(path: string): void {

  if (!fileStream.existsSync(path)) {
    throw new MissingFileError(`'${path}'`);
  }

  let code: any = fileStream.readFileSync(path).toString();
  if (!code) {
    throw new CodeFormatError(`'${path}'`);
  }
  try {
    code = JSON.parse(code);
  }
  catch (error) {
    throw error;
  }

  path = path.substring(0, path.lastIndexOf('/') + 1);
  let types: any = code.types;
  getInterfaces(code.interfaces, path);
  getTypes(code.types, path);
}