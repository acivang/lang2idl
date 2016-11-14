import * as fileStream from 'fs';
import { MissingFileError, CodeFormatError } from './utils/error';
import { InterfaceTool } from './tools/groovy/interfaceTool';
import { TypeTool } from './tools/groovy/TypeTool';

export function convert(path: string): void {

  if (!fileStream.existsSync(path)) {
    throw new MissingFileError(`'${path}'`);
  }

  let code: any = fileStream.readFileSync(path).toString();
  if (!code) {
    throw new CodeFormatError(`'${path}'`);
  }
  try {
    code = JSON.parse(code);
  }
  catch (error) {
    throw error;
  }

  let interfaceTool = new InterfaceTool();
  let typeTool = new TypeTool();
  let interfaces: any = code.interfaces;
  let types: any = code.types;

  path = path.substring(0, path.lastIndexOf('/') + 1);
  interfaceTool.getInterfaces(interfaces, path);
  typeTool.getTypes(types, path);
}