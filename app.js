const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))

var oracledb = require('oracledb');

function getConnection(callback) {
    oracledb.getConnection(
      {
        user          : "allen",
        password      : "password",
        connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)\
        (HOST=whats4lunch.cvvc4g5pnndo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)\
        (SERVICE_NAME=orcl)))"
      }, callback) // callback(err, connection)
}

function releaseConnection(connection) {
      connection.close(
        function(err) {
          if (err)
            console.error(err.message);
        });
}

// follow this model to execute whatever sql queries
function createTables(err, connection) {
    if (err) {
      console.error(err.message);
      return;
    }
    connection.execute(
      `SELECT manager_id, department_id, department_name
       FROM departments
       WHERE manager_id = :id`,
      [103],  // bind value for :id
      function(err, result) {
        if (err) {
          console.error(err.message);
          releaseConnection(connection);
          return;
        }
        console.log(result.rows);
        releaseConnection(connection);
    });
}

getConnection(createTables)