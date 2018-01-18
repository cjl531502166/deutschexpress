import newsModel from '../models/news.model.js';
import One from '../utils/one.js';
export default {
    getNews(cb) {
        wx.showLoading();
        One.ajax(
            'home/notice-list',
            {},
            res => {
                newsModel.newsList = res.data.data;
                newsModel.hasNews = true;
                cb && cb(res)
            }
        )
    },
    getNewsDetail(id, cb) {
        One.ajax('home/notice-list', {}, res => {
            if (!res.data.code) {
                res.data.data.forEach((news, index) => {
                    if (news.id == id) {
                        newsModel.newsDetail = news;
                        return
                    }
                })
                cb && cb()
            } else {
                One.showError(res.data.msg);
            }
        })
    }
}