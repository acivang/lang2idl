import * as fileStream  from 'fs';

let rpcPackage: string = 'org.nofdev.rpc.';

export function convert(path: string) {
  var isDir: boolean = false;
  if (path.lastIndexOf('.groovy') < 0 || path.lastIndexOf('*.groovy') > 0) {
    isDir = true;
  }
  if (!fileStream.existsSync(path)) {
    throw new Error(`no such file or directory, open '${path}'`);
  }
  var filesPath: string[];
  if (isDir) {
    filesPath = fileStream.readdirSync(path);
  } else {
    filesPath = [path];
  }
  var idl = { meta: {}, interfaces: [{}], types: [{}] };
  idl.interfaces.pop();
  idl.types.pop();
  for (var index in filesPath) {
    var file = filesPath[index];
    if (file.lastIndexOf('DTO.groovy') < 0 && file.lastIndexOf('Facade.groovy') < 0) {
      continue;
    }
    var code = fileStream.readFileSync(path + file).toString();
    if (file.lastIndexOf('Facade.groovy') > -1) {

      var itemInterface = {
        package: '',
        name: '',
        doc: '',
        meta: [{
          type: '',
          args: {}
        }]
      };
      itemInterface.meta.pop();
      var itemMethod = {
        name: '',
        doc: '',
        throws: [{}],
        return: {},
        args: [{}]
      };
      itemMethod.throws.pop();
      itemMethod.args.pop();
      var dicTypes = [''];

      itemInterface.package = code.match(/package((\s*?.*?)*?)\n/g)[0].replace('package ', '').replace('\n', '');
      var interfaceDoc = code.match(/[\/\*\*|\n]((\s*?.*?)*?)interface/);
      if(interfaceDoc.length > 2){
        itemInterface.doc = interfaceDoc[1].replace(/\*|\n|\/| /g, '');
      }
      itemInterface.name = code.match(/interface((\s*?.*?)*?)Facade/g)[0].replace('interface ', '');

      var metaes = code.match(/@((\s*?.*?)*?)\n/g);
      for (var i in metaes) {
        itemInterface.meta.push({
          type: rpcPackage + metaes[i],
          args: {}
        });
      }

      var methods = code.match(/\{((\s*?.*?)*?)\}/g);
      for (var i in methods) {

      }

      idl.interfaces.push(itemInterface);

    } else if (file.lastIndexOf('DTO.groovy') > -1){

      var itemType = {
        package: '',
        name: '',
        doc: '',
        meta: {},
        properties: [{}]
      };
      itemType.properties.pop();

      itemType.package = code.match(/package((\s*?.*?)*?)\n/g)[0].replace('package ', '');
      var typeDoc = code.match(/[\/\*\*|\n]((\s*?.*?)*?)class/);
      if(typeDoc.length > 2){
        itemType.doc = typeDoc[1].replace(/\*|\n|\/| /g, '');
      }
      itemType.name = code.match(/class((\s*?.*?)*?)DTO/g)[0].replace('class ', '');

      idl.types.push(itemType);
      
    }

  }
  console.log(JSON.stringify(idl));
}