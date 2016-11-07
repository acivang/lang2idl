
import * as struct from '../../utils/struct';
import * as utils from './utils';
import { Ducoment } from './docTools';
import * as propertyTools from './propertyTools';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from '../../utils/error';

let doc = new Ducoment();

export let getClass = (code: string): any => {

  let classType = struct.typeStruct();
  classType.type = "class";

  classType.package = utils.getPackage(code);

  classType.doc = doc.getObjectDoc(code);
  
  classType.name = utils.getObjectName(code);

  classType.properties = propertyTools.getPropertys(code);

  return classType;
}