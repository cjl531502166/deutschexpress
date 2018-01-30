import One from '../../utils/one.js';
import M from '../../components/modals/common.js';
import deliverConfig from '../../models/delivery.config.js';
import deliverService from '../../services/delivery.service.js';
import goodsCategory from '../../models/goods.categories.js';
import categoryService from '../../services/category.service.js';
import searchModel from '../../models/search.model.js';
import searchService from '../../services/search.service.js';
Page({
    data: {
        order_sn: '',
        navigateto: '/pages/order_detail/detail?id=',
        delivery_types: [{ "id": 0, "delivery_type": "全部物流" }],
        deliverIndex: 0,
        status: [{ "name_en": "all", "name_cn": "全部状态" }],
        statusIndex: 0,
        date: '全部日期',
        order_list: null,
        searchConditions: null//列表搜索参数值
    },
    onLoad: function () {
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
        //获取列表
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
            let obj, that = this;
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
        that.data.order_list = [];
        deliverService.getDelivers(res => {
            One.ajax('user/delivery-orders', data ? data : {}, res => {
                if (!res.data.data) return false;
                res.data.data.forEach((item, index) => {
                    item.packages.forEach((pkg, i) => {
                        pkg.delivery_type_id = item.delivery_type_id;
                    })
                });
                that.data.order_list = res.data.data;
                //获取物流方式
                that.data.order_list.forEach((item, index, arr) => {
                    deliverConfig.delivers.forEach((del,index)=>{
                        if(item.delivery_type_id == del.id){
                            item.delivery_type = del.name;
                        }
                    });
                });
                //更新数据
                this.setData({ "order_list": that.data.order_list });
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
    //搜索
    searchHandle(e) {
        this.data.order_sn = e.detail.value;
        let reg = /^[A-Za-z]\d+$/,
            order_sn = this.data.order_sn ? this.data.order_sn : "",
            delivery_type = this.data.deliverIndex != 0 ? this.data.deliverIndex : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        if (!(reg.test(this.data.order_sn))) {
            M._alert('订单号不能包含汉字或者符号');
            return false;
        }
        this.data.searchConditions = {
            "order_sn": order_sn,
            "delivery_type": delivery_type,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    }
})