//引入第三方模块mysql模块
var mysql = require("mysql");

//链接数据库
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'smms'
});

//打开数据库
connection.connect();

//暴露模块
module.exports = connection;