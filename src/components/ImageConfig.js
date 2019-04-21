import '../assets/css/App.css';
import React from 'react';

class ImageConfig extends React.Component {
  constructor(props) {
    super(props);

    let config = localStorage.getItem('config');
    if(config) {
      config = JSON.parse(config);
      this.state = {
        width: config.width,
        height: config.height,
        format: config.format,
        downloadPath: config.downloadPath
      };
    } else {
      this.state = {
        format: '.jpg',
      };
    }
  }
  handleChange(attr, e) {
    e.preventDefault();
    let value = e.target.value;
    setTimeout(() => {
      this.setState({
        [attr]: value
      }, () => {
        this.save();
      });
    }, 0);
  }
  
  save() {
    localStorage.setItem('config', JSON.stringify(this.state));
  }

  getConfig() {
    let { width, height, format, downloadPath } = this.state;
    if(!width) {
      throw new Error('设置尺寸：宽不能为空');
    }
    if(!height) {
      throw new Error('设置尺寸：高不能为空');
    }
    width = Number(width);
    height = Number(height);
    if(Number.isNaN(width)) {
      throw new Error('设置尺寸：宽只能为数字');
    }
    if(Number.isNaN(height)) {
      throw new Error('设置尺寸：高只能为数字');
    }
    if(!downloadPath) {
      throw new Error('保存地址不能为空');
    }
    return {width, height, format, downloadPath};
  }
  render() {
    return (
      <div>
        <p>
          <span>设置尺寸：</span>
          <span style={{marginRight:10}}>宽:<input style={{width:50}} value={this.state.width} onChange={this.handleChange.bind(this, 'width')}></input>px</span>
          <span>高:<input value={this.state.height}style={{width:50}} onChange={this.handleChange.bind(this, 'height')}></input>px</span>
          <span style={{marginLeft:30}}>设置格式：</span>
          <label style={{marginRight:10}}><input type="radio"   onChange={this.handleChange.bind(this, 'format')}  value=".jpg"  checked={this.state.format ==='.jpg'}  />jpg</label>
          <label><input type="radio"   onChange={this.handleChange.bind(this, 'format')}  value=".png" checked={this.state.format ==='.png'}  />png</label>
        </p>
        <p>
          <span>保存地址：</span>
          <span><input style={{width: 400}} value={this.state.downloadPath} onChange={this.handleChange.bind(this, 'downloadPath')} ></input></span>
        </p>
      </div>
    );
  }
}

export default ImageConfig;
