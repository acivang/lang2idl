
var IdlTypeDictionary: { [type: string]: string} = {
  ['float']:'decimal',
  ['double']:'decimal',
  ['int']:'number',
  ['int32']:'number',
  ['int64']:'number',
  ['integer']:'number',
  ['biginteger']:'number',
  ['bigdecimal']:'number',
  ['byte']:'number',
  ['short']:'number',
  ['long']:'number',
  ['string']:'string',
  ['char']:'string',
  ['boolean']:'boolean',
  ['offsetdatetime']:'date',
  ['datetime']:'Date',
  ['list']:'array'
};

export function toIdlType(type:string): string{
  var idlType = 'undefined';
  idlType = IdlTypeDictionary[type.toLowerCase()];
  return idlType;
}