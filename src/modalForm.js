import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import styled from 'styled-components';
import {
  Row, Col, Grid,
} from 'react-bootstrap';
import toMaterialStyle from 'material-color-hash';


class ModalForm extends Component {
  render() {
    return (
      <Grid>
        <Row>
        The Form for the modal that pops up will go here.
        </Row>
      </Grid>
    );
  }
}


export default Message;
