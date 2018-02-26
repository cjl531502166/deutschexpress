// pages/add_idcard/add.js
Page({

    data: {

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    uploadFile() {
        wx.chooseImage({
            success: function (res) {
                let tempFilePaths = res.tempFilePaths[0];
                wx.uploadFile({
                    
                })
            },
        })
    }
})