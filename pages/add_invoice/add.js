// pages/add_invoice/add.js
import M from '../../components/modals/common.js';
const app = getApp();
Page({

    data: {
        invoiceId: null,
        company: '',
        taxNum: '',
        address: '',
        contact: '',
        issueBank: '',
        bankAccount: '',
        saveInvoice: true,
        fromPage: null,
    },
    onLoad: function (options) {
        this.data.fromPage = options.page ? options.page : null; //判断页面来源
        this.data.invoiceId = options.invoId ? options.invoId : null;
        this.setData({
            "fromPage": this.data.fromPage
        })
    },

    onShow() {

    },
    getCompany(e) {
        if (e.detail.value) {
            this.data.company = e.detail.value;
        }
    },
    getTaxNo(e) {
        if (e.detail.value && (isNaN(e.detail.value) || (e.detail.value.length < 13))) {
            M._alert('企业税号必须为13位数字');
            return
        }
        this.data.taxNum = e.detail.value
    },
    getAddress(e) {
        if (e.detail.value) {
            this.data.address = e.detail.value;
        }
    },
    getTel(e) {
        let regxPhone = /^1[34578]\d{9}$/,
            regxTel = /^(([0\+]\d{2,3})?(0\d{2,3}))(\d{7,8})((\d{3,}))?$/,
            tel = e.detail.value;
        if (tel && (!(regxPhone.test(tel) || regxTel.test(tel)))) {
            M._alert('固话或者手机号码格式不正确\n，固话请加区号');
            return;
        }
        this.data.contact = e.detail.value;
    },
    getBank(e) {
        let reg = /^[\u2E80-\u9FFF]+$/;
        if (e.detail.value && (!reg.test(e.detail.value))) {
            M._alert('开户行名称必须是中文');
            return;
        }
        this.data.issueBank = e.detail.value;
    },
    getAccount(e) {
        let val = e.detail.value.replace(/\s/ig, '');

        if (val && val < 19) {
            M._alert('请输入19位银行账号');
            return
        }
        this.data.bankAccount = val;
    },
    formatAccount(e) {
        this.data.bankAccount = e.detail.value;
        this.data.bankAccount = this.data.bankAccount.replace(/(\d{4})(?=\d)/g, "$1 ");
        this.setData({
            "bankAccount": this.data.bankAccount
        })
    },
    checkboxChange(e) {
        this.data.saveInvoice = e.detail.value[0] ? 1 : 0;
    },
    saveHandle() {
        let invoiceInfo;
        if (this.data.company == '') {
            M._alert('请填写公司名称');
            return;
        }
        if (this.data.taxNum == '') {
            M._alert('请填写企业税号');
            return;
        }
        if (this.data.address == '') {
            M._alert('请填写详细地址');
            return;
        }
        if (this.data.contact == '') {
            M._alert('请填写注册电话');
            return;
        }
        if (this.data.issueBank == '') {
            M._alert('请填写开户银行');
            return;
        }
        if (this.data.bankAccount == '') {
            M._alert('请填写开户行账号');
            return;
        }
        invoiceInfo = {
            "company": this.data.company,
            "taxNum": this.data.taxNum,
            "address": this.data.address,
            "contact": this.data.contact,
            "issueBank": this.data.issueBank,
            "bankAccount": this.data.bankAccount,
            "default": this.data.saveInvoice
        }
        // 开始保存
        if (this.data.fromPage == 'order') {
            app.globalData.currInvoice = invoiceInfo;
            if (this.data.saveInvoice) {
                //保存地址
            } else {
                wx.redirectTo({
                    url: '/pages/delivery/delivery'
                })
            }
        } else {
            //ajax保存或者修改地址
            if (this.data.invoiceId != null) {
                //修改信息
                invoiceInfo.default = app.glogalData.invoiceList[this.data.invoiceId].default;
                wx.redirectTo({
                    url: '/pages/invoice/invoice',
                    success: () => {
                        app.globalData.invoiceList.splice(this.data.invoiceId, 1, invoiceInfo)
                    }
                })
            } else {
                // 保存信息
                invoiceInfo.default = false;
                wx.redirectTo({
                    url: '/pages/invoice/invoice',
                    success: () => {
                        app.globalData.invoiceList.push(invoiceInfo);
                    }
                })
            }
        }
    }
})