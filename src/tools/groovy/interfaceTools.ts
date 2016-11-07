
import * as struct from '../../utils/struct';
import * as utils from './utils';
import { Ducoment } from './docTools';
import {getMethods} from './methodTools';
import {getMetaes} from './metaTools';
import { MissingCommentError, CodeFormatError } from '../../utils/error';


const PACKAGE: string = 'org.nofdev.rpc.';

let interfaceName: string;
let doc = new Ducoment();

export let getInterface = (code: string) => {
  let itemInterface = struct.interfaceStruct();
  let dicTypes = [''];

  itemInterface.package = utils.getPackage(code);

  itemInterface.name = interfaceName = utils.getObjectName(code);

  itemInterface.doc = doc.getObjectDoc(code);

  itemInterface.meta = getMetaes(code, 'interface');

  itemInterface.methods = getMethods(code);

  return itemInterface;
}