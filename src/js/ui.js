const { navigation } = require("./navigation");

export { ui };

class ui {
	static page = 0;
	static switchingPage = false;
	static animation;
	static animationDuration = 10000;

	static q(path) {
		return document.querySelector(path);
	}
	static qa(path) {
		return document.querySelectorAll(path);
	}
	static on(e, type, f, once) {
		e.addEventListener(type, f, { capture: type == 'touchstart' ? true : false, passive: true, once: once == true ? true : false });
	}
	static positionBox(e, position) {
		var x = e.offsetLeft, y, h = e.offsetHeight, w = e.offsetWidth, hTotal = ui.q('body').offsetHeight, wTotal = ui.q('body').offsetWidth, r;
		e.style.transition = 'none';
		if (position.indexOf('bottom') > -1) {
			y = hTotal * (e.getAttribute('class').indexOf('title') > -1 ? 0.15 : 0.25);
			var percent = (wTotal - w) / 2 / wTotal * 100;
			e.style.left = percent + '%';
			e.style.right = percent + '%';
			e.style.top = (y / hTotal * 100) + '%';
			e.style.bottom = hTotal - y;
			r = ((hTotal - h - y) / hTotal * 100) + '%';
		} else if (position.indexOf('right') > -1) {
			e.style.top = (hTotal * (e.getAttribute('class').indexOf('title') > -1 ? 0.3 : 0.4) / hTotal * 100) + '%';
			e.style.right = wTotal - x;
			r = (100 - (w + x) / wTotal * 100) + '%';
		} else if (position.indexOf('top') > -1) {
			y = hTotal * (e.getAttribute('class').indexOf('title') > -1 ? 0.3 : 0.4);
			var percent = (wTotal - w) / 2 / wTotal * 100;
			e.style.left = percent + '%';
			e.style.right = percent + '%';
			e.style.top = ((y + h) / hTotal * 100) + '%';
			e.style.bottom = ((hTotal - y - h) / hTotal * 100) + '%';
			r = (y / hTotal * 100) + '%';
		} else if (position.indexOf('left') > -1) {
			e.style.top = (hTotal * (e.getAttribute('class').indexOf('title') > -1 ? 0.3 : 0.4) / hTotal * 100) + '%';
			e.style.left = x + w;
			r = (x / wTotal * 100) + '%';
		}
		e.style.transition = null;
		e.style.visibility = 'visible';
		return r;
	}
	static uncoverBox(pagePath) {
		var page = ui.q(pagePath);
		var position = page.getAttribute('class');
		var e = ui.qa(pagePath + ' box');
		var call = function (e, x) {
			setTimeout(function () {
				if (position.indexOf('bottom') > -1)
					e.style.bottom = x;
				else if (position.indexOf('right') > -1)
					e.style.right = x;
				else if (position.indexOf('top') > -1)
					e.style.top = x;
				else if (position.indexOf('left') > -1)
					e.style.left = x;
			}, 10);
		}
		for (var i = 0; i < e.length; i++) {
			ui.on(e[i], 'transitionend', function () {
				var e2;
				for (var i = 0; i < this.children.length; i++) {
					if (this.children[i].nodeName == 'COVER') {
						e2 = this.children[i];
						break;
					}
				}
				ui.on(e2, 'transitionend', function () {
					ui.switchingPage = false;
				}, true);
				if (position.indexOf('bottom') > -1)
					e2.style.top = '100%';
				else if (position.indexOf('right') > -1)
					e2.style.left = '100%';
				else if (position.indexOf('top') > -1)
					e2.style.bottom = '100%';
				else if (position.indexOf('left') > -1)
					e2.style.right = '100%';
			}, true);
			call(e[i], e[i].getAttribute('class').indexOf('image') < 0 ? ui.positionBox(e[i], position) : '0px');
		}
	}
	static resetPage(page) {
		var reset = function (e) {
			e = e.style;
			e.bottom = null;
			e.right = null;
			e.top = null;
			e.left = null;
			e.visibility = null;
		}
		ui.q('body>page:nth-child(' + page + ')').style.opacity = 0;
		ui.q('body>page:nth-child(' + page + ') timer').style.transition = '';
		ui.q('body>page:nth-child(' + page + ') timer').style.right = '100%';
		var boxes = ui.qa('body>page:nth-child(' + page + ') box');
		for (var i = 0; i < boxes.length; i++)
			reset(boxes[i]);
		boxes = ui.qa('body>page:nth-child(' + page + ') box cover');
		for (var i = 0; i < boxes.length; i++)
			reset(boxes[i]);
	}
	static switchPage(page, animationStop) {
		if (ui.page == page || ui.switchingPage)
			return;
		ui.switchingPage = true;
		var pageNew = ui.q('body>page:nth-child(' + page + ')');
		var pageCurrent = ui.q('body>page:nth-child(' + ui.page + ')');
		var back = ui.page > page;
		ui.on(back ? pageCurrent : pageNew, 'transitionend', function () {
			if (ui.page)
				ui.resetPage(ui.page);
			pageNew.style.transition = '';
			ui.page = page;
			ui.q('body>page:nth-child(' + page + ') timer').style.transition = 'all ' + ui.animationDuration / 1000 + 's linear';
			ui.q('body>page:nth-child(' + page + ') timer').style.right = 0;
			clearTimeout(ui.animation);
			if (animationStop || ui.page == ui.qa('body>page').length)
				ui.q('body>page:nth-child(' + page + ') timer').style.display = 'none';
			else
				ui.animation = setTimeout(navigation.next, ui.animationDuration);
			ui.uncoverBox('body>page:nth-child(' + page + ')');
		}, true);
		if (back) {
			pageNew.style.transition = 'none';
			pageNew.style.opacity = 1;
			pageCurrent.style.opacity = 0;
		} else
			pageNew.style.opacity = 1;
		var index = ui.qa('index point');
		for (var i = 0; i < index.length; i++)
			index[i].setAttribute('class', page == i + 1 ? 'selected' : '');
	}
	static init() {
		window.onresize = ui.resize;
		ui.resize();
		ui.switchPage(1);
		ui.setLanguage('DE');
	}
	static resize() {
		var x = ui.q('body').offsetWidth / 72;
		if (x < 14)
			x = 14;
		else if (x > 24)
			x = 24;
		ui.q('body').style.fontSize = parseInt('' + x) + 'px';
	}
	static setLanguage(language) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
					var e = ui.qa('[l]'), labels = JSON.parse(xmlhttp.responseText), id, s;
					for (var i = 0; i < e.length; i++) {
						id = e[i].getAttribute('l');
						s = labels[id];
						if (!s && id.indexOf('.') > 0) {
							var s2 = id.split('.');
							if (labels[s2[0]])
								s = labels[s2[0]][s2[1]];
						}
						e[i].innerHTML = s + (e[i].nodeName == 'BOX' ? '<cover></cover>' : '');
					}
				} else
					alert(xmlhttp.responseText);
			}
		};
		xmlhttp.open('GET', 'js/lang/' + language + '.json', true);
		xmlhttp.send();
	}
}