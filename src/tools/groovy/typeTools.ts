
import * as struct from '../../utils/struct';
import { Ducoment } from './docTools';
import * as utils from './utils';
import { MissingMethodError, MissingCommentError, CodeFormatError } from '../../utils/error';


let doc = new Ducoment();
//groovy类型字典
let groovyTypeMap: { [type: string]: boolean } = {
  ['double']: true,
  ['flout']: true,
  ['string']: true,
  ['byte']: true,
  ['short']: true,
  ['int']: true,
  ['char']: true,
  ['boolean']: true,
  ['map']: true,
  ['list']: true,
  ['void']: true,
  ['object']: true,
  ['bigdecimal']: true,
  ['biginteger']: true,
  ['integer']: true,
  ['long']: true
};
let imports: string[];

export let getType = (typeCode: string, code: string): any => {
  let packageName: string = utils.getPackage(code);

  let propType: string;
  let propTypeParams: string[] = [];
  imports = code.match(/import (w?.)*\n/g);

  if (typeCode.indexOf('<') > -1) { //Match List<T>, Map<TK,TV>, CustomClass<T>
    let typeTmp = typeCode.split('<');
    propType = typeTmp[0];
    typeTmp[1] = typeTmp[1].replace(/\>| /g, '');
    if (typeTmp[1].indexOf(',') > -1) {//Match Map<TK,TV>
      let tmpPropTypeParams = typeTmp[1].split(',');
      propTypeParams.push(getTypePackage(tmpPropTypeParams[0], packageName));
      propTypeParams.push(getTypePackage(tmpPropTypeParams[1], packageName));
    }
    else {
      propTypeParams.push(getTypePackage(typeTmp[1], packageName));
    }
  } else {
    propType = typeCode;
  }

  propType = getTypePackage(propType, packageName);

  if (propTypeParams.length > 0) {
    return {
      type: propType,
      typeParams: propTypeParams
    }
  }
  return {
    type: propType
  }
}


let getTypePackage = (type: string, packageName: string): string => {
  if (groovyTypeMap[type.toLowerCase()]) {
    return type;
  }

  if (imports) {
    for (let item of imports) {
      if (item.indexOf(type) > -1) {
        return item.replace('import ', '');
      }
    }
  }

  return `${packageName}.` + type;
}