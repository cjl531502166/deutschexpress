// pages/taxpackage/taxpackage.js
const app = getApp();
import M from '../../components/modals/common.js';
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
import One from '../../utils/one.js';
Page({
  data: {
    "packageId": '',
    "package": {
      "weight": '',//购买包裹重量
      "fee": 0,//运费
      "goods": {
        "category": "",
        "tax_brand": "",
        "brand": '',
        "type": "",
        "spec": "",
        "tax_categories": null,
        "tax_brands": null,
        "tax_brand_types": null,
        "specs": null,
        "maxium": [],
        "tax_brand_type": "",
        "tax_spec": "",
        "customcode": "",
        "description": "",
        "num": "",
        "taxrate": "",
        "taxeuro": "",
        "taxcn": "",
        "price": "",
        "priceeuro": "",
        "weight": 1,
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
    let that = this;
    One.ajax('delivery/tax-category', {}, res => {
      that.data.package.goods.tax_categories = res.data.data;
      this.setData({
        "package": this.data.package
      });
    });
  },
  onLoad: function (options) {
    let id = this.data.packageId = options.packageId ? options.packageId : ''
      , that = this;
    that.data.viewObj = [];
    // 存在id 则为包裹修改，否则为添加
    if (id) {
      let weight = deliveryConfig.packageList[id].weight;
      deliveryConfig.packageList[id].goods.forEach((item, index, arr) => {
        that.data.viewObj.push({
          "cateIndex": null,
          "brandIndex": null,
          "typeIndex": null,
          "specIndex": null,
          "numIndex": null,
          "goods": item
        });
      });
      that.data.package.weight = deliveryConfig.packageList[id].weight;
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
      "typeIndex": null,
      "numIndex": null
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
      , tax_categories = this.data.package.goods.tax_categories
      , tax_brands = null;
    viewObj[id].cateIndex = val;
    viewObj[id].brandIndex = null;
    viewObj[id].typeIndex = null;
    viewObj[id].specIndex = null;
    viewObj[id].numIndex = null;
    viewObj[id].goods.tax_categories = tax_categories;
    viewObj[id].goods.category = tax_categories[val].categorycn;
    viewObj[id].goods.tax_brand = '';
    viewObj[id].goods.tax_brand_type = '';
    viewObj[id].goods.spec = '';
    One.ajax('delivery/tax-brand', { "categorycn": viewObj[id].goods.category }, res => {
      tax_brands = res.data.data;
      viewObj[id].goods.tax_brands = tax_brands;
      this.setData({
        viewObj: viewObj
      });
    });
  },
  bindBrandChange(e) {
    let id = e.currentTarget.dataset.id
      , val = e.detail.value
      , viewObj = this.data.viewObj
      , category = viewObj[id].goods.category
      , tax_brands = viewObj[id].goods.tax_brands
      , tax_brand_types = null;
    viewObj[id].brandIndex = val;
    viewObj[id].typeIndex = null;
    viewObj[id].specIndex = null;
    viewObj[id].numIndex = null;
    viewObj[id].goods.tax_brand_type = '';
    viewObj[id].goods.spec = '';
    viewObj[id].goods.tax_brand = tax_brands[val].brandcn;
    viewObj[id].goods.brand = tax_brands[val].brand;
    One.ajax('delivery/tax-brand-type',
      {
        "categorycn": category,
        "brand": viewObj[id].goods.brand
      },
      res => {
        tax_brand_types = res.data.data;
        viewObj[id].goods.tax_brand_types = tax_brand_types;
        this.setData({
          viewObj: viewObj
        });
      }
    )
  },
  bindTypeChange(e) {
    let id = id = e.currentTarget.dataset.id
      , val = e.detail.value
      , viewObj = this.data.viewObj
      , category = viewObj[id].goods.category
      , tax_brand = viewObj[id].goods.brand
      , tax_brand_types = viewObj[id].goods.tax_brand_types
      , specs = null;
    viewObj[id].specIndex = null;
    viewObj[id].numIndex = null;
    viewObj[id].typeIndex = val;
    viewObj[id].goods.spec = '';
    viewObj[id].goods.tax_brand_type = tax_brand_types[val].typecn;
    viewObj[id].goods.type = tax_brand_types[val].type;
    One.ajax('delivery/tax-brand-type-spec'
      , {
        "categorycn": category,
        "brand": tax_brand,
        "type": viewObj[id].goods.type
      }
      , res => {
        specs = res.data.data;
        viewObj[id].goods.specs = specs;
        this.setData({
          viewObj: viewObj
        });
      }
    )
  },
  bindSpecChange(e) {
    let that = this
      , id = e.currentTarget.dataset.id
      , val = e.detail.value
      , viewObj = this.data.viewObj
      , category = viewObj[id].goods.category
      , tax_brand = viewObj[id].goods.brand
      , brand_type = viewObj[id].goods.type
      , specs = viewObj[id].goods.specs;
    viewObj[id].numIndex = null;
    viewObj[id].specIndex = val;
    viewObj[id].goods.tax_spec = specs[val].speccn;
    viewObj[id].goods.spec = specs[val].spec;
    One.ajax('delivery/tax-good-detail'
      , {
        "categorycn": category,
        "brand": tax_brand,
        "type": brand_type,
        "spec": viewObj[id].goods.spec
      }
      , res => {
        viewObj[id].goods.description = res.data.data.importname;
        viewObj[id].goods.price = res.data.data.importpricecn;
        viewObj[id].goods.priceeuro = res.data.data.importpriceeuro;
        viewObj[id].goods.taxrate = res.data.data.taxrate;
        viewObj[id].goods.taxcn = res.data.data.taxcn;
        viewObj[id].goods.taxeuro = res.data.data.taxeuro;
        viewObj[id].goods.customcode = res.data.data.EAN;
        for (var i = 0; i < res.data.data.maximum; i++) {
          viewObj[id].goods.maxium[i] = i + 1;
        }
        that.setData({
          viewObj: viewObj,
        });
      }
    )
  },
  bindNumChange(e) {
    let val = e.detail.value
      , id = e.currentTarget.dataset.id
      , sum = 0
      , viewObj = this.data.viewObj;
    if (!val) {
      M._alert('请选择输入数量');
    } else {
      viewObj[id].goods.num = viewObj[id].goods.maxium[val];
      viewObj[id].numIndex = val - 1;
      sum = viewObj[id].goods.price * (viewObj[id].goods.num);
      viewObj[id].goods.customdeclarprice = sum.toFixed(2);
    };
    this.setData({
      viewObj: viewObj
    });
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
      goodsArr.push(item.goods);
    });
    if (that.data.completed) {
      // 修改
      currPackage = {
        "weight": pkg.weight,
        "fee": pkg.fee,
        "goods": goodsArr
      };
      if (that.data.packageId) {
        deliveryConfig.packageList.map((item, index, arr) => {
          if (index == that.data.packageId) {
            deliveryConfig.packageList.splice(index, 1, currPackage);
          }
        });
      } else {
        //添加
        deliveryConfig.packageList.push(currPackage);
      };
      wx.redirectTo({
        url: '/pages/delivery/delivery?page=tax'
      });
    };
  },
  // 删除包裹
  removeItem(e) {
    let id = id = e.currentTarget.dataset.id;
    this.data.viewObj.splice(id, 1);
    this.setData({
      "viewObj": this.data.viewObj
    });
  }
});