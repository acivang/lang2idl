import * as fs from 'fs';

import * as groovy2idl from './src/groovy2idl';
import * as csharp2idl from './src/cs2idl';
import * as idl2ts from './src/idl2ts';
import * as idl2groovy from './src/idl2groovy';

let dir: string;
let argvs = process.argv;

if(argvs.length === 3){
  dir = __dirname;
}else{
  if(!fs.existsSync(argvs[3])){
    dir = __dirname + '/' + argvs[3] + '/';
    if(!fs.existsSync(dir)){
      dir = __dirname + '/' + argvs[3];
    }
  }else{
    dir = argvs[3];
  }
}

if(!fs.existsSync(dir)){
  throw new Error(`path is not existed: ${ dir }`);
}
console.log(dir);
console.log(argvs);

var command = argvs[2];

switch (command) {
  case 'groovy2idl':
    groovy2idl.convert(dir);
    break;
  case 'cs2idl':
    csharp2idl.convert(dir);
    break;
  case 'idl2ts':
    idl2ts.convert(dir);
    break;
  case 'idl2groovy':
    idl2groovy.convert(dir);
    break;
  default:
    break;
}
