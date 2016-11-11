
import * as struct from '../../utils/struct';
import { namespaceTool } from './namespaceTool';
import { MissingMethodError, MissingCommentError, CodeFormatError } from '../../utils/error';

//groovy类型字典
let csharpTypeMap: { [type: string]: boolean } = {
  ['double']: true,
  ['flout']: true,
  ['string']: true,
  ['byte']: true,
  ['short']: true,
  ['int']: true,
  ['char']: true,
  ['bool']: true,
  ['dictionary']: true,
  ['arraylist']: true,
  ['hashtable']: true,
  ['sortedlist']: true,
  ['sorteddictionary']: true,
  ['list']: true,
  ['void']: true,
  ['object']: true,
  ['decimal']: true,
  ['biginteger']: true,
  ['integer']: true,
  ['long']: true,
  ['sbyte']: true,
  ['uint']: true,
  ['ulong']: true,
  ['ushort']: true
};
let imports: string[];
let namespacetool = new namespaceTool();

export class typeTool {
  typeFilesMap: { [key: string]: string };

  getType = (typeCode: string): any => {
    let propType: string;
    let propTypeParams: string[] = [];

    if (typeCode.indexOf('<') > -1) { //Match List<T>, Dictionary<TK,TV>, CustomClass<T>
      let typeTmp = typeCode.split('<');
      propType = typeTmp[0];
      typeTmp[1] = typeTmp[1].replace(/\>| /g, '');
      if (typeTmp[1].indexOf(',') > -1) {//Match Dictionary<TK,TV>
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
    if (csharpTypeMap[type.toLowerCase()]) {
      return type;
    }

    return namespacetool.getNamespaceParam(type, this.typeFilesMap[type.toLowerCase()]);
  }
}
