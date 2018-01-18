//alert 弹框
class M{
  constructor(){
    
  }
  _alert(content, succCb, cancelCb){
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          succCb && succCb();
        } else {
          cancelCb && cancelCb();
        }
      }
    })
  }
  //confirm 框
  _confirm(content, succCb, cancelCb) {
    wx.showModal({
      title: '提示',
      content: content,
      success: (res) => {
        if (res.confirm) {
          succCb && succCb();
        } else {
          cancelCb && cancelCb();
        }
      }
    })
  }
}

export default new M()