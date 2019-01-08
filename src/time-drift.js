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
      this.hasCrossedMidnight = false
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
      this.hasCrossedMidnight = false
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