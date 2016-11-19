import * as fs from 'fs';
import * as osPath from 'path';

import * as groovy2idl from './src/groovy2idl';
import * as csharp2idl from './src/cs2idl';
import * as idl2ts from './src/idl2ts';
import * as idl2groovy from './src/idl2groovy';
import * as idl2cs from './src/idl2cs';
import { MissingFileError } from './src/utils/error';
import { log } from './src/utils/log';


  /**
   * 转换方法
   * 
   * @param {string} command
   * @param {string} file
   * 
   * @memberOf Converter
   */
  export let convert = (command: string, file?: string) => {

    if(!file && (command === 'groovy2idl' || command === 'cs2idl')){
      file = __dirname;
    }

    if (!fs.existsSync(file)) {
      file = osPath.join(__dirname, file);
      if (!fs.existsSync(file)) {
        file = osPath.join(__dirname, file, '/');
      }
    } 

    if (!fs.existsSync(file)) {
      throw new MissingFileError(`'${file}'`);
    }

    switch (command) {
      case 'groovy2idl':
        groovy2idl.convert(file);
        break;
      case 'cs2idl':
        csharp2idl.convert(file);
        break;
      case 'idl2ts':
        idl2ts.convert(file);
        break;
      case 'idl2groovy':
        idl2groovy.convert(file);
        break;
      case 'idl2cs':
        idl2cs.convert(file);
        break;
      default:
        log.error('error command');
        break;
    }
  }