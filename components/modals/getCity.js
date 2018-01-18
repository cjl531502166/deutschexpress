class Geolocation {
    config = {
        "ak": "3czpM7iyVkeUpHeaihd9CTcqQ1hGDuzG",
        "api": "https://api.map.baidu.com/geocoder/v2/"
    };
    getLocation(locaparam) {
        locaparam = locaparam || {};
        wx.getSetting({
            success: res => {
                wx.getLocation({
                    type: locaparam.type || "gcj02",
                    success: res => {
                        locaparam.success && locaparam.success(res)
                    },
                    fail: res => {
                        locaparam.fail && locaparam.fial(res)
                    },
                    complete: res => {
                        locaparam.complete && locaparam.complete(res)
                    }
                })
            }
        })
    };
    getCity(succResult, succCb, failCb) {
        let that = this,
            location = `${succResult.latitude},${succResult.longitude}1`;
        wx.request({
            url: that.config.api,
            data: {
                "ak": that.config.ak,
                "location": location,
                "output": "json",
                "pois": '1'
            },
            method: "GET",
            success: res => {
                succCb && succCb(res)
            },
            fail: res => {
                wx.showToast({
                    title: '获取定位失败'
                });
                failCb && failCb(res)
            }
        })
    }
}
export default new Geolocation();