class AccessService {
  constructor ($rootScope) {
    'ngInject'
    this.accessControl = {
      'categories_manage': false,
      'user_add': false,
      'branch_add': false,
      'branch_edit': false
    }
    $rootScope.$on('currentUserInfoLoaded', () => {
      if ($rootScope.currentUser.role === 'SU') {
        this.accessControl['user_add'] = true
        this.accessControl['categories_manage'] = true
        this.accessControl['branch_add'] = true
        this.accessControl['branch_edit'] = true
        this.accessControl['branches'] = undefined
      } else {
        this.accessControl['branches'] = [$rootScope.currentUser.branch]
      }
    })
  }
  getAccessControl () {
    return this.accessControl
  }
}
export default AccessService
