// pages/edit_receiver/edit.js
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
    id: '',
    condition: false,
    countrys: [],
    country: "中国",
    countryIndex: 0,
    provinces: [],
    province: '',
    citys: [],
    city: '',
    countys: [],
    county: '',
    receiverZn: '',
    addressZn: '',//拼音地址
    addrDetail: '',//详细门牌信息
    name: '',//收件人
    cellphone: '',//联系电话
    postnumber: '',//邮政编码
    saveAddr: true,
    idcard_no: ''
  },
  onLoad: function (options) {
    let currReceiver = deliveryConfig.currReceiver,
      that = this,
      countrys = [{
        "k": currReceiver.country,
        "v": currReceiver.country
      }],
      provinces = [],
      citys = [],
      countys = [];
    console.log(currReceiver);
    // One.ajax('geo/country', {}, res => {
    //   countrys = res.data.data;
    //   this.setData({
    //     countrys: countrys
    //   });
    // });
    this.setData({
      countrys: countrys
    });
    if (currReceiver.country.indexOf('中国') != -1) {
      One.ajax('geo/province', {}, res => {
        provinces = res.data.data;
        One.ajax('geo/city', { "province": currReceiver.province }, res => {
          citys = res.data.data;
          One.ajax('geo/county', {
            "province": currReceiver.province,
            "city": currReceiver.city
          }, res => {
            console.log(res.data.data);
            countys = res.data.data;
            that.setData({
              provinces: provinces,
              citys: citys,
              countys: countys
            });
          })
        })
      });
    }
    //设置当前收件人信息
    this.setData({
      'id': options.id ? options.id : '',
      'name': currReceiver.name,
      'country': currReceiver.country,
      'cellphone': currReceiver.cellphone,
      'province': currReceiver.province,
      'city': currReceiver.city,
      'county': currReceiver.county,
      'addrDetail': currReceiver.address,
      'postnumber': currReceiver.postnumber,
      'addressZn': currReceiver.address_en,
      'receiverZn': pinyin.getFullChars(currReceiver.name),
      'saveAddr': currReceiver.asdefault,
      'idcard_no': currReceiver.idcard_no
    });
  },
  //设置拼音地址
  getAddressPinyin() {
    let addressZn = [this.data.province, this.data.city, this.data.county, this.data.addrDetail];
    this.setData({
      addressZn: pinyin.getFullChars(addressZn.join(" "))
    })
  },
  //选择国家
  bindCountryChange(e) {
    let country = this.data.countrys.length > 0 ? this.data.countrys[e.detail.value].v : this.data.country;
    this.setData({
      country: country,
      province: '',
      city: '',
      county: '',
      addressZn: ''
    });
  },
  // 选择省份
  bindProvinceChange(e) {
    let province = this.data.provinces[e.detail.value];
    this.setData({ province: province });
    this.getAddressPinyin();
    One.ajax('geo/city', { "province": province }, res => {
      this.setData({
        city: '',
        county: '',
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
        county: '',
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
  //输入城市
  inputCity(e) {
    let city = e.detail.value
      , addressZn = '';
    if (city && /^[A-Za-z]+$/.test(city) == false) {
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
  //详细地址
  getDetailAddr(e) {
    this.data.addrDetail = e.detail.value;
    this.getAddressPinyin();
  },
  // 检查电话号码输入
  getTel(e) {
    this.data.cellphone = e.detail.value;
  },
  //检测邮编
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
    // 判断门派信息
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
    //收件人信息
    receiverInfo = {
      "id": this.data.id,
      "name": name,
      "name_en": this.data.receiverZn,
      "cellphone": tel,
      "country": this.data.country,
      "county": this.data.county ? this.data.county : null,
      "province": this.data.province,
      "city": this.data.city,
      "address": addrDetail,
      "address_en": this.data.addressZn,
      "postnumber": code,
      "asdefault": this.data.saveAddr
    }
    // 保存并返回我的联系人页面
    deliveryService.editReceiver(receiverInfo, res => {
      if (!res.data.code) {
        wx.redirectTo({
          url: '/pages/receivers/receivers'
        })
      } else {
        One.showError(res.data.msg);
      }
    })
  }
})