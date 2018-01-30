// pages/editemail/editemail.js
import M from '../../components/modals/common.js';
import One from '../../utils/one.js';
const app = getApp();
Page({

    data: {
        userEmail: null,
        errMsg: ""
    },

    onLoad: function () {
        One.ajax('user/info', {}, res => {
            this.setData({
                userEmail: res.data.data.email
            })
        })
    },
    getEmail(e) {
        this.data.userEmail = e.detail.value;
    },
    changeEmail() {
        let email = this.data.userEmail,
            reg = /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;
        if (!email) {
            this.setData({
                errMsg: "请输入邮箱地址"
            })
        }
        else if (!reg.test(email)) {
            this.setData({
                errMsg: "请输入正确的邮箱地址"
            })
        }
        else {
            One.ajax('user/set-email', { "email": email }, res => {
                //邮箱绑定成功的操作
                wx.showToast({
                    title: "绑定成功"
                })
                wx.reLaunch({
                    url: '/pages/user/user'
                })
            })
        }
    }
})