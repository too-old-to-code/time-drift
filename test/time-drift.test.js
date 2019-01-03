"use strict"

var expect = require('chai').expect
var timeDrift = require('../src/time-drift')

var errorMessages = {
  format: "Time format is incorrect. It should be either 'HH:MM:SS' or 'HH:MM', where the colon can be replaced by a non-numerical character",
  hours: "Hours must be between 0 and 23",
  minutes: "Minutes must be between 0 and 59",
  seconds: "Seconds must be between 0 and 59",
  firstArg: "method must be a number",
  secondArgAdd: "Second argument of add method must be hours, minutes or seconds",
  secondArgSubtract: "Second argument of subtract method must be hours, minutes or seconds"
}

describe('Should throw errors',function(){
  it('if time format is incorrect', function(done) {
    expect(() => timeDrift('1:00:00').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('001:00:00').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12:0:00').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12:010:00').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12:01:0').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12:01:101').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12::01:10').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12:01::10').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12::01').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12:011').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift('12:H1:04').add(1,'s').val).to.throw(errorMessages.format)
    expect(() => timeDrift(2200).add(1,'s').val).to.throw(errorMessages.format)
    done()
  })

  it('if hours are outside range 0 - 23', function(done){
    expect(() => timeDrift('26:00:00').add(1,'s').val).to.throw(errorMessages.hours)
    expect(() => timeDrift('24:00:00').add(1,'s').val).to.throw(errorMessages.hours)
    done()
  }),

  it('if minutes are outside range 0 - 59', function(done){
    expect(() => timeDrift('23:62:00').add(1,'s').val).to.throw(errorMessages.minutes)
    expect(() => timeDrift('12:60:00').add(1,'s').val).to.throw(errorMessages.minutes)
    done()
  }),

  it('if seconds are outside range 0 - 59', function(done){
    expect(() => timeDrift('12:15:60').add(1,'s').val).to.throw(errorMessages.seconds)
    expect(() => timeDrift('21:04:80').add(1,'s').val).to.throw(errorMessages.seconds)
    done()
  }),

  it('if first argument of add method is not a number', function(done){
    expect(() => timeDrift('22:00:00').add('hello','s').val).to.throw(errorMessages.firstArg)
    done()
  }),

  it('if first argument of subtract method is not a number', function(done){
    expect(() => timeDrift('22:00:00').subtract('hello','s').val).to.throw(errorMessages.firstArg)
    done()
  }),

  it('if second argument of add method does not begin with \'h\',\'m\' or \'s\'', function(done){
    expect(() => timeDrift('22:00:00').add(20,'weeks').val).to.throw(errorMessages.secondArgAdd)
    done()
  }),

  it('if second argument of subtract method does not begin with \'h\',\'m\' or \'s\'', function(done){
    expect(() => timeDrift('22:00:00').subtract(14,'years').val).to.throw(errorMessages.secondArgSubtract)
    done()
  })
}),

describe('Adding time', function(){

  it('should add correct number of seconds',function(done){
    expect(timeDrift('12:00:00').add(1,'s').val).to.be.equal('12:00:01')
    expect(timeDrift('01:00:00').add(25,'secs').val).to.be.equal('01:00:25')
    expect(timeDrift('13:00:49').add(3,'seconds').val).to.be.equal('13:00:52')
    done()
  }),

  it('should increase minutes correctly if seconds exceed 60',function(done){
    expect(timeDrift('12:00:00').add(100,'s').val).to.be.equal('12:01:40')
    expect(timeDrift('01:00:25').add(600,'secs').val).to.be.equal('01:10:25')
    expect(timeDrift('13:00:49').add(12,'seconds').val).to.be.equal('13:01:01')
    done()
  }),

  it('should add correct number of minutes',function(done){
    expect(timeDrift('12:00:00').add(1,'m').val).to.be.equal('12:01:00')
    expect(timeDrift('01:00:00').add(25,'min').val).to.be.equal('01:25:00')
    expect(timeDrift('13:49:00').add(3,'minutes').val).to.be.equal('13:52:00')
    done()
  }),

  it('should increase hours correctly if minutes exceed 60',function(done){
    expect(timeDrift('12:01:00').add(60,'m').val).to.be.equal('13:01:00')
    expect(timeDrift('01:10:25').add(600,'min').val).to.be.equal('11:10:25')
    expect(timeDrift('13:52:49').add(12,'minutes').val).to.be.equal('14:04:49')
    done()
  }),

  it('should add correct number of hours',function(done){
    expect(timeDrift('12:00:00').add(1,'h').val).to.be.equal('13:00:00')
    expect(timeDrift('01:25:00').add(14,'hour').val).to.be.equal('15:25:00')
    expect(timeDrift('13:49:00').add(3,'hours').val).to.be.equal('16:49:00')
    done()
  }),

  it('should restart hours at 0 if hours exceed 24',function(done){
    expect(timeDrift('23:00:00').add(1,'h').val).to.be.equal('00:00:00')
    expect(timeDrift('03:25:00').add(12,'hour').val).to.be.equal('15:25:00')
    expect(timeDrift('16:49:00').add(16,'hours').val).to.be.equal('08:49:00')
    done()
  })

})

