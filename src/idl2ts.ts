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

  let jsonName: string = `${npm.name.toLowerCase()}Json`;
  if(npm.name.indexOf('-') > -1){
    jsonName = `${npm.name.substring(npm.name.indexOf('-')+1).toLowerCase()}Json`;
  }
  let json = `export let ${jsonName} = ${JSON.stringify(code)};`;
  filePath = path.join(dirname, `${jsonName}.ts`);
  fileHelper.saveFile(filePath, json);

  let importJson: string = `export * from './${jsonName}';`;
  mainFileValue += '\n' + getTypes(code.types, dirname) + '\n' + importJson ;
  fileHelper.saveFile(path.join(dirname, 'main.ts'), mainFileValue);
  
  log.info(`npm package had create at ${dirname}`);
}