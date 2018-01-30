class One {
    config = {
        requestURI: 'https://gd.letwx.com/v1/',
        token: wx.getStorageSync('token')
    }
    ajax(port, data, succCb, failCb, method) {
        wx.showLoading({
            title: '数据加载中',
            mask: true
        });
        
        wx.request({
            url: this.config.requestURI + port + '?token=' + this.config.token,
            data: data,
            method: method ? method : "POST",
            success: (res) => {
                wx.hideLoading();
                if (res.data.code != 0) {
                    wx.showModal({
                        title: '',
                        content:res.data.msg
                    })
                    return
                }
                succCb && succCb(res);
            },
            fail: (res) => {
                wx.hideLoading();
                failCb && failCb(res);
                this.showError(JSON.stringify(res.data));
            }
        })
    }
    showError(errMsg) {
        wx.showModal({
            title: '错误',
            content: errMsg,
            showCancel: false
        })
    }
}
export default new One()