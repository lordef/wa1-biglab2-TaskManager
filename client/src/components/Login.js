import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Button, Form } from 'react-bootstrap';
import { iconTicks, iconLogin } from '../icons';

import '../style.css';


function Login(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = { username, password };

        props.login(credentials);
    };

    return (
        <>
            <div>
                {iconTicks}
                ToDoManager
            </div>

            <br />

            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control required type="email" placeholder="Enter email" value={username} onChange={ev => setUsername(ev.target.value)} />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control required type="password" placeholder="Password" value={password} onChange={ev => setPassword(ev.target.value)} />
                </Form.Group>

                <Button variant="success" type='submit'>
                    Login
            </Button>
            </Form>
        </>

    );
}

function LogoutModal(props) {
    /* State variable for opening and closing the Modal */
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = (event) => {
        event.preventDefault();
        props.logout();
    };

    return (
        <>
            <span className={props.classname} onClick={handleShow}>
                {iconLogin}
            </span>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title> User Info </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <h7><b>Username: </b>{props.userInfo}</h7><br></br>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="success" onClick={handleClose}>Cancel</Button>
                    <Button variant='danger' onClick={handleSubmit}>Logout</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


export { Login, LogoutModal };
