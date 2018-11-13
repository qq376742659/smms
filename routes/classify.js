var express = require('express');
var router = express.Router();

//引入链接数据库模块
var connection = require('./connectMySql');

/*添加分类的路由*/
router.post('/add', function (req, res, next) {
    //后台接收到数据(解构)
    let {cg_fatherID, cg_name, cg_isLocked} = req.body;
    //console.log(cg_fatherID,cg_name,cg_isLocked);

    //执行sql语句
    //定义sql语句
    let addSql = `insert into categorygoods(cg_name,cg_fatherID,cg_isLocked) values (?,?,?)`;
    //创建参数数组
    let addParamsArr  = [cg_name,cg_fatherID,cg_isLocked];
    connection.query(addSql,addParamsArr, function (error, results) {
        if (error) throw error;           //出错抛出错误信息

        //返回结果到前端
        //"affectedRows":1, 返回收影响的行数，如果大于0就表示成功
        if (results.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "分类添加成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "分类添加失败" } );
        }
    });

});


//获取商品分类的路由
router.get("/getClassify", (req, res) => {
    //接到前端请求，查询数据库
    //定义sql语句
    let userGetSql = `select t1.*,t2.cg_name as cg_fatherName FROM categorygoods as t1 LEFT JOIN categorygoods as t2 on t1.cg_fatherID=t2.cg_id`;
    connection.query(userGetSql, function (err, result) {
        if (err) throw  err;
        res.send(result);
    });
});


//删除分类的路由
router.get('/delete',(req,res) => {
    //接收前端传入的id
    let id= req.query.id;
    //console.log(id)

    //构造删除的sql语句
    let deleteSql = `delete FROM categorygoods  where cg_id = ?`;
    //定义传入参数
    let deleteParmarsArr = [id];
    //数据库执行sql语句
    connection.query(deleteSql, deleteParmarsArr, function (err, result) {
        if (err) {
            console.log('删除失败 ', err.message);
            return;
        }
        if (result.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "分类删除成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "分类删除失败" } );
        }
    });

});


//修改分类
/*获取分类的路由*/
router.get('/getClassifyById', function (req, res, next) {
    //后台接收到用户的id
    let id = req.query.id;

    //执行sql语句
    //定义sql语句
    let getSql = `select * from categorygoods where cg_id = ?`;
    //创建参数数组
    let getParamsArr  = [id];
    connection.query(getSql,getParamsArr, function (error, result) {
        if (error) throw error;           //出错抛出错误信息

        //返回结果到前端
        res.send(result);
    });
});


/*保存分类的路由*/
router.post('/save', function (req, res, next) {
    //后台接收到数据(解构)
    let {cg_fatherID, cg_name, cg_isLocked,cg_id} = req.body;
    console.log(cg_fatherID, cg_name, cg_isLocked,cg_id);

    //执行sql语句
    //定义sql语句
    let saveSql = `update categorygoods set cg_name=?,cg_fatherID=?,cg_isLocked=? where cg_id=?`;
    //创建参数数组
    let saveParamsArr  = [cg_name, cg_fatherID, cg_isLocked,cg_id];
    connection.query(saveSql,saveParamsArr, function (error, results) {
        if (error) throw error;           //出错抛出错误信息

        //返回结果到前端
        if (results.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "分类修改成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "分类修改失败" } );
        }
    });

});



module.exports = router;
