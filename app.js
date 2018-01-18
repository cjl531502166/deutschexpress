//app.js
import Login from './components/modals/login.js';
import One from './utils/one.js';
App({
    onLaunch: function () {
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo;
                        }
                    })
                }
            }
        });
    },
    globalData: {
        meta: '',
        userInfo: null
    }
})