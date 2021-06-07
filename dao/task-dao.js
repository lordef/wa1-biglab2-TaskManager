'use strict';

/*
DB STRUCTURE
CREATE TABLE tasks (
    id          INTEGER  PRIMARY KEY,
    description TEXT     NOT NULL,
    urgent      BOOLEAN  DEFAULT (0) NOT NULL,
    private     BOOLEAN  DEFAULT (1) NOT NULL,
    deadline    DATETIME
);
DATETIME FORMAT IS AS ISO 8601: 2018-04-04T16:00:00.000Z
*/

const sqlite = require("sqlite3");
const dayjs = require("dayjs");


// i18n and locale
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(localizedFormat); // use shortcuts 'LLL' for date and time format
/*
const locale_it = require('dayjs/locale/it');
dayjs.locale('it');
*/

function Task(id, description, isImportant = false, isPrivate = true, deadline = '', isCompleted = false) {
  this.id = id;
  this.description = description;
  this.important = isImportant;
  this.private = isPrivate;
  this.completed = isCompleted;
  // saved as dayjs object
  this.deadline = deadline && dayjs(deadline);

  // dayjs().toString() prints GMT
  // LLL	stands for MMMM D, YYYY h:mm A see https://day.js.org/docs/en/display/format

  this.toString = () => {
    return `Id: ${this.id}, ` +
      `Description: ${this.description}, Important: ${this.important}, Private: ${this.private}, ` +
      `Deadline: ${this._formatDeadline('LLL') + `Completed: ${this.completed}`}`;
  }

  this._formatDeadline = (format) => {
    return this.deadline ? this.deadline.format(format) : '<not defined>';
  }
}



const db = new sqlite.Database('tasks.db', (err) => { if (err) throw err; });


exports.getAll = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tasks WHERE user = ?';
    db.all(sql, [userId], (err, rows) => {
      if (err)
        reject(err);
      else {
        const tasks = rows.map(record => new Task(record.id, record.description, record.important == 1, record.private == 1, record.deadline, record.completed));
        resolve(tasks);
      }
    });
  });
};


exports.getByFilter = (userId, filter) => {
  return new Promise((resolve, reject) => {
    let condition, value, sql, upper;
    /* Each case is referring to the list of sidebarTitles
         const sidebarTitles = ["All", "Important", "Today", "Next 7 Days", "Private"]; */
    switch (filter) {
      case 'Important':
        condition = 'important';
        value = 1;
        break;
      case 'Private':
        condition = 'private';
        value = 1;
        break;
      case 'Today':
        condition = 'deadline';
        value = dayjs().format('YYYY-MM-DD');
        //value = "2021-04-14 08:30" ;
        break;
      case 'Next 7 Days':
        condition = 'deadline';
        value = dayjs().format('YYYY-MM-DD HH:mm');
        upper = dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm');
        break;
      default:
        break;
    }

    if (filter === 'Next 7 Days') {
      sql = 'SELECT * FROM tasks WHERE user = ? AND ' + condition + ' > ? AND ' + condition + ' <= ?';
      db.all(sql, [userId, value, upper], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        else {
          const tasks = rows.map(record => new Task(record.id, record.description, record.important == 1, record.private == 1, record.deadline, record.completed));
          resolve(tasks);
        }
      });
    } else if (filter === 'All') {
      sql = 'SELECT * FROM tasks WHERE user = ?';
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        else {
          const tasks = rows.map(record => new Task(record.id, record.description, record.important == 1, record.private == 1, record.deadline, record.completed));
          resolve(tasks);
        }
      });
    } else {
      sql = 'SELECT * FROM tasks WHERE user = ? AND ' + condition + ' LIKE ?';
      db.all(sql, [userId, "%" + value + "%"], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        else {
          const tasks = rows.map(record => new Task(record.id, record.description, record.important == 1, record.private == 1, record.deadline, record.completed));
          resolve(tasks);
        }
      });
    }

  });
};


exports.getById = (userId, id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tasks WHERE user = ? AND id = ?';
    db.get(sql, [userId, id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      else {
        const task = { id: row.id, description: row.description, important: row.important, private: row.private, deadline: row.deadline, completed: row.completed };
        resolve(task);
      }
    });
  });
};



exports.createTask = (userId, task) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tasks(description, important, private, deadline, completed, user) VALUES(?,?,?,?,?,?)`;
    db.run(sql, [task.description, task.important, task.private, task.deadline, task.completed, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};



exports.updateTask = (userId, task) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tasks SET description=?, important=?, private=?, deadline=?, completed=? WHERE user = ? AND id = ? ';
    db.run(sql, [task.description, task.important, task.private, task.deadline, task.completed, userId, task.id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(task.id);
    });
  });
};



exports.updateTaskCompleted = (userId, id, completed) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE tasks SET completed=? WHERE user = ? AND id = ?';
    db.run(sql, [completed, userId, id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(id);
    });
  });
};



exports.deleteTask = (userId, id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM tasks WHERE user = ? AND id = ?';
    db.run(sql, [userId, id], (err) => {
      if (err) {
        reject(err);
        return;
      } else
        resolve("Done task Deletion");
    });
  });
}



exports.getAfterDeadline = (deadline) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tasks WHERE deadline > ?';
    db.all(sql, [deadline.format()], (err, rows) => {
      if (err)
        reject(err);
      else {
        const tasks = rows.map(record => new Task(record.id, record.description, record.important == 1, record.private == 1, record.deadline, record.completed));
        resolve(tasks);
      }
    });
  });
};



exports.getWithWord = (word) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM tasks WHERE description LIKE ?";
    db.all(sql, ["%" + word + "%"], (err, rows) => {
      if (err)
        reject(err);
      else {
        const tasks = rows.map(record => new Task(record.id, record.description, record.important == 1, record.private == 1, record.deadline, record.completed));
        resolve(tasks);
      }
    });
  });
};



