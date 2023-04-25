const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;
const intializerAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.log(`db server error ${error.message}`);
    express.exit(1);
  }
  app.listen(3000, () => {
    console.log("server starts at http://localhost:3000");
  });
};

intializerAndServer();
module.exports = app;

const statusProperty = (query) => {
  return query.status !== undefined;
};

const priorityProperty = (query) => {
  return query.priority !== undefined;
};

const categoryProperty = (query) => {
  return query.category !== undefined;
};

const PropertydueDate = (query) => {
  return query.dueDate !== undefined;
};

const PropertyofPriorityandStatus = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};

const PropertyofCategoryandpriority = (query) => {
  return query.category !== undefined && query.priority !== undefined;
};

const PropertyofCategoryandStatus = (query) => {
  return query.category !== undefined && query.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  const {
    id,
    search_q = "",
    priority,
    status,
    category,
    dueDate,
  } = request.query;
  let getTodoQuery = "";

  switch (true) {
    case statusProperty(request.query):
      getTodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where todo like '%${search_q}%' and status = '${status}'`;
      data = await db.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(data);
      }
      break;
    case priorityProperty(request.query):
      getTodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where todo like '%${search_q}%' and priority = '${priority}'`;
      data = await db.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.send(data);
      }
      break;
    case categoryProperty(request.query):
      getTodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where todo like '%${search_q}%' and category = '${category}'`;
      data = await db.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        response.send(data);
      }
      break;
    case PropertyofPriorityandStatus(request.query):
      getTodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where todo like '%${search_q}%' and status = '${status}' and priority = '${priority}'`;
      data = await db.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(data);
      }
      break;
    case PropertyofCategoryandpriority(request.query):
      getTodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where todo like '%${search_q}%' and category = '${category}' and priority = '${priority}'`;
      data = await db.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        response.send(data);
      }
      break;
    case PropertyofCategoryandStatus(request.query):
      getTodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where todo like '%${search_q}%' and status = '${status}' and category = '${category}'`;
      data = await db.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.send(data);
      }
      break;

    default:
      getTodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where todo like '%${search_q}%'`;
      data = await db.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send("Invalid Todo Search_q");
      } else {
        response.send(data);
      }
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where id = ${todoId} `;
  const getDetails = await db.get(gettodoQuery);
  response.send(getDetails);
});

app.get("/agenda/", async (request, response) => {
  const { dueDate } = request.query;
  const gettodoQuery = `select id,todo,priority,category,status,due_date as dueDate from todo where due_date like ${dueDate}`;
  const getDetails = await db.get(gettodoQuery);
  response.send(getDetails);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, category, status, dueDate } = request.body;
  const postDetails = ` insert into todo(id,todo,priority,category,status,due_date) values(${id},'${todo}','${priority}','${category}','${status}',${dueDate})`;
  const getting_postdetails = await db.run(postDetails);
  const todoId = getting_postdetails.lostID;
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let requestColumn = "";
  switch (true) {
    case request.body.status !== undefined:
      requestColumn = "Status";
      break;
    case request.body.priority !== undefined:
      requestColumn = "Priority";
      break;
    case request.body.category !== undefined:
      requestColumn = "Category";
      break;
    case request.body.todo !== undefined:
      requestColumn = "Todo";
      break;
    case request.body.dueDate !== undefined:
      requestColumn = "Due Date";
      break;
  }
  const gettodoQuery = `select * from todo where id = ${todoId}`;
  const getDetails = await db.get(gettodoQuery);

  const {
    todo = getDetails.todo,
    status = getDetails.status,
    priority = getDetails.priority,
    category = getDetails.category,
    dueDate = getDetails.dueDate,
  } = request.body;
  const upadateQuery = `update todo set todo = '${todo}', status = '${status}', priority = '${priority}',category = '${category}',due_date = '${dueDate}' where id = ${todoId}`;
  const updatedDetails = await db.run(upadateQuery);
  if (updatedDetails.length === 0) {
    response.status(400);
    response.send(`Invalid Todo ${requestColumn}`);
  } else {
    response.send(`${requestColumn} Updated`);
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const delete_query = `select * from todo where id = ${todoId}`;
  await db.run(delete_query);
  response.send("Todo Deleted");
});
