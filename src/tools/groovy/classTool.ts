
import * as struct from '../../utils/struct';
import * as utils from './utils';
import { Ducoment } from './docTool';
import * as propertyTool from './propertyTool';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from '../../utils/error';

let doc = new Ducoment();

export let getClasses = (code: string, typeFilesMap: { [key: string]: string }): any => {

  let classType = struct.typeStruct();
  classType.type = "class";

  classType.package = utils.getPackage(code);

  classType.doc = doc.getObjectDoc(code);
  
  classType.name = utils.getObjectName(code);

  classType.properties = propertyTool.getPropertys(code, typeFilesMap);

  return classType;
}