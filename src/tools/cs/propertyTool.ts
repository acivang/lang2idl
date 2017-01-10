
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
  fileName = `${utils.getObjectName(code)}.cs`;
  packageName = utils.getNamespace(code);
  let properties: any = [];

  code = code.replace(/ { get; set; }/g,';');
  let startIndex: number = 0;
  let endIndex: number = code.lastIndexOf("}");

  if (code.indexOf("class ") > -1) {// the object type is class
    startIndex = code.indexOf("class");
  }else{
    startIndex = code.indexOf("enum");
  }
  let classCode = code.substring(startIndex, endIndex);
  startIndex = classCode.indexOf("{") + 1;
  endIndex = classCode.lastIndexOf("}");
  let propertyCode = classCode.substring(startIndex, endIndex);

  if (!propertyCode) {
    throw new MissingPropertyError(`${fileName}`);
  }

  let propertyBlocks: string[];
  let isEnum: boolean = false;

  if (code.indexOf("class ") > -1) {// the object type is class

    propertyBlocks = propertyCode.split(';');

  } else {// the object type is enum
    isEnum = true;
    propertyBlocks = propertyCode.split(',');
  }
  for (let block of propertyBlocks) {
    if (block.replace(/\r?\n| /g, '').length > 0) {
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
  let startIndex: number = propertyCode.lastIndexOf('public ') + 7;
  let originCode = propertyCode.substring(startIndex);
  if (!isEnum) {
    let tmp: string[] = originCode.split(' ');
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
    property.name = originCode.match(/        [_a-zA-Z]((\s*?.*?)*?)[a-zA-Z;\r?\n\d ]$/)[0].replace(/\r?\n|,| /g, '');
    property.doc = getPropertyDoc(propertyCode).replace(/ /g,'');
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