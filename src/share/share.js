import React from 'react'
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'
import ReactDOM from 'react-dom'

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

module.exports = Items;
