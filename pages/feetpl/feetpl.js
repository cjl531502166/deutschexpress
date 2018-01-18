// pages/feetpl/feetpl.js
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
Page({
    data: {
        delivers: null
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        deliveryService.getDelivers(res => {
            this.setData({
                delivers: deliveryConfig.delivers
            })
        })
    }
})