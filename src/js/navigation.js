import { ui } from "./ui";

export { navigation };

class navigation {
	static popup(parent) {
		ui.q(parent).setAttribute('class', '');
		var e = ui.q(parent == 'legal' ? 'info>popup' : 'legal>popup');
		if (e.style.transform.indexOf('1') > 0)
			e.style.transform = 'scale(0)';
		e = ui.q(parent + '>popup').style;
		setTimeout(function () {
			e.transform = e.transform && e.transform.indexOf('1') > 0 ? 'scale(0)' : 'scale(1)';
		}, 100);
	}
	static next(animationStop) {
		var i = ui.page + 1;
		if (i > ui.qa('body>page').length) {
			if (ui.q('info.pulse')) {
				navigation.popup('info');
				return;
			}
			i = 1;
		}
		ui.switchPage(i, animationStop);
	}
	static previous(animationStop) {
		var i = ui.page - 1;
		ui.switchPage(i < 1 ? ui.qa('body>page').length : i, animationStop);
	}
}
