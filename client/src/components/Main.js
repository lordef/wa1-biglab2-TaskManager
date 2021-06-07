import { useEffect, useState } from 'react';
import { ListGroup, Col, Modal, Button, Form, ModalBody, ModalFooter, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';
import { iconPlus, iconUser, iconEdit, iconDelete } from "../icons.js";


function Main(props) {

    useEffect(() => {
        props.updateFilter(props.filt);
    });

    return (
        <main>
            <Title selected={props.filt} />
            <TaskList {...props} />
            <EditAddForm type={'add'} addTask={props.addTask} icon={iconPlus} />
        </main>
    );
}


function Title(props) {
    return (
        <Col>
            <h1>{props.selected}</h1>
        </Col>
    )
};


function TaskList(props) {

    return (
        <ListGroup as="ul" variant="flush">
            {
                /* tasks property is the state variable 'taskList' that is a list of elements */
                props.tasks && props.tasks.map(task =>
                    <TaskRow key={task.id} task={task}
                        editTask={props.editTask} deleteTask={props.deleteTask} toggleTask={props.toggleTask}
                    />
                )
            }
        </ListGroup>
    )
};

function TaskRow(props) {
    return (
        <ListGroup.Item as="li" className="d-flex w-100 justify-content-between" >
            <TaskInfo {...props} />
            <TaskControls task={props.task} editTask={props.editTask} deleteTask={props.deleteTask} />
        </ListGroup.Item>
    )
};

function TaskInfo(props) {
    return (
        <>
            <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id={"check-t" + props.task.id} defaultChecked={props.task.completed} onChange={(ev) => props.toggleTask(props.task.id, ev.target.checked)} />
                <label className={`custom-control-label ${props.task.important ? 'text-danger' : ''}`} htmlFor={"check-t" + props.task.id}> {props.task.description} </label>
            </div>

            {/* Insertion of the icon user if not private */}
            {
                (!(props.task.private) && <div>{iconUser}</div>) || <div></div>
            }

            <small>{props.task.formatDeadline()}</small>
        </>

    )
};

function TaskControls(props) {
    let statusClass = null;

    switch (props.task.status) {
        case 'adding':
            statusClass = 'success';
            break;
        case 'deleting':
            statusClass = 'danger';
            break;
        case 'updating':
            statusClass = 'warning';
            break;
        default:
            break;
    }

    return (
        <div>
            { !props.task.status ? <><EditAddForm type={'edit'} icon={iconEdit} task={props.task} editTask={props.editTask} />
                <span onClick={() => props.deleteTask(props.task.id)}>
                    {iconDelete}
                </span></>
                :
                <>
                    <small className={"text-" + statusClass}>{props.task.status}</small>
                    <Spinner animation="border" size="sm" variant={statusClass} />
                </>}

        </div>
    )
};

/* Modal for edit and add Button */
function EditAddForm(props) {

    /* State variable for opening and closing the Modal */
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => { setShow(true); reset(); }

    /******/
    /*State variables for forms*/
    const [description, setDescription] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);

    /* State variables and constants for deadline form */
    const [enabledDeadline, setEnabledDeadline] = useState(false); /* It allows to manage tasks with and without a deadline */
    const [deadlineDate, setDeadlineDate] = useState(dayjs());
    const [deadlineHour, setDeadlineHour] = useState(dayjs().hour());
    const [deadlineMinute, setDeadlineMinute] = useState(dayjs().minute());
    const hours = [];
    const minutes = [];
    for (let i = 0; i < 24; i++) { hours[i] = i; }
    for (let i = 0; i < 60; i++) { minutes[i] = i; }
    /******/


    /* State variables for form validation */
    const [validated, setValidated] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /* Update deadline function */
    const updateDeadline = (isActive, date = dayjs()) => {
        setEnabledDeadline(isActive);
        setDeadlineDate(date);
        setDeadlineHour(date.hour());
        setDeadlineMinute(date.minute());
    }

    /* Resetting the Modal */
    const reset = () => {
        setDescription(props.type === 'edit' ? props.task.description : '');
        setIsImportant(props.type === 'edit' ? props.task.isImportant : false);
        setIsPrivate(props.type === 'edit' ? props.task.isPrivate : false);
        /* Resetting deadline form */
        if (props.type === 'edit' && props.task.deadline) {
            updateDeadline(true, props.task.deadline);
        } else if (props.type === 'add') {
            updateDeadline(true);
        }

        setErrorMessage('');
        setValidated(false);
    }

    /* Submitting the Modal after validation */
    const handleSubmit = (event) => {

        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        }

        let deadline;
        if (!enabledDeadline) {
            deadline = '';
        } else {
            /* Example of deadline format: 2021-03-29T14:30:00 */
            deadline = deadlineDate.format('YYYY-MM-DD') + ' ' + deadlineHour + ':' + deadlineMinute;
        }

        setErrorMessage('');
        setValidated(true);
        if (form.checkValidity() === true) {
            if (props.type === 'add') {

                let newTask = { "description": description, "important": isImportant, "private": isPrivate, "deadline": deadline, "completed": 0 };
                props.addTask(newTask);

            } else if (props.type === 'edit') {
                let newTask = { "id": props.task.id, "description": description, "important": isImportant, "private": isPrivate, "deadline": deadline, "completed": 0 };
                props.editTask(newTask);
            }

            handleClose();
        }
    };

    return (
        <>

            <span className={props.type === 'add' ? 'button' : ''} onClick={handleShow}>
                {props.icon}
            </span>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.type === 'add' ? 'Add New Task' : 'Edit Task'}</Modal.Title>
                </Modal.Header>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <ModalBody>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control required type="text" placeholder="Enter Description..." value={description} onChange={ev => setDescription(ev.target.value)} />
                            <Form.Control.Feedback type="invalid"> Please provide a description. </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId='formImportant'>
                            <Form.Check type="switch" id="switch-important" label="Important" checked={isImportant} onChange={ev => setIsImportant(ev.target.checked)} />
                        </Form.Group>

                        <Form.Group controlId='formPrivate'>
                            <Form.Check type="switch" id="switch-private" label="Private" checked={isPrivate} onChange={ev => setIsPrivate(ev.target.checked)} />
                        </Form.Group>

                        < Form.Group>

                            <Form.Check id='formDeadline1' type="switch" id="switch-deadline" label="Deadline" checked={enabledDeadline} onChange={ev => updateDeadline(ev.target.checked)} />

                            <Form.Row id='formDeadline2' className={`collapse ${enabledDeadline ? "show" : ""} `}>
                                <Col>
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control required type='date' value={deadlineDate.format('YYYY-MM-DD')} onChange={ev => setDeadlineDate(dayjs(ev.target.value))} />
                                    {/* <Form.Control required type='date' value={deadlineDate.format('YYYY-MM-DD')} onChange={ev => setDeadlineDate(dayjs(ev.target.value))} min={dayjs().format("YYYY-MM-DD")} /> */}
                                </Col>

                                <Col>
                                    <Form.Label>Hour</Form.Label>
                                    <Form.Control as='select' value={deadlineHour} onChange={ev => setDeadlineHour(ev.target.value)} >
                                        {hours.map(hour => <option key={'h' + hour}>{hour}</option>)}
                                    </Form.Control>
                                </Col>

                                <Col>
                                    <Form.Label>Minute</Form.Label>
                                    <Form.Control as='select' value={deadlineMinute} onChange={ev => setDeadlineMinute(ev.target.value)} >
                                        {minutes.map(minute => <option key={'m' + minute}>{minute}</option>)}
                                    </Form.Control>
                                </Col>

                            </Form.Row>

                            <span id='formDeadline3' style={{ color: 'red' }} className={`collapse ${enabledDeadline ? "show" : ""} `} >
                                {errorMessage}
                            </span>

                        </Form.Group>


                    </ModalBody>

                    <ModalFooter>
                        <Button variant="danger" onClick={handleClose}>
                            Close
                        </Button>
                        <Button type="submit" variant="success" >
                            Save Changes
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </>
    )
}

export default Main;

