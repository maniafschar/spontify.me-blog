const { navigation } = require("./navigation");

export { ui };

class ui {
	static page = 1;
	static switchingPage = false;
	static animation;
	static animationDuration = 10000;
	static language = 'DE';

	static q(path) {
		return document.querySelector(path);
	}
	static qa(path) {
		return document.querySelectorAll(path);
	}
	static on(e, type, f, once) {
		e.addEventListener(type, f, { capture: type == 'touchstart' ? true : false, passive: true, once: once == true ? true : false });
	}
	static swipe(e, exec) {
		ui.on(e, 'touchstart', function (event) {
			e.startX = event.changedTouches[0].pageX;
			e.startY = event.changedTouches[0].pageY;
			e.startTime = new Date().getTime();
		});
		ui.on(e, 'touchend', function (event) {
			var distX = event.changedTouches[0].pageX - e.startX;
			var distY = event.changedTouches[0].pageY - e.startY;
			var elapsedTime = new Date().getTime() - e.startTime;
			var swipedir = 'none', threshold = 60, restraint = 2000, allowedTime = 1000;
			if (elapsedTime <= allowedTime) {
				if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint)
					swipedir = distX < 0 ? 'left' : 'right';
				else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint)
					swipedir = distY < 0 ? 'up' : 'down';
			}
			exec(swipedir, event);
		});
	}
	static positionBox(e, position) {
		var x = e.offsetLeft, y = e.offsetTop, h = e.offsetHeight, w = e.offsetWidth, hTotal = ui.q('body').offsetHeight, wTotal = ui.q('body').offsetWidth, r;
		var inPercent = function (x, total) {
			return (x / total * 100) + '%';
		}
		var fontSize = parseInt(ui.q('body').style.fontSize);
		if (position.indexOf('bottom') > -1) {
			if (e.getAttribute('class').indexOf('text') > -1)
				y += 3 * fontSize;
			w = (wTotal - w) / 2;
			e.style.top = inPercent(y, hTotal);
			e.style.left = inPercent(w, wTotal);
			e.style.right = e.style.left;
			e.style.bottom = inPercent(hTotal - y, hTotal);
			r = inPercent(hTotal - h - y, hTotal);
		} else if (position.indexOf('right') > -1) {
			if (e.getAttribute('class').indexOf('text') > -1)
				y += 3 * fontSize;
			e.style.top = inPercent(y, hTotal);
			e.style.right = inPercent(wTotal - x, wTotal);
			e.style.left = inPercent(x, wTotal);
			e.style.bottom = inPercent(hTotal - y - h, hTotal);
			r = inPercent(wTotal - x - w, wTotal);
		} else if (position.indexOf('top') > -1) {
			if (e.getAttribute('class').indexOf('text') > -1)
				y += 3 * fontSize;
			w = (wTotal - w) / 2;
			e.style.top = inPercent(y + h, hTotal);
			e.style.left = inPercent(w, wTotal);
			e.style.right = e.style.left;
			e.style.bottom = inPercent(hTotal - y - h, hTotal);
			r = inPercent(y, hTotal);
		} else if (position.indexOf('left') > -1) {
			if (e.getAttribute('class').indexOf('text') > -1)
				y += 3 * fontSize;
			e.style.top = inPercent(y, hTotal);
			e.style.left = inPercent(x + w, wTotal);
			e.style.right = inPercent(wTotal - x - w, wTotal);
			e.style.bottom = inPercent(hTotal - y - h, hTotal);
			r = inPercent(x, wTotal);
		}
		e.style.visibility = 'visible';
		return r;
	}
	static uncoverBox(page) {
		var position = ui.q('body>page:nth-child(' + page + ')').getAttribute('class');
		var boxes = ui.qa('body>page:nth-child(' + page + ') box');
		var animate = function (e, x) {
			setTimeout(function () {
				e.style.transition = 'all .7s ease-out';
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
		for (var i = 0; i < boxes.length; i++) {
			ui.on(boxes[i], 'transitionend', function () {
				this.style.transition = null;
				var e2;
				for (var i = 0; i < this.children.length; i++) {
					if (this.children[i].nodeName == 'COVER') {
						e2 = this.children[i];
						break;
					}
				}
				ui.on(e2, 'transitionend', function () {
					ui.switchingPage = false;
					this.style.transition = null;
				}, true);
				e2.style.transition = 'all .7s ease-out';
				if (position.indexOf('bottom') > -1)
					e2.style.top = '100%';
				else if (position.indexOf('right') > -1)
					e2.style.left = '100%';
				else if (position.indexOf('top') > -1)
					e2.style.bottom = '100%';
				else if (position.indexOf('left') > -1)
					e2.style.right = '100%';
			}, true);
			animate(boxes[i], boxes[i].getAttribute('class').indexOf('image') < 0 ? ui.positionBox(boxes[i], position) : '0px');
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
		ui.q('body>page:nth-child(' + page + ')>div').style.display = 'none';
		ui.q('body>page:nth-child(' + page + ')').style.opacity = 0;
		ui.q('body>page:nth-child(' + page + ') timer').style.transition = '';
		ui.q('body>page:nth-child(' + page + ') timer').style.right = '100%';
		var boxes = ui.qa('body>page:nth-child(' + page + ') box');
		for (var i = 0; i < boxes.length; i++)
			reset(boxes[i]);
		boxes = ui.qa('body>page:nth-child(' + page + ') box cover');
		for (var i = 0; i < boxes.length; i++)
			reset(boxes[i]);
		ui.q('body>page:nth-child(' + page + ')>div').style.display = null;
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
			pageNew.style.transition = null;
			ui.page = page;
			clearTimeout(ui.animation);
			if (animationStop || ui.page == ui.qa('body>page').length)
				ui.q('body>page:nth-child(' + page + ') timer').style.display = 'none';
			else {
				ui.q('body>page:nth-child(' + page + ') timer').style.transition = 'all ' + ui.animationDuration / 1000 + 's linear';
				ui.q('body>page:nth-child(' + page + ') timer').style.right = 0;
				ui.animation = setTimeout(navigation.next, ui.animationDuration);
			}
			ui.uncoverBox(page);
			if (pageCurrent)
				pageCurrent.style.opacity = 0;
		}, true);
		if (back) {
			pageNew.style.transition = 'none';
			pageNew.style.opacity = 1;
			pageCurrent.style.opacity = 0;
		} else
			pageNew.style.opacity = 1;
		var indexPoints = ui.qa('index point');
		for (var i = 0; i < indexPoints.length; i++)
			indexPoints[i].setAttribute('class', page == i + 1 ? 'selected' : '');
	}
	static init() {
		window.onresize = ui.resize;
		var swipe = function (dir) {
			if (dir == 'left')
				navigation.next(true);
			else if (dir == 'right')
				navigation.previous(true);
		}
		var e = ui.qa('navigation');
		for (var i = 0; i < e.length; i++)
			ui.swipe(e[i], swipe);
		ui.resize();
		ui.setLanguage(ui.language);
	}
	static resize() {
		var w = ui.q('body').offsetWidth, x = w / 72;
		if (x < 14)
			x = 14;
		else if (x > 24)
			x = 24;
		ui.q('body').style.fontSize = parseInt('' + x) + 'px';
		var e = ui.qa('body>page'), classes = ['bottom', 'right', 'top', 'left'];
		for (var i = 0; i < e.length; i++) {
			e[i].classList.remove('bottom');
			e[i].classList.remove('right');
			e[i].classList.remove('top');
			e[i].classList.remove('left');
			if (w > 600)
				e[i].classList.add(classes[i % 4]);
			else
				e[i].classList.add('bottom');
		}
	}
	static setLanguage(language) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
					var firstCall = !ui.q('[l]').innerHTML;
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
					ui.language = language;
					ui.q('language').innerHTML = language == 'DE' ? 'EN' : 'DE';
					var page = ui.page;
					ui.page = 0;
					ui.resetPage(page);
					setTimeout(function () { ui.switchPage(page, firstCall || ui.animation ? false : true); }, 400);
				} else
					alert(xmlhttp.responseText);
			}
		};
		xmlhttp.open('GET', 'js/lang/' + language + '.json', true);
		xmlhttp.send();
	}
	static toggleLanguage() {
		if (!ui.switchingPage)
			ui.setLanguage(ui.language == 'DE' ? 'EN' : 'DE');
	}
}