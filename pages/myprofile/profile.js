// pages/myprofile/profile.js
const app = getApp();
import One from '../../utils/one.js';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null
    },


    onLoad: function () {
        One.ajax('user/info',{},res =>{
            this.setData({
                "userInfo": res.data.data
            })
        })
    },
    editEmail(){
        wx.navigateTo({
            url: '/pages/editemail/editemail'
        })
    }
})