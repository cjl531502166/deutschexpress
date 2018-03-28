class One {
  config = {
    requestURI: 'https://wxa.litchiland.com/v1/',
    token: wx.getStorageSync('token')
  };
  ajax(port, data, succCb, failCb, method) {
    let that = this;
    wx.showLoading({
      title: '数据加载中',
      mask: true
    });

    wx.request({
      url: that.config.requestURI + port + '?token=' + that.config.token,
      data: data,
      method: method ? method : "POST",
      success: (res) => {
        wx.hideLoading();
        if (res.data.code != 0) {
          res.data.msg ? res.data.msg : "Error";
          wx.showModal({
            title: '',
            content: `${res.data.msg}`
          })
          return
        }
        succCb && succCb(res);
      },
      fail: (res) => {
        wx.hideLoading();
        failCb && failCb(res);
        that.showError(JSON.stringify(res.data));
      }
    })
  };
  showError(errMsg) {
    wx.showModal({
      title: '错误',
      content: errMsg,
      showCancel: false
    })
  };
  uploadFile(port, filepath, formData, succCb, failCb, processCb) {
    let that = this;
    wx.uploadFile({
      url: that.config.requestURI + port + '?token=' + that.config.token,
      filePath: filepath,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      formData: formData,
      success: (res) => {
        succCb && succCb(res);
      },
      fail: (res) => {
        this.showError(res.data)
        failCb && failCb(res);
      }
    }).onProgressUpdate((res) => {
      processCb && processCb(res)
    });

  }
}
export default new One()