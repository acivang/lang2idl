
/**
 * 获取对象（interface/class/enum）名称
 * 
 * @param {string} code 代码
 * @returns {string} 对象名称
 * 
 * @memberOf utiles
 */
export let getNamespace = (code: string): string => {
  let name: string;
  name = code.match(/namespace((\s*?.*?)*?)\n/)[0].replace(/namespace|\;| |\n/g, '');
  return name;
}



/**
 * 获取对象（interface/class/enum）名称
 * 
 * @param {string} code 代码
 * @returns {string} 对象名称
 * 
 * @memberOf utiles
 */
export let getObjectName = (code: string): string => {
  let name: string;
  name = code.match(/(interface|class|enum)((\s*?.*?)*?){/)[0].replace(/(interface|class|enum)| |{|\n/g, '');
  return name;
}
