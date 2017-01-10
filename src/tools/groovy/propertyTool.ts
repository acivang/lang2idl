
import * as utils from './utils';
import { Ducoment as Doc } from './docTool';
import { TypeTool } from './typeTool';
import { MissingPropertyError, MissingCommentError, PropertySybolError } from '../../utils/error';

let fileName: string;
let propertyName: string;
let packageName: string;
let doc = new Doc();
let typetool = new TypeTool();

export let getPropertys = (code: string, typeFilesMap: { [key: string]: string }): any => {
  typetool.typeFilesMap = typeFilesMap;
  fileName = `${utils.getObjectName(code)}.groovy/.java`;
  packageName = utils.getPackage(code);
  let properties: any = [];

  let propertyCode = code.substring(code.indexOf("{"));

  if (!propertyCode) {
    throw new MissingPropertyError(`${fileName}`);
  }

  let propertyBlocks: string[];
  let isEnum: boolean = false;
  propertyCode = propertyCode.replace(/({|})\n\n|\n}|\n\n}/g, '');
  if (code.indexOf("class ") > -1) {// the object type is class

    propertyBlocks = propertyCode.split(/\n\n|\r\n|\r\n\r\n/);

  } else {// the object type is enum
    isEnum = true;
    propertyBlocks = propertyCode.split(',');
  }
  for (let block of propertyBlocks) {
    if (block.replace(/\n/g, '').length > 0) {
      let property = getProperty(block, code, isEnum);
      properties.push(property);
    }
  }
  return properties;
}

let getProperty = (propertyCode: string, code: string, isEnum?: boolean) => {
  let property: any = {
    name: "",
    doc: ""
  };
  let originCode = propertyCode.substring(propertyCode.indexOf('*/') + 2);
  if (!isEnum) {
    if(originCode.indexOf('@') > -1){
      originCode = originCode.substring(originCode.lastIndexOf('\n'));
    }
    let tmp: string[] = originCode.match(/[_a-zA-Z]((\s*?.*?)*?)[a-zA-Z;\n\d]$/)[0].replace(/\n|;/g, '').split(' ');
    let typeParam: any = typetool.getType(tmp[0]);
    propertyName = tmp[1];
    if (typeParam.typeParams) {
      property = {
        name: propertyName,
        type: typeParam.type,
        typeParams: typeParam.typeParams,
        doc: getPropertyDoc(propertyCode)
      };
    } else {
      property = {
        name: propertyName,
        type: typeParam.type,
        doc: getPropertyDoc(propertyCode)
      };
    }
  } else {
    property.name = originCode.match(/[_a-zA-Z]((\s*?.*?)*?)[a-zA-Z;\n\d]$/)[0].replace(/\n|,/g, '');
    property.doc = getPropertyDoc(propertyCode)
  }

  return property;
}

let getPropertyDoc = (code: string): string => {
  let propertyDoc: string = doc.getObjectDoc(code);
  if (!propertyDoc) {
    throw new MissingCommentError(`${propertyName} in ${fileName}`);
  }
  return propertyDoc;
}