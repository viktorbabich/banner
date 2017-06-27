var app = {
	state: 'allow',
	form: {
		width: 0,
		height: 0,
		slides: []
	},
	sendForm: function() {


		app.form.slides = [];

		app.form.id = $('#bannerId').val();
		app.form.width = $('#bannerWidth').val();
		app.form.height = $('#bannerHeight').val();
		app.form.name = $('#bannerName').val();

		$('.c-files__item').each(function() {
			var name = $($(this).find('.c-files__name')).val();
			var fade = $($(this).find('.c-files__fade')).val();
			var duration = $($(this).find('.c-files__duration')).val();
			app.form.slides.push(new BannerSlide(name, +fade, +duration));
		});

		$.ajax({
			method: 'POST',
			data: JSON.stringify(app.form, "", 4),
			dataType: "json",
			contentType: "application/json",
			url: '/updateForm'
		}).done(function() {
			window.location.reload()
		})

	}
}

function BannerSlide (img,fade,  duration) {
	this.img = img;
	this.duration = duration || 2000;
	this.fade = fade
}


$(function() {
	$('.c-files').sortable({
		change: function( event, ui ) {
			app.state  = 'lock';
		}
	});
	$('.c-files__remove').on('click', function() {
		var t = $(this).closest('.c-files__item');
		app.state  = 'lock';
		t.fadeOut(400, function() {
			t.remove()
		})
	});

	$('.j-upd').on('click', function() {
		app.sendForm();
	});

	$('a[href="/download"]').on('click', function(e) {
		var conf = true;
		if (app.state === 'lock') {
			conf = confirm('Есть несохраненные изменения,\nСкачать без сохранения?');
		}
		if (!conf) {
			e.preventDefault()
		}
	});

	$('.c-files__duration, .c-files__fade').on('change', function() {
		app.state  = 'lock';
	});


	$('.c-files__img').each(function() {
		var f = $(this).closest('.c-files__item')
		var info = f.find('.c-files__info');

		var img = new Image()
		img.src = $(this).attr('data-img');
		img.onload = function() {

			$(info).html(img.width + 'X' + img.height);

			if ( +$('#bannerWidth').val() !== img.width || +$('#bannerHeight').val() !== img.height) {
				$(f).addClass('c-files__item--error')
			}
			console.log(img.width, +$('#bannerWidth').val())
		}
	});

	/*$('#addsFiles').on('change', function(e) {
		var files = $('#addsFiles').val();
		console.log()

		$.ajax({
			method: 'POST',
			data: JSON.stringify(app.form, "", 4),
			dataType: "json",
			contentType: "application/json",
			url: '/updateForm'
		}).done(function() {
			window.location.reload()
		})


	})*/

	function getFileView(img, duration, fade) {
		var view = [
			'<div class="c-files__item">',
				'<div class="c-files__img" data-img="../banner/'+ img +'" style="background-image: url(../banner/'+ img +')"></div>',
				'<input type="number" class="c-files__duration" min="0" step="100" value="'+duration+'">',
				'<input type="number" class="c-files__fade" min="0" step="100" value="'+ fade +'">',
				'<input type="hidden" class="c-files__name" value="'+ img +'">',
				'<div class="c-files__remove"></div>',
				'<div class="c-files__info"></div>',
			'</div>'
		]
		return view.join("");
	} 

	$('#addsFiles').change(function(){
		var data = new FormData();
		$.each($('#addsFiles')[0].files, function(i, file) {
		    //data.append('newslides[' + i + ']', file);
		    var file = $('#addsFiles')[0].files[i]
		    data.append('newslide', file);
		});

		$.ajax({
		    url: '/addslide',
		    data: data,
		    cache: false,
		    contentType: false,
		    processData: false,
		    type: 'POST',
		    success: function(data){
		       // alert(data);
		    }
		}).done(function(data) {
			data.forEach(function(k, v) {
				var el = getFileView(k.img, k.duration, k.fade);
				$('.c-files').append(el)
			});
			app.sendForm();

		});
	});
});


 
