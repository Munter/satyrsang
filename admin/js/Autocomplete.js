/*
	Name: Contact information autocompletion
	Author: Peter Müller, B-one Aps.
	Copyright: B-one Aps.
	Version: 1.2
	
	ALL RIGHTS RESERVED
*/

/*
	TODO:
		X Focus input after snatching focus on mousedown on the suggestions
		X Find a better way to handle the currently active AddressBookEntry
		X Fix comma completion, apparently doesnt work when using attribute event handler
		X Make the input not add a comma to the value when pressing comma for completion
		X Make the sugest box scroll when using up/down to change active element
		X Konqueror doesnt hide the non-matching elements on the first filter pass
		X Pressing the scrollbar in the suggestion list triggers mousedown handler. Add container with overflow to avoid
		X Find out why Safari bugs on this. Apparently stops event execution in the keypress handler
		X Disable the mouseover handler on suggestions while using keys to scroll. Mouseover handler resets active element, very annoying
		X Prevent the mouseover event when suggestions are scrolled by keyboard. Mouse focuses the one it's hovering making jump
		X Make a min-height for IE so the suggestion box isnt always equal height if there are fewer suggestions
		X Add pageup/pagedown functionality in the dropdown
		X Make IE put the cursor in the end of the input when an input calls register()
		X Make mousedown on the suggestions only complete if it was a leftclick
		X IE up/down/tab/pgup/pgdown keystrokes dont work
		X Make Safari put the cursor in the end of the input when an input calls register()
		
*/

AddressBookEntry.prototype = {
	filter : function(regex) {
		if ((this.data.name && this.data.name.match(regex)) || (this.data.mail && this.data.mail.match(regex))) {
			var _text = '';
			if (this.type == 'name') _text = '"' + this.data.name.replace(regex, '<strong>$1</strong>') + '" &lt;' + this.data.mail.replace(regex, '<strong>$1</strong>') + '&gt;';
			if (this.type == 'group') _text = '"' + this.data.name.replace(regex, '<strong>$1</strong>') + '"';
			if (this.type == 'mail') _text = '&lt;' + this.data.mail.replace(regex, '<strong>$1</strong>') + '&gt;';
			this.domref.innerHTML = _text;
			this.show();
			return true;
		} else {
			this.hide();
			return false;
		}
	},
	
	getMailString : function() {
		if (this.type == 'name') return '"' + this.data.name + '" <' + this.data.mail + '>';
		if (this.type == 'group') return '"' + this.data.name + '"';
		if (this.type == 'mail') return '<' + this.data.mail + '>';
	},
	
	hide : function() {
		this.domref.className = this.domref.className.replace(/( ?hide)?/,' hide ');
		this.shown = false;
	},
	
	show : function() {
		this.domref.className = this.domref.className.replace(/ ?hide/,'');
		this.shown = true;
	},
	
	setActive : function() {
		this.domref.className += ' active';
		this.active = true;
	},
	
	unsetActive : function() {
		this.domref.className = this.domref.className.replace(/ ?active/,'');
		this.active = false;
	}
}

function AddressBookEntry(data, parent, index) {
	this.data = data;
	this.index = index;
	this.type = function() {
		if (data.name && data.mail) return 'name';
		if (data.name && !data.mail) return 'group';
		if (!data.name && data.mail) return 'mail';
	}();
	
	this.domref = document.createElement('li');
	this.domref.className = this.type;
	this.domref.parent = this;
	this.domref.appendChild(document.createTextNode(this.getMailString()));
	parent.appendChild(this.domref);
}

/******/

