import * as fileStream from 'fs';
import * as osPath from 'path';

import { MissingFileError, RecursionMaxError } from './error';

export class FileHelper {

  private _files: string[] = [];
  private _counter: number = 0;

  public getAllFiles(path: string): string[] {
    // this._counter++;
    // if (this._counter > 10) {
    //   throw new RecursionMaxError(`${this._counter}`);
    // }
    if (!fileStream.existsSync(path)) {
      throw new MissingFileError(`'${path}'`);
    }

    let extname: string;
    if (fileStream.lstatSync(path).isDirectory()) {
      let files: string[] = fileStream.readdirSync(path);
      for (let file of files) {
        extname = osPath.extname(file)
        let fullPath = osPath.join(path, file);
        if (fileStream.lstatSync(fullPath).isDirectory()) {
          this.getAllFiles(`${fullPath}`);
        } else if (extname === ".groovy" || extname === ".cs") {
          this._files.push(fullPath);
        }
      }
    } else if (extname === ".groovy" || extname === ".cs") {
      this._files.push(path);
    }

    return this._files;
  }

  public saveFile(path: string, text: string) {
    let directory: string = osPath.dirname(path);
    if (!fileStream.existsSync(directory)) {
      let folders: string[] = directory.split(osPath.sep);
      let folderPath: string = '';
      for (let folder of folders) {
        folderPath = osPath.join(folderPath, folder, '/');
        if (!fileStream.existsSync(folderPath)) {
          fileStream.mkdirSync(folderPath);
        }
      }
    }
    fileStream.writeFileSync(`${path}`, text);
  }

  public exists(file: string): boolean {
    return fileStream.existsSync(file);
  }

  public read(file: string): string {
    return fileStream.readFileSync(file).toString();
  }

  public copyFile(sourceFile: string, goalFile: string) {
    fileStream.createReadStream(sourceFile).pipe(fileStream.createWriteStream(goalFile));
  }
}