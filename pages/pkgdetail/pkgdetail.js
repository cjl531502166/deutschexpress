// pages/pkgdetail/pkgdetail.js
import orderModel from '../../models/order.model.js';
import orderService from '../../services/orderInfo.service.js';
import deliveryTrack from '../../services/delivery.track.js';
Page({
    data: {
        order_sn: '',
        orderInfo: null,
        packageInfo: {},
        unPaid: false,
        canTrack: false,
        canCancel: false
    },

    onLoad: function (options) {
        let that = this,
            packageid = options.pid,
            order_sn = that.data.order_sn = options.oid,
            status,
            orderInfo = null;
        orderService.getOrderInfo(order_sn, res => {
            orderInfo = res.data.data;
            orderInfo.packages.forEach((item, index) => {
                if (item.packageid == packageid) {
                    that.data.packageInfo = item;
                    return;
                }
            });
            status = orderInfo.status;
            that.data.unPaid = /delivery_unpaid/.test(orderInfo.status_en);
            that.data.canCancel = ((status === "新建" || that.data.unPaid == true) ? true : false);
            that.data.canTrack = (orderInfo.delivery_no && orderInfo.delivery_range =='international')? true : false;
            this.setData({
                orderInfo: orderInfo,
                packageInfo: that.data.packageInfo,
                canDownloadBill: that.data.canDownloadBill,
                canTrack: that.data.canTrack,
                canCancel: that.data.canCancel
            });
        })
    },
    payOrder() {
        wx.redirectTo({
            url: '/pages/order_detail/detail?id=' + this.data.order_sn,
        })
    },
    //查看物流
    trackPkg() {
        let delivery_no = this.orderInfo.delivery_no;
        deliveryTrack.getState(delivery_no, res => {
            wx.redirectTo({
                url: '/pages/delivery_detail/delivery_detail'
            });
        });
    },
    //取消包裹
    cancelPackage() {

    }
})