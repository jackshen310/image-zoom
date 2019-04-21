import '../assets/css/App.css';
import React, { Component } from 'react';
import ImageSelector from './ImageSelector';
import ImageConfig from './ImageConfig';
const {ipcRenderer} = require('electron');


class App extends React.Component {
  constructor(props) {
     super(props);

     let autoDownload = localStorage.getItem('autoDownload');
     this.state = {
       result: '', 
       autoDownload: autoDownload === 'true', 
       imgLogs: [],
       showImgLog: false,
      };
  }
  handleDownload() {
    try {
      let config = this.configInstance.getConfig();
      let canvas = document.getElementById("myCanvas");
      let ctx = canvas.getContext("2d");
      canvas.width = config.width;
      canvas.height = config.height;

      // let html = this.editorState.toHTML();
      let imgSrcs = this.parseImgSrcs(this.html);
      if (!imgSrcs.length) {
        throw new Error('没有选择图片');
      }
      console.log('找到' + (imgSrcs.length) + '张图片');

      let imgDatas = [];
      let ps = [];
      
      for(let i = 0; i < imgSrcs.length; i++) {
        let p = new Promise((resolve, reject) => {
          let img = new Image();
          img.setAttribute("crossOrigin", 'Anonymous');

          img.src = imgSrcs[i];
          img.onload = function () {
            ctx.drawImage(img, 0, 0, config.width, config.height);
            let type = config.format === '.jpg'? 'image/jpeg': 'image/png';
            let data = canvas.toDataURL(type);
            imgDatas[i] = data;
            resolve();
          };
          img.onerror = function() {
            reject('图片[' + img.src + ']找不到');
          }
        }).catch((e)=> {
          reject(e);
        });
        ps.push(p);
      }
      Promise.all(ps).then(()=>{
        ipcRenderer.send('save-image', imgDatas, config.downloadPath, config.format);
      }).catch((err)=>{
        this.setState({result: err});
      });
    } catch(e) {
      console.error(e);
      this.setState({result: e.message});
    }
  }
  parseImgSrcs(html) {
    // console.log('html', html);
    //思路分两步：作者（yanue）.
    //1，匹配出图片img标签（即匹配出所有图片），过滤其他不需要的字符
    //2.从匹配出来的结果（img标签中）循环匹配出图片地址（即src属性）
    //匹配图片（g表示匹配所有结果i表示区分大小写）
    let imgReg = /<img.*?(?:>|\/>)/gi;
    //匹配src属性
    let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
    let arr = html.match(imgReg);
    if(!arr || !arr.length) {
      return [];
    }
    // console.log('所有已成功匹配图片的数组：' + arr);
    let imgSrcs = [];
    let imgLogs = this.state.imgLogs;
    for (let i = 0; i < arr.length; i++) {
      let src = arr[i].match(srcReg);
      //获取图片地址
      if (src[1]) {
        console.log('已匹配的图片地址' + (i + 1) + '：' + src[1]);
        imgSrcs.push(src[1]);
        imgLogs.unshift('已匹配的图片地址' + (i + 1) + '：' + src[1]);
      }
    }

    if (imgLogs.length > 20) {
      imgLogs.length = 20;
    }

    // 处理后缀为.webp的图片
    return imgSrcs.map(function(src){
      // !!898146183.jpg_60x60q90.jpg
      if (src.indexOf('.jpg') > 0) {
        src = src.substr(0, src.indexOf('.jpg') + 4);
        console.log('处理后的图片地址', src);
        imgLogs.unshift('处理后的图片地址: ' + src);
      }
      return src;
    });
    
  }

  handleSelectorChange(html) {
    this.html = html;
    if (this.state.autoDownload) {    
      if (html && html != '<p></p>') {
        this.handleDownload();
      } else {
        this.setState({result: ''});
      }
    }
  }
  handleCheckboxChange(e){
    this.setState({autoDownload: e.target.checked}, ()=>{
      localStorage.setItem('autoDownload', this.state.autoDownload);
    });

  }

  handleShowImgLogChange(e){
    this.setState({showImgLog: e.target.checked});
  }
  componentDidMount() {
    ipcRenderer.on('save-image-reply', (event, arg) => {
      this.setState({result: arg});
    });
  }
  render() {
    return (
      <div>
        <ImageSelector onChange={this.handleSelectorChange.bind(this)} ></ImageSelector>
        <ImageConfig ref={(ref)=> { this.configInstance = ref }}></ImageConfig>
        <canvas id="myCanvas"></canvas>
        <p>
          <button style={{fontSize: '16px', backgroundColor: '#008CBA', color: 'white', marginRight: '10px'}} onClick={this.handleDownload.bind(this)}>保存图片</button>
          <label><input onChange={this.handleCheckboxChange.bind(this)} checked={this.state.autoDownload === true} type="checkbox"></input>自动保存图片</label>
          <label><input onChange={this.handleShowImgLogChange.bind(this)} checked={this.state.showImgLog === true} type="checkbox"></input>显示图片地址</label>
        </p>
        <div style={{color: 'red'}}>
          {this.state.result}
        </div>
        <div>
          {this.state.showImgLog && this.state.imgLogs.map((item, index)=>{
            return <p>{(index + 1) + '->' + item}</p>
          })}
        </div>
      </div>
    );
  }
}

export default App;
