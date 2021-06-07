import ListGroup from 'react-bootstrap/ListGroup';
import { NavLink } from 'react-router-dom';

import '../style.css';


function Sidebar(props) {

    return (
        <aside id="asideTarget">

            <ListGroup as="ul" className="list-group-flush">
                {
                    props.sidebarTitles.map((title =>
                        <NavLink key={'idNavLink_' + title} to={'/tasks/' + title}
                            style={{
                                textDecoration: 'none'
                            }}
                            activeStyle={{
                                background: '#28a745',
                                borderColor: '#28a745',
                                textDecoration: "white"
                            }}>

                            <SidebarRow title={title} />
                        </NavLink>
                    ))
                }
            </ListGroup>

        </aside >
    );
}

function SidebarRow(props) {
    return (
        <ListGroup.Item as="li" className={`list-group-item-action`}>
            {props.title}
        </ListGroup.Item>
    );
}


export default Sidebar;
