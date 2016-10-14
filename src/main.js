import React from 'react'
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'
import ReactDOM from 'react-dom'
import json from '../data.json' //初期データ

let data = json.data
//keyを割り振る
for(let i = 0; i < data.length; i += 1) {
  if (i == 0) { data.unshift({"title": "トップ"}) }
  data[i].key = i
  if (!data[i].children) { data[i].children = [] }
  for(let j = 0; j < data[i].children.length; j += 1) {
    if (j == 0) { data[i].children.unshift({"title": "戻る"}) }
    data[i].children[j].key = i+"-"+j
    if (!data[i].children[j].children) { data[i].children[j].children = [] }
    for( let k = 0; k < data[i].children[j].children.length; k +=1) {
      if (k == 0) { data[i].children[j].children.unshift({"title": "戻る"}) }
      data[i].children[j].children[k].key = i + "-" + j + "-" + k
      if (!data[i].children[j].children[k].children) { data[i].children[j].children[k].children = [] }
    }
  }
}

//longPressのTimerを入れとく変数
let pressTimer
//longPressか判断する変数
let longPress
//戻るのタイマー入れとくとこ
let backTimer
//ブラウジング中のURL
let browsing
// Class宣言
let Main = React.createClass({
  getInitialState: function() {
    let pos = [0]
    return {pos: pos}
  },
  posBack: function() {
    console.log("時間経過")
    let pos = this.state.pos
    backTimer = setTimeout(this.posBack, 1500)
    // 現在位置のitemを取ってくる
    let list = data;
    for(let i = 0; i < pos.length-1; i += 1) {
      list = list[pos[i]].children
    }
    let item = list[pos[pos.length-1]]
    // urlを持っていれば遷移
    if (item.url) {
      if (browsing != item.url) {
        console.log("コンテンツ遷移")
        browsing = item.url
        window.opener.location.href = item.url
      }

    // 最上階層であれば移動しない
    } else if (pos[pos.length-1] == 0 && pos.length == 1) {

    // Listの一番上なので戻る要素だから上の階層に移動
    } else if (pos[pos.length-1] == 0) {
      pos.pop()
      pos[pos.length-1] = 0
      this.setState({pos: pos})

    // 下の階層に移動
    } else {
      pos.push(1)
      this.setState({pos: pos})
    }
  },
  keyDown: function(e) {
    longPress = false
    // pressTimer = setTimeout(this.pressTimer, 200)
    clearTimeout(backTimer)
  },
  keyUp: function(e) {
    // clearTimeout(pressTimer)
    backTimer = setTimeout(this.posBack, 2000)
    let pos = this.state.pos
    console.log(pos)
    if(!longPress) {
      console.log("shortPress")
      // 現在位置のListを取ってくる
      let list = data;
      for(let i = 0; i < pos.length-1; i += 1) {
        list = list[pos[i]].children
      }
      pos[pos.length-1] = (list.length-1 === pos[pos.length-1] ? 0 : pos[pos.length-1] + 1)
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
        <input type="text" ref="nameInput" onKeyPress={this.keyDown} onKeyUp={this.keyUp}/>
      </div>
    );
  }
})

let Item = React.createClass({
  render: function() {
    let pos = this.props.pos
    let style = {}
    if (pos == this.props.class) {
      style.color = "white"
      style.fontWeight = "bold"
      style.background = "#000000"
      //音の読み上げ
      speechSynthesis.cancel()
      let synthesis = new SpeechSynthesisUtterance();
      synthesis.lang = 'ja-JP'
      synthesis.rate = 1.5
      synthesis.text = this.props.text
      speechSynthesis.speak(synthesis)
    } else {
      style.color = "#000000"
    }
    // if (pos == this.props.class && this.props.url) {
    //   console.log("コンテンツ遷移")
    //   $('#content').attr('src', this.props.url);
    // }

    return (
        <div className={this.props.class} style={style}>
            {this.props.text}
          <Items items={this.props.items} pos={pos}/>
        </div>
    );
  }
})

let Items = React.createClass({
  render: function() {
    let pos = this.props.pos
    let posArray = pos.split('-')
    let show = true
    let items = this.props.items.map(function(item, idx) {
      let key = (""+item.key).split('-')
      for (let i = 0; i < key.length-1; i ++) {
        if (posArray.length < key.length || posArray[i] != key[i]) {
          show = false
        }
      }
      return (
        <Item text={item.title} class={item.key} items= {item.children} pos={pos} key={item.key} url={item.url}>
        </Item>
      )
    })
    if (!show) { items = ""}
    return (
      <div className="items">
      <ReactCSSTransitionGroup
        transitionName="item"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}>
        {items}
      </ReactCSSTransitionGroup>
      </div>
    );
  }
})

//描画
ReactDOM.render(
  <Main />,
  document.getElementById('main')
);
