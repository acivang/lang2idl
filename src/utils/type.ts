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
  ['decimal']: 'double',
  ['number']: 'int',
  ['string']: 'String',
  ['Date']: 'Date',
  ['void']: 'def'
}

export function toIdlType(type: string): string {
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