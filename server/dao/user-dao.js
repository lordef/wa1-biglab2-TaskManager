'use strict';
const sqlite = require("sqlite3");

const db = new sqlite.Database('tasks.db', (err) => { if (err) throw err; });
const bcrypt = require('bcrypt');


// DAO operations for validating users

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err)
        reject(err); // DB error
      else if (row === undefined)
        resolve(false); // user not found
      else {
        bcrypt.compare(password, row.hash).then(result => {
          if (result) // password matches
            resolve({ id: row.id, email: row.email, name: row.name });
          else
            resolve(false); // password not matching
        })
      }
    });
  });
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
        const user = { id: row.id, username: row.email, name: row.name }
        resolve(user);
      }
    });
  });
};