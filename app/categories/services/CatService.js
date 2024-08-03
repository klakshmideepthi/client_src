import CONSTANTS from '../../common/modules/Constants'

class CatService {
  constructor ($http) {
    'ngInject'
    this.$http = $http
    this.cats = []
    this.updatedCats = {}
    this.fetchCategories()
  }
  fetchCategories () {
    this.cats = []
    var url = CONSTANTS.URL_BASE + '/categories'
    this.promise = this.$http.get(url, {})
      .then(({data}) => {
        this.cats = data
        angular.forEach(this.cats, (cat, idx) => {
          cat._index = idx
          cat.dep_method = depTypes.straight_line.key
          cat.salvage_value = 5
          cat.lifespan = 10
          angular.forEach(catOverrides, (ov) => {
            if (ov.name === cat.name) {
              cat.dep_method = ov.dep_method
              cat.salvage_value = ov.salvage_value
              cat.lifespan = ov.lifespan
            }
          })
          const updatedCat = this.updatedCats[cat._id]
          if (updatedCat) {
            cat.dep_method = updatedCat.dep_method
            cat.salvage_value = updatedCat.salvage_value
            cat.lifespan = updatedCat.lifespan
          }
        })
      },
      () => console.log('Error while fetching all categories')
    )
  }
  catUpdated (cat) {
    console.log('Updating category: ', cat)
    this.updatedCats[cat._id] = cat
  }
  getDepMethod (key) {
    if (!key) {
      return undefined
    }
    return depTypes[key]
  }
  getDepMethodLabel (key) {
    const m = this.getDepMethod(key)
    if (!m) {
      return undefined
    }
    return m.label
  }
  findMatchingDepMethods (searchTxt) {
    const out = []
    angular.forEach(depTypes, (dep) => {
      if (!searchTxt) {
        out.push(dep)
      } else {
        if (dep.label.toLowerCase().indexOf(searchTxt.toLowerCase()) >= 0) {
          out.push(dep)
        }
      }
    })
    return out
  }
  calculateDepreciation ({purchaseDate, cost}, {dep_method, salvage_value, lifespan}) {
    if (!dep_method || dep_method === 'none') {
      return undefined
    }
    if (!purchaseDate) {
      return undefined
    }
    const curYear = moment().year()
    const purYear = moment(purchaseDate).year()
    const sal = (cost * salvage_value) / 100.0
    const dep = {chart: {labels: [], data: [[], []], series: ['Book Value', 'Depreciation']}}
    if (dep_method === 'double') {
      var depreciation = 0
      var bookValue = cost
      const deprate = 2 * (100.0 / lifespan)
      for (var i = 0; i < Math.min(lifespan, 30); i++) {
        const year = purYear + i
        depreciation = (bookValue * deprate) / 100.0
        bookValue = bookValue - depreciation
        if (bookValue < sal) {
          break
        }
        if (year === curYear) {
          dep.curBookValue = bookValue
          dep.curDepreciation = depreciation
        }
        dep.chart.labels.push(year)
        dep.chart.data[0].push(bookValue)
        dep.chart.data[1].push(depreciation)
      }
    } else {
    // if (dep_method === 'straight_line') {
      const depCost = cost - sal
      for (var i = 0; i < Math.min(lifespan, 30); i++) {
        const year = purYear + i
        const depreciation = (depCost * i) / lifespan
        const bookValue = cost - depreciation
        if (year === curYear) {
          dep.curBookValue = bookValue
          dep.curDepreciation = depreciation
        }
        dep.chart.labels.push(year)
        dep.chart.data[0].push(bookValue)
        dep.chart.data[1].push(depreciation)
      }
    // }
    }
    console.log('Dep: ', dep)
    return dep
  }
  getCategories () {
    return this.cats
  }
  getCategoryById (catId) {
    for (var i = 0; i < this.cats.length; i++) {
      if (this.cats[i]._id === catId) {
        return this.cats[i]
      }
    }
    return null
  }
  getCategoryNameById (catId) {
    const b = this.getCategoryById(catId)
    return b ? b.name : 'Unknown Category'
  }
  updateCategories () {
    this.fetchCategories()
  }
}
export default CatService
const depTypes = {
  none: {key: 'none', label: 'No Depreciation'},
  straight_line: {key: 'straight_line', label: 'Straight Line'},
  double: {key: 'double', label: 'Double Declining'},
  sum_of_years: {key: 'sum_of_years', label: 'Sum Of Years'}
}
const catOverrides = [
  {
    'name': 'Electronics',
    'dep_method': 'straight_line',
    'salvage_value': 9,
    'lifespan': 10
  },
  {
    'name': 'Others',
    'dep_method': 'sum_of_years',
    'salvage_value': 6,
    'lifespan': 20
  },
  {
    'name': 'Furniture',
    'dep_method': 'double',
    'salvage_value': 5,
    'lifespan': 8
  },
  {
    'name': 'Stationery',
    'dep_method': 'none'
  }
]
