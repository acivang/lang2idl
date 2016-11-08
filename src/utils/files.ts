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

  public saveFile(path: string, text: string) {
    let directory: string = path.substring(0, path.lastIndexOf('/'));
    if (!fileStream.existsSync(directory)) {
      let folders: string[] = directory.split('/');
      let folderPath: string = '';
      for (let folder of folders) {
        folderPath = `${folderPath}${folder}/`;
        if (!fileStream.existsSync(folderPath)) {
          fileStream.mkdirSync(folderPath);
        }
      }
    }
    fileStream.writeFileSync(`${path}`, text);
  }
}