const mysql = require('mysql');

const sqlConnection = (sql, values, next) => {

    if (arguments.length === 2) {
        next = values;
        values = null;
    }

    const connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT
    });

    connection.connect((err) => {
        if (err) console.log("[MYSQL] Error connecting to mysql:" + err + '\n');
    });

    connection.query(sql, values, (err) => {
        connection.end();

        if (err) throw err;

        next.apply(this, arguments);
    });

    connection.end();
};

module.exports = sqlConnection;

//Module built with help from https://stackoverflow.com/questions/30545749/how-to-provide-a-mysql-database-connection-in-single-file-in-nodejs

//EXAMPLE
//mysql_query('SELECT * from your_table where ?', {id: '1'}, (err, rows) => {console.log(rows);});