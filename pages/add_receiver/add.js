// pages/add_receiver/add.js
// import { cityData } from '../../utils/cities.js'; 多级联动城市数据
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
import M from '../../components/modals/common.js';
import { pinyin } from '../../utils/pinyin.js';
import One from '../../utils/one.js';
const app = getApp();
Page({
  data: {
    condition: false,
    countrys: [],
    country: "",
    provinces: [],
    province: '',
    citys: [],
    city: '',
    countys: [],
    county: '',
    countryIndex: 0,
    receiverZn: '',//收件人英文
    addrDetail: '',//详细信息
    addressZn: '',//拼音地址
    name: '',//收件人
    cellphone: '',//联系电话
    postnumber: '',//邮政编码
    saveAddr: true,
    fromPage: ''// 来源路径(如果下单页面保存返回下单,否则返回收件人列表页)
  },

  onLoad: function (options) {
    let countrys = [], provinces = [], that = this;
    this.data.fromPage = options.page ? options.page : null;
    // 如果源页面是下单页面--则需要对国家进行筛选
    if (this.data.fromPage == 'order') {
      if (deliveryConfig.orderType == 'germany') {
        this.setData({
          country: 'Germany(Deutschland)',
          countrys: [{ "k": "DEUTSCHLAND", "v": "Germany(Deutschland)" }]
        })
      } else if (deliveryConfig.orderType == 'europ') {
        One.ajax('geo/country', {}, res => {
          for (var i = 0, len = res.data.data.length; i < len; i++) {
            if (res.data.data[i].v.indexOf('中国') != -1 && res.data.data[i].v != "Germany(Deutschland)") {
              countrys.push(res.data.data[i]);
            }
          }
          that.setData({
            countrys: countrys
          });
        })
      } else {
        One.ajax('geo/country', {}, res => {
          countrys = res.data.data;
          this.setData({
            countrys: countrys
          });
        });
        One.ajax('geo/province', {}, res => {
          provinces = res.data.data;
          this.setData({ provinces: provinces })
        });
      }
    } else {
      One.ajax('geo/country', {}, res => {
        countrys = res.data.data;
        this.setData({
          countrys: countrys
        })
      });
      One.ajax('geo/province', {}, res => {
        provinces = res.data.data;
        this.setData({ provinces: provinces })
      });
    }
    this.setData({
      'fromPage': this.data.fromPage
    });
  },
  inputCity(e) {
    let city = e.detail.value, addressZn;
    if (city && /^[A-Za-z]+$/.test(city.replace(/\s+/g, "")) == false) {
      M._alert('请用英文填写');
      this.setData({
        city: '',
        addressZn: ''
      });
      return
    } else {
      this.data.city = city;
      addressZn = `${city} ${this.data.addrDetail}`
      this.setData({
        addressZn: pinyin.getFullChars(addressZn)
      });
    }
  },
  //获取拼音地址
  getAddressPinyin() {
    let addressZn = [this.data.province, this.data.city, this.data.county, this.data.addrDetail];
    this.setData({
      addressZn: pinyin.getFullChars(addressZn.join(" "))
    })
  },
  //选择国家
  bindCountryChange(e) {
    let country = this.data.countrys[e.detail.value].v;
    this.setData({
      country: country,
      province: '',
      city: '',
      county: '',
      addressZn: ''
    })
  },
  // 选择省份
  bindProvinceChange(e) {
    let province = this.data.provinces[e.detail.value];
    this.setData({ province: province });
    this.getAddressPinyin();
    One.ajax('geo/city', { "province": province }, res => {
      this.setData({
        citys: res.data.data
      })
    })
  },
  // 选择城市
  bindCityChange(e) {
    let city = this.data.citys[e.detail.value];
    this.setData({ city: city });
    this.getAddressPinyin();
    One.ajax('geo/county', { "province": this.data.province, "city": city }, res => {
      this.setData({
        countys: res.data.data
      })
    })
  },

  //选择地区
  bindCountyChange(e) {
    let county = this.data.countys[e.detail.value];
    this.setData({ county: county });
    this.getAddressPinyin();
  },
  // 名字转换
  setCnName(e) {
    let val = pinyin.getFullChars(e.detail.value);
    this.data.name = e.detail.value;
    this.setData({
      "receiverZn": val
    })
  },
  // 是否保存收件人
  checkboxChange(e) {
    this.data.saveAddr = e.detail.value[0] ? 1 : 0;
  },
  // 检查电话号码输入
  getTel(e) {
    this.data.cellphone = e.detail.value;
  },
  //详细地址
  getDetailAddr(e) {
    this.data.addrDetail = e.detail.value;
    this.getAddressPinyin();
  },
  //邮政编码
  checkPostcode(e) {
    this.data.postnumber = e.detail.value;
  },
  // 保存操作
  saveHandle() {
    let regxPhone = /^1[34578]\d{9}$/,
      regxTel = /^(([0\+]\d{2,3})?(0\d{2,3}))(\d{7,8})((\d{3,}))?$/,
      name = this.data.name,
      tel = this.data.cellphone,
      addrDetail = this.data.addrDetail,
      code = this.data.postnumber,
      receiverInfo = '';
    // 判断姓名格式
    if (name == '') {
      M._alert('姓名不能为空');
      return;
    } else if (!isNaN(name)) {
      M._alert('姓名格式不正确');
      return;
    } else if (name.length < 2) {
      M._alert('姓名至少包含2个字符');
      return;
    }

    // 判断电话号码
    if (!tel) {
      M._alert('请填写手机号');
      return;
    }
    if (!((regxPhone.test(tel) || regxTel.test(tel)))) {
      M._alert('固话或者手机号码格式不正确\n，固话请加区号');
      return;
    }

    // 判断地址
    if (this.data.country.indexOf('中国') != -1) {
      if (!this.data.province) {
        M._alert('省份未填写');
        return;
      }
      if (!this.data.city) {
        M._alert('城市未填写');
        return;
      }
      if (!this.data.county) {
        M._alert('地区未填写');
        return;
      }
    }

    if (!this.data.city) {
      M._alert('城市未填写');
      return;
    }
    // 判断门牌信息
    if (!addrDetail) {
      M._alert('详细地址未填写');
      return;
    }
    if (code == '') {
      M._alert('邮政编码不能为空');
      return
    } else if (isNaN(code)) {
      M._alert('邮政编码格式不正确');
      return;
    }
    receiverInfo = {
      "name": name,
      "cellphone": tel,
      "country": this.data.country,
      "county": this.data.county ? this.data.county : '',
      "province": this.data.province ? this.data.province : '',
      "city": this.data.city ? this.data.city : '',
      "address": addrDetail,
      "postnumber": code,
      "asdefault": this.data.saveAddr,
      "name_en": this.data.receiverZn,
      "address_en": this.data.addressZn
    };
    //如果是下单页面-则应该直接返回
    if (this.data.fromPage == 'order') {
      deliveryService.addReceiver('user/receiver-add', receiverInfo, res => {
        receiverInfo.id = res.data.data.id;
        deliveryConfig.currReceiver = receiverInfo;
        wx.redirectTo({
          url: '/pages/delivery/delivery'
        })
      })
    } else {
      // 保存并返回我的联系人页面
      deliveryService.addReceiver('user/receiver-add', receiverInfo, res => {
        wx.redirectTo({
          url: '/pages/receivers/receivers',
          success: () => {
            deliveryConfig.receiverList.push(receiverInfo);
          }
        })
      })
    }
  }
})