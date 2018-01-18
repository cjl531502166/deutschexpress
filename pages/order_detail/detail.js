// pages/order_detail/detail.js
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
        orderModel: null,
        weight: '',
        canEdit: false,//是否可编辑
        unPaid: false //是否付款
    },

    onLoad: function (options) {
        let order_sn = options.id,
            that = this;
        orderService.getOrderInfo(order_sn, res => {
            let id = orderModel.orderInfo.delivery_type_id;//物流渠道id
            orderModel.orderInfo.packages.forEach((item, index) => {
                that.data.weight += item.weight
            });
            if (searchModel.delivery_types) {
                orderModel.orderInfo.deliver_type = searchModel.delivery_types[id]
            } else {
                searchService.getDeliverTypes(res => {
                    orderModel.orderInfo.deliver_type = searchModel.delivery_types[id]
                })
            }
            that.data.canEdit = (orderModel.orderInfo.status === "暂存" ? true : false);
            that.data.unPaid = (orderModel.orderInfo.status === "新建" || orderModel.orderInfo.status === "未支付" ? true : false);
            that.setData({
                orderModel: orderModel,
                weight: that.data.weight,
                canEdit: that.data.canEdit,
                unPaid: that.data.unPaid
            });
        })
    },
    //修改订单
    editOrder(e) {
        let order_sn = orderModel.orderInfo.order_sn;
        deliverConfig.orderType = orderModel.orderInfo.delivery_range;
        deliverConfig.deliver_type_id = orderModel.orderInfo.delivery_type_id;
        deliverConfig.currReceiver = orderModel.orderInfo.receiver;
        deliverConfig.currSender = orderModel.orderInfo.sender;
        deliverConfig.packageList = orderModel.orderInfo.packages;
        deliverConfig.fee = orderModel.orderInfo.fee;
        wx.redirectTo({
            url: '/pages/delivery/delivery?id=' + order_sn
        })
    },
    //支付订单
    payOrder(e) {
        let order_sn = orderModel.orderInfo.order_sn;
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
    },
    //物流查询
    trackPkg(e) {
        let num = e.currentTarget.dataset.num;
        wx.redirectTo({
            url: '/pages/delivery_detail/delivery_detail?deliverynum=' + num
        })
    }
})