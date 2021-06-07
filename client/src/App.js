import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import { Login } from './components/Login.js';
import MyNavbar from './components/MyNavbar.js';
import Main from './components/Main.js';
import Sidebar from './components/Sidebar.js';
import NotFoundFilter from "./components/NotFoundFilter"
import './style.css';
import API from './API';
import { Alert } from 'react-bootstrap';
import { Task } from './models/Task';


function App() {

  /* Title of the Sidebar filters */
  const sidebarTitles = ["All", "Important", "Today", "Next 7 Days", "Private"];

  /* LoggedIn as state variable */
  const [loggedIn, setLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userInfo, setUserInfo] = useState();
  const [message, setMessage] = useState('');

  /* taskList as state variable */
  const [taskList, setTaskList] = useState([]);

  /*State variable to store the active filter if there is one*/
  const [filter, setFilter] = useState('All');
  const updateFilter = (f) => {
    setFilter(f);
  };

  const [loading, setLoading] = useState(true); // still loading at mount
  const [dirty, setDirty] = useState(true); //tasks are dirty

  /* Sidebar open state */
  const [openSidebar, setOpenSidebar] = useState(false);
  const toggleSidebar = () => setOpenSidebar(oldOpenSidebar => !oldOpenSidebar);

  useEffect(() => {

    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        // Storing UserInfo (the name) to display it in the logout modal
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUserInfo(user.name);
        setIsCheckingAuth(false);
      } catch (err) {
        console.error(err.error);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);


  useEffect(() => {
    if (loggedIn) {
      /* Function to retrieve the Tasklist*/
      API.loadTaskList().then(result => { /* result is the TaskList from server */
        setTaskList(result);
        setLoading(false);
      })
        .catch(err => {
          setMessage({ msg: "Impossible to load your tasks! Please, try again later...", type: 'danger' });
          console.error(err);
        });
    }
  },
    [loggedIn]
  );

  useEffect(() => {
    if (loggedIn) {
      /* Function to retrieve the filtered Tasklist*/
      API.filterOnTasklist(filter).then(result => {
        setTaskList(result);
        setLoading(false);
        setDirty(false);
      })
        .catch(err => {
          setMessage({ msg: "Impossible to load your tasks! Please, try again later...", type: 'danger' });
          console.error(err);
        });
    }
  },
    [filter, dirty]
  );

  const handleErrors = (err) => {
    if (err.errors)
      setMessage({ msg: err.errors[0].msg + ': ' + err.errors[0].param, type: 'danger' });
    else
      setMessage({ msg: err.error, type: 'danger' });

    setDirty(true);
  }

  /* Function to add new Task to the original TaskList data source */
  const addTask = (newTask) => {
    let nT = new Task(undefined, newTask.description, newTask.important, newTask.private, newTask.deadline, newTask.completed);
    nT.status = 'adding';
    setTaskList(oldTaskList => [...oldTaskList, nT]);


    API.addToTaskList(newTask)
      .then(() => {
        setDirty(true);
      })
      .catch(err => handleErrors(err));
  };

  /* Delete task function */
  const deleteTask = (id) => {
    setTaskList(oldTaskList => {
      return oldTaskList.map(task => {
        if (task.id === id)
          return { ...task, status: 'deleting' };
        else
          return task;
      });
    });

    API.removeFromTaskList(id)
      .then(() => {
        setDirty(true);
      })
      .catch(err => handleErrors(err));
  }

  /* Function to edit a Task from the original TaskList data source */
  const editTask = (newTask) => {

    setTaskList(oldTaskList => {
      return oldTaskList.map(task => {
        if (task.id === newTask.id) {
          let nT = new Task(undefined, newTask.description, newTask.important, newTask.private, newTask.deadline, newTask.completed);
          nT.status = 'updating';
          return nT;
        }
        else
          return task;
      });
    });

    // API.editTaskFromTaskList(newTask).then(newRefresh());
    API.editTaskFromTaskList(newTask)
      .then(() => {
        setDirty(true);
      })
      .catch(err => handleErrors(err));
  };

  /* Function to edit the Task field completed from the original TaskList data source */
  const toggleTask = (id, completed) => {
    completed = (completed) ? { 'completed': 1 } : { 'completed': 0 };
    //API.updateCompleted(id, completed).then(newRefresh());

    API.updateCompleted(id, completed)
      .then(() => {
        setDirty(true);
      })
      .catch(err => handleErrors(err));
  }

  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUserInfo(user);
      setLoggedIn(true);

      /* setIsCheckingAuth(false); */
      setMessage({ msg: `Welcome, ${user}!`, type: 'success' });
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
    }
  }


  const doLogOut = async () => {
    setMessage("");
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setTaskList([]);
  }


  return (
    <Router>
      <> {!isCheckingAuth ?
        <Container fluid>
          <Switch>
            
            <Route exact path="/">
              {
                loggedIn ? <Redirect to={"/tasks/" + sidebarTitles[0]} />
                  :
                  <Redirect to="/login" />
              }
            </Route>

            <Route path="/login">
              <>
                {loggedIn ? <Redirect to={"/"} />
                  :
                  <Row className='col-12-centered below-nav App-header'>
                    {message && <Row>
                      <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
                    </Row>}

                    <Login login={doLogIn} />
                  </Row>/* } */}
              </>
            </Route>

            <Route path="/404" component={NotFoundFilter} />

            <Route path="/tasks/:filter" render={({ match }) =>
              <>
                {
                  loggedIn ? (
                    // loggedIn ? (
                    sidebarTitles.some(t => t === match.params.filter) ? (
                      <TaskMgr loggedIn={loggedIn} toggleSidebar={toggleSidebar} openSidebar={openSidebar} sidebarTitles={sidebarTitles} taskList={taskList}
                        filt={match.params.filter} setLoading={setLoading} message={message} setMessage={setMessage} updateFilter={updateFilter} addTask={addTask}
                        editTask={editTask} deleteTask={deleteTask} toggleTask={toggleTask} loading={loading} doLogOut={doLogOut} userInfo={userInfo} />
                    ) :
                      <Redirect to="/404" />
                  ) : (
                    <Redirect to="/login" />
                  )
                }
              </>
            } />

            <Redirect to="/404" />

          </Switch>
        </Container>
        : <div className="center-block App-headerLoading">
          ToDoManager
          <Spinner animation="border" variant="success" />
        </div>}
      </>
    </Router>
  );
}

function TaskMgr(props) {
  return (
    <>
      <Row>
        <MyNavbar toggleSidebar={props.toggleSidebar} home={props.sidebarTitles[0]} logout={props.doLogOut} userInfo={props.userInfo} />
      </Row>
      <Row className='row min-height'>
        <Col className={`collapse ${props.openSidebar ? "show" : ""} d-sm-block col-sm-4 col-12 below-nav bg-light `}>
          <Sidebar sidebarTitles={props.sidebarTitles} loggedIn={props.loggedIn} />
        </Col>

        <Col className='col-sm-8 col-12 below-nav'>
          {props.message && <Row>
            <Alert variant={props.message.type} onClose={() => props.setMessage('')} dismissible>{props.message.msg}</Alert>
          </Row>}
          {props.loading ?
            <span><Spinner animation="border" variant="success" /> <b>Please wait, loading tasks...</b></span> :
            <Main tasks={props.taskList} filt={props.filt} setLoading={props.setLoading}
              updateFilter={props.updateFilter} addTask={props.addTask} editTask={props.editTask} deleteTask={props.deleteTask} toggleTask={props.toggleTask}
            />}
        </Col>
      </Row>
    </>
  );
}
export default App;
