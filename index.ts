import * as groovy2idl from './src/groovy2idl';

let dir: string;
let argvs = process.argv;

if(argvs.length === 2){
  dir = __dirname;
}else{
  dir = __dirname + '/' + argvs[2] + '/';
}

groovy2idl.convert(dir);
