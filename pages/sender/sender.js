import deliveryConfig from '../../models/delivery.config.js';
import deliveryService from '../../services/delivery.service.js';
Page({
    data: {
        deliveryConfig: deliveryConfig
    },
    onLoad() {
        wx.showLoading();
        deliveryService.getSenders(res => {
            this.setData({
                'deliveryConfig': deliveryConfig
            })
        })
    },
    // 设置默认地址
    addressChange(e) {
        let currIndex = e.detail.value - 0;
        deliveryService.setDefault('user/sender-set-default', currIndex);
    },
    deleteAddr(e) {
        let id = e.currentTarget.dataset.id;
        deliveryService.deleteSender(id, res => {
            deliveryService.getSenders(res => {
                this.setData({
                    'deliveryConfig': deliveryConfig
                })
                wx.showToast({
                    title: '已删除'
                });
            })
        })
    },
    //编辑发件人
    editSender(e) {
        let id = e.currentTarget.dataset.id;
        deliveryService.getCurrSender(id, deliveryConfig.senderList);
        //获得当前发件人并发送给编辑页面
        wx.navigateTo({
            url: '/pages/edit_sender/edit?id=' + id
        })
    }
})