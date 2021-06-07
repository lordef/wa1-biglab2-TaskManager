import React from 'react';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { icon404 } from '../icons';
function NotFoundFilter(props) {

  return (
    <Container fluid className='text-center' >
      <Row className ='below-nav'>
        <Col className='col-sm-4 col-12'>{icon404}</Col>
        <Col className="col-sm-8 col-12 text-left">
          <h2 className="not-found">Page not found</h2>
          <h3><em>/404</em></h3>
          <p>We could not find the above page on our servers.</p>
          <p><b>Did you mean: <Link to="/">/tasks/All</Link></b></p>
          <Link to="/"><Button>Home Page</Button></Link>
        </Col>
      </Row>
    </Container>);
}

export default NotFoundFilter;

