import deliveryConfig from '../models/delivery.config.js';
import One from '../utils/one.js';
import M from '../components/modals/common.js';
export default {
    //获取物流运输方式列表
    getDelivers(cb) {
        One.ajax('delivery/config', {}, res => {
            // deliveryConfig.delivers = res.data.data.delivery_types;
            let arr = [];
            res.data.data.delivery_types.forEach((item, index) => {
                if ((item.name != "德国境内单") && (item.name != "欧盟境内单")){
                    arr.push(item);
                }
            });
            deliveryConfig.delivers = arr;
            deliveryConfig.hotline = res.data.data.hotline;
            cb && cb(res)
        })
    },
    //设置当前物流方式
    setDeliverType(id) {
        deliveryConfig.deliver_type_id = id;
    },
    //获取运费模板
    getFeeTpl(id) {
        if (!deliveryConfig.delivers) {
            this.getDelivers(res => {
                deliveryConfig.delivers.map((item, index, arr) => {
                    if (item.id == id) {
                        deliveryConfig.fee_tpl = item.fee_tpl;
                    }
                })
            })
        } else {
            deliveryConfig.delivers.map((item, index, arr) => {
                if (item.id == id) {
                    deliveryConfig.fee_tpl = item.fee_tpl;
                }
            })
        }

    },
    //获取收件人列表
    getReceivers(cb) {
        One.ajax('user/receiver', {}, res => {
            deliveryConfig.receiverList = res.data.data;
            cb && cb(res)
        })
    },
    //获取当前收件人
    getCurrReceiver(id, listArr) {
        // deliveryConfig.currReceiver = listArr[id - 1]
        listArr.forEach((item, index, arr) => {
            if (item.id == id) {
                deliveryConfig.currReceiver = item;
                return
            }
        })
    },
    //添加收件人
    addReceiver(port, data, cb) {
        One.ajax(port, data, res => {
            cb && cb(res)
        })
    },
    //删除收件人
    deleteReceiver(id, cb) {
        M._alert('确定要删除该收件人？', () => {
            One.ajax('user/receiver-del', { "id": id }, res => {

                cb && cb(res)
            })
        })
    },
    //编辑收件人
    editReceiver(newObj, cb) {
        One.ajax('user/receiver-edit', newObj, res => {
            cb && cb(res)
        })
    },
    //获取发件人列表
    getSenders(cb) {
        One.ajax('user/sender', {}, res => {
            deliveryConfig.senderList = res.data.data;
            cb && cb(res)
        })
    },
    //获取当前发件人
    getCurrSender(id, listArr) {
        listArr.forEach((item, index, arr) => {
            if (item.id == id) {
                deliveryConfig.currSender = item;
                return
            }
        })
        // deliveryConfig.currSender = listArr[id - 1]
    },
    //添加发件人
    addSender(port, data, cb) {
        One.ajax(port, data, res => {

            cb && cb(res);
        })
    },
    //删除当前发件人
    deleteSender(id, cb) {
        M._alert('确定要删除该发件人？', () => {
            One.ajax('user/sender-del', { "id": id }, res => {
                cb && cb(res)
            })
        })
    },
    //编辑发件人
    editSender(newObj, cb) {
        One.ajax('user/sender-edit', newObj, res => {
            cb && cb(res)
        })
    },
    //获取发票列表
    getInvoices(cb) {
        if (deliveryConfig.invoiceList.length == 0) {
            // One.ajax('user/sender', {}, res => {
            //     deliveryConfig.senderList = res.data.data;
            //     cb && cb(res)
            // })
        } else {
            wx.hideLoading()
        }
    },
    //获取当前发票
    getCurrInvoice(id, listArr) {
        deliveryConfig.currInvoice = listArr[id - 1]
    },
    //设置默认
    setDefault(requestPort, id) {
        One.ajax(requestPort, { "id": id }, res => {
            wx.showToast({
                title: '设置成功'
            })
        })
    },
    //计算运费
    calcFee(data, cb) {
        One.ajax('delivery/get-order-fee', data, res => {
            if (res.data.data) {
                deliveryConfig.fee = res.data.data.fee;
                cb && cb(res);
            } else {
                M._alert(res.data.msg);
            }
        })
    }
}