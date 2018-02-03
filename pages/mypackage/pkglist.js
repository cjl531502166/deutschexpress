// pages/mypackage/pkglist.js
import One from '../../utils/one.js';
import goodsCategory from '../../models/goods.categories.js';
import categoryService from '../../services/category.service.js';
import searchModel from '../../models/search.model.js';
import searchService from '../../services/search.service.js';
Page({
    data: {
        order_sn: '',
        navigateto: '/pages/pkgdetail/pkgdetail?',
        category: [{ "id": 0, "name_cn": "全部品种" }],
        cateIndex: 0,
        status: [{ "name_en": "all", "name_cn": "全部状态" }],
        statusIndex: 0,
        date: '全部日期',
        pkg_list: null,
        searchConditions: null //列表搜索条件
    },

    onLoad: function () {
        let that = this;
        //获取列表
        this.getList();
        //获取品种
        categoryService.getCategories(res => {
            this.data.category[1] = res.data.data[0];
            this.setData({
                category: this.data.category
            })
        });
        //获取状态
        searchService.getStatus(res => {
            let i = 0, obj;
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
        let that = this,
            len = 0;
            that.data.pkg_list = [];
        One.ajax('user/delivery-orders', data ? data : {}, res => {
            if(res.data.data !=null){
                res.data.data.forEach((item, index, arr) => {
                    len = item.packages.length;
                    if (len > 0) {
                        arr[index].packages.forEach((pkg, i, pkgArr) => {
                            pkgArr[i].delivery_no = arr[index].delivery_no;
                            pkgArr[i].status = arr[index].status;
                            pkgArr[i].order_sn = arr[index].order_sn;
                            pkgArr[i].created_at = arr[index].created_at;
                            that.data.pkg_list.push(pkgArr[i]);
                        });
                    }
                });
            }
            this.setData({ "pkg_list": that.data.pkg_list })
        });
    },
    onCategoryChagne(e) {
        this.setData({ cateIndex: e.detail.value });

    },
    onStatusChagne(e) {
        this.setData({ statusIndex: e.detail.value });
        let order_sn = this.data.order_sn ? this.data.order_sn : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        this.data.searchConditions = {
            "order_sn": order_sn,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    },
    onDateChange(e) {
        this.setData({ "date": e.detail.value });
        let order_sn = this.data.order_sn ? this.data.order_sn : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        this.data.searchConditions = {
            "order_sn": order_sn,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    },
    searchHandle(e) {
        this.data.order_sn = e.detail.value;
        let order_sn = this.data.order_sn ? this.data.order_sn : "",
            status = this.data.statusIndex != 0 ? this.data.status[this.data.statusIndex].name_en : "",
            dateYm = this.data.date == "全部日期" ? "" : this.data.date;
        this.data.searchConditions = {
            "order_sn": order_sn,
            "status": status,
            "dateYm": dateYm
        };
        this.getList(this.data.searchConditions);
    }
})