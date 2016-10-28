
let IdlTypeDictionary: { [type: string]: string } = {
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
  ['void']: 'void',
  ['def']: 'void'
};

export function toIdlType(type: string): string {
  let idlType = 'undefined';
  if (type) {
    idlType = IdlTypeDictionary[type.toLowerCase()];
    if (!idlType) {
      if (type.indexOf("List")) {
        idlType = IdlTypeDictionary["list"];
      } else if (type.indexOf("Map")) {
        idlType = IdlTypeDictionary["map"];
      } else if (type.indexOf("Dictionary")) {
        idlType = IdlTypeDictionary["dictionary"];
      }
      if(type.indexOf("<") > -1){
        idlType = `${ idlType }<any>`
      }
    }
  }
  return idlType;
}