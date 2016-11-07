

export class log {
  
  /**
   * Out put green log text.
   * 
   * @static
   * @param {string} value
   * 
   * @memberOf log
   */
  public static info(value: string){
    console.log('\x1b[32m', value, '\x1b[0m');  
  }

  /**
   * Out put red log text.
   * 
   * @static
   * @param {string} value
   * 
   * @memberOf log
   */
  public static error(value: string){
    console.log('\x1b[31m', value, '\x1b[0m');  
  }

  /**
   * Out put yellow log text.
   * 
   * @static
   * @param {string} value
   * 
   * @memberOf log
   */
  public static debug(value: string){
    console.log('\x1b[33m', value, '\x1b[0m');  
  }

  /**
   * 
   * 
   * @private
   * @static
   * @param {string} value
   * @param {LogColor} color
   * 
   * @memberOf log
   */
  private static print(value: string, color: LogColor){
    console.log(`\x1b[${color}m`, value, '\x1b[0m');  
  }
}

enum LogColor{
  /**
   * 蓝色
   * 
   * @static
   * 
   * @memberOf LogColor
   */
  BLUE = 34,
  /**
   * 洋红色
   * 
   * @static
   * 
   * @memberOf LogColor
   */
  MAGENTA = 35
}