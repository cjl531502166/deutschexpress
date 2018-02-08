// components/latest_pkglist/latest_pkglist.js
import One from '../../utils/one.js';
import searchModel from '../../models/search.model.js';
import searchService from '../../services/search.service.js';
import deliveryTrack from '../../services/delivery.track.js';
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        packageList:{
            type:Array,
            value:[]
        },
        limit:{
            type:Number,
            value:5
        }
    },

    /**
     * 组件的初始数据
     */
    data:{},
    trackPkg(e){
        let num = e.currentTarget.dataset.num;
        deliveryTrack.getState(num, res => {
            wx.navigateTo({
                url: '/pages/delivery_detail/delivery_detail'
            });
        });
    }
})
