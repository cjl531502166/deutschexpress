import Category from '../models/goods.categories.js';
import One from '../utils/one.js';
export default {
    getCategories(cb) {
        One.ajax('delivery/good-category-code', {}, res => {
            Category.categoryArr = res.data.data;
            cb && cb(res)
        })
    }
}