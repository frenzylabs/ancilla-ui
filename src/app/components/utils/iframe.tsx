import React from 'react'


export class HtmlPreview extends React.Component<{body: any, src: string}> {

  iframe_ref = null
  rendered = null

  constructor(props:any) {
    super(props)
    this.writeHTML = this.writeHTML.bind(this)
  }

  componentDidMount() {
    this.writeHTML(this.rendered)
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(this.props.body)
    if (this.props.src != prevProps.src)
      this.writeHTML(this.rendered)
    // ReactDOM.render(this.props.body, this.rendered.contentDocument.body)
    // this.rendered.contentDocument.write(this.props.body)
  }

  writeHTML(frame){

    if(!frame) {
      return
    }

    let doc = frame.contentDocument
    // console.log("doc = ", doc)
    doc.open()
    doc.write(this.props.body)
    // ReactDOM.render(this.props.body, doc.body)
    doc.close()
    frame.onload = function(){
      frame.style.height = frame.contentWindow.document.body.scrollHeight + 'px';
    }
  }

  render(){
    return (
      <iframe key={this.props.src} width={"100%"} style={{minHeight: "80px", border: '1px solid #c0c0c0'}} height={"100%"}  src='about:blank' scrolling='no' frameBorder='0' seamless={false} ref={(iframe) => this.rendered = iframe} >
      </iframe>
    )
  }
}