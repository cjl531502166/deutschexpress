// pages/delivery_detail/delivery_detail.js
Page({

    data: {
        trackNum:'',
        delivery_data: null
    },
    onLoad(options){
        let trackNum = options.tracknum;
        this.data.trackNum = trackNum;
    },
    onShow() {
        this.setData({
            "delivery_data": [
                {
                    "currPos": "快件到达美国纳斯达克",
                    "datestr": "2017-12-19"
                }, {
                    "currPos": "快件到达伊拉克萨瓦迪卡盆地",
                    "datestr": "2017-12-19"
                }, {
                    "currPos": "快件到达伊拉克萨瓦迪卡盆地",
                    "datestr": "2017-12-19"
                }
            ]
        })
    }
})