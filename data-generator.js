var _ = require('lodash');
var fs = require('fs');
var Chance = require('chance');
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;

var wells = [
  'Standard Draw 9-20-18-93',
  'CG Road 14-2-19-94',
  'Wild Rose 16-30-17-94',
  'Creston Nose 1-9-18-92',
  'CG Road 14-1-19-94',
  'Coal Gulch 7A-34-17-93',
  'Coal Gulch 9-28-17-93',
  'Flat Top Fed Gulch 13-23-14-93',
  'Tierney 16-12-19-94',
  'Robbers Gulch 12-30-14-92'
];

var url = 'mongodb://localhost:27017/demo';

var chance = new Chance();

var startDate = moment({ years: 2015, months: 0, days: 0, hours: 0, minutes: 0 });
var endDate = moment({ years: 2015, months: 11, days: 31, hours: 23, minutes: 59 });

MongoClient.connect(url, function(err, db) {
  var uc = db.collection('uncertainity');
  var mc = db.collection('measurements');
  var frc = db.collection('flowrates');
  var ec = db.collection('events');
  uc.remove({});
  mc.remove({});
  frc.remove({});
  ec.remove({});

  _.each(_.range(wells.length), function(i) {
    console.log('Well : ' + wells[i]);

    var currentDate = moment(startDate);
    var nextSensor = null;
    var nextRate = null;
    var nextEvent = null;

    var eventTypes = [
      { name: 'Well Offline', maxDuration: 14 * 24 * 60 },
      { name: 'Wellhead Maintenance', maxDuration: 4 * 60 },
      { name: 'Slickline', maxDuration: 2 * 24 * 60 },
      { name: 'Braided Line', maxDuration: 5 * 24 * 60 },
      { name: 'Snubbing', maxDuration: 12 * 60 },
      { name: 'Workover', maxDuration: 6 * 24 * 60 }
    ];

    while (currentDate.isBefore(endDate)) {
      var eventChance = chance.weighted([0, 1, 2, 3, 4, 5, 6], [400, 1, 34, 12, 12, 42, 20]);
      if (eventChance !== 0) {
        var e = {};
        e.wellIndex = i;
        e.well = wells[i];
        e.dateHour = currentDate.toDate();
        e.event = eventTypes[eventChance - 1].name;
        var ii = chance.integer({ min: 1, max: eventTypes[eventChance - 1].maxDuration });
        e.duration = ii;
        ec.insert(e);

        nextEvent = moment(currentDate).add(ii, 'minutes');
      }
      else if (nextEvent === null || currentDate.isAfter(nextEvent)) {
        nextEvent = null;

        var uncertainity = {};
        var measurements = [];
        var flowrate = {};
        uncertainity.wellIndex = i;
        uncertainity.well = wells[i];
        uncertainity.dateHour = currentDate.toDate();
        var u = chance.floating({ min: 24, max: 76, fixed: 2 });
        var ll = chance.floating({ min: 0, max: 24, fixed: 2 });
        uncertainity.estPressure = u; // chance value?
        uncertainity.upPressure = u + ll;
        uncertainity.lowPressure = u - ll;
        uc.insert(uncertainity);

        // sensor data was available
        if ((nextSensor === null || (nextSensor.isBefore(currentDate) || nextSensor.isSame(currentDate))) && chance.bool({likelihood: 90})) {
          nextSensor = null;

          var mm = {};
          mm.wellIndex = i;
          mm.well = wells[i];
          mm.dateHour = currentDate.toDate();
          var qty = chance.integer({ min: 1, max: 35 });
          _.each(_.range(qty), function(n) {
            var other = _.clone(mm);
            other.pressure = chance.floating({ min: 0, max: 100, fixed: 2 });
            var uf = chance.weighted([
              chance.floating({min: 0, max: 10, fixed: 2}),
              chance.floating({min: 10, max: 20, fixed: 2}),
              chance.floating({min: 20, max: 30, fixed: 2}),
              chance.floating({min: 30, max: 40, fixed: 2}),
              chance.floating({min: 40, max: 50, fixed: 2}),
              chance.floating({min: 50, max: 60, fixed: 2}),
              chance.floating({min: 60, max: 70, fixed: 2}),
              chance.floating({min: 70, max: 80, fixed: 2}),
              chance.floating({min: 80, max: 90, fixed: 2}),
              chance.floating({min: 90, max: 100, fixed: 2})
            ], [1000000000, 100000000, 10000000, 1000000, 100000, 10000, 1000, 100, 10, 1]);
            other.uncertainity = uf;
            mc.insert(other);
          });
        }
        else {
          // sensor data can be offline for up to 3 days max, minimum is 1 minute offline
          nextSensor = moment(currentDate);
          var o = chance.weighted([chance.integer({min: 1, max: 10}), chance.integer({min: 10, max: 6 * 60}), chance.integer({min: (6 * 60) + 1, max: 24 * 60}), chance.integer({min: 24 * 60, max: 3 * 24 * 60})], [100, 75, 5, 1]);
          nextSensor.add(o, 'minutes');
        }

        // sensor data was available for flow rate
        if ((nextRate === null || (nextRate.isBefore(currentDate) || nextRate.isSame(currentDate))) && chance.bool({likelihood: 90})) {
          nextRate = null;

          var ff = {};
          ff.wellIndex = i;
          ff.well = wells[i];
          ff.dateHour = currentDate.toDate();
          ff.rate = chance.floating({ min: 250, max: 600, fixed: 2 });
          frc.insert(ff);
        }
        else {
          // sensor data can be offline for up to 3 days max, minimum is 1 minute offline
          nextRate = moment(currentDate);
          var o = chance.weighted([chance.integer({min: 1, max: 10}), chance.integer({min: 10, max: 6 * 60}), chance.integer({min: (6 * 60) + 1, max: 24 * 60}), chance.integer({min: 24 * 60, max: 3 * 24 * 60})], [100, 75, 5, 1]);
          nextRate.add(o, 'minutes');
        }
      }

      currentDate.add(1, 'minutes');
    }
  });

  db.close();
});