// pages/newsdetail/newsdetail.js
import newsModel from '../../models/news.model.js';
import newsSevice from '../../services/news.service.js';
Page({
    data: {
        newsModel: newsModel
    },
    onLoad: function (options) {
        let id = options.id;
        if (id) {
            newsSevice.getNewsDetail(id, () => {
                this.setData({
                    'newsModel': newsModel
                })
            })
        }
    }
})