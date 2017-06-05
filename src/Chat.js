import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1);

class Chat extends Component {
  constructor() {
    super();
    this.state = {
      chat: {},
      chatRef: firebase.database().ref().child(`${channel}`).child('chat'),
    };
  }

  componentDidMount() {
    this.state.chatRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        chat: snap.val()
        });
      } else {
        this.setState({
          chat: 0
          });
      }
    });
  }

  sendchat(stop) {
    stop.preventDefault();
    this.state.chatRef.push().set(`${user}: ${this.refs.chatInput.value}`);
    this.refs.chatInput.value = '';
  }

  render() {
    return (
      <div className='App' style={{margin: '5px'}}>
        <form ref='chatForm' onSubmit={this.sendchat.bind(this)}>
        <input className='textinput' style={{width:'285px', margin: '0px'}} ref='chatInput' required/>
        <button ref='send' className='lrgButton' style={{width:'45px', margin: '0 0 0 2px'}}>Send</button>
        </form>
        <div className='messagebox' style={{maxHeight: '350px', maxWidth: '350px'}}>
          {Object.entries(this.state.chat).reverse().map(([k,v])=>
            <div className='message' style={{maxWidth: '18em', minHeight: '0px', lineHeight: 1.2}} key={k}>
            <div>{v}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
  export default Chat;
