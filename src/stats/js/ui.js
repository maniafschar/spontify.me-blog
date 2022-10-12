export { ui };

class ui {
	static language;
	static init() {
		window.onresize = ui.resize;
		var options = {
			chart: {
				type: 'line'
			},
			series: [{
				name: 'sales',
				data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
			}],
			xaxis: {
				categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
			}
		}
		var chart = new ApexCharts(ui.q("chart.no1"), options);
		chart.render();
		ui.language = (navigator.language || '').toLowerCase().indexOf('en') > -1 ? 'DE' : 'EN';
		ui.setLanguage();
		ui.resize();
	}
	static q(path) {
		return document.querySelector(path);
	}
	static qa(path) {
		return document.querySelectorAll(path);
	}
	static on(e, type, f, once) {
		e.addEventListener(type, f, { capture: type == 'touchstart' ? true : false, passive: true, once: once == true ? true : false });
	}
	static setLanguage() {
		var language = ui.language == 'EN' ? 'DE' : 'EN';
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
					ui.language = language;
					ui.q('language').innerHTML = language == 'DE' ? 'EN' : 'DE';
				}
			}
		};
		xmlhttp.open('GET', 'js/lang/stats' + language + '.json', true);
		xmlhttp.send();
	}
	static resize() {
		var x = Math.min(screen.width, screen.height) / 53;
		if (x < 11)
			x = 11;
		else if (x > 24)
			x = 24;
		ui.q('body').style.fontSize = parseInt('' + x) + 'px';
	}
}