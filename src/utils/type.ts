//将其他语言类型转换为ts类型的字典
let tsTypeMap: { [type: string]: string } = {
  ['float']: 'decimal',
  ['double']: 'decimal',
  ['int']: 'number',
  ['int32']: 'number',
  ['int64']: 'number',
  ['integer']: 'number',
  ['biginteger']: 'number',
  ['bigdecimal']: 'number',
  ['byte']: 'number',
  ['short']: 'number',
  ['long']: 'number',
  ['string']: 'string',
  ['char']: 'string',
  ['boolean']: 'boolean',
  ['offsetdatetime']: 'Date',
  ['datetimeoffset']: 'Date',
  ['datetime']: 'Date',
  ['list']: 'Array',
  ['map']: 'Array',
  ['dictionary']: 'Array',
  ['void']: 'void'
};

//将其他语言类型转换为groovy类型的字典
let groovyTypeMap: { [type: string]: string } = {
  ['decimal']: 'float',
  ['number']: 'int',
  ['string']: 'String',
  ['date']: 'Date',
  ['void']: 'void',
  ['dictionary']: 'Map',
  ['map']: 'Map',
  ['array']: 'List',
  ['list']: 'List',
  ['boolean']: 'Boolean',
  ['int']: 'int',
  ['int32']: 'int',
  ['int64']: 'long',
  ['integer']: 'int',
  ['biginteger']: 'long',
  ['bigdecimal']: 'double',
  ['byte']: 'byte',
  ['short']: 'short',
  ['long']: 'long'
}

let csTypeMap: { [type: string]: string } = {
  ['decimal']: 'double',
  ['number']: 'int',
  ['string']: 'string',
  ['date']: 'Date',
  ['void']: 'void',
  ['dictionary']: 'Dictionary',
  ['map']: 'Dictionary',
  ['array']: 'List',
  ['list']: 'List',
  ['boolean']: 'bool',
  ['int']: 'int',
  ['int32']: 'int',
  ['int64']: 'long',
  ['integer']: 'int',
  ['biginteger']: 'long',
  ['bigdecimal']: 'double',
  ['byte']: 'byte',
  ['short']: 'short',
  ['long']: 'long'
}



export function toTsType(type: string): string {
  let idlType = 'undefined';
  if (type) {
    idlType = tsTypeMap[type.toLowerCase()];
    if (!idlType) {
      if (type.indexOf("list") > -1) {
        idlType = tsTypeMap["list"];
      }
    }
  }
  return idlType;
}

export function toLangType(type: string, lang: string): string {
  let langType = 'null';
  type = type.toLowerCase();
  switch(lang){
    case 'groovy':
      langType = groovyTypeMap[type];
      break;
      case 'cs':
      langType = csTypeMap[type];
      break;
      
  }
  return langType;
}


export function canImport(type: string): boolean {
  let result: boolean = true;

  switch (type.toLocaleLowerCase()) {
    case "map":
      result = false;
      break;
    case "list":
      result = false;
      break;
    case "array":
      result = false;
      break;
    case "dictionary":
      result = false;
      break;
    default:
      result = true;
  }

  return result;
}