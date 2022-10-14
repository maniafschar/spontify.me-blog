export { ui };

class ui {
	static labels;
	static language;
	static chartAge;
	static chartGender;
	static chartLog;
	static init() {
		window.onresize = ui.resize;
		ui.language = (navigator.language || '').toLowerCase().indexOf('en') > -1 ? 'DE' : 'EN';
		ui.setLanguage();
		ui.resize();
	}
	static initCharts(data) {
		var d = new Date(data.update);
		ui.q('update').innerHTML = ui.labels.headerUpdate.replace('{date}', d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes())
		ui.initChartGender(data.user);
		ui.initChartAge(data.user);
		ui.initChartLog(data.log);
	}
	static initChartGender(data) {
		var index = {}, total = [0, 0, 0, 0], verified = [0, 0, 0, 0], withImage = [0, 0, 0, 0], genderMap = [2, 1, 3, null];
		for (var i = 0; i < data[0].length; i++)
			index[data[0][i]] = i;
		for (var i = 1; i < data.length; i++) {
			var x = data[i][index['_count']] / 1000;
			for (var i2 = 0; i2 < genderMap.length; i2++) {
				if (data[i][index['contact.gender']] == genderMap[i2]) {
					total[i2] += x;
					if (data[i][index['contact.verified']])
						verified[i2] += x;
					if (data[i][index['_image']])
						withImage[i2] += x;
				}
			}
		}
		for (var i = 0; i < total.length; i++) {
			total[i] = (parseInt(total[i] * 10 + 0.5) / 10);
			verified[i] = (parseInt(verified[i] * 10 + 0.5) / 10);
			withImage[i] = (parseInt(withImage[i] * 10 + 0.5) / 10);
		}
		if (ui.chartGender) {
			ui.chartGender.destroy();
			ui.q("chart.gender").innerHTML = '';
		}
		ui.chartGender = new ApexCharts(ui.q("chart.gender"), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			plotOptions: {
				bar: {
					horizontal: true
				}
			},
			dataLabels: {
				enabled: true,
				textAnchor: 'start',
				formatter: function (val, opt) {
					return val + '%'
				},
				offsetX: 0,
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.labels.total,
				data: total
			},
			{
				name: ui.labels.verified,
				data: verified
			},
			{
				name: ui.labels.withImage,
				data: withImage
			}],
			labels: [ui.labels.female, ui.labels.male, ui.labels.divers, ui.labels.noData]
		});
		ui.chartGender.render();
	}
	static initChartAge(data) {
		var index = {}, female = [0, 0, 0, 0, 0, 0, 0], male = [0, 0, 0, 0, 0, 0, 0], divers = [0, 0, 0, 0, 0, 0, 0], noData = [0, 0, 0, 0, 0, 0, 0], genderMap = [2, 1, 3, null];
		for (var i = 0; i < data[0].length; i++)
			index[data[0][i]] = i;
		for (var i = 1; i < data.length; i++) {
			var x = data[i][index['_count']] / 1000, i2;
			if (data[i][index['_age']] == null)
				i2 = male.length - 1;
			else
				i2 = data[i][index['_age']] - 2;
			if (i2 < 0)
				i2 = 0;
			else if (i2 > male.length - 1)
				i2 = male.length - 1;
			if (data[i][index['contact.gender']] == 1)
				male[i2] += x;
			else if (data[i][index['contact.gender']] == 2)
				female[i2] += x;
			else if (data[i][index['contact.gender']] == 3)
				divers[i2] += x;
			else
				noData[i2] += x;
		}
		for (var i = 0; i < female.length; i++) {
			female[i] = parseInt(0.5 + female[i]);
			male[i] = parseInt(0.5 + male[i]);
			divers[i] = parseInt(0.5 + divers[i]);
			noData[i] = parseInt(0.5 + noData[i]);
		}
		if (ui.chartAge) {
			ui.chartAge.destroy();
			ui.q("chart.age").innerHTML = '';
		}
		ui.chartAge = new ApexCharts(ui.q("chart.age"), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			dataLabels: {
				formatter: function (val, opt) {
					return val + '%'
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.labels.female,
				data: female
			},
			{
				name: ui.labels.male,
				data: male
			},
			{
				name: ui.labels.divers,
				data: divers
			},
			{
				name: ui.labels.noData,
				data: noData
			}],
			labels: [ui.labels.until + ' 20', '20-30', '30-40', '40-50', '50-60', ui.labels.from + ' 60', ui.labels.noData]
		});
		ui.chartAge.render();
	}
	static initChartLog(data) {
		var index = {}, log = [], total = 0;
		for (var i = 0; i < data[0].length; i++)
			index[data[0][i]] = i;
		for (var i = 0; i < 20; i++)
			log.push({ label: i + 1, value: 0 });
		for (var i = 1; i < data.length; i++) {
			var c = data[i][index['_count']];
			if (data[i][index['_time']] > log[log.length - 1].label)
				log[log.length - 1].value += c;
			else {
				for (var i2 = 0; i2 < log.length; i2++) {
					if (data[i][index['_time']] <= log[i2].label) {
						log[i2].value += c;
						break;
					}
				}
			}
			total += c;
		}
		var labels = [], values = [];
		for (var i = 0; i < log.length; i++) {
			values.push(parseInt(((log[i].value + 0.5) / total) * 100));
			labels.push((i == log.length - 1 ? ui.labels.from + ' ' : '') + (log[i].label * 10));
		}
		if (ui.chartLog) {
			ui.chartLog.destroy();
			ui.q("chart.log").innerHTML = '';
		}
		ui.chartLog = new ApexCharts(ui.q("chart.log"), {
			chart: {
				type: 'line',
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.labels.responseTime,
				data: values
			}],
			labels: labels
		});
		ui.chartLog.render();
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
					var e = ui.qa('[l]'), id, s;
					ui.labels = JSON.parse(xmlhttp.responseText);
					for (var i = 0; i < e.length; i++)
						e[i].innerHTML = ui.labels[e[i].getAttribute('l')] + (e[i].nodeName == 'BOX' ? '<cover></cover>' : '');
					ui.language = language;
					ui.q('language').innerHTML = language == 'DE' ? 'EN' : 'DE';
					xmlhttp = new XMLHttpRequest();
					xmlhttp.onreadystatechange = function () {
						if (xmlhttp.readyState == 4 && xmlhttp.status >= 200 && xmlhttp.status < 300)
							ui.initCharts(JSON.parse(xmlhttp.responseText));
					};
					xmlhttp.open('GET', 'statistics.json', true);
					xmlhttp.send();
				}
			}
		};
		xmlhttp.open('GET', 'js/lang/stats' + language + '.json', true);
		xmlhttp.send();
	}
	static resize() {
		var x = Math.max(window.innerWidth, window.innerHeight) / 53;
		if (x < 12)
			x = 12;
		else if (x > 24)
			x = 24;
		ui.q('body').style.fontSize = parseInt('' + x) + 'px';
	}

	static popup(parent) {
		ui.q(parent).setAttribute('class', '');
		var e = ui.q(parent + '>popup').style;
		setTimeout(function () {
			e.transform = e.transform && e.transform.indexOf('1') > 0 ? 'scale(0)' : 'scale(1)';
		}, 100);
	}
}