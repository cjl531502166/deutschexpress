// pages/delivery_detail/delivery_detail.js
import deliveryState from '../../models/delivery.state.js';
Page({
    data: {
        deliveryState: deliveryState,
        result: ''
    },
    onLoad() {
        let that = this,
            result = this.data.deliveryState.shipment;
        this.setData({
            result: result
        });
    }
});