// pages/user/user.js
const app = getApp();
import One from '../../utils/one.js';
Page({
    data: {
        userInfo: {}
    },
    onLoad() {
        let that = this;
        //获取绑定的邮箱
        One.ajax('user/info', {}, res => {
            that.setData({
                'userInfo': res.data.data
            })
        })
    },
})