AddressBook.prototype = {
	toString : function() { return '[object AddressBook]'; },
	container : null,
	domref : null,
	active : {ref:null,shownIndex:-1},
	entries : [], // AddressBookEntry array
	shown : [], // int array.
	hidden : [], // int array
	visible : false,
	oldFilterString : '',
	entryHeight : 0,
	suggestionLimit : 10,
	suggestionPadding : 4,
	filterTimeout : null,
	hideTimeout : null,
	mousedownSet : false,
	
	show : function() {
		this.container.style.height = (this.shown.length > this.suggestionLimit) ? this.container.style.height = this.suggestionLimit * this.entryHeight + this.suggestionPadding + 'px' : '';
		this.container.style.display = 'block';
		this.visible = this.input.suggestion = true;
	},
	
	hide : function(craphack) {
		this.container.style.display = '';
		this.visible = false;
		if (!craphack) this.input.suggestion = false;
	},
	
	down : function() {
		if (this.active.shownIndex < (this.shown.length - 1)) {
			this.unsetMouseover();
			this.newActive(this.active.shownIndex + 1);
		}
	},
	
	up : function() {
		if (this.active.shownIndex > 0) {
			this.unsetMouseover();
			this.newActive(this.active.shownIndex - 1);
		}
	},
	
	pgDown : function() {
		this.unsetMouseover();
		if (this.active.shownIndex < (this.shown.length - 1 - this.suggestionLimit)) {
			this.newActive(this.active.shownIndex + this.suggestionLimit);
		} else {
			this.newActive(this.shown.length - 1);
		}
	},
	
	pgUp : function() {
		this.unsetMouseover();
		if (this.active.shownIndex > this.suggestionLimit) {
			this.newActive(this.active.shownIndex - this.suggestionLimit);
		} else {	
			this.newActive(0);
		}
	},
	
	cleanUp : function() {
		this.input.value = this.input.value.replace(/[,\s]*$/,'');
		//addressbook.writeln('Cleanup called'); // DEBUG
	},
	
	resetActive : function() {
		if (this.active.ref && this.active.ref.shown) {
			for (var i = 0; i < this.shown.length; i++) {
				if (this.shown[i] == this.active.ref.index) {
					this.newActive(i);
					break;
				}
			}
		} else if (this.shown.length) {
			this.newActive(0);
		}
	},
	
	reset : function() {
		if (this.hidden.length) {
			while (this.hidden.length) this.shown.push(this.hidden.pop());
			this.shown.sort(function(a,b){return parseInt(a) - parseInt(b);}); //numeric sort so the first item is selected
			//addressbook.writeln('Resetting to filter ALL','#900'); // DEBUG
		}
	},
	
	setCaretToEnd : function() {
		if (this.input.setSelectionRange) { // Gecko
			this.input.setSelectionRange(this.input.value.length, this.input.value.length);
		} else if (this.input.createTextRange) { // IE
			var range = this.input.createTextRange();
			range.moveEnd('character', this.input.value.length);
			range.moveStart('character', this.input.value.length);
			range.select();
		} else { // Others
			var _val = this.input.value;
			this.input.value += ' ';
			this.input.value = _val;
		}
	},
	
	register : function(objHTMLElement) {
		this.input = objHTMLElement;
		this.container.style.left = objHTMLElement.offsetLeft + 'px';
		this.container.style.top = objHTMLElement.offsetTop + objHTMLElement.offsetHeight + 'px';
		if (typeof this.input.suggestion == 'undefined') this.input.suggestion = false;
		if (this.input.value) {
			var _this = this;
			if (!this.input.suggestion) { // There is no suggestion for matching address
				window.setTimeout(function(){
					_this.input.value =  _this.input.value.replace(/(, *)?$/,', ');
					_this.setCaretToEnd();
				}, 1);
			} else { // There is a suggestion for matching address
				this.reset();
				this.oldFilterString = '';
				window.setTimeout(function(){
					_this.setCaretToEnd();
					_this.filter(_this.input.value);
				}, 1);
			}
		}
		//addressbook.writeln('Register called'); // DEBUG
	},
	
	filter : function(strInput) {
		window.clearTimeout(this.filterTimeout);
		var _input = strInput.split(',').pop().replace(/^[\"<\s]*/,'');
		
		if (!_input) { // There is no pattern to match. Skip
			this.oldFilterString = _input;
			this.hide();
			this.reset();
			return false;
		} else if (!this.oldFilterString) { // This needs to be set on first run
			this.oldFilterString = _input;
		} else if (_input == this.oldFilterString){ // The user hit a key that doesnt change the input. ignore
			return false;
		} else if (!this.visible && this.oldFilterString == _input.substr(0,this.oldFilterString.length)) { // The input is a stricter version of a pattern that was not matched previously. Skip
			return false;
		} else if (this.oldFilterString != _input.substr(0,this.oldFilterString.length)) { // The input is a less strict version of a pattern that was matched previously. Run filter on all items
			this.reset();
			var _ref = this;
			this.filterTimeout = window.setTimeout(function(){_ref.runFilter(_input); }, 400); // Delay so the filter wont run all the time when deleting stuff
			//addressbook.writeln('Set timeout "'+this.filterTimeout+'" to 400ms'); // DEBUG
			this.oldFilterString = _input;
			return false;
		}
		
		//addressbook.writeln('Old Filter String = "'+this.oldFilterString+'"'); // DEBUG
		this.runFilter(_input);
		this.oldFilterString = _input;
	},
	
	runFilter : function(strInput) {
		var _regex = new RegExp('(' + strInput.replace(/(\*|\?|\^|\$|\+|\.|\(|\)|\||\{|\}|\,|\[|\]|\\|\/)/gi,'\\$1') + ')','gi');
		
		for (var i = this.shown.length-1; i >= 0; i--) {
			if (!this.entries[this.shown[i]].filter(_regex)) {
				this.hidden.push(this.shown.splice(i,1));
			}
		}
		this.shown.length ? this.show() : this.hide();
		this.resetActive();
		addressbook.writeln('Filtering with "'+strInput+'"','#090'); // DEBUG
	},
	
	newActive : function(intShownIndex) {
		if (this.active.ref) this.active.ref.unsetActive();
		this.active.shownIndex = intShownIndex;
		this.active.ref = this.entries[this.shown[this.active.shownIndex]];
		this.active.ref.setActive();
		
		var item = this.active.ref.domref;
		if (item.offsetTop + item.offsetHeight > this.container.scrollTop + this.container.offsetHeight) {
			this.container.scrollTop = item.offsetTop + item.offsetHeight - this.container.offsetHeight + 5;
		}
		if (item.offsetTop < this.container.scrollTop) {
			this.container.scrollTop = item.offsetTop - 1;
		}
		
	},
	
	complete : function() {
		if (this.input.suggestion) {
			var _input = this.input.value.replace(/,$/,('')).split(/,\s*/);
			var _last = _input.pop();
			_last = this.active.ref.getMailString();
			_input.push(_last);
			this.input.value = _input.join(', ') + ', ';
			this.setCaretToEnd();
			this.oldFilterString = '';
			var _focus = this.input;
			window.setTimeout(function(){_focus.focus();}, 1);
			this.hide();
			this.reset();
			this.input.suggestion = false;
			return false;
		}
	},
	
	mouseover : function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		if (target === this) return false; // The event happened on the Container itself. Ignore
		while (target.parentNode != this) target = target.parentNode; // The event happened on a child element of an Item. Walk up the tree to the Item.
		var item = target.parent;
		
		for (var i = 0; i < this.parent.shown.length; i++) {
			if (this.parent.shown[i] == item.index) {
				this.parent.newActive(i);
				break;
			}
		}
	},
	
	mousedown : function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		if (target === this) return false; // The event happened on the Container itself. Ignore
		addressbook.writeln(e.button); // DEBUG 
		
		if ((this.parent.isIE && e.button == 1) || e.button == 0 || this.parent.isSafari) this.parent.complete(); // Only on left click;
	},
	
	unfocus : function() {
		this.input.suggest = this.visible;
		this.cleanUp();
		var _adr = this;
		this.hideTimeout = window.setTimeout(function(){_adr.hide(true);}, 10);
	},
	
	wrapperMousedown : function() {
		var _timeout = 10; // IE
		if (navigator.appName.match('Opera')) _timeout = 1;
		var _adr = this.parent;
		window.setTimeout(function(){window.clearTimeout(_adr.hideTimeout);}, _timeout);
	},
	
	setMouseover : function() {
		if (!this.mousedownSet) {
			Events.attach(this.domref, 'mouseover', this.mouseover);
			this.mousedownSet = true;
		}
	},
	
	unsetMouseover : function() {
		if (this.isGecko) {
			Events.detach(this.domref, 'mouseover', this.mouseover);
			this.mousedownSet = false;
		}
	}
}

