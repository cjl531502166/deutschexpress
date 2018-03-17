// pages/taxpackage/taxpackage.js
const app = getApp();
import M from '../../components/modals/common.js';
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
import One from '../../utils/one.js';
Page({
  data: {
    "fee_tpl": null,
    "packageId": '',
    "tax_categories": null,
    "tax_brands": null,
    "tax_brand_types": null,
    "brand": '',
    "type": "",
    "spec": "",
    "specs": null,
    "packageId": '',
    "package": {
      "weight": '',//购买包裹重量
      "fee": 0,//运费
      "goods": {
        "tax_category": "",
        "tax_brand": "",
        "tax_brand_type": "",
        "spec": "",
        "customcode": "",
        "description": "",
        "num": "",
        "taxrate": "",
        "taxeuro": "",
        "taxcn": "",
        "pricecn": "",
        "priceeuro": "",
        "weight": "",
        "customdeclarprice": ""
      }
    },
    "viewObj": [],
    "completed": false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    One.ajax('delivery/tax-category', {}, res => {
      this.setData({
        tax_categories: res.data.data
      });
    });
  },
  onLoad: function (options) {
    let id = this.data.packageId = options.packageId ? options.packageId : '';
    // 存在id 则为包裹修改，否则为添加
    if (id) {
      let weight = deliveryConfig.packageList[id].weight;
      // 阳光清关包裹运费
      deliveryConfig.packageList[id].goods.forEach((item, index, arr) => {
        that.data.viewObj.push({
          "cateIndex": null,
          "brandIndex": null,
          "typeIndex": null,
          "specIndex": null,
          "goods": item
        })
      });
      this.setData({ "viewObj": that.data.viewObj });
    }
  },
  // 增加包裹
  addCate: function () {
    let viewObj = this.data.viewObj;
    if (!this.data.package.weight) {
      M._alert('请填写购买包裹总重量');
      return
    }
    viewObj.push({
      "goods": this.data.package.goods,
      "cateIndex": null,
      "brandIndex": null,
      "specIndex": null,
      "typeIndex": null
    });
    this.setData({
      "viewObj": viewObj
    });
  },
  //添加品种
  bindCateChange(e) {
    let id = e.currentTarget.dataset.id
      , val = e.detail.value
      , viewObj = this.data.viewObj
      , tax_categories = this.data.tax_categories
      , tax_brands = null;
    viewObj[id].cateIndex = val;
    viewObj[id].goods.tax_category = tax_categories[val].categorycn;
    this.setData({
      viewObj: viewObj
    });
    One.ajax('delivery/tax-brand', { "categorycn": viewObj[id].goods.tax_category }, res => {
      tax_brands = res.data.data;
      this.setData({
        tax_brands: tax_brands
      });
    });
  },
  bindBrandChange(e) {
    let id = e.currentTarget.dataset.id
      , val = e.detail.value
      , viewObj = this.data.viewObj
      , tax_category = viewObj[id].goods.tax_category
      , tax_brands = this.data.tax_brands
      , tax_brand_types = null;
    viewObj[id].brandIndex = val;
    viewObj[id].goods.tax_brand = tax_brands[val].brandcn;
    this.data.brand = tax_brands[val].brand;
    this.setData({
      viewObj: viewObj
    });
    One.ajax('delivery/tax-brand-type',
      {
        "categorycn": tax_category,
        "brand": this.data.brand
      },
      res => {
        tax_brand_types = res.data.data;
        this.setData({
          tax_brand_types: tax_brand_types
        });
      }
    )
  },
  bindTypeChange(e) {
    let id = id = e.currentTarget.dataset.id
      , val = e.detail.value
      , viewObj = this.data.viewObj
      , tax_category = viewObj[id].goods.tax_category
      , tax_brand = this.data.brand
      , tax_brand_types = this.data.tax_brand_types
      , specs = null;
    viewObj[id].typeIndex = val;
    viewObj[id].goods.tax_brand_type = tax_brand_types[val].typecn;
    this.data.type = tax_brand_types[val].type;
    this.setData({
      viewObj: viewObj
    });
    One.ajax('delivery/tax-brand-type-spec'
      , {
        "categorycn": tax_category,
        "brand": tax_brand,
        "type": this.data.type
      }
      , res => {
        specs = res.data.data;
        this.setData({
          specs: specs
        })
      }
    )
  },
  bindSpecChange(e) {
    let id = e.currentTarget.dataset.id
      , val = e.detail.value
      , viewObj = this.data.viewObj
      , tax_category = viewObj[id].goods.tax_category
      , tax_brand = this.data.brand
      , brand_type = this.data.type
      , specs = this.data.specs;
    viewObj[id].specIndex = val;
    viewObj[id].goods.spec = specs[val].speccn;
    this.data.spec = specs[val].spec;
    this.setData({
      viewObj: viewObj
    });
    One.ajax('delivery/tax-good-detail'
      , {
        "categorycn": tax_category,
        "brand": tax_brand,
        "type": brand_type,
        "spec": this.data.spec
      }
      , res => {
        viewObj[id].goods.description = res.data.data[0].importname;
        viewObj[id].goods.pricecn = res.data.data[0].importpricecn;
        viewObj[id].goods.priceeuro = res.data.data[0].importpriceeuro;
        viewObj[id].goods.taxrate = res.data.data[0].taxrate;
        viewObj[id].goods.taxcn = res.data.data[0].taxcn;
        viewObj[id].goods.taxeuro = res.data.data[0].taxeuro;
        this.setData({
          viewObj: viewObj
        });
      }
    )
  },
  chkNum(e) {
    let val = e.detail.value
      , id = e.currentTarget.dataset.id
      , regNum = /^[1-9]\d*$/
      , sum = 0
      , viewObj = this.data.viewObj;
    if (val && !regNum.test(val)) {
      M._alert('数量必须为非0整数')
    } else {
      viewObj[id].goods.num = val;
      sum = viewObj[id].goods.taxcn * val + viewObj[id].goods.pricecn * val;
      viewObj[id].goods.customdeclarprice = sum;
    }
    this.setData({
      viewObj: viewObj
    });
  },
  chkWeight(e) {
    let val = e.detail.value
      , id = e.currentTarget.dataset.id
      , viewObj = this.data.viewObj;
    if (val != '' && val == 0) {
      M._alert('总净重必须大于0')
      return false;
    } else {
      let total = 0;
      if (isNaN(val)) {
        M._alert('重量必须为数字');
      } else {
        viewObj[id].goods.weight = val;
      }
      viewObj.map((item, index, arr) => {
        total += item.goods.weight * 1;
      });
      if (total > this.data.package.weight) {
        M._alert('物品净重之和不能大于包裹总重量')
        viewObj[id].goods.weight = 0;
      } else {
        viewObj[id].goods.weight = val;
      }
    }
  },
  // 购买包裹重量
  chkPkgWeight(e) {
    let weight = e.detail.value,
      id = e.currentTarget.dataset.id,
      that = this,
      timer = null;
    if (!weight || weight == '') {
      this.data.package.weight = '';
      this.setData({ "package": this.data.package });
    } else if (weight <= 0 || isNaN(weight)) {
      M._alert('重量必须为大于0的整数');
    } else if (weight > 30) {
      M._alert('包裹重量不能大于30kg');
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // 计算运费

      }, 800);
      this.data.package.weight = weight;
    }
  },
  confirmAdd() {
    let that = this
      , currPackage = {}
      , goodsArr = []
      , pkg = this.data.package
      , viewObj = this.data.viewObj;
    if (!pkg.weight) {
      M._alert('请填写购买包裹总重量');
      return false
    }
    if (viewObj.length <= 0) {
      M._alert('请添加品种');
      return false
    }
    // 判断包裹内容
    viewObj.forEach((item, index, arr) => {
      for (let key in item.goods) {
        if (item.goods[key] == '') {
          M._alert('请确认页面信息填写正确后提交');
          that.data.completed = false;
          return false;
        } else {
          that.data.completed = true;
        }
      }
      goodsArr.push(viewObj[index].goods);
    });
    if (that.data.completed) {
      currPackage = {
        "weight": pkg.weight,
        "fee": pkg.fee,
        "goods": goodsArr
      };
      if (that.data.packageId) {
        deliveryConfig.packageList.map((item, index, arr) => {
          if (item.id == that.data.packageId) {
            deliveryConfig.packageList.splice(index, 1, currPackage);
          }
        });
      } else {
        //添加
        deliveryConfig.packageList.push(currPackage);
      };
      wx.redirectTo({
        url: '/pages/delivery/delivery'
      });
    };
  }
});