// pages/pkgdetail/pkgdetail.js
import orderModel from '../../models/order.model.js';
import orderService from '../../services/orderInfo.service.js';
Page({
    data: {
        orderInfo: null,
        packageInfo: {},
        canDownloadBill: false,
        canTrack: false,
        canCancel: false
    },

    onLoad: function (options) {
        let packageid = options.pid,
            order_sn = options.oid,
            that = this;
        orderService.getOrderInfo(order_sn, res => {
            that.data.orderInfo = res.data.data;
            that.data.orderInfo.packages.forEach((item, index) => {
                if (item.packageid == packageid) {
                    that.data.packageInfo = item;
                    return;
                }
            })
            that.data.canDownloadBill = (that.data.orderInfo.status === "已支付" ? true : false);
            that.data.canTrack = (that.data.orderInfo.status === "已审核" || that.data.orderInfo.status === "已出库" ? true : false);
            that.data.canCancel = (that.data.orderInfo.status === "新建" || that.data.orderInfo.status === "未支付" ? true : false);
            this.setData({
                orderInfo: that.data.orderInfo,
                packageInfo: that.data.packageInfo,
                canDownloadBill: that.data.canDownloadBill,
                canTrack: that.data.canTrack,
                canCancel: that.data.canCancel
            })
        })
    }
})