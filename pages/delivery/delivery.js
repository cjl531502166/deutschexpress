// pages/delivery/delivery.js
import M from '../../components/modals/common.js';
import One from '../../utils/one.js'
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        order_sn: '',
        delivery_range: null,//订单类型
        deliveryConfig: deliveryConfig, //物流配置
        senderInfo: null,//发件人信息
        receiverInfo: null,//收件人信息
        invoice_switch: null,//是否需要发票
        amount: 0,//订单总金额
        totalWeight: '',//包裹总重量
        pkgList: [],
        isOK: false,
        inputable: '',
        deliver_type_id: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 初始化数据
        let totalWeight = 0,
            order_sn = options.id?options.id:'',
            amount = deliveryConfig.fee - 0,//订单运费
            deliver_type_id = deliveryConfig.deliver_type_id ? deliveryConfig.deliver_type_id : '',
            invoice_switch = deliveryConfig.invoice_switch,
            senderInfo = deliveryConfig.currSender ? deliveryConfig.currSender : '',
            receiverInfo = deliveryConfig.currReceiver ? deliveryConfig.currReceiver : '',
            pkgList = deliveryConfig.packageList;
        //获取订单类型
        options.delivery_range && (deliveryConfig.orderType = options.delivery_range);
        this.setData({ inputable: deliveryConfig.orderType == 'international' ? 'disabled' : '' });
        //直接返回首页之后，重新选了订单类型，应该清空之前的pkglist
        deliveryConfig.orderType != 'international' && (deliveryConfig.packageList = []);
        if (pkgList.length > 0) {
            //计算重量
            for (let i = 0, len = pkgList.length; i < len; i++) {
                totalWeight += pkgList[i].weight - 0;
            };
        } else {
            totalWeight = deliveryConfig.weight?deliveryConfig.weight - 0:0;
        }
        //计算运费
        if (totalWeight > 0 && totalWeight <=30) {
            deliveryService.calcFee(
                {
                    "delivery_range": deliveryConfig.orderType,
                    "delivery_type_id": deliveryConfig.deliver_type_id,
                    "weight": totalWeight
                }
                , res => {
                    this.setData({ amount: deliveryConfig.fee });
                }
            );
        }else if(totalWeight>30){
            M.alert('订单超重');
        }

        //设置发票
        this.setData({
            "invoice_switch": invoice_switch == 'on' ? true : false
        });
        //获取物流配置
        if (options.delivery_range == 'international' && deliveryConfig.delivers == null) {
            deliveryService.getDelivers(() => {
                this.setData({
                    "deliveryConfig": deliveryConfig
                })
            })
        } else {
            this.setData({
                "deliveryConfig": deliveryConfig
            });
        };
        this.setData({
            "delivery_range": deliveryConfig.orderType,
            "senderInfo": senderInfo,
            "receiverInfo": receiverInfo,
            "amount": amount,
            "totalWeight": totalWeight == 0 ? '' : totalWeight,
            "pkgList": pkgList,
            "order_sn": order_sn,
            "deliver_type_id": deliver_type_id
        });
    },
    onHide() {
        this.setData({
            "senderInfo": null,
            "receiverInfo": null,
            "amount": 0,
            "totalWeight": 0,
            "pkgList": [],
            "deliver_type_id": ''
        })
    },
    //选择物流渠道
    radioChange(e) {
        let val = e.detail.value;
        this.setData({
            deliver_type_id: val
        });
        deliveryService.setDeliverType(val);
        //计算运费
        if (this.data.pkgList.length > 0) {
            deliveryService.calcFee(
                {
                    "delivery_range": deliveryConfig.orderType,
                    "delivery_type_id": deliveryConfig.deliver_type_id,
                    "weight": this.data.totalWeight
                }
                , res => {
                    this.setData({ amount: deliveryConfig.fee });
                }
            );
        }
    },
    //是否需要发票
    invoWantedChange(e) {
        let val = e.detail.value;
        this.setData({ "invoice_switch": val });
        deliveryConfig.invoice_switch = (e.detail.value == true ? 'on' : 'off');
    },
    // 包裹操作
    addPkg() {
        if (deliveryConfig.deliver_type_id == 0) {
            M._alert('请选择物流渠道');
            return
        }
        wx.navigateTo({
            url: '/pages/pkginfo/pkginfo'
        })
    },
    //购买包裹总重量
    weightChange(e) {
        let val = e.detail.value,
            timer = null;
        if (this.data.delivery_range === 'international' && this.data.deliver_type_id == 0) {
            M._alert('请先选择物流渠道');
            return false;
        }
        if (!val || !(/^[0-9]*$/.test(val))) {
            this.setData({ totalWeight: "", amount: 0 });
        } else {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.data.totalWeight = val;
                //计算运费
                deliveryService.calcFee(
                    {
                        "delivery_range": deliveryConfig.orderType,
                        "delivery_type_id": deliveryConfig.deliver_type_id,
                        "weight": val
                    }
                    , res => {
                        this.setData({ amount: deliveryConfig.fee });
                    }
                );
            }, 800)
        }
    },
    //删除包裹
    delPkg() {
        let pkgList = deliveryConfig.packageList,
            len = pkgList.length,
            totalWeight = 0,
            amount = 0;
        if (len > 0) {
            M._confirm(
                "你确认删除包裹" + len + "？",
                () => {
                    pkgList.splice(-1, 1);
                    //计算重量
                    for (let i = 0, len = pkgList.length; i < len; i++) {
                        totalWeight += pkgList[i].weight - 0;
                    };
                    deliveryService.calcFee(
                        {
                            "delivery_range": deliveryConfig.orderType,
                            "delivery_type_id": deliveryConfig.deliver_type_id,
                            "weight": totalWeight
                        }
                        , res => {
                            this.setData({
                                amount: deliveryConfig.fee,//
                                pkgList: pkgList,
                                totalWeight: totalWeight
                            });
                        }
                    );
                }
            )
        } else {
            M._alert('你还没有添加包裹，无法进行删除操作');
        }
    },
    // 添加收件人信息
    addReceiver() {
        wx.navigateTo({
            url: '/pages/receiver_list/receiver_list'
        })
    },
    // 添加发件人信息
    addSender() {
        wx.navigateTo({
            url: '/pages/sender_list/sender_list'
        })
    },
    //添加发票
    addInvoice() {
        wx.navigateTo({
            url: '/pages/invoice_list/invoice_list',
        })
    },
    //重置
    resetData() {
        deliveryConfig.currSender = null;
        deliveryConfig.currReceiver = null;
        deliveryConfig.fee = 0;
        deliveryConfig.weight = 0;
        deliveryConfig.packageList = [];
        deliveryConfig.invoice_switch = 'off';
        deliveryConfig.deliver_type_id = '';
        deliveryConfig.orderType = null;
    },
    //验证函数
    verifyFn() {
        if (this.data.delivery_range == 'international' && deliveryConfig.deliver_type_id == 0) {
            M._alert('请添选择物流渠道');
            return false
        }
        if (!this.data.receiverInfo) {
            M._alert('请添加收件人');
            return false
        }
        if (this.data.delivery_range == 'international' && this.data.senderInfo == '') {
            M._alert('请添加发件人');
            return false
        }
        if (this.data.delivery_range == 'international' && this.data.pkgList.length == 0) {
            M._alert('请添加包裹');
            return false
        }
        if (this.data.totalWeight == 0) {
            M._alert('购买包裹总重量不能为0');
            return false;
        }
        if(this.data.totalWeight >=30){
            M._alert('订单超重');
            return false;
        }
        this.data.isOK = true;
    },
    //暂存或者提交操作
    orderHandle(port, cb) {
        this.verifyFn();
        if (this.data.isOK) {
            let data = {
                "delivery_range": this.data.delivery_range,
                "delivery_type_id": deliveryConfig.deliver_type_id,
                "sender_id": this.data.senderInfo.id,
                "receiver_id": this.data.receiverInfo.id,
                "invoice_switch": deliveryConfig.invoice_switch,
                "packeages": this.data.pkgList,
                "packages": this.data.pkgList,
                "weight": this.data.totalWeight
            };
            if (this.data.order_sn !='') data.order_sn = this.data.order_sn;
            One.ajax(port, data, res => {
                if (!res.data.code) {
                    this.data.order_sn = res.data.data.order_sn;
                    cb && cb()
                } else {
                    One.showError(res.data.msg);
                }
            })
        }
    },
    // 暂存订单
    saveOrder() {
        let port = (this.data.order_sn ? "delivery/edit-saved-order" : "delivery/save-order"),
            that = this;
        this.orderHandle(port, () => {
            wx.navigateTo({
                url: '/pages/myorder/order_list',
                success: () => {
                    that.resetData();
                }
            });
        });
    },
    // 提交订单
    submitOrder() {
        let port = (this.data.order_sn ? "delivery/edit-saved-order" : "delivery/create-order"),
            that = this;
        this.orderHandle(port, () => {
            wx.navigateTo({
                url: '/pages/order_detail/detail?&id=' + this.data.order_sn,
                success: () => {
                    that.resetData();
                }
            })
        });
    }
})