describe('Subtracting time', function(){

  it('should subtract correct number of seconds',function(done){
    expect(timeDrift('12:00:01').subtract(1,'s').val).to.be.equal('12:00:00')
    expect(timeDrift('01:00:25').subtract(25,'secs').val).to.be.equal('01:00:00')
    expect(timeDrift('13:00:52').subtract(3,'seconds').val).to.be.equal('13:00:49')
    done()
  }),

  it('should decrease minutes correctly if seconds subtracted exceed seconds in time',function(done){
    expect(timeDrift('12:01:40').subtract(100,'s').val).to.be.equal('12:00:00')
    expect(timeDrift('01:10:25').subtract(600,'secs').val).to.be.equal('01:00:25')
    expect(timeDrift('13:01:01').subtract(12,'seconds').val).to.be.equal('13:00:49')
    done()
  }),

  it('should subtract correct number of minutes',function(done){
    expect(timeDrift('12:01:00').subtract(1,'m').val).to.be.equal('12:00:00')
    expect(timeDrift('01:25:00').subtract(25,'minutes').val).to.be.equal('01:00:00')
    expect(timeDrift('13:52:00').subtract(3,'minutes').val).to.be.equal('13:49:00')
    done()
  }),

  it('should decrease hours correctly if minutes subtracted exceed minutes in time',function(done){
    expect(timeDrift('13:01:00').subtract(60,'m').val).to.be.equal('12:01:00')
    expect(timeDrift('11:10:25').subtract(600,'m').val).to.be.equal('01:10:25')
    expect(timeDrift('14:04:49').subtract(12,'m').val).to.be.equal('13:52:49')
    done()
  }),

  it('should subtract correct number of hours',function(done){
    expect(timeDrift('13:00:00').subtract(1,'h').val).to.be.equal('12:00:00')
    expect(timeDrift('15:25:00').subtract(14,'hour').val).to.be.equal('01:25:00')
    expect(timeDrift('16:49:00').subtract(3,'hours').val).to.be.equal('13:49:00')
    done()
  }),

  it('should restart hours at 23 if hours pass 0',function(done){
    expect(timeDrift('00:00:00').subtract(1,'h').val).to.be.equal('23:00:00')
    expect(timeDrift('15:25:00').subtract(12,'hour').val).to.be.equal('03:25:00')
    expect(timeDrift('08:49:00').subtract(16,'hours').val).to.be.equal('16:49:00')
    done()
  })
})

describe('Chaining methods', function () {
  it('should be able to chain methods together and give correct result',function(done){
    expect(timeDrift('12:00:01').subtract(1,'s').add(2, 'h').val).to.be.equal('14:00:00')
    expect(timeDrift('01:00:25').add(25,'secs').subtract(12, 'm').subtract(1, 'h').val).to.be.equal('23:48:50')
    expect(timeDrift('13:00:52').subtract(3,'seconds').subtract(1, 'm').val).to.be.equal('12:59:49')
    done()
  })
})