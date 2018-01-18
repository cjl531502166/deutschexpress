// pages/receivers/receivers.js
import M from '../../components/modals/common.js';
const app = getApp()
Page({
    data: {
        invoiceList: null
    },
    onLoad() {
        this.setData({
            "invoiceList": app.globalData.invoiceList
        })
    },
    onShow() {

    },
    // 设置默认发票
    invoiceChange(e) {
        let currIndex = e.detail.value - 0;
        this.data.invoiceList.forEach((item, index) => {
            if (index == currIndex) {
                item.default = true;
            } else {
                item.default = false;
            }
        })
        this.setData({
            "invoiceList": this.data.invoiceList
        })
    },
    deleteItem(e) {
        let index = e.currentTarget.dataset.id;
        // 删除当前发票
        M._alert('确定要删除该发票？', () => {
            this.data.invoiceList.splice(index, 1);
            this.setData({
                "invoiceList": this.data.invoiceList
            })
            wx.showToast({
                title: '删除成功'
            })
        })
    },
    //编辑发票
    editInvoice(e) {
        let invoId = e.currentTarget.dataset.id;
        wx.redirectTo({
            url: '/pages/add_invoice/add?invoId=' + invoId
        })
    }
})