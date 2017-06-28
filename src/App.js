import React, { Component } from 'react';
import PropTypes from 'prop-types';
import history from '../../core/history';
import fetch from '../../core/fetch';

import './App.css';

const App = {

  async submit(e) {
    e.preventDefault();

    const errors = [];

    // create and populate the form object
    const arr = Array.from(e.target.elements);
    const formArray = [];
    let fileBuffer = null;
    for (let i = 0; i < arr.length; i++) {
      const elem = arr[i];
      elem.escapedValue = escape(elem.value);

      let formElement = {};
      switch (elem.type) {
        case 'text':
        case 'textarea':
          formElement = {
            key: elem.id,
            value: elem.escapedValue,
          };
          formArray.push(formElement);
          break;
        case 'radio':
          if(!formArray.find(e => e.key == elem.name)) {
            let radios = arr.filter(e => e.name == elem.name);
            // set default value for radio button
            if (radios.find(e => e.checked)) {
              formElement = {
                key: elem.name,
                value: elem.escapedValue,
              };
            } else {
              formElement = {
                key: elem.name,
                value: 'None Selected',
              };
            }
            formArray.push(formElement);
          }
          break;
        case 'file':
          const { resume } = this.state;
          if (resume) {
            const base64Data = btoa(resume.split(',')[1]);
            fileBuffer = new Buffer(base64Data, 'base64');
          }
          break;
        default:
          break;
      }
    }

    // If there were any errors with the values, do not continue
    if (errors.length > 0) {
      this.setState({ errors });
      return;
    }

    let args = `form: [${formArray.map(o => `{key: "${o.key}", value: "${o.value}"}`)}]`;
    args += fileBuffer ? `, file: {buffer: "${fileBuffer}"}` : '';

    // Make request
    const resp = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation Mutation {
            sendApplication(${args}) {
              success
            }
          }
        `,
      }),
    });

    // Did it work
    const { data } = await resp.json();
    if (!data || !data.sendApplication || !data.sendApplication.success) {
      errors.push(<li key="Application Submission Failed">Application Submission Failed</li>);
      this.setState({ errors });
      return;
    }

    history.push(`/apply/${this.props.position.id}/submitted`);
  },

  convertToBase64(e) {
    const self = this;
    const files = e.target.files;
    if (files.length > 0)
    {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        self.setState({ resume: loadEvent.target.result });
      };
      reader.readAsDataURL(files[0]);
    }
  }
}
