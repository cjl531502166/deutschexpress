//index.js
//获取应用实例
const app = getApp();
import Login from '../../components/modals/login.js';
import M from '../../components/modals/common.js';
import One from '../../utils/one.js';
import newsModel from '../../models/news.model.js';
import newsSevice from '../../services/news.service.js';
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
import searchModel from '../../models/search.model.js';
import searchService from '../../services/search.service.js';
Page({
    data: {
        userid: '',//用户登录返回的id
        inputVal: '',//搜索框的值
        packageList:[],
        RadioModalHidden: '',//radiogroup 模态框隐藏状态
        isEmailBind: true,//邮箱绑定状态
        radioItem: null,//订单类型
        orderType: '', //物流订单类型
        emailAddr: '', //邮箱地址
        errMsg: ''//错误提示
    },
    onLoad: function (options) {
        Login.meta = options.meta ? options.meta : "";
        Login.checkSession(() => {
            let that = this;
            // 上传用户信息
            One.ajax('user/upload-info', app.globalData.userInfo);
            //判断是否绑定邮箱
            One.ajax('user/info', {}, res => {
                if (res.data.data.email) {
                    this.setData({ 'isEmailBind': true });
                } else {
                    this.setData({ 'isEmailBind': false });
                }
                this.setData({
                    userid: res.data.data.id
                })
            });
            //获取最新包裹列表
            that.data.packageList = [];
            searchService.getDeliverTypes(res => {
                One.ajax('user/delivery-orders', {}, res => {
                    res.data.data.forEach((item, key) => {
                        item.packages.forEach((pkg, k) => {
                            pkg.status = item.status;
                            pkg.order_sn = item.order_sn;
                            pkg.updated_at = item.updated_at;
                            pkg.sender = item.sender;
                            pkg.pid = pkg.packageid;
                            pkg.deliver_type = searchModel.delivery_types[item.delivery_type_id];
                            that.data.packageList.push(pkg);
                        });
                    });
                    this.setData({
                        packageList: this.data.packageList
                    });
                })
            });
        });
    },
    onShow: function () {
        // 初始化所有数据
        this.setData({
            "radioItem": [
                {
                    "value": "德国境内",
                    "name": "germany",
                    "checked": true
                }, {
                    "value": "欧盟境内",
                    "name": "europ"
                }, {
                    "value": "国际包裹",
                    "name": "international"
                },{
                    "value":"阳光清关",
                    "name":"clearcustom"
                }
            ],
            emailAddr: '',
            orderType: '',
            inputVal: '',
            errMsg: '',
            isEmailBind: true,
            RadioModalHidden: true
        });
        // 初始化默认物流订单类型
        this.data.radioItem.map((item, index) => {
            item.checked && (this.data.orderType = item.name);
        })
    },

    // 获取输入物流单号
    getDeliveryNo(e) {
        this.data.inputVal = e.detail.value;
    },
    //获取输入邮箱
    getEmailArr(e) {
        this.data.emailAddr = e.detail.value;
    },
    // 查询快递单号
    trackPkg() {
        //输入验证
        let value = this.data.inputVal.replace(/(\s*$)/g, '');
        if (!value) {
            this.data.errMsg = '快递单号不能为空';
        }
        else if (!(/^[a-zA-Z0-9]+$/.test(value))) {
            this.data.errMsg = '您输入的快递单号格式不正确';
        }
        else if (value.length < 13) {
            this.data.errMsg = '请输入13位快递单号';
        } else {
            //操作
            wx.navigateTo({
                url: '/pages/delivery_detail/delivery_detail?tracknum=' + value
            })
            return false;
        }
        M._alert(this.data.errMsg);
    },
    radioChange(e) {
        this.data.orderType = e.detail.value;
    },
    goToPage(e) {
        let url = e.currentTarget.dataset.url;
        if (url == '/pages/delivery/delivery') {
            return this.setData({ "RadioModalHidden": false })
        }
        // 页面跳转
        wx.navigateTo({
            url: url
        })
    },
    // 选择物流类型
    // SetDeliveryType() {
    //     this.setData({ "RadioModalHidden": true });
    //     wx.navigateTo({
    //         url: '/pages/delivery/delivery'
    //     })
    //     deliveryConfig.orderType = this.data.orderType;
    // },
    //查看更多
    seeMore() {
        wx.navigateTo({
            url: '/pages/mypackage/pkglist'
        })
    },
    //取消物流选择框
    cancelDelivery() {
        this.setData({ "RadioModalHidden": true })
    },
    // 绑定邮箱
    bindEmailHandle() {
        let email = this.data.emailAddr,
            reg = /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;
        if (!email) {
            this.setData({
                errMsg: "请输入邮箱地址"
            })
        }
        else if (!reg.test(email)) {
            this.setData({
                errMsg: "请输入正确的邮箱地址"
            })
        }
        else {
            this.setData({ errMsg: "" });
            One.ajax('user/set-email', { "email": email }, res => {
                wx.setStorageSync("email", email);
                //邮箱绑定成功的操作
                this.setData({ "isEmailBind": true });
                wx.showToast({
                    title: "绑定成功"
                })
            })
        }
    },
    //不绑定邮箱操作
    cancelBindHandle() {
        this.setData({
            isEmailBind: true
        })
    },
    //分享
    onShareAppMessage() {
        return {
            "title": "德意志物流",
            "path": "/pages/index/index?meta=" + this.data.userid,
            "imageUrl": "/images/share.jpg"
        }
    }
})
