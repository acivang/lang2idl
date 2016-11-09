
import * as struct from '../../utils/struct';
import { packageTool } from './packageTool';
import { MissingMethodError, MissingCommentError, CodeFormatError } from '../../utils/error';

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
let packagetool = new packageTool();

export class typeTool {
  typeFilesMap: { [key: string]: string };

  getType = (typeCode: string): any => {
    let propType: string;
    let propTypeParams: string[] = [];

    if (typeCode.indexOf('<') > -1) { //Match List<T>, Map<TK,TV>, CustomClass<T>
      let typeTmp = typeCode.split('<');
      propType = typeTmp[0];
      typeTmp[1] = typeTmp[1].replace(/\>| /g, '');
      if (typeTmp[1].indexOf(',') > -1) {//Match Map<TK,TV>
        let tmpPropTypeParams = typeTmp[1].split(',');
        propTypeParams.push(this.getTypePackage(tmpPropTypeParams[0]));
        propTypeParams.push(this.getTypePackage(tmpPropTypeParams[1]));
      }
      else {
        propTypeParams.push(this.getTypePackage(typeTmp[1]));
      }
    } else {
      propType = typeCode;
    }

    propType = this.getTypePackage(propType);

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

  private getTypePackage (type: string): string {
    if (groovyTypeMap[type.toLowerCase()]) {
      return type;
    }

    return packagetool.getPackageParam(type, this.typeFilesMap[type.toLowerCase()]);
  }
}