function AddressBook(data, objHTMLInputElement) {
	/*@cc_on this.isIE = true; @*/ // IE detection
	this.isGecko = (document.getBoxObjectFor!=null); // Gecko detection
	this.isSafari = (document.childNodes)&&(!document.all)&&(!navigator.taintEnabled)&&(!navigator.accentColorName); 
	
	this.container = document.createElement('div');
	this.container.id = 'addressesWrap';
	this.container.parent = this;
	this.domref = document.createElement('ul');
	this.domref.id = 'addresses';
	this.domref.parent = this;
	this.container.appendChild(this.domref);
	document.body.appendChild(this.container);
	
	for (var i = 0; i < data.length; i++) {
		this.entries.push(new AddressBookEntry(data[i], this.domref, i));
		this.shown.push(i);
	}
	
	this.container.style.visibility = 'hidden';
	this.container.style.display = 'block';
	if (this.entries[0]) this.entryHeight = this.entries[0].domref.offsetHeight;
	this.container.style.display = '';
	this.container.style.visibility = '';
	this.container.style.maxHeight = this.suggestionLimit * this.entryHeight + this.suggestionPadding + 'px'
	
	if (this.isGecko) {
		var _this = this;
		Events.attach(this.domref, 'mousemove', function(){_this.setMouseover();}); // Jumping through hoops so FF wont change active element while using up/down to scroll suggestions
	} else {
		Events.attach(this.domref, 'mouseover', this.mouseover);
	}
	Events.attach(this.domref, 'mousedown', this.mousedown);
	Events.attach(this.container, 'mousedown', this.wrapperMousedown); // Not needed in FF, test which browsers need it
}

