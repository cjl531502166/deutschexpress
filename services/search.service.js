import One from '../utils/one.js';
import searchModel from '../models/search.model.js';
export default {
    getStatus(cb) {
        One.ajax('delivery/order-page-setting', {}, res => {
            searchModel.status = res.data.data.status;
            cb && cb(res)
        })
    },
    getDeliverTypes(cb) {
        One.ajax('delivery/order-page-setting', {}, res => {
            searchModel.delivery_types = res.data.data.delivery_type;
            cb && cb(res)
        })
    }
}