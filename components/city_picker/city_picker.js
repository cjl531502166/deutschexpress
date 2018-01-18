// components/city_picker/city_picker.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    /**
     * 组件的初始数据
     */
    data: {
        provinces: [],
        province: '',
        citys: [],
        city: '',
        countys: [],
        county: '',
        value: [0, 0, 0],
        values: [0, 0, 0],
    },
    onLoad() {
        One.ajax('geo/province', {}, res => {
            provinces = res.data.data;
            One.ajax('geo/city', { 'province': provinces[0] }, res => {
                citys = res.data.data;
                One.ajax('geo/county', {
                    "province": provinces[0],
                    "city": citys[0]
                }, res => {
                    countys = res.data.data;
                    that.setData({
                        'provinces': provinces,
                        'citys': citys,
                        'countys': countys,
                        'province': provinces[0],
                        'city': citys[0],
                        'county': countys[0]
                    })
                })
            })
        })
    },
    bindChange: function (e) {
        var val = e.detail.value,
            t = this.data.values
        if (val[0] != t[0]) {
            wx.showLoading();
            let citys = [];
            let countys = [];
            One.ajax('geo/city', { "province": this.data.provinces[val[0]] }, res => {
                citys = res.data.data;
                One.ajax('geo/county', {
                    "province": this.data.provinces[val[0]],
                    "city": citys[0]
                }, res => {
                    countys = res.data.data;
                    this.setData({
                        'province': this.data.provinces[val[0]],
                        'city': citys[0],
                        'citys': citys,
                        'county': countys[0],
                        'countys': countys,
                        'values': val,
                        'value': [val[0], 0, 0]
                    })
                })
            })
        }
        if (val[1] != t[1]) {
            wx.showLoading();
            let countys = [];
            One.ajax('geo/county', {
                "province": this.data.provinces[val[0]],
                "city": this.data.citys[val[1]]
            }, res => {
                countys = res.data.data;
                this.setData({
                    'city': this.data.citys[val[1]],
                    'county': countys[0],
                    'countys': countys,
                    'values': val,
                    'value': [val[0], val[1], 0]
                })
            })
        }
        if (val[2] != t[2]) {
            this.setData({
                'county': this.data.countys[val[2]],
                'values': val
            })
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {

    }
})
