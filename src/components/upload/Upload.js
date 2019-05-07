import React, { Component } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import { imagePath } from '../../utils/assetUtils';

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
    data.append('file', event[0]);
    axios.post('/upload', data).then(response => {
      // update label when a response is received
      this.setState({
        status: response.data
      });
    });
  };

  // just renders the input box, all done server side
  render() {
    return (
      <div>
        <Dropzone onDrop={this.handleUploadFile}>
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              className={isDragActive ? 'dropzone file-drop' : 'dropzone'}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <div>
                <img src={imagePath('upload.svg')} alt="" />
                <h3>{this.state.status}</h3>
                <h6>
                  {isDragActive
                    ? 'Drop to upload!'
                    : 'Click or drag and drop a file here to upload...'}
                </h6>
              </div>
            </div>
          )}
        </Dropzone>
      </div>
    );
  }
}

export default Upload;
