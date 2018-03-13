import React, { Component } from 'react';
import { Select } from 'antd';
import axios from 'axios';
import StackGrid from "react-stack-grid";
import Blockies from "react-blockies";
import Dropzone from 'react-dropzone'
import './App.css';
import '../node_modules/antd/dist/antd.css';

const Option = Select.Option;

const backend = "http://localhost:48725"

let loadInterval
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mining: false,
      accept: '',
      files: [],
      dropzoneActive: false
    };
  }
  componentDidMount(){
    loadInterval=setInterval(this.load.bind(this),1001)
  }
  componentWillUnmount(){
    clearInterval(loadInterval)
  }
  load(){
    axios.get(backend)
    .then(res => {
      this.setState(res.data)
    });
  }
  handleMiningChange(value) {
    this.setState({target:value})
    axios.post(backend+'/target', {
      target:value,
    })
    .then(function (response) {
      this.load()
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  contextMenu(priv,e) {
      e.preventDefault();
      console.log(priv)
  }
  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop(files) {
    console.log(files)
    this.setState({
      files,
      dropzoneActive: false
    });
    var formData = new FormData();
    formData.append("image", files[0]);
    axios.post(backend+'/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
    })
  }

  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }
  render() {
    if(!this.state){
      return (<div>loading...</div>)
    }
    let miningOptions
    if(this.state.images){
      miningOptions = this.state.images.map(image => {
        return(
          <Option value={image} key={image}>{image}</Option>
        )
      })
    }
    let count = 0
    let results = ""
    if(this.state.results&&this.state.results.length>0){
      results = this.state.results.map(result => {
        if(result&&result.pub){
          return(
              <div key={"blockie"+count++} onContextMenu={this.contextMenu.bind(this,result.priv)}>
                <a target="_blank" href={"http://etherscan.io/address/"+result.pub}>
                  <Blockies
                    seed={result.pub}
                    scale={10}
                  />
                </a>
              </div>
          )
        }

      })
    }
    let result = (
      <StackGrid
        columnWidth={90}
      >
        {results}
      </StackGrid>
    )

    let targetImage
    if(this.state.target!="none"){
      targetImage=(
        <img src={backend+"/"+this.state.target} style={{zIndex:-1,marginLeft:80,transform:'scale(10)'}}/>
      )
    }


    const { accept, files, dropzoneActive } = this.state;
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff'
    };

    return (
        <Dropzone
         disableClick
         style={{position: "relative"}}
         accept={accept}
         onDrop={this.onDrop.bind(this)}
         onDragEnter={this.onDragEnter.bind(this)}
         onDragLeave={this.onDragLeave.bind(this)}
       >
              { dropzoneActive && <div style={overlayStyle}>Drop files...</div> }
              <div className="App">
                <div style={{padding:50}}>
                  <span style={{margin:10}}>Currently Mining:</span>
                  <Select
                    style={{ width: 200 , zIndex: 1}}
                    placeholder="Select Image"
                    onChange={this.handleMiningChange.bind(this)}
                    value={this.state.target}
                  >
                    <Option value={"none"} key={"none"}>{"none"}</Option>
                    {miningOptions}
                  </Select>
                  {targetImage}
                  <div style={{margin:50,padding:50}}>{result}</div>
                </div>
              </div>
      </Dropzone>
    );
  }
}

export default App;
