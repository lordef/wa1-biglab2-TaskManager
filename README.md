# BigLab 2 - Class: 2021 WA1

## Team name: Cobrakai

## Instructions

A general description of the BigLab 2 is avaible in the `course-materials` repository, [under _labs_](https://github.com/polito-WA1-AW1-2021/course-materials/tree/main/labs/BigLab2/BigLab2.pdf). In the same repository, you can find the [instructions for GitHub Classroom](https://github.com/polito-WA1-AW1-2021/course-materials/tree/main/labs/GH-Classroom-BigLab-Instructions.pdf), covering this and the next BigLab.

Once cloned this repository, instead, write your names in the above section.

When committing on this repository, please, do **NOT** commit the `node_modules` directory, so that it is not pushed to GitHub.
This should be already automatically excluded from the `.gitignore` file, but double-check.

When another member of the team pulls the updated project from the repository, remember to run `npm install` in the project directory to recreate all the Node.js dependencies locally, in the `node_modules` folder.

Finally, remember to add the `final` tag for the final submission, otherwise it will not be graded.

The project will need to execute correctly with the following commands:
1. for the back-end: “cd server; nodemon server.js;”
2. for the front-end: “cd client; npm start;”


## Credentials

- email: first@polito.it
- password: firstStudent
---------------------------
- email: second@polito.it
- password: secondStudent
---------------------------
- email: third@polito.it
- password: thirdStudent
---------------------------
- email: fourth@polito.it
- password: fourthStudent
---------------------------

## List of APIs offered by the server

Provide a short description for API with the required parameters, follow the proposed structure.

* [HTTP Method] [URL, with any parameter]
* [One-line about what this API is doing]
* [Sample request, with body (if any)]
* [Sample response, with body (if any)]
* [Error responses, if any]

# Tasks APIs
```
Hereafter, we report the designed HTTP APIs, also implemented in the project.
```



## __List of Tasks__

URL: `/api/tasks`

HTTP Method: GET

Description: Retrieve the list of all the available task

Request body: _None_

Error Response: `500 Internal Server Error` (generic error). 

Response body:
```
[ {id, description, important, private, deadline, completed, user}, {id, description, important, private, deadline, completed, user}, ... ]
```



## __Tasks given a filter__

URL: `/api/tasks/<filter>`

HTTP Method: GET

Description: Retrieve a list of all the tasks that fulfill a given `<filter>`.

Request body: _None_

Error Response: `500 Internal Server Error` (generic error).

Response body:
```
[ {id, description, important, private, deadline, completed, user}, 
  {id, description, important, private, deadline, completed, user}, 
  ... 
]
```




## __Task given its id__

URL: `/api/tasks/<id>`

HTTP Method: GET

Description: Retrieve a task given an `id`.

Request body: _None_

Error Response: `500 Internal Server Error` (generic error).

Response body:
```
{id, description, important, private, deadline, completed, user}
```



## __Create a new task__

URL: "/api/tasks"

HTTP Method: POST

Description: Create a new task (Content-Type: `application/json`).

Request body: {id,description, important, private, deadline, completed, user}

Response: new task's id



## __Update existing Task__

URL: `/api/tasks`

HTTP Method: PUT

Description: Update existing Tas (Content-Type: `application/json`).

Request body: An objct representing the Task to update
{id, description, important, private, deadline, completed, user}

Error Response: `500 Internal Server Error` (generic error).

Response body: _None_



## __Mark an existing task as completed/uncompleted__

URL: `/api/<id>?completed=<completed>`

HTTP Method: PUT

Description: Mark an existing task as completed/uncompleted according to the parameters passed in the URL

Request body: _None_

Error Response: `500 Service Unavailable` (generic error).

Response: Updated task's id



## __Delete an existing task given its id__

URL: `/api/tasks/<id>`

HTTP Method: Delete

Description: Delete an existing task

Request body: _None_

Error Response: `500 Service Unavailable` (generic error).

Response: text message="Done task Deletion"


# Users APIs

## __Login__

URL: `/api/sessions`

Method: POST

Description: Create session for the authenticated user.

Request body: An object representing user credentials
(Content-Type: `application/json`).
```
{
    "username": "first@polito.it",
    "password": "firstStudent"
}
```

Response:  `401 Unauthorized access` (Authorization error).

Response body: User passport object


## __Logout__

URL: `/api/sessions/current`

HTTP Method: Delete

Description: Execute user logout

Request body: _None_
