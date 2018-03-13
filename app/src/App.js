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
      priv: "",
      pub: "",
      diff: "",
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
    this.setState({target:value,results:"",priv:"",pub:"",diff:""})
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
    .then(function (response) {
       console.log(response);
     })
     .catch(function (error) {
       console.log(error);
     });
  }

  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }
  blockieClick(priv,pub,diff){
    this.setState({priv:priv,pub:pub,diff:diff})
  }
  render() {
    if(!this.state){
      return (
        <div className="App">
          <div style={{padding:50}}>
            <span style={{opacity:0.5}}>Loading...</span>
          </div>
        </div>
      )
    }
    let miningOptions
    if(this.state.images){
      miningOptions = this.state.images.map(image => {
        return(
          <Option value={image} key={image}>{image}</Option>
        )
      })
    }else{
      return (
        <div className="App">
          <div style={{padding:50}}>
            <span style={{opacity:0.5}}>Connecting...</span>
          </div>
        </div>
      )
    }
    let count = 0
    let results = ""
    if(this.state.results&&this.state.results.length>0){
      results = this.state.results.map(result => {
        if(result&&result.pub){
          return(
              <div key={"blockie"+count++} style={{cursor:"pointer"}} onContextMenu={this.contextMenu.bind(this,result.priv)}
                onClick={this.blockieClick.bind(this,result.priv,result.pub,result.diff)}
              >

                  <Blockies
                    seed={result.pub}
                    scale={10}
                  />

              </div>
          )
        }

      })
    }
    let result = "Select an image or drag and drop to start mining."
    let targetImage
    if(this.state.target!="none"){
      targetImage=(
        <img src={backend+"/"+this.state.target} style={{zIndex:-1,marginLeft:80,transform:'scale(10)'}}/>
      )

      result = (
        <StackGrid
          columnWidth={88}
        >
          {results}
        </StackGrid>
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

    let bottomBar = ""
    if(this.state.priv){
      bottomBar = (
        <div style={{position:'fixed',bottom:0,width:"100%",textAlign:"center",zIndex:99,padding:50,border:"1px solid #dddddd",backgroundColor:"#ffffff"}}>
          {this.state.priv} {this.state.pub} {this.state.diff} <span style={{cursor:"pointer"}} onClick={()=>{
             this.setState({priv:"",pub:"",diff:""})
           }}>[X]</span>
        </div>
      )
    }

    return (
        <Dropzone
         disableClick
         style={{position: "relative",backgroundColor:"#eeeeee"}}
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
                {bottomBar}
              </div>
      </Dropzone>
    );
  }
}

export default App;
