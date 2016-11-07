import * as fileStream from 'fs';

export class FileHelper {

  private _files: string[] = [];

  public getAllFiles(path: string): string[] {

    if (!fileStream.existsSync(path)) {
      throw new Error(`no such file or directory: '${path}'`);
    }

    if (fileStream.lstatSync(path).isDirectory()) {
      for (let file of fileStream.readdirSync(path)) {
        let fullPath = `${path}${file}`;
        if (fileStream.lstatSync(fullPath).isDirectory()) {
          this.getAllFiles(`${fullPath}/`);
        } else if (file.indexOf(".groovy") > -1 || file.indexOf(".cs") > -1) {
          this._files.push(fullPath);
        }
      }
    } else if (path.indexOf(".groovy") > -1 || path.indexOf(".cs") > -1) {
      this._files.push(path);
    }

    return this._files;
  }
}