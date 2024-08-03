import CONSTANTS from '../../common/modules/Constants'

class UsersService {
  constructor ($http) {
    'ngInject'
    this.$http = $http
    this.users = []
    this.fetchUsers(true)
  }
  fetchUsers () {
    this.users = []
    var url = CONSTANTS.URL_BASE + '/users'
    this.promise1 = this.$http.get(url, {})
      .then(({data}) => {
        this.users = data
      },
      () => console.log('Error while fetching all users')
    )
    this.promise2 = this.$http.get('/currentUser', {})
    .then(({data}) => { this.currentUser = data })
  }
  getCurrentUser () {
    return this.currentUser
  }
  getUsers () {
    return this.users
  }
  getUserById (userId) {
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i]._id === userId) {
        return this.users[i]
      }
    }
    return null
  }
  getUserNameById (id) {
    const b = this.getUserById(id)
    return b ? b.name : 'Unknown User'
  }
  updateUsers () {
    this.fetchUsers()
  }
}
export default UsersService
