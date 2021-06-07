'use strict';

const path = require('path');
const PORT = process.env.PORT || 3001;

const express = require('express');
const app = new express();
const morgan = require('morgan');  // logging middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // session middleware
const dao = require('./dao/task-dao'); // module for accessing the DB
const userDao = require('./dao/user-dao'); // module for accessing the users in the DB


app.use(morgan('dev'));
app.use(express.json()); // parse the body in JSON format => populate req.body attributes 
app.use(express.static("./client/build"));


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy((username, password, done) => {
    // verification callback for authentication
    userDao.getUser(username, password).then(user => {
        if (user)
            return done(null, user);
        else
            return done(null, false, { message: 'Incorrect username  and/or  password' });
    }).catch(err => {
        return done(err);
    });
}));


// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    userDao.getUserById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
            done(err, null);
        });
});



// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());



/*** TaskList APIs ***/

//Retrieve the list of all the available task
app.get('/api/tasks', isLoggedIn, (req, res) => {

    dao.getAll(req.user.id)
        .then((tasks) => { res.json(tasks); })
        .catch((error) => { res.status(500).json(error); });

});

//Retrieve a list of all the tasks that fulfill a given filter
app.get('/api/tasks/:filter', isLoggedIn, (req, res) => {

    const filter = req.params.filter;
    //let value = req.query.value;

    dao.getByFilter(req.user.id, filter)
        .then((tasks) => { res.json(tasks); })
        .catch((error) => { res.status(500).json(error); });
});


//Retrieve a task given its id
app.get('/api/tasks/:id', isLoggedIn, async (req, res) => {

    const id = req.params.id;

    try {
        let task = await dao.getById(req.user.id, id);
        res.json(task);
    } catch (error) {
        res.status(500).json(error);
    }

});


//Create a new Task
app.post('/api/tasks', isLoggedIn, async (req, res) => {

    let description = req.body.description;
    let important = req.body.important;
    let isPrivate = req.body.private;
    let deadline = req.body.deadline;
    let completed = req.body.completed;
    let user = req.user.id;

    try {
        let retId = await dao.createTask(req.user.id, { description: description, important: important, private: isPrivate, deadline: deadline, completed: completed, user: user });
        res.json(`New task's id: ` + retId);
    } catch (error) {
        res.status(500).json(error);
    }
});


//Update existing Task
app.put('/api/tasks', isLoggedIn, async (req, res) => {

    let id = req.body.id;
    let deadline = req.body.deadline;
    let description = req.body.description;
    let important = req.body.important;
    let isPrivate = req.body.private;
    let completed = req.body.completed;
    let user = req.user.id;

    try {
        let retId = await dao.updateTask(req.user.id, { id: id, description: description, important: important, private: isPrivate, deadline: deadline, completed: completed, user: user });
        res.json(`Updated task with id: ` + retId);

    } catch (error) {
        res.status(500).json(error);
    }
});


//Mark an existing task as completed/uncompleted
app.put('/api/tasks/:id', isLoggedIn, async (req, res) => {

    let completed = req.body.completed;
    let id = req.params.id;

    try {
        let retId = await dao.updateTaskCompleted(req.user.id, id, completed);
        res.json(`Marked task with id: ` + retId);
    } catch (error) {
        res.status(500).json(error);
    }
});


//Delete an existing task
app.delete('/api/tasks/:id', isLoggedIn, async (req, res) => {

    let id = req.params.id;

    try {
        let retText = await dao.deleteTask(req.user.id, id);
        res.json(retText);
    } catch (error) {
        res.status(500).json(error);
    }
});

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});

// ALTERNATIVE: if we are not interested in sending error messages...
/*
app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});
*/

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
    req.logout();
    res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    }
    else
        res.status(401).json({ error: 'Unauthenticated user!' });;
});



/* Endpoint to declare that any request that does not match any other endpoints send back the client React application index.html file */
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));