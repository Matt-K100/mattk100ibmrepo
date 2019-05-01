import React, { Component } from 'react';
import axios from 'axios';

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Please select file to upload'
    };
  }

  handleUploadFile = event => {
    const data = new FormData();
    data.append('file', event.target.files[0]);
    axios.post('/upload', data).then(response => {
      console.log(response);
      // if (response.status === 200) {
      //   this.setState({
      //     status: 'Successfully uploaded file'
      //   });
      // } else {
      //   this.setState({
      //     status: 'Failed, please try again'
      //   });
      // }
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
