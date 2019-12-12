//
//  error.tsx
//  ancilla
// 
//  Created by Kevin Musselman (kevin@frenzylabs.com) on 12/12/19
//  Copyright 2019 FrenzyLabs, LLC.
//


import React from 'react';

export default class ErrorModal extends React.Component<{requestError: any, caption?: String, subtext?: String, dismissAction?: Function}> {
  static parentStyles = {background: '#fe3b61'};

  renderMessage() {
    var caption = this.props.caption; 
    var subtext = this.props.subtext;
    
    if(!caption && this.props.requestError) {
       caption = this.props.requestError.message
       if (!subtext) {
        const data = this.props.requestError.response.data;
        if (!data) {
          subtext = "Uknown Error"
        } else {
          subtext = Object.keys(data).map((key, index) => {
            var item = data[key]
            if (typeof(item) == "object") {
              item = JSON.stringify(item)
            }
            else if (Array.isArray(item)) {
              item = item.join(", ")
            } 
            return (
              <div key={key} >
                {key}: {item}
              </div>
            )
          })
        }
       }
    }

    return (<div>
          <p className="" style={{fontSize: '22px'}}>{caption || "Unknown error has occured."}</p>
          <div className="" style={{fontSize: '14px'}}>{subtext || ""}</div>
        </div>
    )
  }

          // {/* <button className="delete" onClick={this.props.dismissAction}></button> */}
  render() {
    return (
      <div className="message is-danger">
        <div className="message-header">
          {this.renderMessage()}
        </div>
      </div>
    );
  }
}
