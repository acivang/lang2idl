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

  filePath = filePath.substring(0, filePath.lastIndexOf(path.sep) + 1);
  interfaceTool.getInterfaces(interfaces, filePath);
  typeTool.getTypes(types, filePath);
}