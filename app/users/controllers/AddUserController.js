import CONSTANTS from '../../common/modules/Constants'
class AddUserController {
  constructor ($http, $mdDialog, $mdToast, $rootScope, Upload, operation, user) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$mdToast = $mdToast
    this.$rootScope = $rootScope
    this.Upload = Upload
    this.operation = operation
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
    if (user) {
      this.newobj = angular.extend({}, {}, user)
    } else {
      this.newobj = {role: 'SU'}
    }
    this.original = angular.copy(this.newobj)
    this.currentPage = 'user-form'
    this.fetchAllBranches()
  }
  fetchAllBranches () {
    this.branches = []
    var url = CONSTANTS.URL_BASE + '/branches'
    this.$http.get(url, {})
      .then(({data}) => {
        this.branches = data
        for (var i = 0; i < data.length; i++) {
          if (data[i]._id === this.newobj.branch) {
            console.log('setting selected branch: ' + data[i]._id)
            this.selectedBranch = data[i]
            break
          }
        }
      },
      () => console.log('Error while fetching all branches')
    )
  }

  // TODO: When user is being created/added, server always return 200. But gives an object that says status as 'UPDATE SUCCESS'
  //  But while changing the password and if the status is success, it gives an object that says status as 'SUCCESS'
  // If ther is an error in changing the password, it gives an empty object.
  // Very inconsistent server behaviour. Some of this logic is to work around these inconsitencies
  submitUser () {
    const url = (this.operation === 'add') ? ('/signup') : (CONSTANTS.URL_BASE + '/user')
    const user = this.processDataForSubmission(this.newobj)
    console.log('User: ', user);
    const func = (this.operation === 'add') ? this.$http.post : this.$http.put
    this.operation === 'add' ? user : delete user['email']
    func(url, user)
      .then(({data}) => {
        console.log('Response user: ', data);
        if (!data || !data.status || data.status !== "SUCCESS") {
          // User add/edit failed.
          console.log('Error while saving user: ', data)
          const msg = 'Unable to save user: ' + user.name + '. Error ' + (data.message || data.status || ' Unknown error')
          this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
        } else {
          if (this.newPic) {
            const formdata = new FormData();
            formdata.append("file", this.newPic);
            this.$http.post(CONSTANTS.IMAGE_BASE_URL + "USER/"+data.user._id,formdata, {
              transformRequest: angular.identity,
              headers: { 'Content-Type': undefined }
            })
            .then((d) => {
              console.log(d.image + ' is uploaded successfully.')
            })
            .catch((err) => console.log(err.message));
          }
          // User add/edit successful. Try changing the password now
          const msg = 'Successfull saved user: ' + user.name
          if (this.newobj.old_password && this.newobj.new_password && this.isCurrentUser()) {
            console.log('Changing password...')
            this.$http.put(CONSTANTS.URL_BASE + '/user/password', {cur_pwd: this.newobj.old_password, new_pwd: this.newobj.new_password})
              .then(({data}) => {
                if (!data || !data.status || !data.status.indexOf('SUCCESS') < 0) {
                  // Password change failed
                  console.log('Unable to change the password', data)
                  const msg = 'Unable to change password: ' + user.name + '. Please check the current password'
                  this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
                } else {
                  // Password change successful
                  console.log('Successfully changed password')
                  this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
                  this.$mdDialog.hide({})
                  // TODO: Check if the image is deleted/added/changed. and handled it appropriately
                }
              }, (obj) => {
                // Password change failed
                console.log('Unable to change the password')
                const msg = 'Unable to change password: ' + user.name + '. Error ' + obj.statusText
                this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
              })
          } else {
            // No need to change password.
            this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
            this.$mdDialog.hide({})
          }
        }
      },
      (obj) => {
        // User add/edit failed
        console.log('Error while saving user: ', obj)
        const msg = 'Unable to save user: ' + user.name + '. Error ' + obj.statusText
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
      }
    )
    .catch((error) => console.error('Error while saving user: ', error))
  }
  isCurrentUser () {
    return this.newobj._id === this.$rootScope.currentUser._id
  }
  deletePicture () {
    delete this.newPic
    delete this.newobj.image
  }
  branchChanged (item) {
    console.log('item: ', this.selectedBranch)
    if (!this.selectedBranch) {
      this.newobj.branch = null
    } else {
      this.newobj.branch = this.selectedBranch._id
    }
  }
  isDirty () {
    var isDirty = false
    if (this.newPic) {
      return true
    }
    angular.forEach(fields, (field) => {
      if (isDirty) {
        return
      }
      if (this.isEmpty(this.newobj[field])) {
        if (this.original && !this.isEmpty(this.original[field])) {
          isDirty = true
        }
      } else {
        if (!this.original) {
          isDirty = true
        } else {
          if (this.isEmpty(this.original[field])) {
            isDirty = true
          } else {
            if (!angular.equals(this.newobj[field], this.original[field])) {
              isDirty = true
            }
          }
        }
      }
      if (isDirty) {
        console.log('Field ' + field + ' is dirty')
      }
    })
    return isDirty
  }
  cancel () {
    if (this.isDirty()) {
      this.prevPage = this.currentPage
      this.currentPage = 'confirm_close'
    } else {
      this.$mdDialog.cancel()
    }
  }
  closeConfirmed () {
    this.$mdDialog.cancel()
  }
  closeCancelled () {
    this.currentPage = this.prevPage
  }
  isEmpty (obj) {
    if (!obj) {
      return true
    }
    if (angular.isArray(obj)) {
      if (obj.length === 0) {
        return true
      }
      return false
    }
    if (angular.isObject(obj)) {
      if (angular.equals(obj, {})) {
        return true
      }
    }
    return false
  }
  processDataForSubmission (data) {
    const output = angular.copy(data)
    // Can not update email and passwrd in using this API.
    // Have to delete them otherwise, server responds with an error
    // delete output.alternateEmails
    // delete output.email
    // delete output.password
    return output
  }
}
const fields = [
  'name',
  'email',
  'branch',
  'old_password',
  'new_password',
  'confirm_password'
]
export default AddUserController
