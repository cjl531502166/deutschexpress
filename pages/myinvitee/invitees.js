// pages/myinvitee/invitees.js
import One from '../../utils/one.js';
Page({
    data: {
        inviteeList: null,
        num: 0,
        userid: ''
    },

    onLoad: function (options) {
        One.ajax('user/invite-list', {}, res => {
            this.setData({
                num: res.data.data.num,
                inviteeList: res.data.data.list
            })
        })
    },
    onShow: function () {
        One.ajax('user/info', {}, res => {
            this.setData({
                userid: res.data.data.id
            })
        })
    },
    onShareAppMessage(res) {
        return {
            "title": "乐志物流，十分钟快速出单",
            "path": "/pages/index/index?meta=" + this.data.userid,
            "imageUrl": "/images/share.jpg",
            "success":res =>{
                
            }
        }
    }
})