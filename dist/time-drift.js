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

    // This is a self-referencing function, and therefore cannot
    // be anonymous
    add: function add (num, unit) {
      validateNum(num, 'add')
      const unitFirstChar = validateUnit(unit, 'add')
      switch(unitFirstChar){
      case 'h':
        hours = (hours + num) % 24
        break
      case 'm':
        let hoursToAdd = Math.floor((minutes + num)/60)
        minutes = (minutes + num) % 60
        add(hoursToAdd, 'h')
        break
      case 's':
        let minutesToAdd = Math.floor((seconds + num)/60)
        seconds = (seconds + num) % 60
        add(minutesToAdd, 'm')
        break
      }
      return this
    },

    // This is a self-referencing function, and therefore cannot
    // be anonymous
    subtract: function subtract (num, unit) {
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
        break
      case 'm':
        let minuteAnswer = minutes - num
        while(minuteAnswer < 0){
          count ++
          minuteAnswer = 60 + minuteAnswer
        }
        minutes = minuteAnswer
        if(count){
          subtract(count, 'h')
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
          subtract(count, 'm')
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

  return response
}

module.exports = timeDrift
},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdGltZS1kcmlmdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiXG5cbmZ1bmN0aW9uIHRpbWVEcmlmdCAodGltZSwgc2VwYXJhdG9yKSB7XG4gIGNvbnN0IHRpbWVGb3JtYXQgPSAvXlxcZFxcZC5cXGRcXGQoLlxcZFxcZCk/JC9cblxuICAvLyBDaGVjayB0aGF0IHRoZSB0aW1lIGZvcm1hdCBpcyBjb3JyZWN0XG4gIGlmICghdGltZUZvcm1hdC50ZXN0KHRpbWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGltZSBmb3JtYXQgaXMgaW5jb3JyZWN0LiBJdCBzaG91bGQgYmUgZWl0aGVyICdISDpNTTpTUycgb3IgJ0hIOk1NJywgXFxcbndoZXJlIHRoZSBjb2xvbiBjYW4gYmUgcmVwbGFjZWQgYnkgYSBub24tbnVtZXJpY2FsIGNoYXJhY3RlclwiKVxuICB9XG5cbiAgY29uc3QgdGltZUNvbXBvbmVudHMgPSB0aW1lLnNwbGl0KC9bLjpcXC0gXS8pLm1hcChjb21wb25lbnQgPT4gTnVtYmVyKGNvbXBvbmVudCkpXG4gIGxldCBbaG91cnMsIG1pbnV0ZXMsIHNlY29uZHNdID0gdGltZUNvbXBvbmVudHNcblxuICAvLyBjaGVjayBob3VycyBhcmUgd2l0aGluIHZhbGlkIHJhbmdlXG4gIGlmKGhvdXJzID4gMjMgfHwgaG91cnMgPCAwKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0hvdXJzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAyMycpXG4gIH1cblxuICAvLyBjaGVjayBtaW51dGVzIGFyZSB3aXRoaW4gdmFsaWQgcmFuZ2VcbiAgaWYobWludXRlcyA+IDU5IHx8IG1pbnV0ZXMgPCAwKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01pbnV0ZXMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDU5JylcbiAgfVxuXG4gIC8vIGNoZWNrIHNlY29uZHMgYXJlIHdpdGhpbiB2YWxpZCByYW5nZVxuICBpZihzZWNvbmRzICE9IG51bGwgJiYgKHNlY29uZHMgPiA1OSB8fCBzZWNvbmRzIDwgMCkpe1xuICAgIHRocm93IG5ldyBFcnJvcignU2Vjb25kcyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgNTknKVxuICB9XG5cbiAgLy8gY2hlY2sgc2VwYXJhdG9yIGlzIHNpbmdsZSBub24tbnVtZXJpY2FsIGNoYXJhY3RlclxuICBpZihzZXBhcmF0b3IgJiYgKHR5cGVvZiBzZXBhcmF0b3IgIT09ICdzdHJpbmcnIHx8IHNlcGFyYXRvci5sZW5ndGggPiAxKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignU2VwYXJhdG9yIG11c3QgYmUgYSBzaW5nbGUsIG5vbi1udW1lcmljYWwgY2hhcmFjdGVyJylcbiAgfVxuXG4gIC8vIGNoZWNrIHRoYXQgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBhZGQgYW5kIHN1YnRyYWN0IG1ldGhvZHMgaXMgYSBudW1iZXJcbiAgZnVuY3Rpb24gdmFsaWRhdGVOdW0gKG51bSwgbWV0aG9kKSB7XG4gICAgaWYgKHR5cGVvZiBudW0gIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpcnN0IGFyZ3VtZW50IG9mICR7bWV0aG9kfSBtZXRob2QgbXVzdCBiZSBhIG51bWJlcmApXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVVbml0ICh1bml0LCBtZXRob2QpIHtcbiAgICAvLyBjaGVjayB0aGF0IHRoZSB1bml0IGlzIGEgc3RyaW5nXG4gICAgaWYgKHR5cGVvZiB1bml0ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZWNvbmQgYXJndW1lbnQgb2YgJHttZXRob2R9IG1ldGhvZCBtdXN0IGJlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdW5pdCBvZiB0aW1lYClcbiAgICB9XG5cbiAgICAvLyBqdXN0IGdyYWIgdGhlIGZpcnN0IGxldHRlciBvZiB0aGUgdW5pdCBhbmQgbG93ZXJjYXNlIGl0LiBUaGlzIGlzIGVub3VnaCB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuXG4gICAgLy8gdW5pdHNcbiAgICBsZXQgdW5pdENoYXIgPSB1bml0LmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpXG5cbiAgICAvLyBjaGVjayB0aGUgdGltZSB1bml0IHVzZWQgYmVnaW5zIHdpdGggdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgd29yZHMgJ2hvdXJzJywgJ21pbnV0ZXMnLCBvciAnc2Vjb25kcydcbiAgICBpZiAoIVsnaCcsJ20nLCdzJ10uaW5jbHVkZXModW5pdENoYXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlY29uZCBhcmd1bWVudCBvZiAke21ldGhvZH0gbWV0aG9kIG11c3QgYmUgaG91cnMsIG1pbnV0ZXMgb3Igc2Vjb25kc2ApXG4gICAgfVxuXG4gICAgLy8gZW5zdXJlIHRoYXQgbm8gY2FsY3VsYXRpb25zIGludm9sdmluZyBzZWNvbmRzIGNhbiBiZSBwZXJmb3JtZWQgaWYgbm8gc2Vjb25kcyB3ZXJlIHN0YXRlZCBpbiB0aGVcbiAgICAvLyBvcmlnaW5hbCB0aW1lIHRvIGJlIGNoYW5nZWRcbiAgICBpZiAodW5pdENoYXIgPT09ICdzJyAmJiBzZWNvbmRzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWW91IGNhbid0IGFkanVzdCBzZWNvbmRzIGlmIHRoZXkgd2VyZW4ndCBpbmNsdWRlZCBpbiB0aGUgb3JpZ2luYWwgdGltZSBnaXZlbmApXG4gICAgfVxuXG4gICAgcmV0dXJuIHVuaXRDaGFyXG4gIH1cblxuICBjb25zdCByZXNwb25zZSA9IHtcbiAgICBub3JtYWxpemUgKHJldHVybkFycmF5KSB7XG4gICAgICAvLyBpZiBubyBzZWNvbmRzIHdlcmUgaW5jbHVkZWQsIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBsYXN0IGVsZW1lbnQgb2YgdGhlIGFycmF5XG4gICAgICAvLyB3aGljaCB3aWxsIGJlIHVuZGVmaW5lZFxuICAgICAgaWYgKHNlY29uZHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm5BcnJheS5wb3AoKVxuICAgICAgfVxuXG4gICAgICAvLyBGb3IgZWFjaCBwYXJ0IG9mIHRoZSB0aW1lLCBlbnN1cmUgdGhhdCBpZiBpdCBpcyBsZXNzXG4gICAgICAvLyB0aGFuIDEwLCB0aGF0IGl0IGhhcyBhIHByZWNlZGluZyAwXG4gICAgICByZXR1cm4gcmV0dXJuQXJyYXkubWFwKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgICBwYXJ0ID0gU3RyaW5nKHBhcnQpXG4gICAgICAgIHJldHVybiBwYXJ0Lmxlbmd0aCA8IDIgPyAnMCcgKyBwYXJ0IDogcGFydFxuICAgICAgfSkuam9pbihzZXBhcmF0b3IgfHwgJzonKVxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGlzIGEgc2VsZi1yZWZlcmVuY2luZyBmdW5jdGlvbiwgYW5kIHRoZXJlZm9yZSBjYW5ub3RcbiAgICAvLyBiZSBhbm9ueW1vdXNcbiAgICBhZGQ6IGZ1bmN0aW9uIGFkZCAobnVtLCB1bml0KSB7XG4gICAgICB2YWxpZGF0ZU51bShudW0sICdhZGQnKVxuICAgICAgY29uc3QgdW5pdEZpcnN0Q2hhciA9IHZhbGlkYXRlVW5pdCh1bml0LCAnYWRkJylcbiAgICAgIHN3aXRjaCh1bml0Rmlyc3RDaGFyKXtcbiAgICAgIGNhc2UgJ2gnOlxuICAgICAgICBob3VycyA9IChob3VycyArIG51bSkgJSAyNFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnbSc6XG4gICAgICAgIGxldCBob3Vyc1RvQWRkID0gTWF0aC5mbG9vcigobWludXRlcyArIG51bSkvNjApXG4gICAgICAgIG1pbnV0ZXMgPSAobWludXRlcyArIG51bSkgJSA2MFxuICAgICAgICBhZGQoaG91cnNUb0FkZCwgJ2gnKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncyc6XG4gICAgICAgIGxldCBtaW51dGVzVG9BZGQgPSBNYXRoLmZsb29yKChzZWNvbmRzICsgbnVtKS82MClcbiAgICAgICAgc2Vjb25kcyA9IChzZWNvbmRzICsgbnVtKSAlIDYwXG4gICAgICAgIGFkZChtaW51dGVzVG9BZGQsICdtJylcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIC8vIFRoaXMgaXMgYSBzZWxmLXJlZmVyZW5jaW5nIGZ1bmN0aW9uLCBhbmQgdGhlcmVmb3JlIGNhbm5vdFxuICAgIC8vIGJlIGFub255bW91c1xuICAgIHN1YnRyYWN0OiBmdW5jdGlvbiBzdWJ0cmFjdCAobnVtLCB1bml0KSB7XG4gICAgICB2YWxpZGF0ZU51bShudW0sICdzdWJ0cmFjdCcpXG4gICAgICBjb25zdCB1bml0Rmlyc3RDaGFyID0gdmFsaWRhdGVVbml0KHVuaXQsICdzdWJ0cmFjdCcpXG4gICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgc3dpdGNoKHVuaXRGaXJzdENoYXIpe1xuICAgICAgY2FzZSAnaCc6XG4gICAgICAgIGxldCBob3VyQW5zd2VyID0gaG91cnMgLSBudW1cbiAgICAgICAgd2hpbGUoaG91ckFuc3dlciA8IDApe1xuICAgICAgICAgIGNvdW50ICsrXG4gICAgICAgICAgaG91ckFuc3dlciA9IDI0ICsgaG91ckFuc3dlclxuICAgICAgICB9XG4gICAgICAgIGhvdXJzID0gaG91ckFuc3dlclxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnbSc6XG4gICAgICAgIGxldCBtaW51dGVBbnN3ZXIgPSBtaW51dGVzIC0gbnVtXG4gICAgICAgIHdoaWxlKG1pbnV0ZUFuc3dlciA8IDApe1xuICAgICAgICAgIGNvdW50ICsrXG4gICAgICAgICAgbWludXRlQW5zd2VyID0gNjAgKyBtaW51dGVBbnN3ZXJcbiAgICAgICAgfVxuICAgICAgICBtaW51dGVzID0gbWludXRlQW5zd2VyXG4gICAgICAgIGlmKGNvdW50KXtcbiAgICAgICAgICBzdWJ0cmFjdChjb3VudCwgJ2gnKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzJzpcbiAgICAgICAgbGV0IHNlY29uZEFuc3dlciA9IHNlY29uZHMgLSBudW1cbiAgICAgICAgd2hpbGUoc2Vjb25kQW5zd2VyIDwgMCl7XG4gICAgICAgICAgY291bnQgKytcbiAgICAgICAgICBzZWNvbmRBbnN3ZXIgPSA2MCArIHNlY29uZEFuc3dlclxuICAgICAgICB9XG4gICAgICAgIHNlY29uZHMgPSBzZWNvbmRBbnN3ZXJcbiAgICAgICAgaWYoY291bnQpe1xuICAgICAgICAgIHN1YnRyYWN0KGNvdW50LCAnbScpXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3BvbnNlLCAndmFsJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKFtob3VycywgbWludXRlcywgc2Vjb25kc10pXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiByZXNwb25zZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWVEcmlmdCJdfQ==
