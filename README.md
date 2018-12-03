 


###### 上传文件到sftp服务器   
```
kilaftp sftpdir 
  /*
   sftpdir sftp目录，默认是当前目录名称，例如当前目录是mydata，就会默认上传到sftpmydata目录
  */
```  
###### 上传文件到sftp服务器 配置信息
```
kilaftp config root username password sftbasic_url localdir 
 /*
  config 配置本目录下上传目录
  root sftp地址
  username sftp 用户名
  password sftp 密码
  basic_url sftp 基目录
  localdir 本地上传文件夹，默认是./dist目录
 */
``` 
###### 上传文件到sftp服务器 全局配置信息
```
kilaftp configs root username password sftbasic_url localdir 
 /*
  configs 配置本目录下上传目录
  root sftp地址
  username sftp 用户名
  password sftp 密码
  basic_url sftp 基目录
  localdir 本地上传文件夹，默认是./dist目录
 */
``` 