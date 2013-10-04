Events = {
	_events: new Array(),
	_cleanup: new Array(),
	
	attach: function(obj, type, fn) {
		if (obj === window && type == 'unload') {
			this._cleanup[this._cleanup.length] = {
				obj: obj,
				type: type,
				fn: fn
			}
		} else {
			if (obj.addEventListener) {
				obj.addEventListener(type, fn, false);
			} else if(obj.attachEvent) {
				obj["e" + type + fn] = fn;
				obj[type + fn] = function() {
					var evt = window.event;
					evt.target = evt.srcElement;
					obj["e" + type + fn](evt);
				}
				obj.attachEvent("on" + type, obj[type + fn]);
			}
			this._events[this._events.length] = {
				obj: obj,
				type: type,
				fn: fn
			}
		}
	},
	
	detach: function(obj, type, fn, cleanup) {
		if (obj === window && type == 'unload') {
			for (var i = 0; i < this._cleanup.length; i++) {
				if (this._cleanup[i].fn == fn) {
					this._cleanup.splice(i, 1);
					break;
				}
			}
		} else {
			if (obj.removeEventListener) {
				obj.removeEventListener(type, fn, false);
			} else if(obj.detachEvent) {
				obj.detachEvent("on" + type, obj[type + fn]);
				obj[type + fn] = null;
				obj["e" + type + fn] = null;
			}
			
			if (!cleanup) {
				for (var i = 0; i < this._events.length; i++) {
					if (this._events[i].obj == obj && this._events[i].type == type && this._events[i].fn == fn) {
						this._events.splice(i, 1);
						break;
					}
				}
			}
		}
	},
	
	cleanup: function(e) {
		while (this._cleanup.length) {
			var clean = this._cleanup.pop();
			clean.fn(e);
		}
		
		while (this._events.length) {
			var evt = this._events.pop();
			this.detach(evt.obj, evt.type, evt.fn, true);
			evt = null;
		}
	},
	
	stop: function(e) {
		e = e || window.event;
		if (e) {
			e.cancelBubble = true;
			if (e.stopPropagation) e.stopPropagation();
		}
	}
}

window.onunload = function(e) {
	Events.cleanup(e);
}
