// pages/receiver_list/receiver_list.js
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        deliveryConfig: null
    },
    onLoad: function () {
        var list;
        wx.showLoading();
        deliveryService.getReceivers(res => {
            if (['international','clearcustom'].indexOf(deliveryConfig.orderType) < 0) {
                deliveryConfig.receiverList.forEach((item, index, arr) => {
                    if (/China|中国/g.test(item.country)) {
                        list = deliveryConfig.receiverList.slice(index + 1);
                    }
                });
                deliveryConfig.receiverList = list;
            };
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