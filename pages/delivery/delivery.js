// pages/delivery/delivery.js
import M from '../../components/modals/common.js';
import One from '../../utils/one.js'
import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    order_sn: '',
    packageEditPath: '',//包裹编辑的页面路径
    delivery_range: null,//订单类型
    deliveryConfig: deliveryConfig, //物流配置
    senderInfo: null,//发件人信息
    receiverInfo: null,//收件人信息
    invoice_switch: null,//是否需要发票
    amount: 0,//订单总金额
    totalWeight: '',//包裹总重量
    pkgList: [],
    customdeclarprice: 0, //海关报价
    isOK: false,
    inputable: '',
    deliver_type_id: 0,
    needPkg: false,//是否需要添加包裹,
    showDeliveryRange: false,
    uploadIDCard: false,//是否需要上传身份证
    idcardFrontUploaded: false,//是否上传在身份证正面
    idcardBackUploaded: false,//是否上传身份证反面
    fpercent: 0,
    bpercent: 0,
    frontUploadStatus: '',
    backUploadStatus: '',
    bidCardImage: '',
    fidCardImage: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化数据
    let totalWeight = 0,
      customdeclarprice = '',
      order_sn = options.id ? options.id : '',
      page = options.page ? options.page : '',
      amount = deliveryConfig.fee - 0,//订单运费
      deliver_type_id = deliveryConfig.deliver_type_id ? deliveryConfig.deliver_type_id : '',
      invoice_switch = deliveryConfig.invoice_switch,
      senderInfo = deliveryConfig.currSender ? deliveryConfig.currSender : '',
      receiverInfo = deliveryConfig.currReceiver ? deliveryConfig.currReceiver : '',
      pkgList = deliveryConfig.packageList;

    //获取订单类型
    options.delivery_range && (deliveryConfig.orderType = options.delivery_range);
    if (['international', 'clearcustom'].indexOf(deliveryConfig.orderType) >= 0) {
      this.data.inputable = 'disabled';
      this.data.needPkg = true;
    } else {
      this.data.inputable = '';
      this.data.needPkg = false;
      deliveryConfig.packageList = [];
    };
    if (deliveryConfig.orderType == 'international') {
      this.data.showDeliveryRange = true;
      this.data.packageEditPath = '/pages/pkginfo/pkginfo';
    };
    if (deliveryConfig.orderType == 'clearcustom') {
      this.data.packageEditPath = '/pages/taxpackage/taxpackage';
    }
    //是否需要上传身份证
    if (deliveryConfig.orderType == 'clearcustom' && receiverInfo) {
      if (receiverInfo.idcard_no && receiverInfo.idcardFrontUploaded && receiverInfo.idcardBackUploaded) {
        this.data.uploadIDCard = false;
      } else {
        this.data.uploadIDCard = true;
      }
      this.setData({
        uploadIDCard: this.data.uploadIDCard,
        idcardFrontUploaded: receiverInfo.idcardFrontUploaded != 0 ? true : false,
        idcardBackUploaded: receiverInfo.idcardBackUploaded != 0 ? true : false
      });
    }
    if (pkgList.length > 0) {
      //计算重量
      for (let i = 0, len = pkgList.length; i < len; i++) {
        totalWeight += pkgList[i].weight - 0;
      };
    } else {
      totalWeight = deliveryConfig.weight ? deliveryConfig.weight - 0 : 0;
    }
    //计算运费
    if (totalWeight > 0 && totalWeight <= 30) {
      if (deliveryConfig.orderType === 'clearcustom') {
        // 清关运费计算
        One.ajax(
          'delivery/get-tax-order-fee',
          {
            "weight": totalWeight,
            "packages": pkgList
          }, res => {
            this.setData({
              "amount": res.data.data.fee
            });
            deliveryConfig.fee = res.data.data.fee;
          }
        )
      } else {
        deliveryService.calcFee(
          {
            "delivery_range": deliveryConfig.orderType,
            "delivery_type_id": deliveryConfig.deliver_type_id,
            "weight": totalWeight
          }
          , res => {
            this.setData({ amount: deliveryConfig.fee });
          }
        );
      }
    }
    else if (totalWeight > 30) {
      M.alert('订单超重');
    }
    //获取物流配置
    if (this.data.showDeliveryRange && deliveryConfig.delivers == null) {
      deliveryService.getDelivers(() => {
        this.setData({
          "deliveryConfig": deliveryConfig
        })
      })
    } else {
      this.setData({
        "deliveryConfig": deliveryConfig
      });
    };
    this.setData({
      "packageEditPath": this.data.packageEditPath,
      "delivery_range": deliveryConfig.orderType,
      "senderInfo": senderInfo,
      "receiverInfo": receiverInfo,
      "amount": amount,
      "totalWeight": totalWeight == 0 ? '' : totalWeight,
      "pkgList": pkgList,
      "order_sn": order_sn,
      "deliver_type_id": deliver_type_id,
      "invoice_switch": invoice_switch == 'on' ? true : false,
      "inputable": this.data.inputable,
      "needPkg": this.data.needPkg,
      "showDeliveryRange": this.data.showDeliveryRange,
      "uploadIDCard": this.data.uploadIDCard
    });
  },
  onUnload() {
    this.setData({
      "senderInfo": null,
      "receiverInfo": null,
      "amount": 0,
      "totalWeight": 0,
      "pkgList": [],
      "deliver_type_id": ''
    });
  },
  //选择物流渠道
  radioChange(e) {
    let val = e.detail.value;
    this.setData({
      deliver_type_id: val
    });
    deliveryService.setDeliverType(val);
    //计算运费
    if (this.data.pkgList.length > 0) {
      deliveryService.calcFee(
        {
          "delivery_range": deliveryConfig.orderType,
          "delivery_type_id": deliveryConfig.deliver_type_id,
          "weight": this.data.totalWeight
        }
        , res => {
          this.setData({ amount: deliveryConfig.fee });
        }
      );
    }
  },
  //是否需要发票
  invoWantedChange(e) {
    let val = e.detail.value;
    this.setData({ "invoice_switch": val });
    deliveryConfig.invoice_switch = (e.detail.value == true ? 'on' : 'off');
  },
  // 包裹操作
  addPkg() {
    if (this.data.showDeliveryRange && deliveryConfig.deliver_type_id == 0) {
      M._alert('请选择物流渠道');
      return
    }
    if (this.data.delivery_range == 'international') {
      wx.navigateTo({
        url: '/pages/pkginfo/pkginfo'
      });
    } else {
      wx.navigateTo({
        url: '/pages/taxpackage/taxpackage'
      })
    }
  },
  //购买包裹总重量
  weightChange(e) {
    let val = e.detail.value,
      timer = null;
    if (this.data.delivery_range === 'international' && this.data.deliver_type_id == 0) {
      M._alert('请先选择物流渠道');
      return false;
    }
    if (!val || !(/^[0-9]*$/.test(val))) {
      this.setData({ totalWeight: "", amount: 0 });
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.data.totalWeight = val;
        //计算运费
        deliveryService.calcFee(
          {
            "delivery_range": deliveryConfig.orderType,
            "delivery_type_id": deliveryConfig.deliver_type_id,
            "weight": val
          }
          , res => {
            this.setData({ amount: deliveryConfig.fee });
          }
        );
      }, 800)
    }
  },
  //删除包裹
  delPkg() {
    let pkgList = deliveryConfig.packageList,
      len = pkgList.length,
      totalWeight = 0,
      amount = 0;
    if (len > 0) {
      M._confirm(
        "你确认删除包裹" + len + "？",
        () => {
          pkgList.splice(-1, 1);
          //计算重量
          for (let i = 0, len = pkgList.length; i < len; i++) {
            totalWeight += pkgList[i].weight - 0;
          };
          if (deliveryConfig.orderType === 'clearcustom') {
            // 清关运费计算
            One.ajax(
              'delivery/get-tax-order-fee',
              {
                "weight": totalWeight,
                "packages": pkgList
              }, res => {
                deliveryConfig.fee = res.data.data.fee;
                this.setData({
                  "amount": res.data.data.fee,
                  "pkgList": pkgList,
                  "totalWeight": totalWeight
                });
              }
            )
          } else {
            deliveryService.calcFee(
              {
                "delivery_range": deliveryConfig.orderType,
                "delivery_type_id": deliveryConfig.deliver_type_id,
                "weight": totalWeight
              }
              , res => {
                this.setData({
                  "amount": deliveryConfig.fee,
                  "pkgList": pkgList,
                  "totalWeight": totalWeight
                });
              }
            );
          }

        }
      )
    } else {
      M._alert('你还没有添加包裹，无法进行删除操作');
    }
  },
  // 添加收件人信息
  addReceiver() {
    wx.navigateTo({
      url: '/pages/receiver_list/receiver_list'
    })
  },
  // 身份证上传
  uploadImage(e) {
    let side = e.currentTarget.dataset.side
      , receiver_id = deliveryConfig.currReceiver.id
      , that = this;
    wx.chooseImage({
      success: function (res) {
        let path = res.tempFilePaths[0];
        One.uploadFile('user/receiver-upload-idcard'
          , path
          , {
            "side": side,
            "receiver_id": receiver_id
          }
          , res => {
            let resData = JSON.parse(res.data);
            if (!resData.code) {
              if (side == 'front') {
                that.data.idcardFrontUploaded = true;
                that.data.fpercent = 100;
                that.data.frontUploadStatus = '上传成功(点击可重新上传)';
                that.data.fidCardImage = path;
                deliveryConfig.currReceiver.idcard_no = resData.cardno;
              } else {
                that.data.idcardBackUploaded = true;
                that.data.bpercent = 100;
                that.data.backUploadStatus = '上传成功(点击可重新上传)';
                that.data.bidCardImage = path;
              }
              //更新数据
              that.setData({
                fpercent: that.data.fpercent,
                bpercent: that.data.bpercent,
                frontUploadStatus: that.data.frontUploadStatus,
                backUploadStatus: that.data.backUploadStatus,
                fidCardImage: that.data.fidCardImage,
                bidCardImage: that.data.bidCardImage
              });

            } else {
              M._alert(`${resData.msg},请重新上传`);
              if (side == 'front') {
                that.data.fpercent = 0;
                that.data.idcardFrontUploaded = false;
              } else {
                that.data.bpercent = 0;
                that.data.idcardBackUploaded = false;
              };
              that.setData({
                bpercent: that.data.bpercent,
                fpercent: that.data.fpercent
              });
            }
            deliveryConfig.currReceiver.idcardFrontUploaded = that.data.idcardFrontUploaded;
            deliveryConfig.currReceiver.idcardBackUploaded = that.data.idcardBackUploaded;
          },
          null,
          processRes => {
            let p = processRes.progress >= 99 ? 99 : processRes.progress
            if (side == 'front') {
              that.setData({
                fpercent: p,
                frontUploadStatus: '上传中...'
              });
            } else {
              that.setData({
                bpercent: p,
                backUploadStatus: '上传中...'
              });
            }
          }
        )
      },
    })
  },
  // 添加发件人信息
  addSender() {
    wx.navigateTo({
      url: '/pages/sender_list/sender_list'
    })
  },
  //添加发票
  addInvoice() {
    wx.navigateTo({
      url: '/pages/invoice_list/invoice_list',
    })
  },
  //重置
  resetData() {
    deliveryConfig.currSender = null;
    deliveryConfig.currReceiver = null;
    deliveryConfig.fee = 0;
    deliveryConfig.weight = 0;
    deliveryConfig.packageList = [];
    deliveryConfig.invoice_switch = 'off';
    deliveryConfig.deliver_type_id = '';
    deliveryConfig.orderType = null;
  },
  //验证函数
  verifyFn() {
    // 清关的总价计算
    let customdeclarprice = 0
      , pkgList = deliveryConfig.packageList;
    if (deliveryConfig.orderType === 'clearcustom' && deliveryConfig.packageList.length > 1) {
      for (let i = 0, len = pkgList.length; i < len; i++) {
        customdeclarprice += pkgList[i].goods.customdeclarprice - 0;
      }
      this.data.customdeclarprice = customdeclarprice;
      if (customdeclarprice - 0 > 2000) {
        M._alert(`清关商品商品总价不能超过￥2000,当前总价为${customdeclarprice}`);
        return false
      }
    };
    if (this.data.delivery_range == 'international' && deliveryConfig.deliver_type_id == 0) {
      M._alert('请添选择物流渠道');
      return false
    };
    if (!this.data.receiverInfo) {
      M._alert('请添加收件人');
      return false
    };
    if (this.data.delivery_range == 'clearcustom') {
      if (!this.data.idcardFrontUploaded) {
        M._alert('请上传身份证正面照');
        return false
      } else if (!this.data.idcardBackUploaded) {
        M._alert('请上传身份证背面照');
        return false
      }
    };
    if (['international', 'clearcustom'].indexOf(this.data.delivery_range) >= 0) {
      if (this.data.senderInfo == '') {
        M._alert('请添加发件人');
        return false
      } else if (this.data.pkgList.length == 0) {
        M._alert('请添加包裹');
        return false
      }
    };
    if (this.data.totalWeight == 0) {
      M._alert('购买包裹总重量不能为0');
      return false;
    };
    if (this.data.totalWeight >= 30) {
      M._alert('订单超重');
      return false;
    };
    this.data.isOK = true;
  },
  //暂存或者提交操作
  orderHandle(port, cb) {
    this.verifyFn();
    if (this.data.isOK) {
      if (deliveryConfig.orderType === 'clearcustom') {
        var data = {
          "receiver_id": this.data.receiverInfo.id,
          "sender_id": this.data.senderInfo.id,
          "invoice_switch": deliveryConfig.invoice_switch,
          "packeages": this.data.pkgList,
          "packages": this.data.pkgList,
          "weight": this.data.totalWeight
        };
      } else {
        // 其他订单数据
        var data = {
          "delivery_range": this.data.delivery_range,
          "delivery_type_id": deliveryConfig.deliver_type_id,
          "sender_id": this.data.senderInfo.id,
          "receiver_id": this.data.receiverInfo.id,
          "invoice_switch": deliveryConfig.invoice_switch,
          "packeages": this.data.pkgList,
          "packages": this.data.pkgList,
          "weight": this.data.totalWeight
        };
      }
      // 清关订单数据
      if (this.data.order_sn != '') data.order_sn = this.data.order_sn;
      One.ajax(port, data, res => {
        if (!res.data.code) {
          this.data.order_sn = res.data.data.order_sn;
          cb && cb()
        } else {
          One.showError(res.data.msg);
        }
      })
    }
  },
  // 暂存订单
  saveOrder() {
    let port = (this.data.order_sn ? "delivery/edit-saved-order" : "delivery/save-order"),
      that = this;
    this.orderHandle(port, () => {
      wx.redirectTo({
        url: '/pages/myorder/order_list',
        success: () => {
          that.resetData();
        }
      });
    });
  },
  // 提交订单
  submitOrder() {
    let port
      , that = this;
    if (deliveryConfig.orderType === 'clearcustom') {
      port = 'delivery/tax-order';
    } else {
      port = this.data.order_sn ? "delivery/edit-saved-order" : "delivery/create-order"
    }
    this.orderHandle(port, () => {
      wx.redirectTo({
        url: '/pages/order_detail/detail?&id=' + this.data.order_sn,
        success: () => {
          that.resetData();
        }
      })
    });
  }
})