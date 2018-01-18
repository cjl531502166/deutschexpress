// pages/extrafees/extrafee.js
import One from '../../utils/one.js';
import orderModel from '../../models/order.model.js';
import orderService from '../../services/orderInfo.service.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderInfo: null,
        packageInfo: {},
    },
    onLoad: function (options) {
        let packageid = options.pid,
            order_sn = options.oid,
            that = this;
        orderService.getOrderInfo(order_sn, res => {
            res.data.data.packages.forEach((item, index) => {
                if (item.packageid == packageid) {
                    that.data.packageInfo = item;
                    return
                }
            })
            this.setData({
                orderInfo: res.data.data,
                packageInfo: that.data.packageInfo
            })
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
                    this.data.orderModel.orderInfo.status = '已支付';
                    this.setData({
                        orderInfo: this.data.orderInfo
                    })
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
                        title: '支付失败'
                    })
                }
            })
        })
    }
})