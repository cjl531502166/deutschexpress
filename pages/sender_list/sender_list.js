const app = getApp();
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deliveryConfig: null
  },

  onLoad: function () {
    wx.showLoading();
    deliveryService.getSenders(res => {
      this.setData({
        'deliveryConfig': deliveryConfig
      })
    })
  },
  getCurrSender(e) {
    let id = e.currentTarget.dataset.id;
    deliveryService.getCurrSender(id, deliveryConfig.senderList)
    wx.navigateTo({
      url: '/pages/delivery/delivery'
    })
  }
})