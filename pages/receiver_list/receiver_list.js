// pages/receiver_list/receiver_list.js
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        deliveryConfig: deliveryConfig
    },
    onLoad: function () {
        wx.showLoading();
        deliveryService.getReceivers(res => {
            this.setData({
                'deliveryConfig': deliveryConfig
            });
        });
    },
    getCurrReceiver(e) {
        let id = e.currentTarget.dataset.id;
        deliveryService.getCurrReceiver(id, deliveryConfig.receiverList)
        wx.redirectTo({
            url: '/pages/delivery/delivery'
        })
    }
})