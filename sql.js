

var express = require('express');
var mysql = require('.dbconn.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6719);

//create a table
app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS todo", function(err){
      var createString = "CREATE TABLE todo(" +
      "id INT PRIMARY KEY AUTO_INCREMENT," +
      "name VARCHAR(255) NOT NULL," +
      "done BOOLEAN," +
      "due DATE)";
      mysql.pool.query(createString, function(err){
        context.results = "Table reset";
        res.render('home',context);
      })
    });
  });

//insert data
  app.get('/insert',function(req,res,next){
    var context = {};
    mysql.pool.query("INSERT INTO todo (`name`) VALUES (?)", [req.query.c], function(err, result){
      if(err){
        next(err);
        return;
      }
      context.results = "Inserted id " + result.insertId;
      res.render('home',context);
    });
  });

//select data
app.get('/',function(req,res,next){
    var context = {};
    mysql.pool.query('SELECT * FROM todo', function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.render('home', context);
    });
  });


  //update data
  app.get('/simple-update',function(req,res,next){
    var context = {};
    mysql.pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
      [req.query.name, req.query.done, req.query.due, req.query.id],
      function(err, result){
      if(err){
        next(err);
        return;
      }
      context.results = "Updated " + result.changedRows + " rows.";
      res.render('home',context);
    });
  });

  // delete data
  //Deleting:  It requires a callback with two arguments, just like update, 
  //and that can let you know how many rows were deleted.