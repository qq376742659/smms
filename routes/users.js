var express = require('express');
var router = express.Router();

//引入MD5模块
var crypto = require("crypto");

//引入链接数据库模块
var connection = require('./connectMySql');

/*添加账户的路由*/
router.post('/add', function (req, res, next) {
    //后台接收到数据(解构)
    let {pass, username, region} = req.body;
    //console.log(pass,checkPass,username,region);

    //对密码进行加密
    pass = crypto.createHash('md5').update(pass).digest('hex');

    //执行sql语句
    //定义sql语句
    //let addSql = `insert into usertable(userName,userPwd,userGroup) values ("${username}","${pass}","${region}")`;
    let addSql = `insert into usertable(userName,userPwd,userGroup) values (?,?,?)`;
    //创建参数数组
    let addParamsArr  = [username,pass,region];
    connection.query(addSql,addParamsArr, function (error, results) {
        if (error) throw error;           //出错抛出错误信息

        /*
      {
        "fieldCount":0,
        "affectedRows":1, 返回收影响的行数，如果大于0就表示成功
        "insertId":1,
        "serverStatus":2,
        "warningCount":0,
        "message":"",
        "protocol41":true,
        "changedRows":0
      }
      */
        //返回结果到前端
        if (results.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "用户添加成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "用户添加失败" } );
        }
    });

});


//用户管理(用户列表)的路由
router.get("/list", (req, res) => {
    //接到前端请求，查询数据库
    //定义sql语句
    let userGetSql = `SELECT * FROM usertable order by u_id desc`;
    connection.query(userGetSql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        res.send(result);
    });
});


//删除用户的路由
router.get('/delete',(req,res) => {
    //接收前端传入的id
    let id= req.query.id;
    //console.log(id)

    //构造删除的sql语句
    let deleteSql = `delete FROM usertable  where u_id = ?`;
    //定义传入参数
    let deleteParmarsArr = [id];
    //数据库执行sql语句
    connection.query(deleteSql, deleteParmarsArr, function (err, result) {
        if (err) {
            console.log('删除失败 ', err.message);
            return;
        }
        if (result.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "用户删除成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "用户删除失败" } );
        }
    });

});


//修改用户
/*获取用户的路由*/
router.get('/getUserById', function (req, res, next) {
    //后台接收到用户的id
    let id = req.query.id;

    //执行sql语句
    //定义sql语句
    let getSql = `select * from usertable where u_id = ?`;
    //创建参数数组
    let getParamsArr  = [id];
    connection.query(getSql,getParamsArr, function (error, userDate) {
        if (error) throw error;           //出错抛出错误信息

        //返回结果到前端
        res.send(userDate);
    });
});


/*保存用户的路由*/
router.post('/save', function (req, res, next) {
    //后台接收到数据(解构)
    let {pass, username, region,u_id,oldPwd} = req.body;
    //console.log(pass,checkPass,username,region);

    //判断新密码和老密码是否相等，相等就不需要再次做加密
    if (pass !== oldPwd) {
        //对新密码进行加密
        pass = crypto.createHash('md5').update(pass).digest('hex');
    }

    //执行sql语句
    //定义sql语句
    let saveSql = `update usertable set userName=?,userPwd=?,userGroup=? where u_id=?`;
    //创建参数数组
    let saveParamsArr  = [username,pass,region,u_id];
    connection.query(saveSql,saveParamsArr, function (error, results) {
        if (error) throw error;           //出错抛出错误信息

        //返回结果到前端
        if (results.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "用户修改成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "用户修改失败" } );
        }
    });

});




//登录用户的路由
router.post("/login", (req, res) => {
     let {username, checkPass} = req.body;
     //对密码进行md5加密才能和后台数据相等
　　　checkPass = crypto.createHash("md5").update(checkPass).digest("hex");
    //接到前端请求，查询数据库
    //定义sql语句
    let userLoginSql = `SELECT u_id FROM usertable where userName = ? and userPwd = ? `;
    //定义sql参数数组
    let userLoginArr = [username, checkPass];
    connection.query(userLoginSql, userLoginArr, function (err, result) {
        if (err) throw err;
        //如果result是空数组说明用户名或者密码不正确，如果不是空数组说明用户合法
        if (result.length > 0) {
            //说明登录成功，就写入cookie
            res.cookie("username" ,username);       //写入用户名
            res.cookie("u_id" , result[0].u_id);    //写入u_id
            res.send({isOk:true,msg:"登录成功!"});
        } else {
            res.send({isOk:false,msg:"登录失败!,用户名或密码错误"});
        }
    });
});


//退出登录的路由
router.get('/loginOut', (req, res) => {
    //退出就销毁(清除)cookie
    res.clearCookie("username");
    res.clearCookie("u_id");
    //跳转到登录页面 (重定向)
    res.redirect("/login.html");
});



//验证身份是否合法的路由   有cookie合法，没有cookie不合法
router.get('/checkState', (req, res) => {
    //读取cookie
    let username = req.cookies.username;

    //判断username是否存在，不存在就就跳转到登录页面
    if (!username) {
        //不存在
        res.send("alert('还未登录，请先登录!'); location.href = 'login.html'; ");
    } else {
        //存在也必须返回一个内容，否则会一直挂起
        res.send("");
    }
});




module.exports = router;
