
import * as struct from '../../utils/struct';
import * as utils from './utils';
import { Ducoment } from './docTool';
import * as propertyTools from './propertyTool';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from '../../utils/error';

let doc = new Ducoment();

export let getEnums = (code: string, typeFilesMap: { [key: string]: string }): any => {

  let enumType = struct.typeStruct();
  enumType.type = "enum";

  enumType.package = utils.getNamespace(code);

  enumType.doc = doc.getObjectDoc(code);
  
  enumType.name = utils.getObjectName(code);

  enumType.properties = propertyTools.getPropertys(code, typeFilesMap);

  return enumType;
}