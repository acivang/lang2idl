1. ### What is it?

      this is a tool for create a json idl(interface description lanauge) from groovy/java/c# etc, and convert idl to typescript/java/groovy/c# etc.

2. ### How use?

      create json idl from groovy: npm run groovy2idl "groovy file dir path" 

      create json idl from c#: npm run cs2idl "cs file dir path"

      create typescript from json idl: npm run idl2ts "json idl file path"


3. ### About code document
 
      Standard code：
      
      ```java

        /**
        * 银泰网换绑手机号（没有关联银泰护照的账号，可以正常绑定手机号和修改绑定的手机号）
        * @description 1.判断手机号是否已绑定银泰网账号，如果已绑定，不能换绑
        * @description 2.判断手机号是否是银泰护照
        * @description   2.1. 如果是银泰护照，验证银泰护照手机号+验证码登录的逻辑，换绑银泰网手机号、绑定银泰护照
        * @description   2.2. 如果不是银泰护照，验证银泰网换绑手机号的短信验证，走银泰网换绑手机号的逻辑
        * @author MengQiang
        * @param mobile 换绑后的手机号
        * @param smsVerificationCode 短信验证码
        * @param smsTokenId 短信验证码TokenId
        * */
        void changeBindingMobileForMe(String mobile, String smsVerificationCode,String smsTokenId);Ï

      ```

      The comments that not start with '@' is method's comments.
      Start with '@author' is the author of code block.
      Start with '@param' are args comments.
      Start with '@return' is the method return result comments.


4. ### About import

      <del>If import other package, must not use '\*' in import code line, because the converter need match the custom type's package, use '\*' can't match it nicety. </del>


5. ### About property(groovy)

      <del>Property code must end with ';' for split property code block in groovy.</del>
