import * as utils from './utils';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from '../../utils/error';

export class Ducoment {

  /**
   * 获取对象（interface/class/enum/method/property）的注释
   * 
   * @param {string} code 代码
   * @returns {string} 首行注释
   * 
   * @memberOf GroovyTools
   */
  getObjectDoc(code: string): string {
    let doc: string;

    let doces = code.match(/\/\*\*((\s*?.*?)*?)\*\//);
    
    return doces[0].split('\n')[1].replace(/\n|\*| /g, '');
  }

  /**
   * 获取方法返回结果注释
   * 
   * @param {string} code
   * @returns {string}
   * 
   * @memberOf GroovyTools
   */
  getMethodReturnDoc(code: string): string {
    let doc: string;

    let tempDoc = code.match(/\@return((\s*?.*?)*?)\n/);
    if (tempDoc) {
      doc = tempDoc[0].replace(/@return |\n/g, '');
    }

    return doc;
  }

  /**
   * 获取方法返回结果注释
   * 
   * @param {string} code
   * @returns {string}
   * 
   * @memberOf GroovyTools
   */
  getMethodArgsDoc(code: string): string[] {
    let doc: string[] = [];
    doc.pop();
    let doces = code.match(/\@param((\s*?.*?)*?)\n/g);
    if (doces) {
      for (let item of doces) {
        item = item.replace(/\n|\*| |@param/g, '');
        if (item && item.length !== 0) {
          doc.push(item);
        }
      }
    }
    return doc;
  }
}
