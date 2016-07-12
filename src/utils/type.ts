
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
  ['offsetdatetime']: 'date',
  ['datetimeoffset']: 'date',
  ['datetime']: 'date',
  ['list']: 'array',
  ['void']: 'viod',
  ['def']: 'void'
};

export function toIdlType(type: string): string {
  let idlType = 'undefined';
  idlType = IdlTypeDictionary[type.toLowerCase()];
  return idlType;
}