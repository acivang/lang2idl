import * as fileStream from 'fs';
import * as path from 'path';
import { MissingFileError, CodeFormatError } from './utils/error';
import { InterfaceTool } from './tools/cs/interfaceTool';
import { TypeTool } from './tools/cs/typeTool';

export function convert(filePath: string): void {

  if (!fileStream.existsSync(filePath)) {
    throw new MissingFileError(`'${path}'`);
  }

  let code: any = fileStream.readFileSync(filePath).toString();
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

  let dirname = path.dirname(filePath);
  interfaceTool.getInterfaces(interfaces, dirname);
  typeTool.getTypes(types, dirname);
}