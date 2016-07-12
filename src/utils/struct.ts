export function idlStruct(): any{

  let idl = { meta: {}, interfaces: [{}], types: [{}] };
  idl.interfaces.pop();
  idl.types.pop();
  return idl;

}

export function interfaceStruct(): any{
  let itemInterface = {
    package: '',
    name: '',
    doc: '',
    meta: [{
      type: '',
      args: {}
    }],
    methods: [{}]
  };
  itemInterface.meta.pop();
  itemInterface.methods.pop();
  return itemInterface;
}

export function methodStruct(): any{
  
  let itemMethod = {
    name: '',
    doc: '',
    throws: [{}],
    return: {},
    args: [{}]
  };
  itemMethod.throws.pop();
  itemMethod.args.pop();
  return itemMethod;

}

export function typeStruct(): any{
  let itemType = {
    package: '',
    name: '',
    doc: '',
    meta: {},
    properties: [{}]
  };
  itemType.properties.pop();
  return itemType;
}