// pages/news_notices/news_notice.js
import newsModel from '../../models/news.model.js';
import newsSevice from '../../services/news.service.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsModel: newsModel
  },
  onLoad() {
    //获取新闻
    newsSevice.getNews((res) => {
      newsModel.newsList.reverse();
      this.setData({
        newsModel: newsModel
      })
    });
  }
})