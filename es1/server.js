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
conf.ssl.ca = fs.readFileSync(__dirname + "/ca.pem");
const connection = mysql.createConnection(conf);

const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {      
        connection.query(sql, function (err, result) {
           if (err) {
              console.error(err);
              reject();     
           }
           resolve(result);         
     });
  })
};

const createTable = () => {
  return executeQuery(`
  CREATE TABLE IF NOT EXISTS todo
     ( id INT PRIMARY KEY AUTO_INCREMENT, 
        task VARCHAR(255) NOT NULL, 
        done BOOLEAN ) 
     `);      
};

const insert = (todo) => {
  const template = `
  INSERT INTO todo (task, done) VALUES ('$TASK', '$DONE')
     `;
  let sql = template.replace("$TASK", todo.task).replace("$DONE", todo.done);
  return executeQuery(sql); 
};

const select = () => {
  const sql = `
  SELECT id, task, done FROM todo
     `;
  return executeQuery(sql); 
};

const update = (todo) => {
  const template = `
  UPDATE todo
  SET done=$DONE
  WHERE id=$ID;
     `;
  let sql = template.replace("$ID", todo.id).replace("$DONE", todo.done);
  return executeQuery(sql); 
}

const deleteTodo = (id) => {
  return executeQuery("DELETE FROM todo WHERE id=" + id + ";")
}

const app = express();

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
  todo.done = Number(todo.done);

  insert(todo).then(() => {
    res.json({result: "Ok"});
  });
});

app.get("/todo", (req, res) => {
  select().then(todos => res.json({todos: todos}));
});

app.put("/todo/change", (req, res) => { // cambia lo stato nel caso si volgia riassegnare l'attività
  const todo = req.body;
  todo.done = Number(!Boolean(todo.done));

  update(todo).then(() => {
    res.json({result: "Ok"});
  });
});

app.delete("/todo/:id", (req, res) => {
  deleteTodo(req.params.id).then(() => {
    res.json({result: "Ok"});
  });
});

const server = http.createServer(app);

server.listen(80, () => console.log("Server running..."));