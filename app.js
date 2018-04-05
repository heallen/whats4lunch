const express = require('express')
const app = express()


var oracledb = require('oracledb');

function init(){
    oracledb.createPool(
        {
        user          : "allen",
        password      : "password",
        connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)\
        (HOST=whats4lunch.cvvc4g5pnndo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)\
        (SERVICE_NAME=orcl)))"
      }, function(err, pool){
        if (err) {
          console.error(err.message);
          return;
        }
        app.listen(3000, () => console.log('Example app listening on port 3000!'))
        app.get('/', (req, res) => mainPage(req, res, pool))
      }
    )
}

function mainPage(req, res, pool) {
    getConnection(pool, createTables)
    res.send('Hellow world!')
}

//call this function with the function callback(connection), and do whatever with that connection
function getConnection(pool, callback) {
    pool.getConnection(
        function(err, connection) {
            if (err) {
              console.error(err.message);
              return;
            } 
            //perform action with connection then close it
            callback(connection, function(){
                connection.close(
                    function(err) {
                      if (err)
                        console.error(err.message);
                    }
                );
            });
          }
    )
}

// follow this model to execute whatever sql queries
function createTables(connection) {
    connection.execute(
      `SELECT manager_id, department_id, department_name
       FROM departments
       WHERE manager_id = :id`,
      [103],  // bind value for :id
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result.rows);
    });
}

init()