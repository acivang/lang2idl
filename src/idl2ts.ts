import * as path from 'path';
import * as dataType from './utils/type';
import { log } from './utils/log';
import { getInterfaces } from './tools/ts/interfaceTools';
import { getTypes } from './tools/ts/typeTools';
import { FileHelper } from './utils/files';
import { MissingFileError, CodeFormatError } from './utils/error';
import { npm } from './config/npm';
import { tsconfig } from './config/ts';
import { npmignore } from './config/npmignore'

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

  dirname = path.join(dirname, 'npm-package');

  npm.name = path.basename(filePath, '.json');
  fileHelper.saveFile(path.join(dirname, 'package.json'), JSON.stringify(npm));
  fileHelper.saveFile(path.join(dirname, 'tsconfig.json'), JSON.stringify(tsconfig));
  fileHelper.saveFile(path.join(dirname, '.npmignore'), npmignore.join('\n'));

  let mainFileValue: string = getInterfaces(code.interfaces, dirname);
  fileHelper.saveFile(path.join(dirname, 'main.ts'), mainFileValue);
  getTypes(code.types, dirname);
  log.info(`npm package had create at ${dirname}`);
}