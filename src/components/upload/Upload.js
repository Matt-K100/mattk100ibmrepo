import React, { Component } from 'react';
import axios from 'axios';

class Upload extends Component {
  // setup status variable in props and set default message
  constructor(props) {
    super(props);
    this.state = {
      status: 'Please select file to upload'
    };
  }

  handleUploadFile = event => {
    // set message to loading when clicked
    this.setState({
      status: 'LOADING... PLEASE WAIT'
    });

    // send data to server and wait for a response
    const data = new FormData();
    data.append('file', event.target.files[0]);
    axios.post('/upload', data).then(response => {
      // update label when a response is received
      this.setState({
        status: response.data
      });
    });
  };

  render() {
    return (
      <div>
        <h4>{this.state.status}</h4>
        <input type="file" onChange={this.handleUploadFile} />
      </div>
    );
  }
}

export default Upload;
