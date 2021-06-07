import { Task } from "./models/Task";

// const url = 'http://localhost:3000';
const url = '';

async function loadTaskList() {
    let taskList = [];    /* Creation of a list of Task for storing data from server */
    // call GET /api/tasks
    const response = await fetch(url + '/api/tasks');
    let tasksJson = await response.json();
    if (response.ok) {
        tasksJson.forEach(t => {
            taskList = [...taskList, new Task(t.id, t.description, t.important == 1, t.private == 1, t.deadline, t.completed)];
        });
        return taskList;
    } else
        throw tasksJson;

}

async function filterOnTasklist(filter) {
    let taskList = [];    /* Creation of a list of Task for storing data from server */
    // call GET /api/tasks/:filter
    const response = await fetch(url + '/api/tasks/' + filter);
    let tasksJson = await response.json();
    if (response.ok) {
        tasksJson.forEach(t => {
            taskList = [...taskList, new Task(t.id, t.description, t.important == 1, t.private == 1, t.deadline, t.completed)];
        });
        return taskList;
    } else
        throw tasksJson;

}

async function addToTaskList(newTask) {
    fetch(url + '/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(newTask),
    })
        .catch(() => { return ({ error: "Cannot communicate with the server." }) }); // connection errors
}

/*For testing web application behaviour on server delays*/
async function addToTaskListSlow(newTask) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            let result = await addToTaskList(newTask);
            resolve(result);
        }, 15000)
    });
}

async function removeFromTaskList(id) {
    fetch(url + '/api/tasks/' + id + '', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', },
        body: null
    })
        .catch(() => { return ({ error: "Cannot communicate with the server." }) }); // connection errors

}

async function editTaskFromTaskList(task) {
    fetch(url + '/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(task),
    })
        .catch(() => { return ({ error: "Cannot communicate with the server." }) }); // connection errors

}

async function updateCompleted(id, completed) {

    fetch('/api/tasks/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(completed),
    })
        .catch(() => { return ({ error: "Cannot communicate with the server." }) }); // connection errors
}

/*USER APIs*/

async function logIn(credentials) {
    let response = await fetch(url + '/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user.name;
    }
    else {
        try {
            const errDetail = await response.json();
            throw errDetail.message;
        }
        catch (err) {
            throw err;
        }
    }
}

async function logOut() {
    await fetch(url + '/api/sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
    const response = await fetch(url + '/api/sessions/current');
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}


const API = { loadTaskList, addToTaskList, addToTaskListSlow, removeFromTaskList, editTaskFromTaskList, updateCompleted, filterOnTasklist, logIn, logOut, getUserInfo }
export default API;

