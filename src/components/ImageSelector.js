import '../assets/css/App.css';
import React from 'react';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import  _  from 'lodash';

class ImageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.beforeHTML = '';
    this.handleEditorChange = _.debounce((editorState) => {
      // let html = editorState.toHTML();
      let html = '';
      if (this.editorInstance) {
        html = this.editorInstance.getDraftInstance().editor.innerHTML;;
      }
      // html = this.editorInstance && this.editorInstance.getDraftInstance().editor.innerHTML;
      if (html !== this.beforeHTML) {
        this.props.onChange(html);
        this.beforeHTML = html;
      }
    }, 100);
  }
  handleClear() {
    this.editorInstance.clearEditorContent();
  }

  render() {
    return (
      <div>
        <p style={{ marginBottom: '5px' }}>
          <span style={{ fontSize: '16px', marginRight: '20px' }}>选择图片</span>
          <button style={{ fontSize: '14px', backgroundColor: '#008CBA', color: 'white' }} onClick={this.handleClear.bind(this)}>清空</button>
        </p>
        <div style={{ border: "0.5px solid darkblue" }}>
          <BraftEditor
            ref={(instance) => {
              this.editorInstance = instance;
            }}
            placeholder="支持粘贴图片，支持截图"
            controls={['media', 'clear']}
            onChange={this.handleEditorChange}
          />
        </div>

      </div>
    );
  }
}

export default ImageSelector;
