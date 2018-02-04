// pages/add_sender/add.js
import M from '../../components/modals/common.js';
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
import One from '../../utils/one.js';
import Geo from '../../components/modals/getCity.js';
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        name: '',
        cellphone: '',
        address: '',
        houseNo: '',
        postnumber: '',
        extraInfo: '',
        city: '',
        country: 'Germany',
        saveAddr: true,
        fromPage: null
    },
    onLoad: function (options) {
        let that = this;
        this.setData({
            "fromPage": options.page ? options.page : null
        });
        Geo.getLocation({
            success: data => {
                Geo.getCity(data, (res) => {
                  console.log(res);
                    // that.setData({
                    //     city: res.data.result.addressComponent.city,
                    //     country: res.data.result.addressComponent.country,
                    //     street: res.data.result.addressComponent.street,
                    //     address: res.data.result.formatted_address
                    // })
                })
            }
        })
    },
    onShow: function () {

    },
    getName(e) {
        let reg = /[a-zA-Z]/,
            val = e.detail.value.replace(/\s/ig, '');
        if (val && !reg.test(val)) {
            M._alert('发件人姓名必须是英文')
            return
        }
        this.data.name = e.detail.value;
    },
    getTel(e) {
        let regxPhone = /^1[34578]\d{9}$/,
            regxTel = /^(\+49|0049)?\s*(\d{3,4})(\d{6,7})$/,
            tel = e.detail.value;
        if (tel && !(regxTel.test(tel))) {
            M._alert('固话或者手机号码格式不正确');
            return;
        }
        this.data.cellphone = e.detail.value;
    },
    getStreet(e) {
        let reg = /[a-zA-Z]/,
            val = e.detail.value;
        if (val && !reg.test(val)) {
            M._alert('街道信息必须为英文')
            return
        }
        this.data.address = e.detail.value;
    },
    getHouseNo(e) {
        let val = e.detail.value.replace(/\s/ig, '');
        if (val && isNaN(val)) {
            M._alert('门牌号必须为数字')
            return
        }
        this.data.houseNo = e.detail.value;
    },
    checkPostcode(e) {
        let val = e.detail.value.replace(/\s/ig, '');
        if (val && (isNaN(val) || val.length < 5)) {
            M._alert('邮政编码必须位5位数字')
            return
        }
        this.data.postnumber = e.detail.value
    },
    getCity(e) {
        let val = e.detail.value,
            reg = /[a-zA-Z]/;
        if (val && !reg.test(val)) {
            M._alert('城市必须为英文')
            return
        }
        this.data.city = e.detail.value;
    },
    checkboxChange(e) {
        this.data.saveAddr = e.detail.value[0] ? 1 : 0;
    },
    saveHandle() {
        let senderInfo = '';
        if (this.data.name == '') {
            M._alert('请填写发件人');
            return
        }
        if (this.data.address == '') {
            M._alert('请填写详细地址');
            return
        }
        if (this.data.postnumber == '') {
            M._alert('请填写邮政编码');
            return
        }
        if (this.data.city == '') {
            M._alert('请填写所在城市');
            return
        }
        senderInfo = {
            "name": this.data.name,
            "cellphone": this.data.cellphone,
            "postnumber": this.data.postnumber,
            "county": "county",
            "province": "province",
            "country": this.data.country,
            "city": this.data.city,
            "address": this.data.address,
            "asdefault": this.data.saveAddr,
        }
        if (this.data.fromPage == 'order') {
            deliveryService.addSender('user/sender-add', senderInfo, res => {
                if (!res.data.code) {
                    senderInfo.id = res.data.data.id;
                    deliveryConfig.currSender = senderInfo;
                    wx.navigateTo({
                        url: '/pages/delivery/delivery'
                    })
                } else {
                    One.showError(res.data.msg);
                }
            })
        } else {
            deliveryService.addSender('user/sender-add', senderInfo, res => {
                if (!res.data.code) {
                    wx.navigateTo({
                        url: '/pages/sender/sender'
                    })
                } else {
                    One.showError(res.data.msg);
                }
            })
        }
    }
})