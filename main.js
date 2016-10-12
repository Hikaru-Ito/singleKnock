var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup
//初期データ
let data = []
for(let i = 0; i < 10; i += 1) {
  let item = {}
  item["title"] = "title" + i
  item["key"] = i
  item["children"] = []
  for(let j = 0; j < 10; j += 1) {
    let itemj = {}
    itemj["title"] = "title" + i + "-" + j
    itemj["key"] = i+"-"+j
    itemj["children"] = []
    for( let k = 0; k < 10; k +=1) {
      let itemk = {}
      itemk["title"] = "title" + i + "-" + j +"-" + k
      itemk["key"] = i + "-" + j + "-" + k
      itemk["children"] = []
      itemk["url"] = "https://www.youtube.com/embed/IALr6M2NXsE"
      itemj.children.push(itemk)
    }
    item.children.push(itemj)
  }
  data.push(item)
}

//longPressのTimerを入れとく変数
let pressTimer
//longPressか判断する変数
let longPress
//戻るのタイマー入れとくとこ
let backTimer
//SpeechAPIの設定


// Class宣言
let Main = React.createClass({
  getInitialState: function() {
    let pos = [0]
    return {pos: pos}
  },
  posBack: function() {
    console.log("きたぞー")
    let pos = this.state.pos;
    backTimer = setTimeout(this.posBack, 2000)
    if (pos.length > 1) {
      pos.pop()
      this.setState({pos: pos})
    }
  },
  mouseDown: function(e) {
    longPress = false
    pressTimer = setTimeout(this.pressTimer, 200)
    clearTimeout(backTimer)
  },
  mouseUp: function(e) {
    clearTimeout(pressTimer)
    backTimer = setTimeout(this.posBack, 2000)
    let pos = this.state.pos
    console.log(pos)
    if(!longPress) {
      console.log("shortPress")
      pos[pos.length-1] = (data.length-1 === pos[pos.length-1] ? 0 : pos[pos.length-1] + 1)
    }
    this.setState({pos: pos})
  },
  pressTimer: function() {
    console.log("LongPress")
    longPress = true
    let pos = this.state.pos
    pos.push(0)
    this.setState({pos: pos})
  },
  render: function() {
    return (
      <div onMouseDown={this.mouseDown} onMouseUp={this.mouseUp}>
        <Items items={data} pos={this.state.pos.join('-')}/>
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
    if (pos == this.props.class && this.props.url) {
      console.log("コンテンツ遷移")
      $('#content').attr('src', this.props.url);
    }

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
