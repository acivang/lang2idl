
import * as struct from '../../utils/struct';
import * as utils from './utils';
import { Ducoment } from './docTools';
import * as propertyTools from './propertyTools';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from '../../utils/error';

let doc = new Ducoment();

export let getEnum = (code: string): any => {

  let enumType = struct.typeStruct();
  enumType.type = "enum";

  enumType.package = utils.getPackage(code);

  enumType.doc = doc.getObjectDoc(code);
  
  enumType.name = utils.getObjectName(code);

  enumType.properties = propertyTools.getPropertys(code);

  return enumType;
}