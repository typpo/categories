var School = require('../models/school');
var District = require('../models/district');

function getStaticMapUrl(lat, lng) {
  return 'http://maps.googleapis.com/maps/api/staticmap?zoom=2&scale=1&size=350x250&maptype=terrain&format=png&visual_refresh=true&markers=size:mid%7Ccolor:red%7Clabel:1%7C' + lat + ',' + lng + '&key=' + process.env.MAPS_API_KEY;
}

function getPaginationData(currentPage, totalPage) {
  currentPage = parseInt(currentPage, 10) || 1;
  // Display 5 pages at once.
  var NUM_PAGES = 5;
  var startPage = Math.max(1, currentPage - Math.floor(NUM_PAGES / 2));
  if (startPage > totalPage - NUM_PAGES + 1) {
    startPage = Math.max(1, totalPage - NUM_PAGES + 1);
  }

  return {
    currentPage: currentPage,
    prevPage: Math.max(1, currentPage - 1),
    nextPage: Math.min(totalPage, currentPage + 1),
    totalPage: totalPage,
    startPage: startPage,
    endPage: Math.min(totalPage, startPage + NUM_PAGES - 1)
  };
}

/**
 * GET school data.
 */
exports.index = function(req, res) {
  var filter = {};
  var context = {};

  if (req.params.directory) {
    console.log('Getting directory data for ' + req.params.directory);
    // Example directory: CA-schools, 94043-schools.
    var loc = req.params.directory.split('-')[0];
    if (/^\d+$/.test(loc)) {
      // By zipcode.
      filter.zip = loc;
      context.thing = loc;
    } else {
      // By state.
      filter.state = loc.toUpperCase();
      context.thing = filter.state;
    }
  }

  if (req.params.district) {
    console.log('Getting directory data for ' + req.params.district);
    filter.agency_slug = req.params.district;

    District.findOne({agency_slug: req.params.district}).then(function(resp) {
      context.district = resp;
      context.thing = context.district.agency;
      renderDirectory(req, res, filter, context);
    });
  } else {
    renderDirectory(req, res, filter, context);
  }
};

function renderDirectory(req, res, filter, context) {
  School.paginate(filter, {page: req.query.page || 1, limit: 20, sort: 'name'}).then(function(resp) {
    res.render('directory', {
      page: {
        selection: 'Schools',
      },
      pagination: getPaginationData(resp.page, resp.pages),
      schools: resp.docs,
      context: context,
    });
  });
}
