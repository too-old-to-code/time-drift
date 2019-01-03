let timeDrift = require('./dist/time-drift')

let time2 = timeDrift('22:00').add(27, 'h').subtract(35, 'm').val
console.log(time2)