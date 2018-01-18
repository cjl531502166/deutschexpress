// pages/receivers/receivers.js
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
const app = getApp();
Page({
    data: {
        deliveryConfig: deliveryConfig
    },
    onLoad(options) {
        wx.showLoading();
        deliveryService.getReceivers(res => {
            this.setData({
                'deliveryConfig': deliveryConfig
            })
        })
    },
    // 设置默认地址
    addressChange(e) {
        let currIndex = e.detail.value - 0;
        deliveryService.setDefault('user/receiver-set-default', currIndex)
    },
    deleteAddr(e) {
        let id = e.currentTarget.dataset.id;
        // 删除收件人

        deliveryService.deleteReceiver(id, res => {
            wx.showToast({
                title: '已删除'
            });
            deliveryService.getReceivers(res => {
                this.setData({
                    'deliveryConfig': deliveryConfig
                })
            })
        })
    },
    editReceiver(e) {
        let id = e.currentTarget.dataset.id;
        deliveryService.getCurrReceiver(id, deliveryConfig.receiverList);
        //获得当前收件人并发送给编辑页面
        wx.navigateTo({
            url: '/pages/edit_receiver/edit?id=' + id
        })
    }
})