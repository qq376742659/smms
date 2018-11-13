var express = require('express');
var router = express.Router();

//引入链接数据库模块
var connection = require('./connectMySql');

/*添加商品的路由*/
router.post('/add', function (req, res, next) {
    //后台接收到数据(解构)
    let {cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, discount, promotion, goodsDetails} = req.body;
    //console.log(cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, discount, promotion, goodsDetails);

    //执行sql语句
    //定义sql语句
    let addSql = `insert into goodstable(cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, discount, promotion, goodsDetails) values (?,?,?,?,?,?,?,?,?,?,?,?)`;
    //创建参数数组
    let addParamsArr  = [cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, discount, promotion, goodsDetails];
    connection.query(addSql,addParamsArr, function (error, results) {
        if (error) throw error;           //出错抛出错误信息

        //返回结果到前端
        //"affectedRows":1, 返回收影响的行数，如果大于0就表示成功
        if (results.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "商品添加成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "商品添加失败" } );
        }
    });

});


//获取商品的路由
router.get("/getSearchList", (req, res) => {
    //接到前端请求的数据库，解构，查询数据库
    let {currentPage, pageSize, keyWords, classify} = req.query;
    //定义sql语句
    let goodsGetSql = `select t1.*,t2.cg_name FROM goodstable as t1 LEFT JOIN categorygoods as t2 on t1.cg_id=t2.cg_id where 1=1`;
    //执行全表查询
    connection.query(goodsGetSql, function (err, result) {
        if (err) throw  err;
        let total = result.length;      //得到总条数

        //  ----------查询部分---------------

        if(keyWords.length>0){
            goodsGetSql+=` and (t1.barcode like '%${keyWords}%' or t1.goodsname like '%${keyWords}%')`;
        }

        //分类
        if(classify.length>0){
            goodsGetSql+=` and t1.cg_id=${classify}`;
        }

        //执行查询的sql结果
        if(keyWords.length>0 || classify.length>0){
            connection.query(goodsGetSql,(err,searchList)=>{
                if(err) throw err;
                //res.send(searchList); //查询的结果
                //修改原来的总记录为查询后的记录数
                total=searchList.length;
            });
        }


        //  ----------分页部分---------------


        //定义参数数组
        // let skip = (currentPage - 1)*pageSize;    //要跳过的条数    =(当前页 - 1 ) * 一页的条数
        // let paramsSql = [skip, parseInt(pageSize)];
        // //定义分页的sql语句
        //goodsGetSql += "limit ?,?";

        let skip=(currentPage - 1)*pageSize; //跳过的条数
        let paramsSql=[skip,parseInt(pageSize)];
        goodsGetSql+=" limit ?,?";


        //执行当前页码应该显示的条数的sql语句
        connection.query(goodsGetSql,paramsSql,(err,result)=>{
            if(err) throw err;
            res.send({"total":total,"dataList":result});
        });


    });

});


//删除分类的路由
router.get('/delete',(req,res) => {
    //接收前端传入的id
    let id= req.query.id;
    //console.log(id)

    //构造删除的sql语句
    let deleteSql = `delete FROM goodstable  where good_id = ?`;
    //定义传入参数
    let deleteParmarsArr = [id];
    //数据库执行sql语句
    connection.query(deleteSql, deleteParmarsArr, function (err, result) {
        if (err) {
            console.log('删除失败 ', err.message);
            return;
        }
        if (result.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "商品删除成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "商品删除失败" } );
        }
    });

});


//修改分类
/*获取分类的路由*/
router.get('/getGoodsById', function (req, res, next) {
    //后台接收到用户的id
    let id = req.query.id;

    //执行sql语句
    //定义sql语句
    let getSql = `select * from goodstable where good_id = ?`;
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
    let {cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, discount, promotion, goodsDetails,good_id} = req.body;
    //console.log(cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, discount, promotion, goodsDetails);

    //执行sql语句
    //定义sql语句
    let saveSql = `update goodstable set cg_id=?,barcode=?,goodsname=?,goodsprice=?,marketprice=?,saleprice=?,stockNum=?,weigth=?,unit=?,discount=?,promotion=?,goodsDetails=? where good_id=?`;
    //创建参数数组
    let saveParamsArr  = [cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, discount, promotion, goodsDetails,good_id];
    connection.query(saveSql,saveParamsArr, function (error, results) {
        if (error) throw error;           //出错抛出错误信息

        //返回结果到前端
        if (results.affectedRows > 0) {
            res.send( { "isOk" : true , "msg" : "商品修改成功" } );
        } else {
            res.send( { "isOk" : false , "msg" : "商品修改失败" } );
        }
    });

});



module.exports = router;
