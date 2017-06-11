import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';

var channel = window.location.pathname.slice(1).toLowerCase();
var position;

class Character extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      character: {},
      characterRef: firebase.database().ref().child(`${channel}`).child('character'),
      currentCharacter: '',
      incapacitated: 'none',
    };
  }

  componentDidMount() {
    this.state.characterRef.on('value', snap => {
      this.setState({character: snap.val()});
      if (this.state.currentCharacter !== '') {
        this.setState({currentCharacter: snap.val()[this.getcurrentKey()]});
      }
      if ((this.state.currentCharacter === '') && (this.state.character !== null)) {
        this.previous();
      }
    });
    position = 0;
  }

  setNew() {
    Popup.create({
        title: 'New Character',
        content:
        <div style={{textAlign: 'center'}}>
          <input className='textinput' style={{textAlign: 'center'}} id='charName' placeholder='Character Name' />
          <input className='textinput' style={{textAlign: 'center'}} id='maxWounds' placeholder='Max Wounds' />
          <input className='textinput' style={{textAlign: 'center'}} id='maxStrain' placeholder='Max Strain' />
          <input className='textinput' style={{textAlign: 'center'}} id='credits' placeholder='Credits' />
          <input className='textinput' style={{textAlign: 'center'}} id='imageURL' placeholder='Image URL' />
        </div>,
        buttons: {
            left: ['cancel'],
            right: [{
                text: 'Save',
                className: 'success',
                action: () => {
                    let currentCharacter = {
                                  name: document.getElementById('charName').value,
                                  currentWounds: 0,
                                  maxWounds: document.getElementById('maxWounds').value,
                                  currentStrain: 0,
                                  maxStrain: document.getElementById('maxStrain').value,
                                  credits: document.getElementById('credits').value,
                                  imageURL: document.getElementById('imageURL').value,
                                  key: this.genKey(),
                                };
                    if (currentCharacter['imageURL'] === '') {
                      currentCharacter['imageURL'] = '/images/crest.png';
                    }
                    this.state.characterRef.push().set(currentCharacter);
                    this.state.messageRef.push().set(currentCharacter['name'] + ' has been successfully added!');
                    Popup.close();
                }
            }]

        }
    });
  }

  editCharacter() {
    Popup.create({
        title: 'Edit Character',
        content:
        <div>
        <div style={{fontSize: '20px', float: 'left', lineHeight: '2.2', textAlign: 'right'}}>
          <span style={{padding: '10px 0'}}>Character Name</span><br/>
          <span style={{padding: '10px 0'}}>Max Wounds</span><br/>
          <span style={{padding: '10px 0'}}>Max Strain</span><br/>
          <span style={{padding: '10px 0'}}>Credits</span><br/>
          <span style={{padding: '10px 0'}}>imageURL</span><br/>
        </div>
        <div style={{marginLeft: '135px'}}>
          <input className='textinput' style={{textAlign: 'center', width: '10em'}} id='charName' defaultValue={this.state.currentCharacter['name']} /><br/>
          <input className='textinput' style={{textAlign: 'center', width: '10em'}} id='maxWounds' defaultValue={this.state.currentCharacter['maxWounds']} /><br/>
          <input className='textinput' style={{textAlign: 'center', width: '10em'}} id='maxStrain' defaultValue={this.state.currentCharacter['maxStrain']} /><br/>
          <input className='textinput' style={{textAlign: 'center', width: '10em'}} id='credits' defaultValue={this.state.currentCharacter['credits']} /><br/>
          <input className='textinput' style={{textAlign: 'center', width: '10em'}} id='imageURL' defaultValue={this.state.currentCharacter['imageURL']} /><br/>
        </div>
        </div>,
        buttons: {
            left: ['cancel'],
            right: [{
                text: 'Save',
                className: 'success',
                action: () => {
                    let currentCharacter = {
                                  name: document.getElementById('charName').value,
                                  currentWounds: this.state.currentCharacter['currentWounds'],
                                  maxWounds: document.getElementById('maxWounds').value,
                                  currentStrain: this.state.currentCharacter['currentStrain'],
                                  maxStrain: document.getElementById('maxStrain').value,
                                  credits: document.getElementById('credits').value,
                                  imageURL: document.getElementById('imageURL').value,
                                  key: this.state.currentCharacter['key'],
                                };
                    if (currentCharacter['imageURL'] === '') {
                      currentCharacter['imageURL'] = '/images/crest.png';
                    }

                    if (currentCharacter['key'] === undefined) {
                      currentCharacter['key'] = this.genKey()
                    }
                    this.state.characterRef.child(this.getcurrentKey()).set(currentCharacter);
                    this.checkIncap(currentCharacter);
                    this.state.messageRef.push().set(currentCharacter['name'] + ' has been successfully edited!');
                    Popup.close();
                }
            }]

        }
    });
  }

  Remove() {
    if (Object.keys(this.state.character).length > 1) {
      this.state.characterRef.child(this.getcurrentKey()).remove();
      this.state.messageRef.push().set(this.state.currentCharacter['name'] + ' has been removed.');
      this.previous();
    } else {
      this.state.characterRef.child(this.getcurrentKey()).remove();
      this.state.messageRef.push().set(this.state.currentCharacter['name'] + ' has been removed.');
      this.setState({currentCharacter: {name: 'No Characters', currentWounds: 0, maxWounds: 0, currentStrain: 0, maxStrain: 0, credits: 0, imageURL: '/images/crest.png'}});
    }
  }

  popupDeleteCharacter() {
    Popup.create({
    title: 'Delete Character',
    content: 'Are you sure, this will delete ' + this.state.currentCharacter['name'],
    className: 'alert',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.Remove();
              Popup.close();
            }
        }]
    }});
  }


  previous() {
    if (position - 1 < 0) {
      position = Object.keys(this.state.character).length-1;
    } else {
      position--;
    }
    let currentCharacter = this.state.character[Object.keys(this.state.character)[position]];
    this.setState({currentCharacter});
    this.checkIncap(currentCharacter);
  }

  next() {
    if (position + 1 === Object.keys(this.state.character).length) {
      position = 0;
    } else {
      position++;
    }
    let currentCharacter = this.state.character[Object.keys(this.state.character)[position]];
    this.setState({currentCharacter});
    this.checkIncap(currentCharacter);
  }

  checkIncap(currentCharacter) {
    if (currentCharacter['currentWounds'] > currentCharacter['maxWounds']  || currentCharacter['currentStrain'] > currentCharacter['maxStrain']) {
      this.setState({incapacitated: 'block'});

    } else {
      this.setState({incapacitated: 'none'});
    }
  }

  modifyStats(e) {
    e.preventDefault();
    var modifyStat = {
      currentWounds: this.refs.currentWounds.value,
      currentStrain: this.refs.currentStrain.value,
      credits: this.refs.credits.value
    };
    let currentCharacter = Object.assign({}, this.state.currentCharacter);
    for (var j = 0; j < Object.keys(modifyStat).length; j++) {
      var stat = Object.keys(modifyStat)[j];
      var modifier = modifyStat[stat];
      if (modifier !== '') {
        var message = currentCharacter['name'];
        if (modifier.includes('+')) {
          if (stat === 'credits') {message += ' earns '}
          else {message += ' takes '}
          modifier = (modifier).replace(/\D/g, '');
          message += (modifier + ' ' + stat.replace('current', '') + ' for a total of ');
          modifier = +this.state.currentCharacter[stat] + +modifier;
          message += (modifier + ' ' + stat.replace('current', ''));
      	//subtraction modifier
        } else if (modifier.includes('-')) {
          if (stat === 'credits') {message += ' spends '}
          else {message += ' recovers '}
          modifier = (modifier).replace(/\D/g, '');
          message += (modifier + ' ' + stat.replace('current', '') + ' for a total of ');
          modifier = +this.state.currentCharacter[stat] - +modifier;
          message += (modifier + ' ' + stat.replace('current', ''));

        } else {
          modifier = +(modifier).replace(/\D/g, '');
          message += (' ' + stat.slice(7) + ' set to ' + modifier);
        }
        currentCharacter[stat] = modifier;
    this.refs.currentWounds.blur();
    this.refs.currentStrain.blur();
    this.refs.credits.blur();
    this.refs.currentWounds.value = '';
    this.refs.currentStrain.value = '';
    this.refs.credits.value = '';
    this.state.characterRef.child(this.getcurrentKey()).set(currentCharacter);
    this.checkIncap(currentCharacter);
    this.state.messageRef.push().set(message);

    }
  }
}

  getcurrentKey() {
    let currentCharacter = Object.assign({}, this.state.currentCharacter);
    let character = Object.assign({}, this.state.character);
    for (var i = 0; i < Object.keys(character).length; i++) {
      if (character[Object.keys(character)[i]]['key'] === currentCharacter.key) {
        return Object.keys(character)[i];
      }
    }
  }

  genKey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  render() {
    return (
      <div className='dice-box' style={{margin: '5px', marginTop: '40px', minHeight: '225px', display: 'block', textAlign: 'center'}}>
        <img className='characterimage' ref='imageURL' onClick={this.editCharacter.bind(this)} style={{float: 'right', marginRight: '5px'}} src={this.state.currentCharacter['imageURL']} alt=''/>
        <div style={{float: 'left'}}>
          <button className='btnAdd' onClick={this.setNew.bind(this)}>+</button>
          <button className='btnAdd' onClick={this.popupDeleteCharacter.bind(this)}>-</button>
          <button className='btnAdd' onClick={this.previous.bind(this)}>←</button>
          <button className='btnAdd' onClick={this.next.bind(this)}>→</button>
        </div>
        <div style={{lineHeight: '1.6'}}>
          <b style={{fontSize: '25px', color: 'black', textAlign: 'center', padding: '5px'}}>{this.state.currentCharacter['name']}</b>
          <br />
          <b style={{fontSize: '25px', color: 'red', display: this.state.incapacitated}}>Incapacitated</b>
        </div>
          <div style={{marginLeft: '70px', textAlign: 'left'}}>
            <div>
              <form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='currentWounds' placeholder={this.state.currentCharacter['currentWounds']} style={{width: '40px', textAlign: 'center'}}/>
              <b style={{fontSize: '20px', color: 'Black'}}>/{this.state.currentCharacter['maxWounds']} Wounds</b>
            </form>
            </div>
            <div>
              <form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='currentStrain' placeholder={this.state.currentCharacter['currentStrain']} style={{width: '40px', textAlign: 'center'}}/>
              <b style={{fontSize: '20px', color: 'Black'}}>/{this.state.currentCharacter['maxStrain']} Strain</b>
              </form>
            </div>
            <div>
              <form onSubmit={this.modifyStats.bind(this)}><input className='textinput' ref='credits' placeholder={this.state.currentCharacter['credits']} style={{width: '40px', textAlign: 'center'}}/>
              <b style={{marginLeft: '10px', fontSize: '20px', color: 'Black'}}> Credits</b>
              <button className='btnAdd' style={{width: '75px', marginLeft:'40px', display: 'inline-block'}}>Update</button>
              </form>
            </div>
          </div>
      </div>
    )
  }
}
  export default Character;
