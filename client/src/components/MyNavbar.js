import { iconTicks } from "../icons.js";
import { Row, Form } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import { LogoutModal } from './Login.js';

function MyNavbar(props) {
    return (
        <nav className="navbar navbar-expand-sm navbar-dark bg-success fixed-top">

            <button className="navbar-toggler mr-auto" type="button" data-toggle="collapse" data-target="#asideTarget"
                aria-controls="asideTarget" aria-expanded="false" aria-label="Toggle sidebar">
                <span onClick={() => props.toggleSidebar()} className="navbar-toggler-icon"></span>
            </button>

            <NavLink to={"/tasks/" + props.home} className="navbar-brand">
                {iconTicks}
                ToDoManager
            </NavLink>

            <Form className="d-none d-sm-block mx-auto" action="#" >
                <Form.Control type="search" placeholder="Search" aria-label="Search" />
            </Form>

            <Row className="navbar-nav ml-auto">

                <LogoutModal classname={"nav-item nav-link"} logout={props.logout} userInfo={props.userInfo} />
            </Row>
        </nav>

    );
}


export default MyNavbar;