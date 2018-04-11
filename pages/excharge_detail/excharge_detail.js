// pages/extrafees/extrafee.js
import One from '../../utils/one.js';
import orderModel from '../../models/order.model.js';
import orderService from '../../services/orderInfo.service.js';
import searchModel from '../../models/search.model.js';
import searchService from '../../services/search.service.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderInfo: null
  },
  onLoad: function (options) {
    let id = '',
      packageid = options.pid,
      order_sn = options.oid,
      that = this;
    orderService.getOrderInfo(order_sn, res => {
      id = orderModel.orderInfo.delivery_type_id;
      if (searchModel.delivery_types) {
        orderModel.orderInfo.deliver_type = searchModel.delivery_types[id]
      } else {
        searchService.getDeliverTypes(res => {
          orderModel.orderInfo.deliver_type = searchModel.delivery_types[id]
        })
      }
      this.setData({
        orderInfo: orderModel.orderInfo
      });
    })
  },
  //补款
  payExcharge() {
    let order_sn = this.data.orderInfo.order_sn;
    One.ajax('wxapay/pay-params', { "order_sn": order_sn }, res => {
      wx.requestPayment({
        "appId": res.data.data.params.appId,
        "timeStamp": res.data.data.params.timeStamp,
        "nonceStr": res.data.data.params.nonceStr,
        "package": res.data.data.params.package,
        "signType": res.data.data.params.signType,
        "paySign": res.data.data.params.paySign,
        "success": res => {
          wx.showToast({
            title: '支付成功',
            success: res => {
              wx.redirectTo({
                url: '/pages/myorder/order_list'
              })
            }
          })
        },
        "fail": res => {
          wx.showToast({
            icon: 'none',
            title: '未支付'
          })
        }
      })
    })
  }
})