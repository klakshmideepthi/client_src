import CONSTANTS from '../../common/modules/Constants'
class ViewDocumentsController {
  constructor ($mdDialog, docs) {
    'ngInject'
    this.$mdDialog = $mdDialog
    // TODO: handle multiple documents
    this.doc = docs[0]
    // TODO: For some reason $rootScope's IMAGE_BASE_URL is not accessible here.
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
  }
  hide () {
    this.$mdDialog.hide()
  }
  cancel () {
    this.$mdDialog.cancel()
  }
}
export default ViewDocumentsController
