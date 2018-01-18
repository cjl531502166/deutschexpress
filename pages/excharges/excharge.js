// pages/excharges/excharge.js
import One from '../../utils/one.js';
import deliverConfig from '../../models/delivery.config.js';
import deliverService from '../../services/delivery.service.js';
import searchModel from '../../models/search.model.js';
import searchService from '../../services/search.service.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_sn: '',//订单号
        navigateto: '/pages/excharge_detail/excharge_detail?',
        delivery_types: [{ "id": 0, "delivery_type": "全部物流" }],
        deliverIndex: 0,//
        status: [{ "name_en": "all", "name_cn": "全部状态" }],//状态
        statusIndex: 0,
        date: '全部日期',
        excharge_list: null,
        searchConditions: null //搜索/筛选条件
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onLoad: function () {
        let that = this;

        // 获取物流渠道函数
        let getDeliverTypes = () => {
            let obj, that = this;
            for (let key in searchModel.delivery_types) {
                obj = {
                    "id": key,
                    "delivery_type": searchModel.delivery_types[key]
                }
                that.data.delivery_types.push(obj)
            }
            that.setData({
                delivery_types: that.data.delivery_types
            });
        }

        //获取订单列表
        
        this.getList();
        //获取物流
        if (searchModel.delivery_types) {
            getDeliverTypes();
        } else {
            searchService.getDeliverTypes(res => {
                getDeliverTypes();
            });
        }

        //获取状态
        searchService.getStatus(res => {
            let obj;
            for (let key in searchModel.status) {
                obj = {
                    "name_en": key,
                    "name_cn": searchModel.status[key]
                }
                that.data.status.push(obj);
            }
            that.setData({
                status: that.data.status
            })
        });
    },
    getList(data) {
        let that = this;
        that.data.excharge_list = [];
        deliverService.getDelivers(res => {
            One.ajax('user/delivery-orders', data ? data : {}, res => {
                if (!res.data.data) return false;
                res.data.data.forEach((item, index) => {
                    if (item.status === '超重补款') {
                        item.packages.forEach((pkg, i) => {
                            pkg.order_sn = item.order_sn;
                            pkg.status = item.status;
                            pkg.updated_at = item.updated_at;
                            that.data.excharge_list.push(pkg)
                        })
                    }
                });
                this.setData({ "excharge_list": that.data.excharge_list });
            })
        })
    },
    onDeliveryChagne(e) {
        this.setData({ deliverIndex: e.detail.value });
        let order_sn = this.data.order_sn ? this.data.order_sn : "",
            delivery_type = this.data.deliverIndex != 0 ? this.data.deliverIndex : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        this.data.searchConditions = {
            "order_sn": order_sn,
            "delivery_type": delivery_type,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    },
    onStatusChagne(e) {
        this.setData({ statusIndex: e.detail.value });
        let order_sn = this.data.order_sn ? this.data.order_sn : "",
            delivery_type = this.data.deliverIndex != 0 ? this.data.deliverIndex : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        this.data.searchConditions = {
            "order_sn": order_sn,
            "delivery_type": delivery_type,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    },
    onDateChange(e) {
        this.setData({ "date": e.detail.value });
        let order_sn = this.data.order_sn ? this.data.order_sn : "",
            delivery_type = this.data.deliverIndex != 0 ? this.data.deliverIndex : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        this.data.searchConditions = {
            "order_sn": order_sn,
            "delivery_type": delivery_type,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    },
    searchHandle(e) {
        this.data.order_sn = e.detail.value;
        let order_sn = this.data.order_sn ? this.data.order_sn : "",
            delivery_type = this.data.deliverIndex != 0 ? this.data.deliverIndex : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        this.data.searchConditions = {
            "order_sn": order_sn,
            "delivery_type": delivery_type,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    }
})