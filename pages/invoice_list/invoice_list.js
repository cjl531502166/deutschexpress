// pages/invoice_list/invoice_list.js
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
        this.setData({
            "deliveryConfig": deliveryConfig
        })
    },

    getCurrInvoice(e){
        let id = e.currentTarget.dataset.id;
        
        wx.redirectTo({
            url: '/pages/delivery/delivery'
        })
    }
})