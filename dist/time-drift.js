(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeDrift = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function timeDrift(time, separator) {
  var timeFormat = /^\d\d.\d\d(.\d\d)?$/; // Check that the time format is correct

  if (!timeFormat.test(time)) {
    throw new Error("Time format is incorrect. It should be either 'HH:MM:SS' or 'HH:MM', \
where the colon can be replaced by a non-numerical character");
  }

  var timeComponents = time.split(/[.:\- ]/).map(function (component) {
    return Number(component);
  });

  var _timeComponents = _slicedToArray(timeComponents, 3),
      hours = _timeComponents[0],
      minutes = _timeComponents[1],
      seconds = _timeComponents[2]; // check hours are within valid range


  if (hours > 23 || hours < 0) {
    throw new Error('Hours must be between 0 and 23');
  } // check minutes are within valid range


  if (minutes > 59 || minutes < 0) {
    throw new Error('Minutes must be between 0 and 59');
  } // check seconds are within valid range


  if (seconds != null && (seconds > 59 || seconds < 0)) {
    throw new Error('Seconds must be between 0 and 59');
  } // check separator is single non-numerical character


  if (separator && (typeof separator !== 'string' || separator.length > 1)) {
    throw new Error('Separator must be a single, non-numerical character');
  } // check that the first argument to the add and subtract methods is a number


  function validateNum(num, method) {
    if (typeof num !== 'number') {
      throw new Error("First argument of ".concat(method, " method must be a number"));
    }
  }

  function validateUnit(unit, method) {
    // check that the unit is a string
    if (typeof unit !== 'string') {
      throw new Error("Second argument of ".concat(method, " method must be a string representing the unit of time"));
    } // just grab the first letter of the unit and lowercase it. This is enough to distinguish between
    // units


    var unitChar = unit.charAt(0).toLowerCase(); // check the time unit used begins with the first character of the words 'hours', 'minutes', or 'seconds'

    if (!['h', 'm', 's'].includes(unitChar)) {
      throw new Error("Second argument of ".concat(method, " method must be hours, minutes or seconds"));
    } // ensure that no calculations involving seconds can be performed if no seconds were stated in the
    // original time to be changed


    if (unitChar === 's' && seconds == null) {
      throw new Error("You can't adjust seconds if they weren't included in the original time given");
    }

    return unitChar;
  }

  var response = {
    normalize: function normalize(returnArray) {
      // if no seconds were included, we need to remove the last element of the array
      // which will be undefined
      if (seconds == null) {
        returnArray.pop();
      } // For each part of the time, ensure that if it is less
      // than 10, that it has a preceding 0


      return returnArray.map(function (part) {
        part = String(part);
        return part.length < 2 ? '0' + part : part;
      }).join(separator || ':');
    },
    hasCrossedMidnight: false,
    // This is a self-referencing method
    add: function add(num, unit) {
      validateNum(num, 'add');
      this.hasCrossedMidnight = false;
      var unitFirstChar = validateUnit(unit, 'add');

      switch (unitFirstChar) {
        case 'h':
          this.hasCrossedMidnight = Boolean(Math.floor((hours + num) / 24));
          hours = (hours + num) % 24;
          break;

        case 'm':
          var hoursToAdd = Math.floor((minutes + num) / 60);
          minutes = (minutes + num) % 60;
          this.add(hoursToAdd, 'h');
          break;

        case 's':
          var minutesToAdd = Math.floor((seconds + num) / 60);
          seconds = (seconds + num) % 60;
          this.add(minutesToAdd, 'm');
          break;
      }

      return this;
    },
    // This is a self-referencing method
    subtract: function subtract(num, unit) {
      validateNum(num, 'subtract');
      this.hasCrossedMidnight = false;
      var unitFirstChar = validateUnit(unit, 'subtract');
      var count = 0;

      switch (unitFirstChar) {
        case 'h':
          var hourAnswer = hours - num;

          while (hourAnswer < 0) {
            count++;
            hourAnswer = 24 + hourAnswer;
          }

          hours = hourAnswer;

          if (count) {
            this.hasCrossedMidnight = true;
          }

          break;

        case 'm':
          var minuteAnswer = minutes - num;

          while (minuteAnswer < 0) {
            count++;
            minuteAnswer = 60 + minuteAnswer;
          }

          minutes = minuteAnswer;

          if (count) {
            this.subtract(count, 'h');
          }

          break;

        case 's':
          var secondAnswer = seconds - num;

          while (secondAnswer < 0) {
            count++;
            secondAnswer = 60 + secondAnswer;
          }

          seconds = secondAnswer;

          if (count) {
            this.subtract(count, 'm');
          }

          break;
      }

      return this;
    }
  };
  Object.defineProperty(response, 'val', {
    get: function get() {
      return this.normalize([hours, minutes, seconds]);
    }
  });
  response.add = response.add.bind(response);
  response.subtract = response.subtract.bind(response);
  return response;
}

module.exports = timeDrift;

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdGltZS1kcmlmdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7Ozs7O0FBRUEsU0FBUyxTQUFULENBQW9CLElBQXBCLEVBQTBCLFNBQTFCLEVBQXFDO0FBQ25DLE1BQU0sVUFBVSxHQUFHLHFCQUFuQixDQURtQyxDQUduQzs7QUFDQSxNQUFJLENBQUMsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBTCxFQUE0QjtBQUMxQixVQUFNLElBQUksS0FBSixDQUFVOzZEQUFWLENBQU47QUFFRDs7QUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLFNBQVgsRUFBc0IsR0FBdEIsQ0FBMEIsVUFBQSxTQUFTO0FBQUEsV0FBSSxNQUFNLENBQUMsU0FBRCxDQUFWO0FBQUEsR0FBbkMsQ0FBdkI7O0FBVG1DLHVDQVVILGNBVkc7QUFBQSxNQVU5QixLQVY4QjtBQUFBLE1BVXZCLE9BVnVCO0FBQUEsTUFVZCxPQVZjLHVCQVluQzs7O0FBQ0EsTUFBRyxLQUFLLEdBQUcsRUFBUixJQUFjLEtBQUssR0FBRyxDQUF6QixFQUEyQjtBQUN6QixVQUFNLElBQUksS0FBSixDQUFVLGdDQUFWLENBQU47QUFDRCxHQWZrQyxDQWlCbkM7OztBQUNBLE1BQUcsT0FBTyxHQUFHLEVBQVYsSUFBZ0IsT0FBTyxHQUFHLENBQTdCLEVBQStCO0FBQzdCLFVBQU0sSUFBSSxLQUFKLENBQVUsa0NBQVYsQ0FBTjtBQUNELEdBcEJrQyxDQXNCbkM7OztBQUNBLE1BQUcsT0FBTyxJQUFJLElBQVgsS0FBb0IsT0FBTyxHQUFHLEVBQVYsSUFBZ0IsT0FBTyxHQUFHLENBQTlDLENBQUgsRUFBb0Q7QUFDbEQsVUFBTSxJQUFJLEtBQUosQ0FBVSxrQ0FBVixDQUFOO0FBQ0QsR0F6QmtDLENBMkJuQzs7O0FBQ0EsTUFBRyxTQUFTLEtBQUssT0FBTyxTQUFQLEtBQXFCLFFBQXJCLElBQWlDLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXpELENBQVosRUFBeUU7QUFDdkUsVUFBTSxJQUFJLEtBQUosQ0FBVSxxREFBVixDQUFOO0FBQ0QsR0E5QmtDLENBZ0NuQzs7O0FBQ0EsV0FBUyxXQUFULENBQXNCLEdBQXRCLEVBQTJCLE1BQTNCLEVBQW1DO0FBQ2pDLFFBQUksT0FBTyxHQUFQLEtBQWUsUUFBbkIsRUFBNkI7QUFDM0IsWUFBTSxJQUFJLEtBQUosNkJBQStCLE1BQS9CLDhCQUFOO0FBQ0Q7QUFDRjs7QUFFRCxXQUFTLFlBQVQsQ0FBdUIsSUFBdkIsRUFBNkIsTUFBN0IsRUFBcUM7QUFDbkM7QUFDQSxRQUFJLE9BQU8sSUFBUCxLQUFnQixRQUFwQixFQUE4QjtBQUM1QixZQUFNLElBQUksS0FBSiw4QkFBZ0MsTUFBaEMsNERBQU47QUFDRCxLQUprQyxDQU1uQztBQUNBOzs7QUFDQSxRQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQVosRUFBZSxXQUFmLEVBQWYsQ0FSbUMsQ0FVbkM7O0FBQ0EsUUFBSSxDQUFDLENBQUMsR0FBRCxFQUFLLEdBQUwsRUFBUyxHQUFULEVBQWMsUUFBZCxDQUF1QixRQUF2QixDQUFMLEVBQXVDO0FBQ3JDLFlBQU0sSUFBSSxLQUFKLDhCQUFnQyxNQUFoQywrQ0FBTjtBQUNELEtBYmtDLENBZW5DO0FBQ0E7OztBQUNBLFFBQUksUUFBUSxLQUFLLEdBQWIsSUFBb0IsT0FBTyxJQUFJLElBQW5DLEVBQXlDO0FBQ3ZDLFlBQU0sSUFBSSxLQUFKLGdGQUFOO0FBQ0Q7O0FBRUQsV0FBTyxRQUFQO0FBQ0Q7O0FBRUQsTUFBTSxRQUFRLEdBQUc7QUFDZixJQUFBLFNBRGUscUJBQ0osV0FESSxFQUNTO0FBQ3RCO0FBQ0E7QUFDQSxVQUFJLE9BQU8sSUFBSSxJQUFmLEVBQXFCO0FBQ25CLFFBQUEsV0FBVyxDQUFDLEdBQVo7QUFDRCxPQUxxQixDQU90QjtBQUNBOzs7QUFDQSxhQUFPLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVMsSUFBVCxFQUFjO0FBQ25DLFFBQUEsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFELENBQWI7QUFDQSxlQUFPLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBZCxHQUFrQixNQUFNLElBQXhCLEdBQStCLElBQXRDO0FBQ0QsT0FITSxFQUdKLElBSEksQ0FHQyxTQUFTLElBQUksR0FIZCxDQUFQO0FBSUQsS0FkYztBQWdCZixJQUFBLGtCQUFrQixFQUFFLEtBaEJMO0FBa0JmO0FBQ0EsSUFBQSxHQW5CZSxlQW1CVixHQW5CVSxFQW1CTCxJQW5CSyxFQW1CQztBQUNkLE1BQUEsV0FBVyxDQUFDLEdBQUQsRUFBTSxLQUFOLENBQVg7QUFDQSxXQUFLLGtCQUFMLEdBQTBCLEtBQTFCO0FBQ0EsVUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUQsRUFBTyxLQUFQLENBQWxDOztBQUNBLGNBQU8sYUFBUDtBQUNBLGFBQUssR0FBTDtBQUNFLGVBQUssa0JBQUwsR0FBMEIsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxLQUFLLEdBQUcsR0FBVCxJQUFjLEVBQXpCLENBQUQsQ0FBakM7QUFDQSxVQUFBLEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFULElBQWdCLEVBQXhCO0FBQ0E7O0FBQ0YsYUFBSyxHQUFMO0FBQ0UsY0FBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLE9BQU8sR0FBRyxHQUFYLElBQWdCLEVBQTNCLENBQWpCO0FBQ0EsVUFBQSxPQUFPLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBWCxJQUFrQixFQUE1QjtBQUNBLGVBQUssR0FBTCxDQUFTLFVBQVQsRUFBcUIsR0FBckI7QUFDQTs7QUFDRixhQUFLLEdBQUw7QUFDRSxjQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsT0FBTyxHQUFHLEdBQVgsSUFBZ0IsRUFBM0IsQ0FBbkI7QUFDQSxVQUFBLE9BQU8sR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFYLElBQWtCLEVBQTVCO0FBQ0EsZUFBSyxHQUFMLENBQVMsWUFBVCxFQUF1QixHQUF2QjtBQUNBO0FBZEY7O0FBZ0JBLGFBQU8sSUFBUDtBQUNELEtBeENjO0FBMENmO0FBQ0EsSUFBQSxRQTNDZSxvQkEyQ0wsR0EzQ0ssRUEyQ0EsSUEzQ0EsRUEyQ007QUFDbkIsTUFBQSxXQUFXLENBQUMsR0FBRCxFQUFNLFVBQU4sQ0FBWDtBQUNBLFdBQUssa0JBQUwsR0FBMEIsS0FBMUI7QUFDQSxVQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsSUFBRCxFQUFPLFVBQVAsQ0FBbEM7QUFDQSxVQUFJLEtBQUssR0FBRyxDQUFaOztBQUNBLGNBQU8sYUFBUDtBQUNBLGFBQUssR0FBTDtBQUNFLGNBQUksVUFBVSxHQUFHLEtBQUssR0FBRyxHQUF6Qjs7QUFDQSxpQkFBTSxVQUFVLEdBQUcsQ0FBbkIsRUFBcUI7QUFDbkIsWUFBQSxLQUFLO0FBQ0wsWUFBQSxVQUFVLEdBQUcsS0FBSyxVQUFsQjtBQUNEOztBQUNELFVBQUEsS0FBSyxHQUFHLFVBQVI7O0FBQ0EsY0FBSSxLQUFKLEVBQVc7QUFDVCxpQkFBSyxrQkFBTCxHQUEwQixJQUExQjtBQUNEOztBQUNEOztBQUNGLGFBQUssR0FBTDtBQUNFLGNBQUksWUFBWSxHQUFHLE9BQU8sR0FBRyxHQUE3Qjs7QUFDQSxpQkFBTSxZQUFZLEdBQUcsQ0FBckIsRUFBdUI7QUFDckIsWUFBQSxLQUFLO0FBQ0wsWUFBQSxZQUFZLEdBQUcsS0FBSyxZQUFwQjtBQUNEOztBQUNELFVBQUEsT0FBTyxHQUFHLFlBQVY7O0FBQ0EsY0FBRyxLQUFILEVBQVM7QUFDUCxpQkFBSyxRQUFMLENBQWMsS0FBZCxFQUFxQixHQUFyQjtBQUNEOztBQUNEOztBQUNGLGFBQUssR0FBTDtBQUNFLGNBQUksWUFBWSxHQUFHLE9BQU8sR0FBRyxHQUE3Qjs7QUFDQSxpQkFBTSxZQUFZLEdBQUcsQ0FBckIsRUFBdUI7QUFDckIsWUFBQSxLQUFLO0FBQ0wsWUFBQSxZQUFZLEdBQUcsS0FBSyxZQUFwQjtBQUNEOztBQUNELFVBQUEsT0FBTyxHQUFHLFlBQVY7O0FBQ0EsY0FBRyxLQUFILEVBQVM7QUFDUCxpQkFBSyxRQUFMLENBQWMsS0FBZCxFQUFxQixHQUFyQjtBQUNEOztBQUNEO0FBakNGOztBQW1DQSxhQUFPLElBQVA7QUFDRDtBQXBGYyxHQUFqQjtBQXVGQSxFQUFBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLFFBQXRCLEVBQWdDLEtBQWhDLEVBQXVDO0FBQ3JDLElBQUEsR0FBRyxFQUFFLGVBQVk7QUFDZixhQUFPLEtBQUssU0FBTCxDQUFlLENBQUMsS0FBRCxFQUFRLE9BQVIsRUFBaUIsT0FBakIsQ0FBZixDQUFQO0FBQ0Q7QUFIb0MsR0FBdkM7QUFNQSxFQUFBLFFBQVEsQ0FBQyxHQUFULEdBQWUsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFiLENBQWtCLFFBQWxCLENBQWY7QUFDQSxFQUFBLFFBQVEsQ0FBQyxRQUFULEdBQW9CLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQWxCLENBQXVCLFFBQXZCLENBQXBCO0FBRUEsU0FBTyxRQUFQO0FBQ0Q7O0FBRUQsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIlxuXG5mdW5jdGlvbiB0aW1lRHJpZnQgKHRpbWUsIHNlcGFyYXRvcikge1xuICBjb25zdCB0aW1lRm9ybWF0ID0gL15cXGRcXGQuXFxkXFxkKC5cXGRcXGQpPyQvXG5cbiAgLy8gQ2hlY2sgdGhhdCB0aGUgdGltZSBmb3JtYXQgaXMgY29ycmVjdFxuICBpZiAoIXRpbWVGb3JtYXQudGVzdCh0aW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRpbWUgZm9ybWF0IGlzIGluY29ycmVjdC4gSXQgc2hvdWxkIGJlIGVpdGhlciAnSEg6TU06U1MnIG9yICdISDpNTScsIFxcXG53aGVyZSB0aGUgY29sb24gY2FuIGJlIHJlcGxhY2VkIGJ5IGEgbm9uLW51bWVyaWNhbCBjaGFyYWN0ZXJcIilcbiAgfVxuXG4gIGNvbnN0IHRpbWVDb21wb25lbnRzID0gdGltZS5zcGxpdCgvWy46XFwtIF0vKS5tYXAoY29tcG9uZW50ID0+IE51bWJlcihjb21wb25lbnQpKVxuICBsZXQgW2hvdXJzLCBtaW51dGVzLCBzZWNvbmRzXSA9IHRpbWVDb21wb25lbnRzXG5cbiAgLy8gY2hlY2sgaG91cnMgYXJlIHdpdGhpbiB2YWxpZCByYW5nZVxuICBpZihob3VycyA+IDIzIHx8IGhvdXJzIDwgMCl7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdIb3VycyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMjMnKVxuICB9XG5cbiAgLy8gY2hlY2sgbWludXRlcyBhcmUgd2l0aGluIHZhbGlkIHJhbmdlXG4gIGlmKG1pbnV0ZXMgPiA1OSB8fCBtaW51dGVzIDwgMCl7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNaW51dGVzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA1OScpXG4gIH1cblxuICAvLyBjaGVjayBzZWNvbmRzIGFyZSB3aXRoaW4gdmFsaWQgcmFuZ2VcbiAgaWYoc2Vjb25kcyAhPSBudWxsICYmIChzZWNvbmRzID4gNTkgfHwgc2Vjb25kcyA8IDApKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY29uZHMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDU5JylcbiAgfVxuXG4gIC8vIGNoZWNrIHNlcGFyYXRvciBpcyBzaW5nbGUgbm9uLW51bWVyaWNhbCBjaGFyYWN0ZXJcbiAgaWYoc2VwYXJhdG9yICYmICh0eXBlb2Ygc2VwYXJhdG9yICE9PSAnc3RyaW5nJyB8fCBzZXBhcmF0b3IubGVuZ3RoID4gMSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcGFyYXRvciBtdXN0IGJlIGEgc2luZ2xlLCBub24tbnVtZXJpY2FsIGNoYXJhY3RlcicpXG4gIH1cblxuICAvLyBjaGVjayB0aGF0IHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgYWRkIGFuZCBzdWJ0cmFjdCBtZXRob2RzIGlzIGEgbnVtYmVyXG4gIGZ1bmN0aW9uIHZhbGlkYXRlTnVtIChudW0sIG1ldGhvZCkge1xuICAgIGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBhcmd1bWVudCBvZiAke21ldGhvZH0gbWV0aG9kIG11c3QgYmUgYSBudW1iZXJgKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlVW5pdCAodW5pdCwgbWV0aG9kKSB7XG4gICAgLy8gY2hlY2sgdGhhdCB0aGUgdW5pdCBpcyBhIHN0cmluZ1xuICAgIGlmICh0eXBlb2YgdW5pdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IG9mICR7bWV0aG9kfSBtZXRob2QgbXVzdCBiZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHVuaXQgb2YgdGltZWApXG4gICAgfVxuXG4gICAgLy8ganVzdCBncmFiIHRoZSBmaXJzdCBsZXR0ZXIgb2YgdGhlIHVuaXQgYW5kIGxvd2VyY2FzZSBpdC4gVGhpcyBpcyBlbm91Z2ggdG8gZGlzdGluZ3Vpc2ggYmV0d2VlblxuICAgIC8vIHVuaXRzXG4gICAgbGV0IHVuaXRDaGFyID0gdW5pdC5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKVxuXG4gICAgLy8gY2hlY2sgdGhlIHRpbWUgdW5pdCB1c2VkIGJlZ2lucyB3aXRoIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHdvcmRzICdob3VycycsICdtaW51dGVzJywgb3IgJ3NlY29uZHMnXG4gICAgaWYgKCFbJ2gnLCdtJywncyddLmluY2x1ZGVzKHVuaXRDaGFyKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZWNvbmQgYXJndW1lbnQgb2YgJHttZXRob2R9IG1ldGhvZCBtdXN0IGJlIGhvdXJzLCBtaW51dGVzIG9yIHNlY29uZHNgKVxuICAgIH1cblxuICAgIC8vIGVuc3VyZSB0aGF0IG5vIGNhbGN1bGF0aW9ucyBpbnZvbHZpbmcgc2Vjb25kcyBjYW4gYmUgcGVyZm9ybWVkIGlmIG5vIHNlY29uZHMgd2VyZSBzdGF0ZWQgaW4gdGhlXG4gICAgLy8gb3JpZ2luYWwgdGltZSB0byBiZSBjaGFuZ2VkXG4gICAgaWYgKHVuaXRDaGFyID09PSAncycgJiYgc2Vjb25kcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFlvdSBjYW4ndCBhZGp1c3Qgc2Vjb25kcyBpZiB0aGV5IHdlcmVuJ3QgaW5jbHVkZWQgaW4gdGhlIG9yaWdpbmFsIHRpbWUgZ2l2ZW5gKVxuICAgIH1cblxuICAgIHJldHVybiB1bml0Q2hhclxuICB9XG5cbiAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgbm9ybWFsaXplIChyZXR1cm5BcnJheSkge1xuICAgICAgLy8gaWYgbm8gc2Vjb25kcyB3ZXJlIGluY2x1ZGVkLCB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBhcnJheVxuICAgICAgLy8gd2hpY2ggd2lsbCBiZSB1bmRlZmluZWRcbiAgICAgIGlmIChzZWNvbmRzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuQXJyYXkucG9wKClcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIGVhY2ggcGFydCBvZiB0aGUgdGltZSwgZW5zdXJlIHRoYXQgaWYgaXQgaXMgbGVzc1xuICAgICAgLy8gdGhhbiAxMCwgdGhhdCBpdCBoYXMgYSBwcmVjZWRpbmcgMFxuICAgICAgcmV0dXJuIHJldHVybkFycmF5Lm1hcChmdW5jdGlvbihwYXJ0KXtcbiAgICAgICAgcGFydCA9IFN0cmluZyhwYXJ0KVxuICAgICAgICByZXR1cm4gcGFydC5sZW5ndGggPCAyID8gJzAnICsgcGFydCA6IHBhcnRcbiAgICAgIH0pLmpvaW4oc2VwYXJhdG9yIHx8ICc6JylcbiAgICB9LFxuXG4gICAgaGFzQ3Jvc3NlZE1pZG5pZ2h0OiBmYWxzZSxcblxuICAgIC8vIFRoaXMgaXMgYSBzZWxmLXJlZmVyZW5jaW5nIG1ldGhvZFxuICAgIGFkZCAobnVtLCB1bml0KSB7XG4gICAgICB2YWxpZGF0ZU51bShudW0sICdhZGQnKVxuICAgICAgdGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQgPSBmYWxzZVxuICAgICAgY29uc3QgdW5pdEZpcnN0Q2hhciA9IHZhbGlkYXRlVW5pdCh1bml0LCAnYWRkJylcbiAgICAgIHN3aXRjaCh1bml0Rmlyc3RDaGFyKXtcbiAgICAgIGNhc2UgJ2gnOlxuICAgICAgICB0aGlzLmhhc0Nyb3NzZWRNaWRuaWdodCA9IEJvb2xlYW4oTWF0aC5mbG9vcigoaG91cnMgKyBudW0pLzI0KSlcbiAgICAgICAgaG91cnMgPSAoaG91cnMgKyBudW0pICUgMjRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ20nOlxuICAgICAgICBsZXQgaG91cnNUb0FkZCA9IE1hdGguZmxvb3IoKG1pbnV0ZXMgKyBudW0pLzYwKVxuICAgICAgICBtaW51dGVzID0gKG1pbnV0ZXMgKyBudW0pICUgNjBcbiAgICAgICAgdGhpcy5hZGQoaG91cnNUb0FkZCwgJ2gnKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncyc6XG4gICAgICAgIGxldCBtaW51dGVzVG9BZGQgPSBNYXRoLmZsb29yKChzZWNvbmRzICsgbnVtKS82MClcbiAgICAgICAgc2Vjb25kcyA9IChzZWNvbmRzICsgbnVtKSAlIDYwXG4gICAgICAgIHRoaXMuYWRkKG1pbnV0ZXNUb0FkZCwgJ20nKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBpcyBhIHNlbGYtcmVmZXJlbmNpbmcgbWV0aG9kXG4gICAgc3VidHJhY3QgKG51bSwgdW5pdCkge1xuICAgICAgdmFsaWRhdGVOdW0obnVtLCAnc3VidHJhY3QnKVxuICAgICAgdGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQgPSBmYWxzZVxuICAgICAgY29uc3QgdW5pdEZpcnN0Q2hhciA9IHZhbGlkYXRlVW5pdCh1bml0LCAnc3VidHJhY3QnKVxuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIHN3aXRjaCh1bml0Rmlyc3RDaGFyKXtcbiAgICAgIGNhc2UgJ2gnOlxuICAgICAgICBsZXQgaG91ckFuc3dlciA9IGhvdXJzIC0gbnVtXG4gICAgICAgIHdoaWxlKGhvdXJBbnN3ZXIgPCAwKXtcbiAgICAgICAgICBjb3VudCArK1xuICAgICAgICAgIGhvdXJBbnN3ZXIgPSAyNCArIGhvdXJBbnN3ZXJcbiAgICAgICAgfVxuICAgICAgICBob3VycyA9IGhvdXJBbnN3ZXJcbiAgICAgICAgaWYgKGNvdW50KSB7XG4gICAgICAgICAgdGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ20nOlxuICAgICAgICBsZXQgbWludXRlQW5zd2VyID0gbWludXRlcyAtIG51bVxuICAgICAgICB3aGlsZShtaW51dGVBbnN3ZXIgPCAwKXtcbiAgICAgICAgICBjb3VudCArK1xuICAgICAgICAgIG1pbnV0ZUFuc3dlciA9IDYwICsgbWludXRlQW5zd2VyXG4gICAgICAgIH1cbiAgICAgICAgbWludXRlcyA9IG1pbnV0ZUFuc3dlclxuICAgICAgICBpZihjb3VudCl7XG4gICAgICAgICAgdGhpcy5zdWJ0cmFjdChjb3VudCwgJ2gnKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzJzpcbiAgICAgICAgbGV0IHNlY29uZEFuc3dlciA9IHNlY29uZHMgLSBudW1cbiAgICAgICAgd2hpbGUoc2Vjb25kQW5zd2VyIDwgMCl7XG4gICAgICAgICAgY291bnQgKytcbiAgICAgICAgICBzZWNvbmRBbnN3ZXIgPSA2MCArIHNlY29uZEFuc3dlclxuICAgICAgICB9XG4gICAgICAgIHNlY29uZHMgPSBzZWNvbmRBbnN3ZXJcbiAgICAgICAgaWYoY291bnQpe1xuICAgICAgICAgIHRoaXMuc3VidHJhY3QoY291bnQsICdtJylcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVzcG9uc2UsICd2YWwnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoW2hvdXJzLCBtaW51dGVzLCBzZWNvbmRzXSlcbiAgICB9XG4gIH0pXG5cbiAgcmVzcG9uc2UuYWRkID0gcmVzcG9uc2UuYWRkLmJpbmQocmVzcG9uc2UpXG4gIHJlc3BvbnNlLnN1YnRyYWN0ID0gcmVzcG9uc2Uuc3VidHJhY3QuYmluZChyZXNwb25zZSlcblxuICByZXR1cm4gcmVzcG9uc2Vcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aW1lRHJpZnQiXX0=
