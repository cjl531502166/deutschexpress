// pages/pkgdetail/pkgdetail.js
import orderModel from '../../models/order.model.js';
import orderService from '../../services/orderInfo.service.js';
Page({
    data: {
        order_sn:'',
        orderInfo: null,
        packageInfo: {},
        isPaid:false,
        canDownloadBill: false,
        canTrack: false,
        canCancel: false
    },

    onLoad: function (options) {
        let that = this,
            packageid = options.pid,
            order_sn = that.data.order_sn = options.oid,
            status;
        orderService.getOrderInfo(order_sn, res => {
            that.data.orderInfo = res.data.data;
            that.data.orderInfo.packages.forEach((item, index) => {
                if (item.packageid == packageid) {
                    that.data.packageInfo = item;
                    return;
                }
            });
            status = that.data.orderInfo.status;
            that.data.canDownloadBill = (status === "已支付" ? true : false);
            that.data.canTrack = (status === "已审核" || status === "已出库" ? true : false);
            that.data.canCancel = (status === "新建" || status === "未支付" ? true : false);
            that.data.isPaid = (status ==='未支付'?false:true);
            this.setData({
                orderInfo: that.data.orderInfo,
                packageInfo: that.data.packageInfo,
                canDownloadBill: that.data.canDownloadBill,
                canTrack: that.data.canTrack,
                canCancel: that.data.canCancel
            })
        })
    },
    payOrder(){
        wx.redirectTo({
            url: '/pages/order_detail/detail?id='+this.data.order_sn,
        })
    },
    //下载境内单
    downLoadBill(){

    },
    //查看物流
    trackOrder(){

    },
    //取消包裹
    cancelPackage(){

    }
})