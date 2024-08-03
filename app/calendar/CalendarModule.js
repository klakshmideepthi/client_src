var app = angular.module('infore.calendar', [])

app.controller('calendarDemo', function ($scope) {
  $scope.day = moment()
})

app.directive('calendar', function () {
  return {
    restrict: 'E',
    template: require('./calendar.html'),
    scope: {
      selected: '=',
      hasEvents: '&',
      dateSelected: '&'
    },
    controller: ['$scope', function ($scope) {
      console.log('sfsfdsdfsfd')
      $scope.day = moment()
    }],
    link: function (scope) {
      scope.selected = _removeTime(scope.selected || moment())
      scope.current = scope.selected.clone()

      var start = scope.selected.clone()
      start.date(1)
      _removeTime(start.day(0))

      _buildMonth(scope, start, scope.current)

      scope.select = function (day) {
        scope.selected = day.date
        scope.dateSelected({day: day})
      }

      scope.next = function () {
        var next = scope.current.clone()
        next = _removeTime(next.add(1, 'month').date(1))
        scope.current = next
        _buildMonth(scope, next, scope.current)
      }

      scope.previous = function () {
        var previous = scope.current.clone()
        previous = _removeTime(previous.subtract(1, 'month').date(1))
        scope.current = previous
        _buildMonth(scope, previous, scope.current)
      }
    }
  }

  function _removeTime (date) {
    return date.hour(0).minute(0).second(0).millisecond(0)
  }

  function _buildMonth (scope, start, month) {
    scope.weeks = []
    var done = false
    var d = start.clone().day(0)
    while (!done) {
      const w = {days: _buildWeek(d.clone(), month)}
        // Corner case where month end falls on a sat.
      if (!w.days[0].isCurrentMonth && !w.days[w.days.length - 1].isCurrentMonth) {
          // Whole week is not current month. dont add this week
        done = true
        break
      }
      scope.weeks.push(w)
      if (!w.days[w.days.length - 1].isCurrentMonth) {
        done = true
        break
      }
      d = d.add(7, 'day')
    }
  }

  function _buildWeek (date, month) {
    var days = []
    for (var i = 0; i < 7; i++) {
      days.push({
        name: date.format('dd').substring(0, 1),
        number: date.date(),
        isCurrentMonth: date.month() === month.month(),
        isToday: date.isSame(new Date(), 'day'),
        date: date
      })
      date = date.clone()
      date.add(1, 'd')
    }
    return days
  }
})
