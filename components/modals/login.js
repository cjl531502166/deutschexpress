import One from '../../utils/one.js';
export default {
  meta: '',
  checkSession(cb) {
    let that = this;
    wx.checkSession({
      success: (res) => {
        if (wx.getStorageSync('token') == '') {
          that.login(cb);
          return
        };
        cb && cb();
      },
      fail: (res) => {
        that.login(cb);
      }
    });
  },
  login(cb) {
    let that = this;
    wx.login({
      success: res => {
        let data = {
          "code": res.code,
          "inviter": that.meta
        };
        //发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: One.config.requestURI + 'wxa/login',
          data: data,
          success: res => {
            wx.setStorageSync('token', res.data.data.token);
            One.config.token = wx.getStorageSync('token');
            cb && cb();
          }
        })
      }
    })
  }
}