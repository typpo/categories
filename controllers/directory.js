var School = require('../models/school');

function getStaticMapUrl(lat, lng) {
  return 'http://maps.googleapis.com/maps/api/staticmap?zoom=2&scale=1&size=350x250&maptype=terrain&format=png&visual_refresh=true&markers=size:mid%7Ccolor:red%7Clabel:1%7C' + lat + ',' + lng;
}

exports.index = function(req, res) {
  School.find().distinct('state').then(function(schools) {
    res.render('directory', {
      page: {
        selection: 'Schools',
      },
      states: schools,
    });
  });
}

/**
 * GET school data.
 */
exports.state = function(req, res) {
  console.log('Getting school data for ' + req.params.slug);
  School.find({state: req.params.state.toUpperCase()}).then(function(schools) {
    res.render('directory', {
      page: {
        selection: 'Schools',
      },
      schools: schools,
    });
  });
};