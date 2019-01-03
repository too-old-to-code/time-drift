(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeDrift = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict"

function timeDrift (time, separator) {
  const timeFormat = /^\d\d.\d\d(.\d\d)?$/

  // Check that the time format is correct
  if (!timeFormat.test(time)) {
    throw new Error("Time format is incorrect. It should be either 'HH:MM:SS' or 'HH:MM', \
where the colon can be replaced by a non-numerical character")
  }

  const timeComponents = time.split(/[.:\- ]/).map(component => Number(component))
  let [hours, minutes, seconds] = timeComponents

  // check hours are within valid range
  if(hours > 23 || hours < 0){
    throw new Error('Hours must be between 0 and 23')
  }

  // check minutes are within valid range
  if(minutes > 59 || minutes < 0){
    throw new Error('Minutes must be between 0 and 59')
  }

  // check seconds are within valid range
  if(seconds != null && (seconds > 59 || seconds < 0)){
    throw new Error('Seconds must be between 0 and 59')
  }

  // check separator is single non-numerical character
  if(separator && (typeof separator !== 'string' || separator.length > 1)) {
    throw new Error('Separator must be a single, non-numerical character')
  }

  // check that the first argument to the add and subtract methods is a number
  function validateNum (num, method) {
    if (typeof num !== 'number') {
      throw new Error(`First argument of ${method} method must be a number`)
    }
  }

  function validateUnit (unit, method) {
    // check that the unit is a string
    if (typeof unit !== 'string') {
      throw new Error(`Second argument of ${method} method must be a string representing the unit of time`)
    }

    // just grab the first letter of the unit and lowercase it. This is enough to distinguish between
    // units
    let unitChar = unit.charAt(0).toLowerCase()

    // check the time unit used begins with the first character of the words 'hours', 'minutes', or 'seconds'
    if (!['h','m','s'].includes(unitChar)) {
      throw new Error(`Second argument of ${method} method must be hours, minutes or seconds`)
    }

    // ensure that no calculations involving seconds can be performed if no seconds were stated in the
    // original time to be changed
    if (unitChar === 's' && seconds == null) {
      throw new Error(`You can't adjust seconds if they weren't included in the original time given`)
    }

    return unitChar
  }

  const response = {
    normalize (returnArray) {
      // if no seconds were included, we need to remove the last element of the array
      // which will be undefined
      if (seconds == null) {
        returnArray.pop()
      }

      // For each part of the time, ensure that if it is less
      // than 10, that it has a preceding 0
      return returnArray.map(function(part){
        part = String(part)
        return part.length < 2 ? '0' + part : part
      }).join(separator || ':')
    },

    hasCrossedMidnight: false,

    // This is a self-referencing method
    add (num, unit) {
      validateNum(num, 'add')
      const unitFirstChar = validateUnit(unit, 'add')
      switch(unitFirstChar){
      case 'h':
        this.hasCrossedMidnight = Boolean(Math.floor((hours + num)/24))
        hours = (hours + num) % 24
        break
      case 'm':
        let hoursToAdd = Math.floor((minutes + num)/60)
        minutes = (minutes + num) % 60
        this.add(hoursToAdd, 'h')
        break
      case 's':
        let minutesToAdd = Math.floor((seconds + num)/60)
        seconds = (seconds + num) % 60
        this.add(minutesToAdd, 'm')
        break
      }
      return this
    },

    // This is a self-referencing method
    subtract (num, unit) {
      validateNum(num, 'subtract')
      const unitFirstChar = validateUnit(unit, 'subtract')
      let count = 0;
      switch(unitFirstChar){
      case 'h':
        let hourAnswer = hours - num
        while(hourAnswer < 0){
          count ++
          hourAnswer = 24 + hourAnswer
        }
        hours = hourAnswer
        if (count) {
          this.hasCrossedMidnight = true
        }
        break
      case 'm':
        let minuteAnswer = minutes - num
        while(minuteAnswer < 0){
          count ++
          minuteAnswer = 60 + minuteAnswer
        }
        minutes = minuteAnswer
        if(count){
          this.subtract(count, 'h')
        }
        break
      case 's':
        let secondAnswer = seconds - num
        while(secondAnswer < 0){
          count ++
          secondAnswer = 60 + secondAnswer
        }
        seconds = secondAnswer
        if(count){
          this.subtract(count, 'm')
        }
        break
      }
      return this
    }
  }

  Object.defineProperty(response, 'val', {
    get: function () {
      return this.normalize([hours, minutes, seconds])
    }
  })

  response.add = response.add.bind(response)
  response.subtract = response.subtract.bind(response)

  return response
}

module.exports = timeDrift
},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdGltZS1kcmlmdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXCJ1c2Ugc3RyaWN0XCJcblxuZnVuY3Rpb24gdGltZURyaWZ0ICh0aW1lLCBzZXBhcmF0b3IpIHtcbiAgY29uc3QgdGltZUZvcm1hdCA9IC9eXFxkXFxkLlxcZFxcZCguXFxkXFxkKT8kL1xuXG4gIC8vIENoZWNrIHRoYXQgdGhlIHRpbWUgZm9ybWF0IGlzIGNvcnJlY3RcbiAgaWYgKCF0aW1lRm9ybWF0LnRlc3QodGltZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaW1lIGZvcm1hdCBpcyBpbmNvcnJlY3QuIEl0IHNob3VsZCBiZSBlaXRoZXIgJ0hIOk1NOlNTJyBvciAnSEg6TU0nLCBcXFxud2hlcmUgdGhlIGNvbG9uIGNhbiBiZSByZXBsYWNlZCBieSBhIG5vbi1udW1lcmljYWwgY2hhcmFjdGVyXCIpXG4gIH1cblxuICBjb25zdCB0aW1lQ29tcG9uZW50cyA9IHRpbWUuc3BsaXQoL1suOlxcLSBdLykubWFwKGNvbXBvbmVudCA9PiBOdW1iZXIoY29tcG9uZW50KSlcbiAgbGV0IFtob3VycywgbWludXRlcywgc2Vjb25kc10gPSB0aW1lQ29tcG9uZW50c1xuXG4gIC8vIGNoZWNrIGhvdXJzIGFyZSB3aXRoaW4gdmFsaWQgcmFuZ2VcbiAgaWYoaG91cnMgPiAyMyB8fCBob3VycyA8IDApe1xuICAgIHRocm93IG5ldyBFcnJvcignSG91cnMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDIzJylcbiAgfVxuXG4gIC8vIGNoZWNrIG1pbnV0ZXMgYXJlIHdpdGhpbiB2YWxpZCByYW5nZVxuICBpZihtaW51dGVzID4gNTkgfHwgbWludXRlcyA8IDApe1xuICAgIHRocm93IG5ldyBFcnJvcignTWludXRlcyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgNTknKVxuICB9XG5cbiAgLy8gY2hlY2sgc2Vjb25kcyBhcmUgd2l0aGluIHZhbGlkIHJhbmdlXG4gIGlmKHNlY29uZHMgIT0gbnVsbCAmJiAoc2Vjb25kcyA+IDU5IHx8IHNlY29uZHMgPCAwKSl7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZWNvbmRzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA1OScpXG4gIH1cblxuICAvLyBjaGVjayBzZXBhcmF0b3IgaXMgc2luZ2xlIG5vbi1udW1lcmljYWwgY2hhcmFjdGVyXG4gIGlmKHNlcGFyYXRvciAmJiAodHlwZW9mIHNlcGFyYXRvciAhPT0gJ3N0cmluZycgfHwgc2VwYXJhdG9yLmxlbmd0aCA+IDEpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZXBhcmF0b3IgbXVzdCBiZSBhIHNpbmdsZSwgbm9uLW51bWVyaWNhbCBjaGFyYWN0ZXInKVxuICB9XG5cbiAgLy8gY2hlY2sgdGhhdCB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIGFkZCBhbmQgc3VidHJhY3QgbWV0aG9kcyBpcyBhIG51bWJlclxuICBmdW5jdGlvbiB2YWxpZGF0ZU51bSAobnVtLCBtZXRob2QpIHtcbiAgICBpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmlyc3QgYXJndW1lbnQgb2YgJHttZXRob2R9IG1ldGhvZCBtdXN0IGJlIGEgbnVtYmVyYClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZVVuaXQgKHVuaXQsIG1ldGhvZCkge1xuICAgIC8vIGNoZWNrIHRoYXQgdGhlIHVuaXQgaXMgYSBzdHJpbmdcbiAgICBpZiAodHlwZW9mIHVuaXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlY29uZCBhcmd1bWVudCBvZiAke21ldGhvZH0gbWV0aG9kIG11c3QgYmUgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB1bml0IG9mIHRpbWVgKVxuICAgIH1cblxuICAgIC8vIGp1c3QgZ3JhYiB0aGUgZmlyc3QgbGV0dGVyIG9mIHRoZSB1bml0IGFuZCBsb3dlcmNhc2UgaXQuIFRoaXMgaXMgZW5vdWdoIHRvIGRpc3Rpbmd1aXNoIGJldHdlZW5cbiAgICAvLyB1bml0c1xuICAgIGxldCB1bml0Q2hhciA9IHVuaXQuY2hhckF0KDApLnRvTG93ZXJDYXNlKClcblxuICAgIC8vIGNoZWNrIHRoZSB0aW1lIHVuaXQgdXNlZCBiZWdpbnMgd2l0aCB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSB3b3JkcyAnaG91cnMnLCAnbWludXRlcycsIG9yICdzZWNvbmRzJ1xuICAgIGlmICghWydoJywnbScsJ3MnXS5pbmNsdWRlcyh1bml0Q2hhcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IG9mICR7bWV0aG9kfSBtZXRob2QgbXVzdCBiZSBob3VycywgbWludXRlcyBvciBzZWNvbmRzYClcbiAgICB9XG5cbiAgICAvLyBlbnN1cmUgdGhhdCBubyBjYWxjdWxhdGlvbnMgaW52b2x2aW5nIHNlY29uZHMgY2FuIGJlIHBlcmZvcm1lZCBpZiBubyBzZWNvbmRzIHdlcmUgc3RhdGVkIGluIHRoZVxuICAgIC8vIG9yaWdpbmFsIHRpbWUgdG8gYmUgY2hhbmdlZFxuICAgIGlmICh1bml0Q2hhciA9PT0gJ3MnICYmIHNlY29uZHMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBZb3UgY2FuJ3QgYWRqdXN0IHNlY29uZHMgaWYgdGhleSB3ZXJlbid0IGluY2x1ZGVkIGluIHRoZSBvcmlnaW5hbCB0aW1lIGdpdmVuYClcbiAgICB9XG5cbiAgICByZXR1cm4gdW5pdENoYXJcbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgIG5vcm1hbGl6ZSAocmV0dXJuQXJyYXkpIHtcbiAgICAgIC8vIGlmIG5vIHNlY29uZHMgd2VyZSBpbmNsdWRlZCwgd2UgbmVlZCB0byByZW1vdmUgdGhlIGxhc3QgZWxlbWVudCBvZiB0aGUgYXJyYXlcbiAgICAgIC8vIHdoaWNoIHdpbGwgYmUgdW5kZWZpbmVkXG4gICAgICBpZiAoc2Vjb25kcyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybkFycmF5LnBvcCgpXG4gICAgICB9XG5cbiAgICAgIC8vIEZvciBlYWNoIHBhcnQgb2YgdGhlIHRpbWUsIGVuc3VyZSB0aGF0IGlmIGl0IGlzIGxlc3NcbiAgICAgIC8vIHRoYW4gMTAsIHRoYXQgaXQgaGFzIGEgcHJlY2VkaW5nIDBcbiAgICAgIHJldHVybiByZXR1cm5BcnJheS5tYXAoZnVuY3Rpb24ocGFydCl7XG4gICAgICAgIHBhcnQgPSBTdHJpbmcocGFydClcbiAgICAgICAgcmV0dXJuIHBhcnQubGVuZ3RoIDwgMiA/ICcwJyArIHBhcnQgOiBwYXJ0XG4gICAgICB9KS5qb2luKHNlcGFyYXRvciB8fCAnOicpXG4gICAgfSxcblxuICAgIGhhc0Nyb3NzZWRNaWRuaWdodDogZmFsc2UsXG5cbiAgICAvLyBUaGlzIGlzIGEgc2VsZi1yZWZlcmVuY2luZyBtZXRob2RcbiAgICBhZGQgKG51bSwgdW5pdCkge1xuICAgICAgdmFsaWRhdGVOdW0obnVtLCAnYWRkJylcbiAgICAgIGNvbnN0IHVuaXRGaXJzdENoYXIgPSB2YWxpZGF0ZVVuaXQodW5pdCwgJ2FkZCcpXG4gICAgICBzd2l0Y2godW5pdEZpcnN0Q2hhcil7XG4gICAgICBjYXNlICdoJzpcbiAgICAgICAgdGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQgPSBCb29sZWFuKE1hdGguZmxvb3IoKGhvdXJzICsgbnVtKS8yNCkpXG4gICAgICAgIGhvdXJzID0gKGhvdXJzICsgbnVtKSAlIDI0XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdtJzpcbiAgICAgICAgbGV0IGhvdXJzVG9BZGQgPSBNYXRoLmZsb29yKChtaW51dGVzICsgbnVtKS82MClcbiAgICAgICAgbWludXRlcyA9IChtaW51dGVzICsgbnVtKSAlIDYwXG4gICAgICAgIHRoaXMuYWRkKGhvdXJzVG9BZGQsICdoJylcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3MnOlxuICAgICAgICBsZXQgbWludXRlc1RvQWRkID0gTWF0aC5mbG9vcigoc2Vjb25kcyArIG51bSkvNjApXG4gICAgICAgIHNlY29uZHMgPSAoc2Vjb25kcyArIG51bSkgJSA2MFxuICAgICAgICB0aGlzLmFkZChtaW51dGVzVG9BZGQsICdtJylcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIC8vIFRoaXMgaXMgYSBzZWxmLXJlZmVyZW5jaW5nIG1ldGhvZFxuICAgIHN1YnRyYWN0IChudW0sIHVuaXQpIHtcbiAgICAgIHZhbGlkYXRlTnVtKG51bSwgJ3N1YnRyYWN0JylcbiAgICAgIGNvbnN0IHVuaXRGaXJzdENoYXIgPSB2YWxpZGF0ZVVuaXQodW5pdCwgJ3N1YnRyYWN0JylcbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICBzd2l0Y2godW5pdEZpcnN0Q2hhcil7XG4gICAgICBjYXNlICdoJzpcbiAgICAgICAgbGV0IGhvdXJBbnN3ZXIgPSBob3VycyAtIG51bVxuICAgICAgICB3aGlsZShob3VyQW5zd2VyIDwgMCl7XG4gICAgICAgICAgY291bnQgKytcbiAgICAgICAgICBob3VyQW5zd2VyID0gMjQgKyBob3VyQW5zd2VyXG4gICAgICAgIH1cbiAgICAgICAgaG91cnMgPSBob3VyQW5zd2VyXG4gICAgICAgIGlmIChjb3VudCkge1xuICAgICAgICAgIHRoaXMuaGFzQ3Jvc3NlZE1pZG5pZ2h0ID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdtJzpcbiAgICAgICAgbGV0IG1pbnV0ZUFuc3dlciA9IG1pbnV0ZXMgLSBudW1cbiAgICAgICAgd2hpbGUobWludXRlQW5zd2VyIDwgMCl7XG4gICAgICAgICAgY291bnQgKytcbiAgICAgICAgICBtaW51dGVBbnN3ZXIgPSA2MCArIG1pbnV0ZUFuc3dlclxuICAgICAgICB9XG4gICAgICAgIG1pbnV0ZXMgPSBtaW51dGVBbnN3ZXJcbiAgICAgICAgaWYoY291bnQpe1xuICAgICAgICAgIHRoaXMuc3VidHJhY3QoY291bnQsICdoJylcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncyc6XG4gICAgICAgIGxldCBzZWNvbmRBbnN3ZXIgPSBzZWNvbmRzIC0gbnVtXG4gICAgICAgIHdoaWxlKHNlY29uZEFuc3dlciA8IDApe1xuICAgICAgICAgIGNvdW50ICsrXG4gICAgICAgICAgc2Vjb25kQW5zd2VyID0gNjAgKyBzZWNvbmRBbnN3ZXJcbiAgICAgICAgfVxuICAgICAgICBzZWNvbmRzID0gc2Vjb25kQW5zd2VyXG4gICAgICAgIGlmKGNvdW50KXtcbiAgICAgICAgICB0aGlzLnN1YnRyYWN0KGNvdW50LCAnbScpXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3BvbnNlLCAndmFsJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKFtob3VycywgbWludXRlcywgc2Vjb25kc10pXG4gICAgfVxuICB9KVxuXG4gIHJlc3BvbnNlLmFkZCA9IHJlc3BvbnNlLmFkZC5iaW5kKHJlc3BvbnNlKVxuICByZXNwb25zZS5zdWJ0cmFjdCA9IHJlc3BvbnNlLnN1YnRyYWN0LmJpbmQocmVzcG9uc2UpXG5cbiAgcmV0dXJuIHJlc3BvbnNlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGltZURyaWZ0Il19
