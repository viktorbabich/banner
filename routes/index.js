var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer();
var shortid = require('shortid');
var _ = require('lodash');
var rimraf = require('rimraf');
var sizeOf = require('image-size');
var archiver = require('archiver');
var outputPath = 'archive.zip'
var nunjucks = require('nunjucks');
var jsFileContent = "";

global.banner = {}

var sizes = require('../datasource/sizes.json');


function getArchive (name, cb) {
	var output = fs.createWriteStream('downloads/' + name + '.zip');
	var zipArchive = archiver('zip');

	output.on('close', function() {
	    console.log('done with the zip', name);
	    cb()
	});

	zipArchive.pipe(output);

	zipArchive.bulk([
	    { src: [ '**/*' ], cwd: 'archive', expand: true }
	]);

	zipArchive.finalize(function(err, bytes) {
	    if(err) {
	      throw err;
	    }
	    console.log('done:', bytes);
	});
}

function updBannerFolder () {
	fs.rmdirSync(path.join('public/banner'));
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {ctx: {} });
});

router.get('/banner', function(req, res, next) {
	var b = JSON.parse(fs.readFileSync('public/banner/banner.json', 'utf8'))
	res.render('banner', {ctx: b, sizes: sizes});
});

router.get('/download', function(req, res, next) {
	var b = JSON.parse(fs.readFileSync('public/banner/banner.json', 'utf8'));
	var r;

	rimraf(path.join('archive'), {}, function() {
		fs.mkdirSync(path.join('archive'));

		_.forEach(b.files, function(file, idx) {
			var name = b.name + '_img_' + idx + path.extname(file.img);
			fs.createReadStream(path.join('public/banner/', file.img)).pipe(fs.createWriteStream(path.join('archive',name)));
			b.files[idx].img = name;
		});

		var ts = new Date();

		var content = nunjucks.render('../views/preview.html', {
			ctx: b
		});
		fs.writeFileSync('archive/' + b.name + '.html', content, 'utf8');

		getArchive(b.name, function() {
			res.download('downloads/' + b.name + '.zip', b.name + '.zip')
		});
	});
});

router.post('/updateForm', function(req, res, next) {

		var banner = {
			id: req.body.id,
			width: req.body.width,
			height: req.body.height,
			name: req.body.name,
			files: req.body.slides
		}

		fs.writeFileSync(path.join('public/banner/banner.json'), JSON.stringify(banner, null, 4))

		res.send({})
});

router.post('/addslide', upload.array('newslide'), function(req, res, next) {
	console.log(req.files,  '+++++++++++++++++++++++++++++')
	var arr = [];
	_.forEach(req.files, function(file, i) {
			console.log(file)
			var f = {
				img: file.originalname,
				duration: 2000,
				fade: 500
			}

			arr.push(f);
			fs.writeFileSync(path.join('public/banner', file.originalname), file.buffer);
	});

	res.send(arr)

})

router.post('/saveForm', upload.array('banners'),  function(req, res, next) {

 	var banner = {
		id: shortid.generate(),
		name: req.body.name.split(' ').join('_'),
		width: 0,
		height: 0,
		files: []
	}

	var f = {
		img: '',
		duration: 2000,
		fade: 500
	}

	rimraf(path.join('public/banner'), {}, function() {

		fs.mkdirSync(path.join('public/banner'));

		_.forEach(req.files, function(file, i) {
				console.log(file)
				f = {
					img: file.originalname,
					duration: 2000,
					fade: 500
				}
				banner.files.push(f);
				
				fs.writeFileSync(path.join('public/banner', file.originalname), file.buffer);

				if (i === 0) {
					sizeOf(path.join('public/banner', file.originalname), function (err, dimensions) {
					  banner.width = dimensions.width;
					  banner.height = dimensions.height;
					  banner.name += ('_' + dimensions.width + 'X' + dimensions.height) ;
					  fs.writeFileSync(path.join('public/banner/banner.json'), JSON.stringify(banner, null, 4))
					});
				}
		});

		res.redirect('/banner')
	})
});


module.exports = router;
