// pages/pkginfo/pkginfo.js
import M from '../../components/modals/common.js';
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
import Category from '../../models/goods.categories.js';
import categoryService from '../../services/category.service.js'
const app = getApp();
let timer = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    "fee_tpl": null,//运费模板
    "categories": Category,//类目相关数据
    "cateIndex": "",
    "packageId": '',
    "package": {
      "weight": '',//购买包裹重量
      "fee": 0,//运费
      "goods": {
        "category": "",
        "customcode": "",
        "description": "",
        "num": "",
        "price": "",
        "weight": "",
        "customdeclarprice": ""
      }
    },
    "viewObj": [

    ],
    "completed": false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this, id;
    this.data.packageId = id = options.packageId ? options.packageId : null;
    if (id) {
      let weight = deliveryConfig.packageList[id].weight;
      //计算运费
      deliveryService.calcFee(
        {
          "delivery_range": deliveryConfig.orderType,
          "delivery_type_id": deliveryConfig.deliver_type_id,
          "weight": weight
        }
        , res => {
          this.data.package.weight = weight;
          this.data.package.fee = deliveryConfig.fee;
          this.setData({
            "package": this.data.package
          });
        }
      );
      deliveryConfig.packageList[id].goods.forEach((item, index, arr) => {
        that.data.viewObj.push({
          "cateIndex": that.data.cateIndex,
          "goods": item
        })
      });
      this.setData({ "viewObj": that.data.viewObj });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取品类
    categoryService.getCategories(res => {
      this.setData({
        "categories": Category
      })
    });
  },
  // 添加品种
  addCate() {
    if (!this.data.package.weight) {
      M._alert('请填写购买包裹总重量');
      return
    }
    this.data.viewObj.push({
      "goods": this.data.package.goods,
      "cateIndex": this.data.cateIndex
    });
    this.setData({
      "viewObj": this.data.viewObj
    });
    console.log(this.data.viewObj);
  },
  // 品种选择
  bindCateChange(e) {
    let id = e.currentTarget.dataset.id;
    this.data.viewObj[id].cateIndex = e.detail.value;
    this.data.viewObj[id].goods.category = this.data.categories.categoryArr[e.detail.value].name_cn;
    this.data.viewObj[id].goods.customcode = this.data.categories.categoryArr[e.detail.value].code;
    this.setData({
      "viewObj": this.data.viewObj
    })
  },
  removeItem(e) {
    let id = e.currentTarget.dataset.id;
    this.data.viewObj.splice(id, 1);
    this.setData({
      "viewObj": this.data.viewObj
    })
  },
  chkNum(e) {
    let val = e.detail.value,
      id = e.currentTarget.dataset.id,
      regNum = /^[1-9]\d*$/;
    if (val && !regNum.test(val)) {
      M._alert('数量必须为非0整数')
    } else {
      this.data.viewObj[id].goods.num = val;
      // 计算海关报价
      if (this.data.viewObj[id].goods.price) {
        this.data.viewObj[id].goods.customdeclarprice = this.data.viewObj[id].goods.price * val;
        this.setData({
          "viewObj": this.data.viewObj
        })
      }
    }
  },
  chkDescp(e) {
    let val = e.detail.value,
      id = e.currentTarget.dataset.id;
    if (val == '') return false;
    if (/^[a-zA-Z]+$/.test(val)) {
      this.data.viewObj[id].goods.description = val;
    } else {
      M._alert('请输入英文描述');
    }
  },
  chkPrice(e) {
    let val = e.detail.value,
      id = e.currentTarget.dataset.id,
      reg = /^\d+(?=\.{0,1}\d+$|$)/;
    if (val == '') return false;
    if (val && !reg.test(val)) {
      M._alert('请输入正确的数字');
      return false
    };
    if (val <= 0) {
      M._alert('单价必须大于0');
      return false
    };
    if (isNaN(val)) {
      M._alert('价格必须为数字');
    } else {
      this.data.viewObj[id].goods.price = val;
      // 计算海关报价
      if (this.data.viewObj[id].goods.num) {
        this.data.viewObj[id].goods.customdeclarprice = this.data.viewObj[id].goods.num * val;
        this.setData({
          "viewObj": this.data.viewObj
        })
      }
    };
  },
  chkWeight(e) {
    let val = e.detail.value,
      id = e.currentTarget.dataset.id;
    if (val != '' && val == 0) {
      M._alert('总净重必须大于0')
      return false;
    } else {
      let total = 0;
      if (isNaN(val)) {
        M._alert('重量必须为数字');
      } else {
        this.data.viewObj[id].goods.weight = val;
      }
      this.data.viewObj.map((item, index, arr) => {
        total += item.goods.weight * 1;
      })
      if (total > this.data.package.weight) {
        M._alert('物品净重之和不能大于包裹总重量')
        this.data.viewObj[id].goods.weight = 0;
      } else {
        this.data.viewObj[id].goods.weight = val;
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
        deliveryService.calcFee(
          {
            "delivery_range": deliveryConfig.orderType,
            "delivery_type_id": deliveryConfig.deliver_type_id,
            "weight": weight
          }
          , res => {
            that.data.package.fee = deliveryConfig.fee;
            that.setData({ "package": that.data.package });
          }
        );
      }, 800);
      this.data.package.weight = weight;
    }
  },
  confirmAdd() {
    let currPackage = {}, goodsArr = [], that = this;
    if (!this.data.package.weight) {
      M._alert('请填写购买包裹总重量');
      return false
    }
    if (this.data.viewObj.length <= 0) {
      M._alert('请添加品种');
      return false
    }
    // 判断包裹内容
    this.data.viewObj.forEach((item, index, arr) => {
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
      console.log(goodsArr);
    });
    if (that.data.completed) {
      currPackage = {
        "weight": that.data.package.weight,
        "fee": that.data.package.fee,
        "goods": goodsArr
      };
      console.log(deliveryConfig.packageList);
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
        url: '/pages/delivery/delivery'
      });
    };
  }
});