
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
  ['list']: 'array',
  ['map']: 'array',
  ['dictionary']: 'array',
  ['void']: 'void',
  ['def']: 'void'
};

export function toIdlType(type: string): string {
  let idlType = 'undefined';
  if(type){
  idlType = IdlTypeDictionary[type.toLowerCase()];
  }
  return idlType;
}