/******/

AutoComplete.prototype = {
	toString : function() { return '[Object AutoComplete]'; },
	domref : null,
	isIE : false,
	
	keyControl : function(e) {
		e = e || window.event;
		var key = this.IEKey || e.keyCode;
		this.IEKey = null;
		
		//autocomplete.writeln('keycontrol keyCode : ' + key); // DEBUG
		
		switch (key) {
			case 27 : // ESC
				this.parent.addressbook.hide();
				return false;
			
			case 33 : // Page up
			case 63276 : // Page up, Safari
				this.parent.addressbook.pgUp();
				return false;
			
			case 34 : // Page down
			case 63277 : // Page up, Safari
				this.parent.addressbook.pgDown();
				return false;
			
			case 38 : // up
			case 63232 : // up, Safari
				this.parent.addressbook.up();
				return !this.suggestion; // Only return false if there is a suggestion. MacOS uses up/down to move the caret to end/home
				
			case 40 : // down
			case 63233 : // down, Safari
				this.parent.addressbook.down();
				return !this.suggestion; // Only return false if there is a suggestion. MacOS uses up/down to move the caret to end/home
				
			case 9 : // tab
			case 13 : // enter
			case 188 : // comma
			case 44 : // comma
				return this.parent.addressbook.complete();
				
			default: 
				//autocomplete.writeln('Event keycode: ' + e.keyCode); // DEBUG
		}

		return true;
	},
	
	keyup : function() { this.parent.addressbook.filter(this.value); },
	
	keydown : function(e) {
		e = e || window.event;
		switch (e.keyCode) {
			case 27 : // ESC
			case 33 : // Page up
			case 34 : // Page down
			case 38 : // up
			case 40 : // down
			case 9 : // tab
				autocomplete.writeln('keydown keyCode : ' + e.keyCode);
				this.IEKey = e.keyCode;
				this.onkeypress();
			default :
		}
	},
	
	register : function() { this.parent.addressbook.register(this); },
	
	hide : function() { this.parent.addressbook.unfocus(); },
	
	destruct : function() {
		
	}
}

function AutoComplete(objHTMLInputElement, objAddressBook) {
	/*@cc_on this.isIE = true; @*/
	this.domref = objHTMLInputElement;
	this.domref.parent = this;
	this.domref.setAttribute("autocomplete","off");
	this.domref.suggestion = false;
	this.addressbook = objAddressBook;
	//this.addressbook.register(this.domref); // makes no sense when having multible inputs. trigger the registering by focus()
	
	Events.attach(this.domref, 'focus', this.register);
	Events.attach(this.domref, 'blur', this.hide);
	Events.attach(this.domref, 'keyup', this.keyup);
	//Events.attach(this.domref, 'keypress', this.keyControl); // Can't return false on an event handler attached like this
	this.domref.onkeypress = this.keyControl;
	
	if (this.isIE) Events.attach(this.domref, 'keydown', this.keydown); // IE only handles all keyCodes on keydown
}

/******/

window.onload = function() {
	Adr = new AddressBook(Data);
	new AutoComplete(document.getElementById('authorInput'), Adr);
	
	document.getElementById('title').focus();
}
