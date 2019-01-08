## TimeDrift

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![circleci](https://img.shields.io/circleci/project/github/too-old-to-code/time-drift.svg)](https://circleci.com/gh/too-old-to-code/time-drift/tree/master) [![](https://david-dm.org/too-old-to-code/time-drift.svg)](https://david-dm.org/too-old-to-code/time-drift)



This is small package without any dependencies that allows for quick arithmetic with times.
It allows you to give a time and then add or subtract minutes, hours or seconds.

### Browser
```
<script src="dist/time-drift.js"></script>
```

### Node
```
npm install time-drift
```

And then require it into your app like so:

```
let timeDrift = require('time-drift')
```

### Usage

When you invoke timeDrift, you need to supply a first argument, which should be a time. It should be written as a string in the form: HH:MM:SS or, if you don't need to use seconds: HH:MM

The colons can be interchanged with most non-numerical characters. All these would be valid times:

```
"12:34"
"10-27-00"
"09 15"

```

There is a second optional argument to tell timeDrift what you would like to be the delimiter between the time components. This must be a single string character.

##### Example usage:

```
let time = timeDrift('19:00:00')
time.add(24, 'mins')
time.subtract(16, 'secs')
console.log(time.val) // "19:23:44"

let time2 = timeDrift('22:00', '.').add(27, 'h').subtract(35, 'm').val
console.log(time2) // "00.25"
```

As you can see from the example above, timeDrift is chainable. You can chain multiple times, and you will only be returned the final value when you chain on a `val` to the end. And still, you can continue chaining after that too.

The first argument to the `add()` and `subtract()` methods is the number of units you wish to add/subtract from the time.

The second argument signifies the time unit to be used can be any string, as long as it begins with the letters 'h', 'm', or 's'.

If the midnight boundary is passed during any calculation, the timeDrift object has a property `hasCrossedMidnight` that will be set to true.