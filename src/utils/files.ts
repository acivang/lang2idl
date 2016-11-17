import * as fileStream from 'fs';
import * as osPath from 'path';
export class FileHelper {

  private _files: string[] = [];

  public getAllFiles(path: string): string[] {

    if (!fileStream.existsSync(path)) {
      throw new Error(`no such file or directory: '${path}'`);
    }

    let extname: string;
    if (fileStream.lstatSync(path).isDirectory()) {
      for (let file of fileStream.readdirSync(path)) {
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
}