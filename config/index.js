import mysql from "mysql";

//* creating the connection to database here 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myClinic',
    port: '8080'
})

export default db