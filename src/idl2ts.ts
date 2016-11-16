
import * as fileStream from 'fs';
import * as path from 'path';
import * as dataType from './utils/type';
import { log } from './utils/log';
import { getInterfaces } from './tools/ts/interfaceTools';
import { getTypes } from './tools/ts/typeTools';
import { FileHelper } from './utils/files';
import { MissingFileError, CodeFormatError } from './utils/error';

let fileHelper = new FileHelper();

export function convert(filePath: string): void {

  if (!fileStream.existsSync(filePath)) {
    throw new MissingFileError(`'${filePath}'`);
  }

  let code: any = fileStream.readFileSync(filePath).toString();
  if (!code) {
    throw new CodeFormatError(`'${filePath}'`);
  }
  try {
    code = JSON.parse(code);
  }
  catch (error) {
    throw error;
  }

  filePath = filePath.substring(0, filePath.lastIndexOf(path.sep) + 1);
  let types: any = code.types;
  getInterfaces(code.interfaces, filePath);
  getTypes(code.types, filePath);
}