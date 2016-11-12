import * as utils from './utils';
import { MissingMethodError, MissingCommentError, MissingPropertyError, CodeFormatError } from '../../utils/error';

export class Ducoment {


  /**
   * 获取对象（interface/class/enum/method/property）的注释
   * 
   * @param {string} code 代码
   * @returns {string} 首行注释
   * 
   * @memberOf Ducoment
   */
  getObjectDoc(code: string): string {
    let doc: string;

    let doces = code.match(/<summary>((\s*?.*?)*?)<\/summary>/);

    return doces[0].replace(/<summary>|<\/summary>|\/\/\/|\n| /g, '');
  }

  /**
   * 获取方法返回结果注释
   * 
   * @param {string} code
   * @returns {string}
   * 
   * @memberOf Ducoment
   */
  getMethodReturnDoc(code: string): string {
    let doc: string;

    let tempDoc = code.match(/<returns>((\s*?.*?)*?)<\/returns>/);
    if (tempDoc) {
      doc = tempDoc[0].replace(/<returns>|<\/returns>|\n| /g, '');
    }

    return doc;
  }

  /**
   * 获取方法参数
   * 
   * @param {string} code
   * @returns {string}
   * 
   * @memberOf Ducoment
   */
  getMethodArgsDoc(code: string): string[] {
    let doc: string[] = [];
    doc.pop();
    let doces = code.match(/<param((\s*?.*?)*?)<\/param>/g);
    if (doces) {
      for (let item of doces) {
        item = item.replace(/<\/param>|<param name=|"|>/g, '');
        if (item && item.length !== 0) {
          doc.push(item);
        }
      }
    }
    return doc;
  }
}
