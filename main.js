var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup

//初期データ
let data = {}
$.ajaxSetup({async: false});//同期通信(json取ってくるまで待つ)
$.getJSON("data.json", function(json) {
  console.log(json)
    data = json // this will show the info it in firebug console
});
data = data.data

//keyを割り振る
for(let i = 0; i < data.length; i += 1) {
  data[i].key = i
  for(let j = 0; j < data[i].children.length; j += 1) {
    data[i].children[j].key = i+"-"+j
    for( let k = 0; k < data[i].children[j].children.length; k +=1) {
      data[i].children[j].children[k].key = i + "-" + j + "-" + k
    }
  }
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
      console.log("コンテンツ遷移")
      $('#content').attr('src', this.props.url);

    // TOPであれば移動しない
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
  mouseDown: function(e) {
    longPress = false
    // pressTimer = setTimeout(this.pressTimer, 200)
    clearTimeout(backTimer)
  },
  mouseUp: function(e) {
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
