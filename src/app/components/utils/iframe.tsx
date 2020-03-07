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
    if (this.props.src != prevProps.src)
      this.writeHTML(this.rendered)
  }

  writeHTML(frame){

    if(!frame) {
      return
    }



    let doc = frame.contentDocument

    doc.open()
    doc.write(this.props.body)
    doc.close()

    setTimeout(function() {
      
      var win = frame.contentWindow
      if (!win || !win.document) return

      var newheight = Math.max( win.document.body.scrollHeight, win.document.body.offsetHeight, win.document.documentElement.clientHeight, win.document.documentElement.scrollHeight, win.document.documentElement.offsetHeight );

      frame.style.height = newheight + 'px';
    }, 1000);

    frame.onload = function(){
      var win = frame.contentWindow
      if (!win || !win.document) return
      var newheight = Math.max( win.document.body.scrollHeight, win.document.body.offsetHeight, win.document.documentElement.clientHeight, win.document.documentElement.scrollHeight, win.document.documentElement.offsetHeight );
      frame.style.height = newheight + 'px';
    }
    
  }

  render(){
    return (
      <iframe key={this.props.src} width={"100%"} style={{minHeight: "80px", border: '1px solid #c0c0c0'}} height={"100%"}  src='about:blank' scrolling='no' frameBorder='0' seamless={false} ref={(iframe) => this.rendered = iframe} >
      </iframe>
    )
  }
}