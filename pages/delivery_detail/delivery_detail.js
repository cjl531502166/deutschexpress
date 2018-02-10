// pages/delivery_detail/delivery_detail.js
import deliveryState from '../../models/delivery.state.js';
Page({
    data: {
        deliveryState: deliveryState,
        html: ''
    },
    onLoad() {
        let that = this,
            str = this.data.deliveryState.shipment;
        this.setData({
            html: str
        });
    }
})