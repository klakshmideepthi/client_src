import CONSTANTS from '../../common/modules/Constants'
class UseAssetController {
  constructor ($http, $mdDialog, $mdToast, asset) {
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$mdToast = $mdToast
    this.asset = asset
  }
  useAsset () {
    const url = CONSTANTS.URL_BASE + '/asset/use?ASSET_ID=' + this.asset._id + '&QUANTITY=' + this.quantity
    this.$http.put(url, {})
    .then(() => {
      const msg = 'Successfully marked ' + this.quantity + ' of ' + this.asset.name + ' as used'
      this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
      this.$mdDialog.hide({})
      console.log(msg)
    }, (obj) => {
      const msg = 'Unable to mark asset: ' + this.asset.name + ' as used. Error ' + obj.statusText
      this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
    })
  }
  cancel () {
    this.$mdDialog.cancel()
  }
}
export default UseAssetController
