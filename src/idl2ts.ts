import * as path from 'path';
import * as dataType from './utils/type';
import { log } from './utils/log';
import { getInterfaces } from './tools/ts/interfaceTools';
import { getTypes } from './tools/ts/typeTools';
import { FileHelper } from './utils/files';
import { MissingFileError, CodeFormatError } from './utils/error';
import { npm } from './source/npm';

let fileHelper = new FileHelper();

export function convert(filePath: string): void {

  if (!fileHelper.exists(filePath)) {
    throw new MissingFileError(`'${filePath}'`);
  }

  let code: any = fileHelper.read(filePath);
  if (!code) {
    throw new CodeFormatError(`'${filePath}'`);
  }
  try {
    code = JSON.parse(code);
  }
  catch (error) {
    throw error;
  }

  let dirname = path.dirname(filePath);

  dirname = path.join(dirname, 'package');

  npm.name = path.basename(filePath, '.json');
  fileHelper.saveFile(path.join(dirname, 'package.json'), JSON.stringify(npm));

  getInterfaces(code.interfaces, dirname);
  getTypes(code.types, dirname);
}