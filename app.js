//entry file for the express app

//using express to communicate with the
//postgreSQL DB


var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
const {check, validationResult }= require("express-validator/check");

var app = express();

//postgre connection
const { Pool } = require('pg');//postgre module

const pool = new Pool({//make login
user: 'xav',
host: '127.0.0.1',
database: 'xav',
password: 'xavier',
port: '5432'
});

/*

---middle ware
var logger=function(req,res,next)
{
  console.log('Logging...');
  next();
}
app.use(logger);
*/
//view engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended":false}));

//set static path
app.use(express.static(path.join(__dirname,'public')))

//Global Vars - middleware
app.use(function(req,res,next)
{
  res.locals.errors=null;
  next();
});

//expressValidator middleware
/*
var users=[
  {
    id:"1",
    fname:"Kev",
    lname:"G",
    email:"gmail.com"
  },
  {
    id:"2",
    fname:"SAM",
    lname:"P",
    email:"lol@lol.com"
  },
  {
    id:"3",
    fname:"Eric",
    lname:"B",
    email:"jaja@jaja.com"
  }
];
*/

app.get('/',function(req,resp){
  //res.send('HELLO');
  var users=[];

  pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }

  client.query('SELECT * FROM test', (err, res) => {
    release()//erase current client

    if (err) {
      return console.error('Error executing query', err.stack)
    }

    for(var i=0;i<res.rows.length;i++)
    {
      //console.log(res.rows);
      users.push({id:res.rows[i].id,fname:res.rows[i].name,phone:res.rows[i].phone});
    }
    resp.render('index',{title:"Customers",users:users});//render html index.js
    });
  });

});

//capture form submission
app.post("/addUser",function(req,resp)
{
  /*
  check('email').isEmail()//validator example
  const errs = validationResult(req);
  if(errs)
    {
      console.log("ERROR FOUND");
    }
  */
  var errors='';
  //console.log("User "+req.body.fname+" "+ req.body.lname+" was added");
  if (req.body.fname.length<5)
    {
      errors="Name not big enough";
       resp.render('index',{title:"Customers",errors:errors});
    }
  else
    {
      var user=
        {
          fname:req.body.fname,
          lname:req.body.lname,
          email:req.body.email
        };


      pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }

      client.query('INSERT INTO test (name,phone)VALUES($1,$2)',[user.fname,user.lname], (err, res) => {
        release();//erase current client

        if (err) {
          return console.error('Error executing query', err.stack)
        }
          resp.redirect('/');//back to home page .,.,.,. re-render database

          //resp.render('index',{title:"Customers"});//render html index.js
          //^^ can't render with no 'users' car ..... > wrong way
        });
      });
    }
});

app.post("/delete",function(req,resp){
  {
    //console.log(req.body);

    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }//if connection err

      client.query("DELETE FROM test WHERE id=$1",[req.body.id], (err, res) => {
      release();//erase current client

        if (err) {return console.error('Error executing query', err.stack)}

          //resp.render('index',{title:"Customers"});//render html index.js
          //^^ can't render with no 'users' car ..... > wrong way
        });
      resp.redirect('back');//force the view to refresh ... ".redirect('/')" did not work??
    });
  }

});

app.listen(3000,function()
          {
console.log("Server started on localhost:3000");
});
