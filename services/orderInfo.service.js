import One from '../utils/one.js';
import orderInfo from '../models/order.model.js';
export default {
    getOrderInfo(order_sn, cb) {
        One.ajax('delivery/order-info', { "order_sn": order_sn }, res => {
            console.log(res.data.data);
            orderInfo.orderInfo = res.data.data;
            cb && cb(res)
        })
    },
    getCurrPackage(id, packageList) {
        packageList.forEach((item, index, arr) => {
            if(item.packageid == id){
                orderInfo.currPackage = item;
                return
            }
        })
    }
}