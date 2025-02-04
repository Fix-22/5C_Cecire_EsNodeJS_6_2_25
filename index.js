/*
    TODO list database (back-end) - Cecire
*/

const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');

const conf = JSON.parse(fs.readFileSync('conf.json'));
const connection = mysql.createConnection(conf);

const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {      
        connection.query(sql, function (err, result) {
           if (err) {
              console.error(err);
              reject();     
           }   
           console.log('done');
           resolve(result);         
     });
  })
};

const createTable = () => {
  return executeQuery(`
  CREATE TABLE IF NOT EXISTS todos
     ( id INT PRIMARY KEY AUTO_INCREMENT, 
        name VARCHAR(255) NOT NULL, 
        done BOOLEAN ) 
     `);      
};

const insert = (todo) => {
  const template = `
  INSERT INTO todos (name, done) VALUES ('$NAME', '$DONE')
     `;
  let sql = template.replace("$NAME", todo.name).replace("$DONE", todo.completed);
  return executeQuery(sql); 
};

const select = () => {
  const sql = `
  SELECT id, name, done FROM todos
     `;
  return executeQuery(sql); 
};

createTable().then(() => {
  insert({name: "test " + new Date().getTime(), completed: false}).then((result) => {
     select().then(console.log);
  });
});

const app = express();

let todos = [];

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/"))
);

app.use("/", express.static(path.join(__dirname, "public")));

app.post("/todo/add", (req, res) => {
  const todo = req.body;
  todo.id = "" + new Date().getTime();
  todos.push(todo);

  res.json({result: "Ok"});
});

app.get("/todo", (req, res) => {
  res.json({todos: todos});
});

app.put("/todo/change", (req, res) => { // cambia lo stato nel caso si volgia riassegnare l'attività
  const todo = req.body;

  try {
    todos.forEach((element) => {
      if (element.id === todo.id) {
        element.done = !element.done;
      }
    });
  }
  catch (e) {
    console.log(e);
  }

  res.json({result: "Ok"});
});

app.delete("/todo/:id", (req, res) => {
  todos = todos.filter((element) => element.id !== req.params.id);

  res.json({result: "Ok"});  
});

const server = http.createServer(app);

server.listen(80, () => console.log("Server running..."));