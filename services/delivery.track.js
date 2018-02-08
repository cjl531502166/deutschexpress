import One from '../utils/one.js';
import deliveryState from '../models/delivery.state.js';
import M from '../components/modals/common.js';
export default {
    getState(delivery_no,cb) {
        One.ajax('delivery/status-search',
            { "delivery_no": delivery_no },
            res => {
                if (res.data.data != null) {
                    deliveryState.shipment = res.data.data.html;
                    cb && cb(res);
                } else {
                    M._alert(res.data.msg);
                }
            }
        )
    }
}