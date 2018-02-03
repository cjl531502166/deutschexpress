// pages/order_detail/detail.js
import M from '../../components/modals/common.js';
import One from '../../utils/one.js';
import orderModel from '../../models/order.model.js';
import orderService from '../../services/orderInfo.service.js';
import deliverConfig from '../../models/delivery.config.js';
import deliverService from '../../services/delivery.service.js';
import searchModel from '../../models/search.model.js';
import searchService from '../../services/search.service.js';
import deliveryTrack from '../../services/delivery.track.js';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        orderModel: null,
        canEdit: false,//是否可编辑
        unPaid: false, //是否付款
        additionalPay:false, //是否需要补款
        canTrack:false //是否可以查看物流
    },
    onLoad: function (options) {
        let order_sn = options.id,
            that = this,
            orderInfo = null;
        orderService.getOrderInfo(order_sn, res => {
            orderInfo = orderModel.orderInfo;
            //物流渠道id
            let id = orderInfo.delivery_type_id;
            if (searchModel.delivery_types) {
                orderInfo.deliver_type = searchModel.delivery_types[id]
            } else {
                searchService.getDeliverTypes(res => {
                    orderInfo.deliver_type = searchModel.delivery_types[id]
                })
            }
            that.data.canEdit = (orderInfo.status === "暂存" ? true : false);
            that.data.unPaid = /delivery_unpaid/.test(orderInfo.status_en);
            that.data.additionalPay = /delivery_outofweight/.test(orderInfo.status_en);
            that.data.canTrack = (orderInfo.delivery_range === 'international' && orderInfo.delivery_no)?true:false;
            that.setData({
                orderModel: orderModel,
                canEdit: that.data.canEdit,
                unPaid: that.data.unPaid,
                additionalPay: that.data.additionalPay
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
        });
    },
    //支付订单
    payOrder(e) {
        let order_sn = orderModel.orderInfo.order_sn;
        One.ajax('wxapay/pay-params', { "order_sn": order_sn }, res => {
            if (res.data.data.params){
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
                });
            }else{
                M._alert(res.data.data.error_msg);
            }
        })
    },
    //物流查询
    trackPkg() {
        let delivery_no = this.data.orderModel.orderInfo.delivery_no;
        deliveryTrack.getState(delivery_no,res=>{
            wx.redirectTo({
                url: '/pages/delivery_detail/delivery_detail'
            })
        });
    }
})