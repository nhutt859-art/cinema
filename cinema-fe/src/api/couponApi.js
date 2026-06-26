import axiosClient from './axiosClient'

const couponApi = {
  applyCoupon: (data) => axiosClient.post('/coupons/apply', data),
}

export default couponApi
