import React from 'react'
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'
import ReactDOM from 'react-dom'
import json from '../../data.json' //初期データ
import Items from '../share/share.js'

console.log('2knock')

let data = json.data
//keyを割り振る
for(let i = 0; i < data.length; i += 1) {
  // if (i == 0) { data.unshift({"title": "トップ"}) }
  data[i].key = i
  if (!data[i].children) { data[i].children = [] }
  for(let j = 0; j < data[i].children.length; j += 1) {
    // if (j == 0) { data[i].children.unshift({"title": "戻る"}) }
    data[i].children[j].key = i+"-"+j
    if (!data[i].children[j].children) { data[i].children[j].children = [] }
    for( let k = 0; k < data[i].children[j].children.length; k +=1) {
      // if (k == 0) { data[i].children[j].children.unshift({"title": "戻る"}) }
      data[i].children[j].children[k].key = i + "-" + j + "-" + k
      if (!data[i].children[j].children[k].children) { data[i].children[j].children[k].children = [] }
    }
  }
}

//longPressのTimerを入れとく変数
let pressTimer
//longPressか判断する変数
let longPress
//keyDownの初回だけメソッド呼び出すために
let keyPressed = false
//戻るのタイマー入れとくとこ
let backTimer
//ブラウジング中のURL
let browsing
// Class宣言
let Main = React.createClass({
  updateState: function(pos) {
    pos = pos.split('-')
    for (let i = 0; i < pos.length; i++) {
      pos[i] = parseInt(pos[i])
    }
    this.setState({pos: pos})
    console.log(pos)
  },
  getInitialState: function() {
    let pos = [0]
    return {pos: pos}
  },
  posBack: function() {
    let pos = this.state.pos
    backTimer = setTimeout(this.posBack, 3000)
    // 現在位置のitemを取ってくる
    let list = data;
    for(let i = 0; i < pos.length-1; i += 1) {
      list = list[pos[i]].children
    }
    let item = list[pos[pos.length-1]]
    if (longPress || pos.length == 1) {　// LongPress or 最上階層であれば移動しない
    } else { // Listの一番上なので戻る要素だから上の階層に移動
      pos.pop()
      this.setState({pos: pos})
    }
  },
  keyPress: function(e) {
    if(!keyPressed) {
      keyPressed = true
      longPress = false
      pressTimer = setTimeout(this.pressTimer, 300)
    }
    clearTimeout(backTimer)
  },
  keyUp: function(e) {
    keyPressed = false
    clearTimeout(pressTimer)
    backTimer = setTimeout(this.posBack, 3000)
    let pos = this.state.pos
    if(!longPress) {
      // 現在位置のListを取ってくる
      let list = data;
      for(let i = 0; i < pos.length-1; i += 1) {
        list = list[pos[i]].children
      }
      pos[pos.length-1] = (list.length-1 === pos[pos.length-1] ? 0 : pos[pos.length-1] + 1)
    }
    this.setState({pos: pos})
    ts.write({type: "pos", pos: pos.join('-')})
  },
  pressTimer: function() {
    let pos = this.state.pos
    longPress = true
    // 現在位置のitemを取ってくる
    let list = data;
    for(let i = 0; i < pos.length-1; i += 1) {
      list = list[pos[i]].children
    }
    let item = list[pos[pos.length-1]]
    // urlを持っていれば遷移
    if (item.url) {
      browsing = item.url
      window.opener.location.href = item.url
    // 下の階層に移動
    } else {
      pos.push(0)
    }
    this.setState({pos: pos})
  },
  componentDidMount: function() {
    this.refs.nameInput.focus();
  },
  render: function() {
    return (
      <div>
        <Items items={data} pos={this.state.pos.join('-')}/>
        <input type="text" ref="nameInput" onKeyPress={this.keyPress} onKeyUp={this.keyUp}/>
      </div>
    );
  }
})
//描画
let domInstance = ReactDOM.render(
  <Main />,
  document.getElementById('main')
);
// Linda
// let server_url = "http://localhost:8931"
let server_url = "http://linda.masuilab.com"
let socket = io.connect(server_url)
let linda = new Linda().connect(socket)
let ts = linda.tuplespace("knock")
linda.io.on("connect", function(){
  console.log("connect")
  ts.watch({type: "event"}, function(err, tuple) {
    if (tuple.data.key == "press") {
      domInstance.keyPress();
      domInstance.keyUp();
    } else if (tuple.data.key == "longpress") {
      domInstance.pressTimer();
    }
  })
  ts.watch({type: "pos"}, function(err, tuple){
    domInstance.updateState(tuple.data.pos)
  });
});
