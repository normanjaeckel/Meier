(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.ap.bg === region.ay.bg)
	{
		return 'on line ' + region.ap.bg;
	}
	return 'on lines ' + region.ap.bg + ' through ' + region.ay.bg;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.be,
		impl.by,
		impl.bx,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		bj: func(record.bj),
		aq: record.aq,
		an: record.an
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.bj;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.aq;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.an) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.be,
		impl.by,
		impl.bx,
		function(sendToApp, initialModel) {
			var view = impl.bz;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.be,
		impl.by,
		impl.bx,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.ao && impl.ao(sendToApp)
			var view = impl.bz;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.y);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.p) && (_VirtualDom_doc.title = title = doc.p);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.bm;
	var onUrlRequest = impl.bn;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		ao: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.aN === next.aN
							&& curr.aE === next.aE
							&& curr.aK.a === next.aK.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		be: function(flags)
		{
			return A3(impl.be, flags, _Browser_getUrl(), key);
		},
		bz: impl.bz,
		by: impl.by,
		bx: impl.bx
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { bb: 'hidden', a4: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { bb: 'mozHidden', a4: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { bb: 'msHidden', a4: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { bb: 'webkitHidden', a4: 'webkitvisibilitychange' }
		: { bb: 'hidden', a4: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		aS: _Browser_getScene(),
		aY: {
			a_: _Browser_window.pageXOffset,
			a$: _Browser_window.pageYOffset,
			aZ: _Browser_doc.documentElement.clientWidth,
			aD: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		aZ: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		aD: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			aS: {
				aZ: node.scrollWidth,
				aD: node.scrollHeight
			},
			aY: {
				a_: node.scrollLeft,
				a$: node.scrollTop,
				aZ: node.clientWidth,
				aD: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			aS: _Browser_getScene(),
			aY: {
				a_: x,
				a$: y,
				aZ: _Browser_doc.documentElement.clientWidth,
				aD: _Browser_doc.documentElement.clientHeight
			},
			a9: {
				a_: x + rect.left,
				a$: y + rect.top,
				aZ: rect.width,
				aD: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.P.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.P.b, xhr)); });
		$elm$core$Maybe$isJust(request.aW) && _Http_track(router, xhr, request.aW.a);

		try {
			xhr.open(request.z, request.C, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.C));
		}

		_Http_configureRequest(xhr, request);

		request.y.a && xhr.setRequestHeader('Content-Type', request.y.a);
		xhr.send(request.y.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.l; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.o.a || 0;
	xhr.responseType = request.P.d;
	xhr.withCredentials = request.a1;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		C: xhr.responseURL,
		bu: xhr.status,
		bv: xhr.statusText,
		l: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			bt: event.loaded,
			aT: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			bq: event.loaded,
			aT: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}

// CREATE

var _Regex_never = /.^/;

var _Regex_fromStringWith = F2(function(options, string)
{
	var flags = 'g';
	if (options.bk) { flags += 'm'; }
	if (options.a3) { flags += 'i'; }

	try
	{
		return $elm$core$Maybe$Just(new RegExp(string, flags));
	}
	catch(error)
	{
		return $elm$core$Maybe$Nothing;
	}
});


// USE

var _Regex_contains = F2(function(re, string)
{
	return string.match(re) !== null;
});


var _Regex_findAtMost = F3(function(n, re, str)
{
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex == re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch
				? $elm$core$Maybe$Just(submatch)
				: $elm$core$Maybe$Nothing;
		}
		out.push(A4($elm$regex$Regex$Match, result[0], result.index, number, _List_fromArray(subs)));
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _List_fromArray(out);
});


var _Regex_replaceAtMost = F4(function(n, re, replacer, string)
{
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch
				? $elm$core$Maybe$Just(submatch)
				: $elm$core$Maybe$Nothing;
		}
		return replacer(A4($elm$regex$Regex$Match, match, arguments[arguments.length - 2], count, _List_fromArray(submatches)));
	}
	return string.replace(re, jsReplacer);
});

var _Regex_splitAtMost = F3(function(n, re, str)
{
	var string = str;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		var result = re.exec(string);
		if (!result) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _List_fromArray(out);
});

var _Regex_infinity = Infinity;


function _Url_percentEncode(string)
{
	return encodeURIComponent(string);
}

function _Url_percentDecode(string)
{
	try
	{
		return $elm$core$Maybe$Just(decodeURIComponent(string));
	}
	catch (e)
	{
		return $elm$core$Maybe$Nothing;
	}
}var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.e) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.g),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.g);
		} else {
			var treeLen = builder.e * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.h) : builder.h;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.e);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.g) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.g);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{h: nodeList, e: (len / $elm$core$Array$branchFactor) | 0, g: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {aC: fragment, aE: host, aI: path, aK: port_, aN: protocol, aO: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$Main$GotCampaignList = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$Loading = {$: 0};
var $author$project$Main$Overview = {$: 0};
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$json$Json$Decode$list = _Json_decodeList;
var $dillonkearns$elm_graphql$Graphql$SelectionSet$SelectionSet = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $dillonkearns$elm_graphql$Graphql$RawField$Composite = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$composite = F3(
	function (fieldName, args, fields) {
		return A3($dillonkearns$elm_graphql$Graphql$RawField$Composite, fieldName, args, fields);
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $dillonkearns$elm_graphql$Graphql$Document$Hash$HashData = F4(
	function (shift, seed, hash, charsProcessed) {
		return {M: charsProcessed, Q: hash, I: seed, R: shift};
	});
var $dillonkearns$elm_graphql$Graphql$Document$Hash$c1 = 3432918353;
var $dillonkearns$elm_graphql$Graphql$Document$Hash$c2 = 461845907;
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy = F2(
	function (b, a) {
		return ((a & 65535) * b) + ((((a >>> 16) * b) & 65535) << 16);
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $elm$core$Bitwise$or = _Bitwise_or;
var $dillonkearns$elm_graphql$Graphql$Document$Hash$rotlBy = F2(
	function (b, a) {
		return (a << b) | (a >>> (32 - b));
	});
var $elm$core$Bitwise$xor = _Bitwise_xor;
var $dillonkearns$elm_graphql$Graphql$Document$Hash$finalize = function (data) {
	var acc = (!(!data.Q)) ? (data.I ^ A2(
		$dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy,
		$dillonkearns$elm_graphql$Graphql$Document$Hash$c2,
		A2(
			$dillonkearns$elm_graphql$Graphql$Document$Hash$rotlBy,
			15,
			A2($dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy, $dillonkearns$elm_graphql$Graphql$Document$Hash$c1, data.Q)))) : data.I;
	var h0 = acc ^ data.M;
	var h1 = A2($dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy, 2246822507, h0 ^ (h0 >>> 16));
	var h2 = A2($dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy, 3266489909, h1 ^ (h1 >>> 13));
	return (h2 ^ (h2 >>> 16)) >>> 0;
};
var $elm$core$String$foldl = _String_foldl;
var $dillonkearns$elm_graphql$Graphql$Document$Hash$mix = F2(
	function (h1, k1) {
		return A2(
			$dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy,
			5,
			A2(
				$dillonkearns$elm_graphql$Graphql$Document$Hash$rotlBy,
				13,
				h1 ^ A2(
					$dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy,
					$dillonkearns$elm_graphql$Graphql$Document$Hash$c2,
					A2(
						$dillonkearns$elm_graphql$Graphql$Document$Hash$rotlBy,
						15,
						A2($dillonkearns$elm_graphql$Graphql$Document$Hash$multiplyBy, $dillonkearns$elm_graphql$Graphql$Document$Hash$c1, k1))))) + 3864292196;
	});
var $dillonkearns$elm_graphql$Graphql$Document$Hash$hashFold = F2(
	function (c, data) {
		var res = data.Q | ((255 & $elm$core$Char$toCode(c)) << data.R);
		var _v0 = data.R;
		if (_v0 === 24) {
			return {
				M: data.M + 1,
				Q: 0,
				I: A2($dillonkearns$elm_graphql$Graphql$Document$Hash$mix, data.I, res),
				R: 0
			};
		} else {
			return {M: data.M + 1, Q: res, I: data.I, R: data.R + 8};
		}
	});
var $dillonkearns$elm_graphql$Graphql$Document$Hash$hashString = F2(
	function (seed, str) {
		return $dillonkearns$elm_graphql$Graphql$Document$Hash$finalize(
			A3(
				$elm$core$String$foldl,
				$dillonkearns$elm_graphql$Graphql$Document$Hash$hashFold,
				A4($dillonkearns$elm_graphql$Graphql$Document$Hash$HashData, 0, seed, 0, 0),
				str));
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$Json = function (a) {
	return {$: 1, a: a};
};
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$List = function (a) {
	return {$: 2, a: a};
};
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$Object = function (a) {
	return {$: 3, a: a};
};
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $elm$json$Json$Decode$keyValuePairs = _Json_decodeKeyValuePairs;
var $elm$core$Tuple$mapSecond = F2(
	function (func, _v0) {
		var x = _v0.a;
		var y = _v0.b;
		return _Utils_Tuple2(
			x,
			func(y));
	});
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$serialize = function (value) {
	var serializeJson = function (json) {
		var decoder = $elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$json$Json$Decode$map,
					A2(
						$elm$core$Basics$composeL,
						$dillonkearns$elm_graphql$Graphql$Internal$Encode$List,
						$elm$core$List$map($dillonkearns$elm_graphql$Graphql$Internal$Encode$Json)),
					$elm$json$Json$Decode$list($elm$json$Json$Decode$value)),
					A2(
					$elm$json$Json$Decode$map,
					A2(
						$elm$core$Basics$composeL,
						$dillonkearns$elm_graphql$Graphql$Internal$Encode$Object,
						$elm$core$List$map(
							$elm$core$Tuple$mapSecond($dillonkearns$elm_graphql$Graphql$Internal$Encode$Json))),
					$elm$json$Json$Decode$keyValuePairs($elm$json$Json$Decode$value))
				]));
		var _v2 = A2($elm$json$Json$Decode$decodeValue, decoder, json);
		if (!_v2.$) {
			var v = _v2.a;
			return $dillonkearns$elm_graphql$Graphql$Internal$Encode$serialize(v);
		} else {
			return A2($elm$json$Json$Encode$encode, 0, json);
		}
	};
	switch (value.$) {
		case 0:
			var enumValue = value.a;
			return enumValue;
		case 1:
			var json = value.a;
			return serializeJson(json);
		case 2:
			var values = value.a;
			return '[' + (A2(
				$elm$core$String$join,
				', ',
				A2($elm$core$List$map, $dillonkearns$elm_graphql$Graphql$Internal$Encode$serialize, values)) + ']');
		default:
			var keyValuePairs = value.a;
			return '{' + (A2(
				$elm$core$String$join,
				', ',
				A2(
					$elm$core$List$map,
					function (_v1) {
						var key = _v1.a;
						var objectValue = _v1.b;
						return key + (': ' + $dillonkearns$elm_graphql$Graphql$Internal$Encode$serialize(objectValue));
					},
					keyValuePairs)) + '}');
	}
};
var $dillonkearns$elm_graphql$Graphql$Document$Argument$argToString = function (_v0) {
	var name = _v0.a;
	var value = _v0.b;
	return name + (': ' + $dillonkearns$elm_graphql$Graphql$Internal$Encode$serialize(value));
};
var $dillonkearns$elm_graphql$Graphql$Document$Argument$serialize = function (args) {
	if (!args.b) {
		return '';
	} else {
		var nonemptyArgs = args;
		return '(' + (A2(
			$elm$core$String$join,
			', ',
			A2($elm$core$List$map, $dillonkearns$elm_graphql$Graphql$Document$Argument$argToString, nonemptyArgs)) + ')');
	}
};
var $elm$core$List$singleton = function (value) {
	return _List_fromArray(
		[value]);
};
var $dillonkearns$elm_graphql$Graphql$Document$Field$maybeAliasHash = function (field) {
	return A2(
		$elm$core$Maybe$map,
		$dillonkearns$elm_graphql$Graphql$Document$Hash$hashString(0),
		function () {
			if (!field.$) {
				var name = field.a;
				var _arguments = field.b;
				var children = field.c;
				return $elm$core$List$isEmpty(_arguments) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
					$dillonkearns$elm_graphql$Graphql$Document$Argument$serialize(_arguments));
			} else {
				var typeString = field.a.aX;
				var fieldName = field.a.aB;
				var _arguments = field.b;
				return (fieldName === '__typename') ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
					$elm$core$String$concat(
						A2(
							$elm$core$List$append,
							_List_fromArray(
								[typeString]),
							$elm$core$List$singleton(
								$dillonkearns$elm_graphql$Graphql$Document$Argument$serialize(_arguments)))));
			}
		}());
};
var $dillonkearns$elm_graphql$Graphql$RawField$name = function (field) {
	if (!field.$) {
		var fieldName = field.a;
		var argumentList = field.b;
		var fieldList = field.c;
		return fieldName;
	} else {
		var typeString = field.a.aX;
		var fieldName = field.a.aB;
		var argumentList = field.b;
		return fieldName;
	}
};
var $dillonkearns$elm_graphql$Graphql$Document$Field$alias = function (field) {
	return A2(
		$elm$core$Maybe$map,
		function (aliasHash) {
			return _Utils_ap(
				$dillonkearns$elm_graphql$Graphql$RawField$name(field),
				$elm$core$String$fromInt(aliasHash));
		},
		$dillonkearns$elm_graphql$Graphql$Document$Field$maybeAliasHash(field));
};
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $dillonkearns$elm_graphql$Graphql$Document$Field$hashedAliasName = function (field) {
	return A2(
		$elm$core$Maybe$withDefault,
		$dillonkearns$elm_graphql$Graphql$RawField$name(field),
		$dillonkearns$elm_graphql$Graphql$Document$Field$alias(field));
};
var $dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField = F4(
	function (fieldName, args, _v0, decoderTransform) {
		var fields = _v0.a;
		var decoder = _v0.b;
		return A2(
			$dillonkearns$elm_graphql$Graphql$SelectionSet$SelectionSet,
			_List_fromArray(
				[
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$composite, fieldName, args, fields)
				]),
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2(
						$elm$json$Json$Decode$field,
						fieldName,
						decoderTransform(decoder)),
						A2(
						$elm$json$Json$Decode$field,
						$dillonkearns$elm_graphql$Graphql$Document$Field$hashedAliasName(
							A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$composite, fieldName, args, fields)),
						decoderTransform(decoder))
					])));
	});
var $author$project$Api$Query$campaignList = function (object____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
		'campaignList',
		_List_Nil,
		object____,
		A2($elm$core$Basics$composeR, $elm$core$Basics$identity, $elm$json$Json$Decode$list));
};
var $author$project$Data$Campaign = F5(
	function (id, title, days, events, pupils) {
		return {ak: days, aA: events, j: id, bp: pupils, p: title};
	});
var $author$project$Data$Day = F3(
	function (id, title, events) {
		return {aA: events, j: id, p: title};
	});
var $author$project$Api$Object$EventPupil$event = function (object____) {
	return A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField, 'event', _List_Nil, object____, $elm$core$Basics$identity);
};
var $author$project$Api$Scalar$Codecs = $elm$core$Basics$identity;
var $author$project$Api$Scalar$defineCodecs = function (definitions) {
	return definitions;
};
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $elm$json$Json$Encode$int = _Json_wrap;
var $author$project$IdScalarCodecs$codecs = $author$project$Api$Scalar$defineCodecs(
	{
		a5: {
			a7: $elm$json$Json$Decode$int,
			ax: function (v) {
				return $elm$json$Json$Encode$int(v);
			}
		}
	});
var $dillonkearns$elm_graphql$Graphql$RawField$Leaf = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$leaf = F2(
	function (details, args) {
		return A2($dillonkearns$elm_graphql$Graphql$RawField$Leaf, details, args);
	});
var $dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField = F4(
	function (typeString, fieldName, args, decoder) {
		var newLeaf = A2(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$leaf,
			{aB: fieldName, aX: typeString},
			args);
		return A2(
			$dillonkearns$elm_graphql$Graphql$SelectionSet$SelectionSet,
			_List_fromArray(
				[newLeaf]),
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2($elm$json$Json$Decode$field, fieldName, decoder),
						A2(
						$elm$json$Json$Decode$field,
						$dillonkearns$elm_graphql$Graphql$Document$Field$hashedAliasName(newLeaf),
						decoder)
					])));
	});
var $author$project$Api$Scalar$unwrapCodecs = function (_v0) {
	var unwrappedCodecs = _v0;
	return unwrappedCodecs;
};
var $author$project$Api$Object$Event$id = A4(
	$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
	'IdScalarCodecs.Id',
	'id',
	_List_Nil,
	$author$project$Api$Scalar$unwrapCodecs($author$project$IdScalarCodecs$codecs).a5.a7);
var $author$project$Api$Object$Pupil$id = A4(
	$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
	'IdScalarCodecs.Id',
	'id',
	_List_Nil,
	$author$project$Api$Scalar$unwrapCodecs($author$project$IdScalarCodecs$codecs).a5.a7);
var $dillonkearns$elm_graphql$Graphql$SelectionSet$map2 = F3(
	function (combine, _v0, _v1) {
		var selectionFields1 = _v0.a;
		var selectionDecoder1 = _v0.b;
		var selectionFields2 = _v1.a;
		var selectionDecoder2 = _v1.b;
		return A2(
			$dillonkearns$elm_graphql$Graphql$SelectionSet$SelectionSet,
			_Utils_ap(selectionFields1, selectionFields2),
			A3($elm$json$Json$Decode$map2, combine, selectionDecoder1, selectionDecoder2));
	});
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Api$Object$EventPupil$pupils = function (object____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
		'pupils',
		_List_Nil,
		object____,
		A2($elm$core$Basics$composeR, $elm$core$Basics$identity, $elm$json$Json$Decode$list));
};
var $author$project$Data$eventPupilSelectionSet = A3(
	$dillonkearns$elm_graphql$Graphql$SelectionSet$map2,
	$elm$core$Tuple$pair,
	$author$project$Api$Object$EventPupil$event($author$project$Api$Object$Event$id),
	$author$project$Api$Object$EventPupil$pupils($author$project$Api$Object$Pupil$id));
var $author$project$Api$Object$Day$events = function (object____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
		'events',
		_List_Nil,
		object____,
		A2($elm$core$Basics$composeR, $elm$core$Basics$identity, $elm$json$Json$Decode$list));
};
var $author$project$Api$Object$Day$id = A4(
	$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
	'IdScalarCodecs.Id',
	'id',
	_List_Nil,
	$author$project$Api$Scalar$unwrapCodecs($author$project$IdScalarCodecs$codecs).a5.a7);
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$json$Json$Decode$map3 = _Json_map3;
var $dillonkearns$elm_graphql$Graphql$SelectionSet$map3 = F4(
	function (combine, _v0, _v1, _v2) {
		var selectionFields1 = _v0.a;
		var selectionDecoder1 = _v0.b;
		var selectionFields2 = _v1.a;
		var selectionDecoder2 = _v1.b;
		var selectionFields3 = _v2.a;
		var selectionDecoder3 = _v2.b;
		return A2(
			$dillonkearns$elm_graphql$Graphql$SelectionSet$SelectionSet,
			$elm$core$List$concat(
				_List_fromArray(
					[selectionFields1, selectionFields2, selectionFields3])),
			A4($elm$json$Json$Decode$map3, combine, selectionDecoder1, selectionDecoder2, selectionDecoder3));
	});
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Api$Object$Day$title = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'String', 'title', _List_Nil, $elm$json$Json$Decode$string);
var $author$project$Data$daySelectionSet = A4(
	$dillonkearns$elm_graphql$Graphql$SelectionSet$map3,
	$author$project$Data$Day,
	$author$project$Api$Object$Day$id,
	$author$project$Api$Object$Day$title,
	$author$project$Api$Object$Day$events($author$project$Data$eventPupilSelectionSet));
var $author$project$Api$Object$Campaign$days = function (object____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
		'days',
		_List_Nil,
		object____,
		A2($elm$core$Basics$composeR, $elm$core$Basics$identity, $elm$json$Json$Decode$list));
};
var $author$project$Data$Event = F4(
	function (id, title, capacity, maxSpecialPupils) {
		return {Y: capacity, j: id, ab: maxSpecialPupils, p: title};
	});
var $author$project$Api$Object$Event$capacity = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'Int', 'capacity', _List_Nil, $elm$json$Json$Decode$int);
var $elm$json$Json$Decode$map4 = _Json_map4;
var $dillonkearns$elm_graphql$Graphql$SelectionSet$map4 = F5(
	function (combine, _v0, _v1, _v2, _v3) {
		var selectionFields1 = _v0.a;
		var selectionDecoder1 = _v0.b;
		var selectionFields2 = _v1.a;
		var selectionDecoder2 = _v1.b;
		var selectionFields3 = _v2.a;
		var selectionDecoder3 = _v2.b;
		var selectionFields4 = _v3.a;
		var selectionDecoder4 = _v3.b;
		return A2(
			$dillonkearns$elm_graphql$Graphql$SelectionSet$SelectionSet,
			$elm$core$List$concat(
				_List_fromArray(
					[selectionFields1, selectionFields2, selectionFields3, selectionFields4])),
			A5($elm$json$Json$Decode$map4, combine, selectionDecoder1, selectionDecoder2, selectionDecoder3, selectionDecoder4));
	});
var $author$project$Api$Object$Event$maxSpecialPupils = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'Int', 'maxSpecialPupils', _List_Nil, $elm$json$Json$Decode$int);
var $author$project$Api$Object$Event$title = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'String', 'title', _List_Nil, $elm$json$Json$Decode$string);
var $author$project$Data$eventSelectionSet = A5($dillonkearns$elm_graphql$Graphql$SelectionSet$map4, $author$project$Data$Event, $author$project$Api$Object$Event$id, $author$project$Api$Object$Event$title, $author$project$Api$Object$Event$capacity, $author$project$Api$Object$Event$maxSpecialPupils);
var $author$project$Api$Object$Campaign$events = function (object____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
		'events',
		_List_Nil,
		object____,
		A2($elm$core$Basics$composeR, $elm$core$Basics$identity, $elm$json$Json$Decode$list));
};
var $author$project$Api$Object$Campaign$id = A4(
	$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
	'IdScalarCodecs.Id',
	'id',
	_List_Nil,
	$author$project$Api$Scalar$unwrapCodecs($author$project$IdScalarCodecs$codecs).a5.a7);
var $elm$json$Json$Decode$map5 = _Json_map5;
var $dillonkearns$elm_graphql$Graphql$SelectionSet$map5 = F6(
	function (combine, _v0, _v1, _v2, _v3, _v4) {
		var selectionFields1 = _v0.a;
		var selectionDecoder1 = _v0.b;
		var selectionFields2 = _v1.a;
		var selectionDecoder2 = _v1.b;
		var selectionFields3 = _v2.a;
		var selectionDecoder3 = _v2.b;
		var selectionFields4 = _v3.a;
		var selectionDecoder4 = _v3.b;
		var selectionFields5 = _v4.a;
		var selectionDecoder5 = _v4.b;
		return A2(
			$dillonkearns$elm_graphql$Graphql$SelectionSet$SelectionSet,
			$elm$core$List$concat(
				_List_fromArray(
					[selectionFields1, selectionFields2, selectionFields3, selectionFields4, selectionFields5])),
			A6($elm$json$Json$Decode$map5, combine, selectionDecoder1, selectionDecoder2, selectionDecoder3, selectionDecoder4, selectionDecoder5));
	});
var $author$project$Data$Pupil = F4(
	function (id, name, _class, isSpecial) {
		return {_: _class, j: id, bf: isSpecial, ac: name};
	});
var $author$project$Api$Object$Pupil$class = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'String', 'class', _List_Nil, $elm$json$Json$Decode$string);
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $author$project$Api$Object$Pupil$isSpecial = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'Bool', 'isSpecial', _List_Nil, $elm$json$Json$Decode$bool);
var $author$project$Api$Object$Pupil$name = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'String', 'name', _List_Nil, $elm$json$Json$Decode$string);
var $author$project$Data$pupilSelectionSet = A5($dillonkearns$elm_graphql$Graphql$SelectionSet$map4, $author$project$Data$Pupil, $author$project$Api$Object$Pupil$id, $author$project$Api$Object$Pupil$name, $author$project$Api$Object$Pupil$class, $author$project$Api$Object$Pupil$isSpecial);
var $author$project$Api$Object$Campaign$pupils = function (object____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
		'pupils',
		_List_Nil,
		object____,
		A2($elm$core$Basics$composeR, $elm$core$Basics$identity, $elm$json$Json$Decode$list));
};
var $author$project$Api$Object$Campaign$title = A4($dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField, 'String', 'title', _List_Nil, $elm$json$Json$Decode$string);
var $author$project$Data$campaingSelectionSet = A6(
	$dillonkearns$elm_graphql$Graphql$SelectionSet$map5,
	$author$project$Data$Campaign,
	$author$project$Api$Object$Campaign$id,
	$author$project$Api$Object$Campaign$title,
	$author$project$Api$Object$Campaign$days($author$project$Data$daySelectionSet),
	$author$project$Api$Object$Campaign$events($author$project$Data$eventSelectionSet),
	$author$project$Api$Object$Campaign$pupils($author$project$Data$pupilSelectionSet));
var $dillonkearns$elm_graphql$Graphql$Http$Query = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $dillonkearns$elm_graphql$Graphql$Http$Request = $elm$core$Basics$identity;
var $dillonkearns$elm_graphql$Graphql$Document$decoder = function (_v0) {
	var fields = _v0.a;
	var decoder_ = _v0.b;
	return A2($elm$json$Json$Decode$field, 'data', decoder_);
};
var $dillonkearns$elm_graphql$Graphql$Http$queryRequest = F2(
	function (baseUrl, query) {
		return {
			X: baseUrl,
			ah: A2($dillonkearns$elm_graphql$Graphql$Http$Query, $elm$core$Maybe$Nothing, query),
			P: $dillonkearns$elm_graphql$Graphql$Document$decoder(query),
			l: _List_Nil,
			E: $elm$core$Maybe$Nothing,
			G: _List_Nil,
			o: $elm$core$Maybe$Nothing,
			K: false
		};
	});
var $author$project$Shared$queryUrl = '/query';
var $elm$http$Http$Request = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {aQ: reqs, aU: subs};
	});
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 2};
var $elm$http$Http$Receiving = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$Timeout_ = {$: 1};
var $elm$core$Maybe$isJust = function (maybe) {
	if (!maybe.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (!cmd.$) {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 1) {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.aW;
							if (_v4.$ === 1) {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.aQ));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.aU)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (!cmd.$) {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					a1: r.a1,
					y: r.y,
					P: A2(_Http_mapExpect, func, r.P),
					l: r.l,
					z: r.z,
					o: r.o,
					aW: r.aW,
					C: r.C
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{a1: false, y: r.y, P: r.P, l: r.l, z: r.z, o: r.o, aW: r.aW, C: r.C}));
};
var $elm$http$Http$riskyRequest = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{a1: true, y: r.y, P: r.P, l: r.l, z: r.z, o: r.o, aW: r.aW, C: r.C}));
};
var $dillonkearns$elm_graphql$Graphql$Http$GraphqlError = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $dillonkearns$elm_graphql$Graphql$Http$HttpError = function (a) {
	return {$: 1, a: a};
};
var $dillonkearns$elm_graphql$Graphql$Http$convertResult = function (httpResult) {
	if (!httpResult.$) {
		var successOrError = httpResult.a;
		if (!successOrError.$) {
			var value = successOrError.a;
			return $elm$core$Result$Ok(value);
		} else {
			var _v2 = successOrError.a;
			var possiblyParsedData = _v2.a;
			var error = _v2.b;
			return $elm$core$Result$Err(
				A2($dillonkearns$elm_graphql$Graphql$Http$GraphqlError, possiblyParsedData, error));
		}
	} else {
		var httpError = httpResult.a;
		return $elm$core$Result$Err(
			$dillonkearns$elm_graphql$Graphql$Http$HttpError(httpError));
	}
};
var $dillonkearns$elm_graphql$Graphql$Http$BadPayload = function (a) {
	return {$: 4, a: a};
};
var $dillonkearns$elm_graphql$Graphql$Http$BadStatus = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $dillonkearns$elm_graphql$Graphql$Http$BadUrl = function (a) {
	return {$: 0, a: a};
};
var $dillonkearns$elm_graphql$Graphql$Http$NetworkError = {$: 2};
var $dillonkearns$elm_graphql$Graphql$Http$Timeout = {$: 1};
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $dillonkearns$elm_graphql$Graphql$Http$expectJson = F2(
	function (toMsg, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			function (response) {
				switch (response.$) {
					case 0:
						var url = response.a;
						return $elm$core$Result$Err(
							$dillonkearns$elm_graphql$Graphql$Http$BadUrl(url));
					case 1:
						return $elm$core$Result$Err($dillonkearns$elm_graphql$Graphql$Http$Timeout);
					case 2:
						return $elm$core$Result$Err($dillonkearns$elm_graphql$Graphql$Http$NetworkError);
					case 3:
						var metadata = response.a;
						var body = response.b;
						return $elm$core$Result$Err(
							A2($dillonkearns$elm_graphql$Graphql$Http$BadStatus, metadata, body));
					default:
						var metadata = response.a;
						var body = response.b;
						var _v1 = A2($elm$json$Json$Decode$decodeString, decoder, body);
						if (!_v1.$) {
							var value = _v1.a;
							return $elm$core$Result$Ok(value);
						} else {
							var err = _v1.a;
							return $elm$core$Result$Err(
								$dillonkearns$elm_graphql$Graphql$Http$BadPayload(err));
						}
				}
			});
	});
var $dillonkearns$elm_graphql$Graphql$Http$QueryHelper$Get = 0;
var $dillonkearns$elm_graphql$Graphql$Http$QueryHelper$Post = 1;
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$core$Basics$ge = _Utils_ge;
var $elm$http$Http$jsonBody = function (value) {
	return A2(
		_Http_pair,
		'application/json',
		A2($elm$json$Json$Encode$encode, 0, value));
};
var $dillonkearns$elm_graphql$Graphql$Http$QueryHelper$maxLength = 2000;
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$String$dropRight = F2(
	function (n, string) {
		return (n < 1) ? string : A3($elm$core$String$slice, 0, -n, string);
	});
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!_v0.$) {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $lukewestby$elm_string_interpolate$String$Interpolate$applyInterpolation = F2(
	function (replacements, _v0) {
		var match = _v0.bi;
		var ordinalString = A2(
			$elm$core$Basics$composeL,
			$elm$core$String$dropLeft(1),
			$elm$core$String$dropRight(1))(match);
		return A2(
			$elm$core$Maybe$withDefault,
			'',
			A2(
				$elm$core$Maybe$andThen,
				function (value) {
					return A2($elm$core$Array$get, value, replacements);
				},
				$elm$core$String$toInt(ordinalString)));
	});
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{h: nodeList, e: nodeListSize, g: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $elm$regex$Regex$Match = F4(
	function (match, index, number, submatches) {
		return {bd: index, bi: match, bl: number, bw: submatches};
	});
var $elm$regex$Regex$fromStringWith = _Regex_fromStringWith;
var $elm$regex$Regex$fromString = function (string) {
	return A2(
		$elm$regex$Regex$fromStringWith,
		{a3: false, bk: false},
		string);
};
var $elm$regex$Regex$never = _Regex_never;
var $lukewestby$elm_string_interpolate$String$Interpolate$interpolationRegex = A2(
	$elm$core$Maybe$withDefault,
	$elm$regex$Regex$never,
	$elm$regex$Regex$fromString('\\{\\d+\\}'));
var $elm$regex$Regex$replace = _Regex_replaceAtMost(_Regex_infinity);
var $lukewestby$elm_string_interpolate$String$Interpolate$interpolate = F2(
	function (string, args) {
		var asArray = $elm$core$Array$fromList(args);
		return A3(
			$elm$regex$Regex$replace,
			$lukewestby$elm_string_interpolate$String$Interpolate$interpolationRegex,
			$lukewestby$elm_string_interpolate$String$Interpolate$applyInterpolation(asArray),
			string);
	});
var $elm$core$Set$Set_elm_builtin = $elm$core$Basics$identity;
var $elm$core$Set$empty = $elm$core$Dict$empty;
var $j_maas$elm_ordered_containers$OrderedDict$OrderedDict = $elm$core$Basics$identity;
var $j_maas$elm_ordered_containers$OrderedDict$empty = {c: $elm$core$Dict$empty, i: _List_Nil};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$filter = F2(
	function (isGood, dict) {
		return A3(
			$elm$core$Dict$foldl,
			F3(
				function (k, v, d) {
					return A2(isGood, k, v) ? A3($elm$core$Dict$insert, k, v, d) : d;
				}),
			$elm$core$Dict$empty,
			dict);
	});
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0;
		return A3($elm$core$Dict$insert, key, 0, dict);
	});
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $elm$core$Dict$singleton = F2(
	function (key, value) {
		return A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
	});
var $elm$core$Set$singleton = function (key) {
	return A2($elm$core$Dict$singleton, key, 0);
};
var $elm$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			if (dict.$ === -2) {
				return n;
			} else {
				var left = dict.d;
				var right = dict.e;
				var $temp$n = A2($elm$core$Dict$sizeHelp, n + 1, right),
					$temp$dict = left;
				n = $temp$n;
				dict = $temp$dict;
				continue sizeHelp;
			}
		}
	});
var $elm$core$Dict$size = function (dict) {
	return A2($elm$core$Dict$sizeHelp, 0, dict);
};
var $elm$core$Set$size = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$size(dict);
};
var $dillonkearns$elm_graphql$Graphql$Document$Field$findConflictingTypeFields = function (rawFields) {
	var compositeCount = $elm$core$List$length(
		A2(
			$elm$core$List$filterMap,
			function (field) {
				if (!field.$) {
					return $elm$core$Maybe$Just(0);
				} else {
					return $elm$core$Maybe$Nothing;
				}
			},
			rawFields));
	if (compositeCount <= 1) {
		return $elm$core$Set$empty;
	} else {
		var levelBelowNodes = A2(
			$elm$core$List$concatMap,
			function (field) {
				if (field.$ === 1) {
					return _List_Nil;
				} else {
					var children = field.c;
					return children;
				}
			},
			rawFields);
		var fieldTypes = A3(
			$elm$core$List$foldl,
			F2(
				function (_v1, acc) {
					var fieldName = _v1.a;
					var fieldType = _v1.b;
					return A3(
						$elm$core$Dict$update,
						fieldName,
						function (maybeFieldTypes) {
							if (maybeFieldTypes.$ === 1) {
								return $elm$core$Maybe$Just(
									$elm$core$Set$singleton(fieldType));
							} else {
								var fieldTypes_ = maybeFieldTypes.a;
								return $elm$core$Maybe$Just(
									A2($elm$core$Set$insert, fieldType, fieldTypes_));
							}
						},
						acc);
				}),
			$elm$core$Dict$empty,
			A2(
				$elm$core$List$filterMap,
				function (field) {
					if (field.$ === 1) {
						var typeString = field.a.aX;
						return $elm$core$Maybe$Just(
							_Utils_Tuple2(
								$dillonkearns$elm_graphql$Graphql$RawField$name(field),
								typeString));
					} else {
						return $elm$core$Maybe$Nothing;
					}
				},
				levelBelowNodes));
		return $elm$core$Set$fromList(
			$elm$core$Dict$keys(
				A2(
					$elm$core$Dict$filter,
					F2(
						function (fieldType, fields) {
							return function (size) {
								return size > 1;
							}(
								$elm$core$Set$size(fields));
						}),
					fieldTypes)));
	}
};
var $j_maas$elm_ordered_containers$OrderedDict$get = F2(
	function (key, _v0) {
		var orderedDict = _v0;
		return A2($elm$core$Dict$get, key, orderedDict.c);
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$member, key, dict);
	});
var $elm$core$Basics$always = F2(
	function (a, _v0) {
		return a;
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $j_maas$elm_ordered_containers$OrderedDict$insert = F3(
	function (key, value, _v0) {
		var orderedDict = _v0;
		var filteredOrder = A2($elm$core$Dict$member, key, orderedDict.c) ? A2(
			$elm$core$List$filter,
			function (k) {
				return !_Utils_eq(k, key);
			},
			orderedDict.i) : orderedDict.i;
		var newOrder = _Utils_ap(
			filteredOrder,
			_List_fromArray(
				[key]));
		return {
			c: A3($elm$core$Dict$insert, key, value, orderedDict.c),
			i: newOrder
		};
	});
var $j_maas$elm_ordered_containers$OrderedDict$remove = F2(
	function (key, _v0) {
		var orderedDict = _v0;
		return {
			c: A2($elm$core$Dict$remove, key, orderedDict.c),
			i: A2($elm$core$Dict$member, key, orderedDict.c) ? A2(
				$elm$core$List$filter,
				function (k) {
					return !_Utils_eq(k, key);
				},
				orderedDict.i) : orderedDict.i
		};
	});
var $j_maas$elm_ordered_containers$OrderedDict$update = F3(
	function (key, alter, original) {
		var orderedDict = original;
		var _v0 = A2($elm$core$Dict$get, key, orderedDict.c);
		if (!_v0.$) {
			var oldItem = _v0.a;
			var _v1 = alter(
				$elm$core$Maybe$Just(oldItem));
			if (!_v1.$) {
				var newItem = _v1.a;
				return {
					c: A3(
						$elm$core$Dict$update,
						key,
						$elm$core$Basics$always(
							$elm$core$Maybe$Just(newItem)),
						orderedDict.c),
					i: orderedDict.i
				};
			} else {
				return A2($j_maas$elm_ordered_containers$OrderedDict$remove, key, original);
			}
		} else {
			var _v2 = alter($elm$core$Maybe$Nothing);
			if (!_v2.$) {
				var newItem = _v2.a;
				return A3($j_maas$elm_ordered_containers$OrderedDict$insert, key, newItem, original);
			} else {
				return original;
			}
		}
	});
var $dillonkearns$elm_graphql$Graphql$Document$Field$canAllowHashing = F2(
	function (forceHashing, rawFields) {
		var fieldCounts = A3(
			$elm$core$List$foldl,
			F2(
				function (fld, acc) {
					return A3(
						$j_maas$elm_ordered_containers$OrderedDict$update,
						fld,
						function (val) {
							return $elm$core$Maybe$Just(
								function () {
									if (val.$ === 1) {
										return 0;
									} else {
										var count = val.a;
										return count + 1;
									}
								}());
						},
						acc);
				}),
			$j_maas$elm_ordered_containers$OrderedDict$empty,
			A2($elm$core$List$map, $dillonkearns$elm_graphql$Graphql$RawField$name, rawFields));
		var conflictingTypeFields = $dillonkearns$elm_graphql$Graphql$Document$Field$findConflictingTypeFields(rawFields);
		return A2(
			$elm$core$List$map,
			function (field) {
				return _Utils_Tuple3(
					field,
					A2(
						$elm$core$Set$member,
						$dillonkearns$elm_graphql$Graphql$RawField$name(field),
						forceHashing) ? $dillonkearns$elm_graphql$Graphql$Document$Field$alias(field) : ((!A2(
						$elm$core$Maybe$withDefault,
						0,
						A2(
							$j_maas$elm_ordered_containers$OrderedDict$get,
							$dillonkearns$elm_graphql$Graphql$RawField$name(field),
							fieldCounts))) ? $elm$core$Maybe$Nothing : $dillonkearns$elm_graphql$Graphql$Document$Field$alias(field)),
					conflictingTypeFields);
			},
			rawFields);
	});
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $dillonkearns$elm_graphql$Graphql$Document$Indent$generate = function (indentationLevel) {
	return A2($elm$core$String$repeat, indentationLevel, '  ');
};
var $dillonkearns$elm_graphql$Graphql$Document$Field$mergeFields = function (rawFields) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (field, mergedSoFar) {
				if (!field.$) {
					var newChildren = field.c;
					return A3(
						$j_maas$elm_ordered_containers$OrderedDict$update,
						$dillonkearns$elm_graphql$Graphql$Document$Field$hashedAliasName(field),
						function (maybeChildrenSoFar) {
							if (maybeChildrenSoFar.$ === 1) {
								return $elm$core$Maybe$Just(field);
							} else {
								if (!maybeChildrenSoFar.a.$) {
									var _v2 = maybeChildrenSoFar.a;
									var existingFieldName = _v2.a;
									var existingArgs = _v2.b;
									var existingChildren = _v2.c;
									return $elm$core$Maybe$Just(
										A3(
											$dillonkearns$elm_graphql$Graphql$RawField$Composite,
											existingFieldName,
											existingArgs,
											_Utils_ap(existingChildren, newChildren)));
								} else {
									return $elm$core$Maybe$Just(field);
								}
							}
						},
						mergedSoFar);
				} else {
					return A3(
						$j_maas$elm_ordered_containers$OrderedDict$update,
						$dillonkearns$elm_graphql$Graphql$Document$Field$hashedAliasName(field),
						function (maybeChildrenSoFar) {
							return $elm$core$Maybe$Just(
								A2($elm$core$Maybe$withDefault, field, maybeChildrenSoFar));
						},
						mergedSoFar);
				}
			}),
		$j_maas$elm_ordered_containers$OrderedDict$empty,
		rawFields);
};
var $j_maas$elm_ordered_containers$OrderedDict$values = function (_v0) {
	var orderedDict = _v0;
	return A2(
		$elm$core$List$filterMap,
		function (key) {
			return A2($elm$core$Dict$get, key, orderedDict.c);
		},
		orderedDict.i);
};
var $dillonkearns$elm_graphql$Graphql$Document$Field$mergedFields = function (children) {
	return $j_maas$elm_ordered_containers$OrderedDict$values(
		$dillonkearns$elm_graphql$Graphql$Document$Field$mergeFields(children));
};
var $dillonkearns$elm_graphql$Graphql$RawField$typename = A2(
	$dillonkearns$elm_graphql$Graphql$RawField$Leaf,
	{aB: '__typename', aX: ''},
	_List_Nil);
var $dillonkearns$elm_graphql$Graphql$Document$Field$nonemptyChildren = function (children) {
	return $elm$core$List$isEmpty(children) ? A2($elm$core$List$cons, $dillonkearns$elm_graphql$Graphql$RawField$typename, children) : children;
};
var $dillonkearns$elm_graphql$Graphql$Document$Field$serialize = F4(
	function (forceHashing, aliasName, mIndentationLevel, field) {
		var prefix = function () {
			if (!aliasName.$) {
				var aliasName_ = aliasName.a;
				return _Utils_ap(
					aliasName_,
					function () {
						if (!mIndentationLevel.$) {
							return ': ';
						} else {
							return ':';
						}
					}());
			} else {
				return '';
			}
		}();
		return A2(
			$elm$core$Maybe$map,
			function (string) {
				return _Utils_ap(
					$dillonkearns$elm_graphql$Graphql$Document$Indent$generate(
						A2($elm$core$Maybe$withDefault, 0, mIndentationLevel)),
					_Utils_ap(prefix, string));
			},
			function () {
				if (!field.$) {
					var fieldName = field.a;
					var args = field.b;
					var children = field.c;
					if (mIndentationLevel.$ === 1) {
						return $elm$core$Maybe$Just(
							(fieldName + ($dillonkearns$elm_graphql$Graphql$Document$Argument$serialize(args) + ('{' + A3($dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildrenHelp, forceHashing, $elm$core$Maybe$Nothing, children)))) + '}');
					} else {
						var indentationLevel = mIndentationLevel.a;
						return $elm$core$Maybe$Just(
							(fieldName + ($dillonkearns$elm_graphql$Graphql$Document$Argument$serialize(args) + (' {\n' + A3(
								$dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildrenHelp,
								forceHashing,
								$elm$core$Maybe$Just(indentationLevel),
								children)))) + ('\n' + ($dillonkearns$elm_graphql$Graphql$Document$Indent$generate(indentationLevel) + '}')));
					}
				} else {
					var fieldName = field.a.aB;
					var args = field.b;
					return $elm$core$Maybe$Just(
						_Utils_ap(
							fieldName,
							$dillonkearns$elm_graphql$Graphql$Document$Argument$serialize(args)));
				}
			}());
	});
var $dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildrenHelp = F3(
	function (forceHashing, indentationLevel, children) {
		return A2(
			$elm$core$String$join,
			function () {
				if (!indentationLevel.$) {
					return '\n';
				} else {
					return ' ';
				}
			}(),
			A2(
				$elm$core$List$filterMap,
				$elm$core$Basics$identity,
				A2(
					$elm$core$List$map,
					function (_v0) {
						var field = _v0.a;
						var maybeAlias = _v0.b;
						var conflictingTypeFields = _v0.c;
						return A4(
							$dillonkearns$elm_graphql$Graphql$Document$Field$serialize,
							conflictingTypeFields,
							maybeAlias,
							A2(
								$elm$core$Maybe$map,
								$elm$core$Basics$add(1),
								indentationLevel),
							field);
					},
					A2(
						$dillonkearns$elm_graphql$Graphql$Document$Field$canAllowHashing,
						forceHashing,
						$dillonkearns$elm_graphql$Graphql$Document$Field$nonemptyChildren(
							$dillonkearns$elm_graphql$Graphql$Document$Field$mergedFields(children))))));
	});
var $dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildren = F2(
	function (indentationLevel, children) {
		return A3($dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildrenHelp, $elm$core$Set$empty, indentationLevel, children);
	});
var $dillonkearns$elm_graphql$Graphql$Document$serialize = F2(
	function (operationType, queries) {
		return A2(
			$lukewestby$elm_string_interpolate$String$Interpolate$interpolate,
			'{0} {\n{1}\n}',
			_List_fromArray(
				[
					operationType,
					A2(
					$dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildren,
					$elm$core$Maybe$Just(0),
					queries)
				]));
	});
var $dillonkearns$elm_graphql$Graphql$Document$serializeQuery = function (_v0) {
	var fields = _v0.a;
	var decoder_ = _v0.b;
	return A2($dillonkearns$elm_graphql$Graphql$Document$serialize, 'query', fields);
};
var $dillonkearns$elm_graphql$Graphql$Document$serializeQueryForUrl = function (_v0) {
	var fields = _v0.a;
	var decoder_ = _v0.b;
	return '{' + (A2($dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildren, $elm$core$Maybe$Nothing, fields) + '}');
};
var $dillonkearns$elm_graphql$Graphql$Document$serializeQueryForUrlWithOperationName = F2(
	function (operationName, _v0) {
		var fields = _v0.a;
		var decoder_ = _v0.b;
		return 'query ' + (operationName + (' {' + (A2($dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildren, $elm$core$Maybe$Nothing, fields) + '}')));
	});
var $dillonkearns$elm_graphql$Graphql$Document$serializeWithOperationName = F3(
	function (operationType, operationName, queries) {
		return A2(
			$lukewestby$elm_string_interpolate$String$Interpolate$interpolate,
			'{0} {1} {\n{2}\n}',
			_List_fromArray(
				[
					operationType,
					operationName,
					A2(
					$dillonkearns$elm_graphql$Graphql$Document$Field$serializeChildren,
					$elm$core$Maybe$Just(0),
					queries)
				]));
	});
var $dillonkearns$elm_graphql$Graphql$Document$serializeQueryWithOperationName = F2(
	function (operationName, _v0) {
		var fields = _v0.a;
		var decoder_ = _v0.b;
		return A3($dillonkearns$elm_graphql$Graphql$Document$serializeWithOperationName, 'query', operationName, fields);
	});
var $elm$json$Json$Encode$string = _Json_wrap;
var $elm$url$Url$percentEncode = _Url_percentEncode;
var $dillonkearns$elm_graphql$Graphql$Http$QueryParams$replace = F2(
	function (old, _new) {
		return A2(
			$elm$core$Basics$composeR,
			$elm$core$String$split(old),
			$elm$core$String$join(_new));
	});
var $dillonkearns$elm_graphql$Graphql$Http$QueryParams$queryEscape = A2(
	$elm$core$Basics$composeR,
	$elm$url$Url$percentEncode,
	A2($dillonkearns$elm_graphql$Graphql$Http$QueryParams$replace, '%20', '+'));
var $dillonkearns$elm_graphql$Graphql$Http$QueryParams$queryPair = function (_v0) {
	var key = _v0.a;
	var value = _v0.b;
	return $dillonkearns$elm_graphql$Graphql$Http$QueryParams$queryEscape(key) + ('=' + $dillonkearns$elm_graphql$Graphql$Http$QueryParams$queryEscape(value));
};
var $dillonkearns$elm_graphql$Graphql$Http$QueryParams$joinUrlEncoded = function (args) {
	return A2(
		$elm$core$String$join,
		'&',
		A2($elm$core$List$map, $dillonkearns$elm_graphql$Graphql$Http$QueryParams$queryPair, args));
};
var $dillonkearns$elm_graphql$Graphql$Http$QueryParams$urlWithQueryParams = F2(
	function (queryParams, url) {
		return $elm$core$List$isEmpty(queryParams) ? url : (url + ('?' + $dillonkearns$elm_graphql$Graphql$Http$QueryParams$joinUrlEncoded(queryParams)));
	});
var $dillonkearns$elm_graphql$Graphql$Http$QueryHelper$build = F5(
	function (forceMethod, url, queryParams, maybeOperationName, queryDocument) {
		var _v0 = function () {
			if (!maybeOperationName.$) {
				var operationName = maybeOperationName.a;
				return _Utils_Tuple2(
					A2($dillonkearns$elm_graphql$Graphql$Document$serializeQueryForUrlWithOperationName, operationName, queryDocument),
					_List_fromArray(
						[
							_Utils_Tuple2('operationName', operationName)
						]));
			} else {
				return _Utils_Tuple2(
					$dillonkearns$elm_graphql$Graphql$Document$serializeQueryForUrl(queryDocument),
					_List_Nil);
			}
		}();
		var serializedQueryForGetRequest = _v0.a;
		var operationNameParamForGetRequest = _v0.b;
		var urlForGetRequest = A2(
			$dillonkearns$elm_graphql$Graphql$Http$QueryParams$urlWithQueryParams,
			_Utils_ap(
				queryParams,
				A2(
					$elm$core$List$cons,
					_Utils_Tuple2('query', serializedQueryForGetRequest),
					operationNameParamForGetRequest)),
			url);
		if (_Utils_eq(
			forceMethod,
			$elm$core$Maybe$Just(1)) || ((_Utils_cmp(
			$elm$core$String$length(urlForGetRequest),
			$dillonkearns$elm_graphql$Graphql$Http$QueryHelper$maxLength) > -1) && (!_Utils_eq(
			forceMethod,
			$elm$core$Maybe$Just(0))))) {
			var _v2 = function () {
				if (!maybeOperationName.$) {
					var operationName = maybeOperationName.a;
					return _Utils_Tuple2(
						A2($dillonkearns$elm_graphql$Graphql$Document$serializeQueryWithOperationName, operationName, queryDocument),
						_List_fromArray(
							[
								_Utils_Tuple2(
								'operationName',
								$elm$json$Json$Encode$string(operationName))
							]));
				} else {
					return _Utils_Tuple2(
						$dillonkearns$elm_graphql$Graphql$Document$serializeQuery(queryDocument),
						_List_Nil);
				}
			}();
			var serializedQuery = _v2.a;
			var operationNameParamForPostRequest = _v2.b;
			return {
				y: $elm$http$Http$jsonBody(
					$elm$json$Json$Encode$object(
						A2(
							$elm$core$List$cons,
							_Utils_Tuple2(
								'query',
								$elm$json$Json$Encode$string(serializedQuery)),
							operationNameParamForPostRequest))),
				z: 1,
				C: A2($dillonkearns$elm_graphql$Graphql$Http$QueryParams$urlWithQueryParams, queryParams, url)
			};
		} else {
			return {y: $elm$http$Http$emptyBody, z: 0, C: urlForGetRequest};
		}
	});
var $dillonkearns$elm_graphql$Graphql$Http$GraphqlError$ParsedData = function (a) {
	return {$: 0, a: a};
};
var $dillonkearns$elm_graphql$Graphql$Http$GraphqlError$UnparsedData = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $dillonkearns$elm_graphql$Graphql$Http$GraphqlError$GraphqlError = F3(
	function (message, locations, details) {
		return {ah: details, bh: locations, bj: message};
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$json$Json$Decode$dict = function (decoder) {
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$Dict$fromList,
		$elm$json$Json$Decode$keyValuePairs(decoder));
};
var $dillonkearns$elm_graphql$Graphql$Http$GraphqlError$Location = F2(
	function (line, column) {
		return {a6: column, bg: line};
	});
var $dillonkearns$elm_graphql$Graphql$Http$GraphqlError$locationDecoder = A3(
	$elm$json$Json$Decode$map2,
	$dillonkearns$elm_graphql$Graphql$Http$GraphqlError$Location,
	A2($elm$json$Json$Decode$field, 'line', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'column', $elm$json$Json$Decode$int));
var $elm$json$Json$Decode$maybe = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $dillonkearns$elm_graphql$Graphql$Http$GraphqlError$decoder = A2(
	$elm$json$Json$Decode$field,
	'errors',
	$elm$json$Json$Decode$list(
		A4(
			$elm$json$Json$Decode$map3,
			$dillonkearns$elm_graphql$Graphql$Http$GraphqlError$GraphqlError,
			A2($elm$json$Json$Decode$field, 'message', $elm$json$Json$Decode$string),
			$elm$json$Json$Decode$maybe(
				A2(
					$elm$json$Json$Decode$field,
					'locations',
					$elm$json$Json$Decode$list($dillonkearns$elm_graphql$Graphql$Http$GraphqlError$locationDecoder))),
			A2(
				$elm$json$Json$Decode$map,
				$elm$core$Dict$remove('locations'),
				A2(
					$elm$json$Json$Decode$map,
					$elm$core$Dict$remove('message'),
					$elm$json$Json$Decode$dict($elm$json$Json$Decode$value))))));
var $dillonkearns$elm_graphql$Graphql$Http$decodeErrorWithData = function (data) {
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$Result$Err,
		A2(
			$elm$json$Json$Decode$map,
			$elm$core$Tuple$pair(data),
			$dillonkearns$elm_graphql$Graphql$Http$GraphqlError$decoder));
};
var $dillonkearns$elm_graphql$Graphql$Http$nullJsonValue = function (a) {
	nullJsonValue:
	while (true) {
		var _v0 = A2($elm$json$Json$Decode$decodeString, $elm$json$Json$Decode$value, 'null');
		if (!_v0.$) {
			var value = _v0.a;
			return value;
		} else {
			var $temp$a = 0;
			a = $temp$a;
			continue nullJsonValue;
		}
	}
};
var $dillonkearns$elm_graphql$Graphql$Http$errorDecoder = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$andThen,
				$dillonkearns$elm_graphql$Graphql$Http$decodeErrorWithData,
				A2($elm$json$Json$Decode$map, $dillonkearns$elm_graphql$Graphql$Http$GraphqlError$ParsedData, decoder)),
				A2(
				$elm$json$Json$Decode$andThen,
				$dillonkearns$elm_graphql$Graphql$Http$decodeErrorWithData,
				A2(
					$elm$json$Json$Decode$map,
					$dillonkearns$elm_graphql$Graphql$Http$GraphqlError$UnparsedData,
					A2($elm$json$Json$Decode$field, 'data', $elm$json$Json$Decode$value))),
				A2(
				$elm$json$Json$Decode$andThen,
				$dillonkearns$elm_graphql$Graphql$Http$decodeErrorWithData,
				$elm$json$Json$Decode$succeed(
					$dillonkearns$elm_graphql$Graphql$Http$GraphqlError$UnparsedData(
						$dillonkearns$elm_graphql$Graphql$Http$nullJsonValue(0))))
			]));
};
var $dillonkearns$elm_graphql$Graphql$Http$decoderOrError = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$dillonkearns$elm_graphql$Graphql$Http$errorDecoder(decoder),
				A2($elm$json$Json$Decode$map, $elm$core$Result$Ok, decoder)
			]));
};
var $dillonkearns$elm_graphql$Graphql$Document$serializeMutation = function (_v0) {
	var fields = _v0.a;
	var decoder_ = _v0.b;
	return A2($dillonkearns$elm_graphql$Graphql$Document$serialize, 'mutation', fields);
};
var $dillonkearns$elm_graphql$Graphql$Document$serializeMutationWithOperationName = F2(
	function (operationName, _v0) {
		var fields = _v0.a;
		var decoder_ = _v0.b;
		return A3($dillonkearns$elm_graphql$Graphql$Document$serializeWithOperationName, 'mutation', operationName, fields);
	});
var $dillonkearns$elm_graphql$Graphql$Http$toReadyRequest = function (_v0) {
	var request = _v0;
	var _v1 = request.ah;
	if (!_v1.$) {
		var forcedRequestMethod = _v1.a;
		var querySelectionSet = _v1.b;
		var queryRequestDetails = A5(
			$dillonkearns$elm_graphql$Graphql$Http$QueryHelper$build,
			function () {
				if (!forcedRequestMethod.$) {
					if (!forcedRequestMethod.a) {
						var _v4 = forcedRequestMethod.a;
						return $elm$core$Maybe$Just(0);
					} else {
						var _v5 = forcedRequestMethod.a;
						return $elm$core$Maybe$Nothing;
					}
				} else {
					return $elm$core$Maybe$Just(1);
				}
			}(),
			request.X,
			request.G,
			request.E,
			querySelectionSet);
		return {
			y: queryRequestDetails.y,
			a7: $dillonkearns$elm_graphql$Graphql$Http$decoderOrError(request.P),
			l: request.l,
			z: function () {
				var _v2 = queryRequestDetails.z;
				if (!_v2) {
					return 'GET';
				} else {
					return 'Post';
				}
			}(),
			o: request.o,
			C: queryRequestDetails.C
		};
	} else {
		var mutationSelectionSet = _v1.a;
		var serializedMutation = function () {
			var _v7 = request.E;
			if (!_v7.$) {
				var operationName = _v7.a;
				return A2($dillonkearns$elm_graphql$Graphql$Document$serializeMutationWithOperationName, operationName, mutationSelectionSet);
			} else {
				return $dillonkearns$elm_graphql$Graphql$Document$serializeMutation(mutationSelectionSet);
			}
		}();
		return {
			y: $elm$http$Http$jsonBody(
				$elm$json$Json$Encode$object(
					A2(
						$elm$core$List$append,
						_List_fromArray(
							[
								_Utils_Tuple2(
								'query',
								$elm$json$Json$Encode$string(serializedMutation))
							]),
						function () {
							var _v6 = request.E;
							if (!_v6.$) {
								var operationName = _v6.a;
								return _List_fromArray(
									[
										_Utils_Tuple2(
										'operationName',
										$elm$json$Json$Encode$string(operationName))
									]);
							} else {
								return _List_Nil;
							}
						}()))),
			a7: $dillonkearns$elm_graphql$Graphql$Http$decoderOrError(request.P),
			l: request.l,
			z: 'POST',
			o: request.o,
			C: A2($dillonkearns$elm_graphql$Graphql$Http$QueryParams$urlWithQueryParams, request.G, request.X)
		};
	}
};
var $dillonkearns$elm_graphql$Graphql$Http$toHttpRequestRecord = F2(
	function (resultToMessage, fullRequest) {
		var request = fullRequest;
		return function (readyRequest) {
			return {
				y: readyRequest.y,
				P: A2(
					$dillonkearns$elm_graphql$Graphql$Http$expectJson,
					A2($elm$core$Basics$composeR, $dillonkearns$elm_graphql$Graphql$Http$convertResult, resultToMessage),
					readyRequest.a7),
				l: readyRequest.l,
				z: readyRequest.z,
				o: readyRequest.o,
				aW: $elm$core$Maybe$Nothing,
				C: readyRequest.C
			};
		}(
			$dillonkearns$elm_graphql$Graphql$Http$toReadyRequest(fullRequest));
	});
var $dillonkearns$elm_graphql$Graphql$Http$send = F2(
	function (resultToMessage, fullRequest) {
		var request = fullRequest;
		return (request.K ? $elm$http$Http$riskyRequest : $elm$http$Http$request)(
			A2($dillonkearns$elm_graphql$Graphql$Http$toHttpRequestRecord, resultToMessage, fullRequest));
	});
var $author$project$Main$init = function (_v0) {
	return _Utils_Tuple2(
		{a: _List_Nil, d: $author$project$Main$Loading, b: $author$project$Main$Overview},
		A2(
			$dillonkearns$elm_graphql$Graphql$Http$send,
			$author$project$Main$GotCampaignList,
			A2(
				$dillonkearns$elm_graphql$Graphql$Http$queryRequest,
				$author$project$Shared$queryUrl,
				$author$project$Api$Query$campaignList($author$project$Data$campaingSelectionSet))));
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $author$project$Main$subscriptions = function (_v0) {
	return $elm$core$Platform$Sub$none;
};
var $author$project$Main$CampaignFormPage = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$CampaignPage = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$DayFormPage = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$EventFormPage = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$Failure = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$FormMsg = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$FormPage = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$PupilFormPage = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$PupilPage = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$Success = {$: 2};
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$getObjFromCampaign = F4(
	function (campaignId, objId, getter, campaigns) {
		return A2(
			$elm$core$Maybe$andThen,
			function (c) {
				return $elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (e) {
							return _Utils_eq(e.j, objId);
						},
						getter(c)));
			},
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (c) {
						return _Utils_eq(c.j, campaignId);
					},
					campaigns)));
	});
var $author$project$CampaignForm$Model = F3(
	function (title, numOfDays, action) {
		return {V: action, ai: numOfDays, p: title};
	});
var $author$project$CampaignForm$init = function (action) {
	return A3($author$project$CampaignForm$Model, '', 2, action);
};
var $author$project$DayForm$Model = F3(
	function (title, campaignId, action) {
		return {V: action, as: campaignId, p: title};
	});
var $author$project$DayForm$init = F2(
	function (campaignId, action) {
		return A3($author$project$DayForm$Model, '', campaignId, action);
	});
var $author$project$EventForm$Model = F5(
	function (title, capacity, maxSpecialPupils, campaignId, action) {
		return {V: action, as: campaignId, Y: capacity, ab: maxSpecialPupils, p: title};
	});
var $author$project$EventForm$init = F2(
	function (campaignId, action) {
		return A5($author$project$EventForm$Model, '', 12, 2, campaignId, action);
	});
var $author$project$PupilForm$Model = F5(
	function (name, _class, isSpecial, campaignId, action) {
		return {V: action, as: campaignId, _: _class, bf: isSpecial, ac: name};
	});
var $author$project$PupilForm$init = F2(
	function (campaignId, action) {
		return A5($author$project$PupilForm$Model, '', '', false, campaignId, action);
	});
var $elm$core$Platform$Cmd$map = _Platform_map;
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Shared$parseGraphqlError = function (err) {
	if (err.$ === 1) {
		var httpErr = err.a;
		switch (httpErr.$) {
			case 0:
				var m = httpErr.a;
				return 'bad url: ' + m;
			case 1:
				return 'timeout';
			case 2:
				return 'network error';
			case 3:
				var code = httpErr.b;
				return 'bad status: ' + code;
			default:
				var e = httpErr.a;
				return 'bad payload: ' + $elm$json$Json$Decode$errorToString(e);
		}
	} else {
		var gErrs = err.b;
		var fn = function (e) {
			return e.bj;
		};
		var errMsg = A2(
			$elm$core$String$join,
			',',
			A2($elm$core$List$map, fn, gErrs));
		return 'graphql error: ' + errMsg;
	}
};
var $author$project$Main$CampaignFormMsg = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$DayFormMsg = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$EventFormMsg = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$PupilFormMsg = function (a) {
	return {$: 3, a: a};
};
var $author$project$Main$deleteFromList = F2(
	function (objId, objects) {
		if (objects.b) {
			var one = objects.a;
			var rest = objects.b;
			return _Utils_eq(one.j, objId) ? rest : A2(
				$elm$core$List$cons,
				one,
				A2($author$project$Main$deleteFromList, objId, rest));
		} else {
			return _List_Nil;
		}
	});
var $author$project$Main$insertOrUpdateInList = F2(
	function (obj, objects) {
		if (objects.b) {
			var one = objects.a;
			var rest = objects.b;
			return _Utils_eq(one.j, obj.j) ? A2($elm$core$List$cons, obj, rest) : A2(
				$elm$core$List$cons,
				one,
				A2($author$project$Main$insertOrUpdateInList, obj, rest));
		} else {
			return _List_fromArray(
				[obj]);
		}
	});
var $author$project$Api$Mutation$AddCampaignRequiredArguments = function (title) {
	return {p: title};
};
var $author$project$CampaignForm$ClosedWithoutChange = {$: 2};
var $author$project$Api$Mutation$DeleteCampaignRequiredArguments = function (id) {
	return {j: id};
};
var $author$project$CampaignForm$Deleted = function (a) {
	return {$: 1, a: a};
};
var $author$project$CampaignForm$Done = function (a) {
	return {$: 3, a: a};
};
var $author$project$CampaignForm$Error = function (a) {
	return {$: 4, a: a};
};
var $author$project$CampaignForm$GotDelete = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $author$project$CampaignForm$GotNew = function (a) {
	return {$: 3, a: a};
};
var $author$project$CampaignForm$GotUpdated = function (a) {
	return {$: 4, a: a};
};
var $author$project$CampaignForm$Loading = function (a) {
	return {$: 1, a: a};
};
var $author$project$CampaignForm$NewOrUpdated = function (a) {
	return {$: 0, a: a};
};
var $author$project$CampaignForm$None = {$: 0};
var $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present = function (a) {
	return {$: 0, a: a};
};
var $author$project$Api$Mutation$UpdateCampaignRequiredArguments = F2(
	function (id, title) {
		return {j: id, p: title};
	});
var $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent = {$: 1};
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$list = F2(
	function (toValue, value) {
		return $dillonkearns$elm_graphql$Graphql$Internal$Encode$List(
			A2($elm$core$List$map, toValue, value));
	});
var $dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$Argument = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$null = $dillonkearns$elm_graphql$Graphql$Internal$Encode$Json($elm$json$Json$Encode$null);
var $dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional = F3(
	function (fieldName, maybeValue, toValue) {
		switch (maybeValue.$) {
			case 0:
				var value = maybeValue.a;
				return $elm$core$Maybe$Just(
					A2(
						$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$Argument,
						fieldName,
						toValue(value)));
			case 1:
				return $elm$core$Maybe$Nothing;
			default:
				return $elm$core$Maybe$Just(
					A2($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$Argument, fieldName, $dillonkearns$elm_graphql$Graphql$Internal$Encode$null));
		}
	});
var $dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required = F3(
	function (fieldName, raw, encode) {
		return A2(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$Argument,
			fieldName,
			encode(raw));
	});
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$string = function (value) {
	return $dillonkearns$elm_graphql$Graphql$Internal$Encode$Json(
		$elm$json$Json$Encode$string(value));
};
var $author$project$Api$Mutation$addCampaign = F3(
	function (fillInOptionals____, requiredArgs____, object____) {
		var filledInOptionals____ = fillInOptionals____(
			{ak: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent});
		var optionalArgs____ = A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					A3(
					$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional,
					'days',
					filledInOptionals____.ak,
					$dillonkearns$elm_graphql$Graphql$Internal$Encode$list($dillonkearns$elm_graphql$Graphql$Internal$Encode$string))
				]));
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'addCampaign',
			_Utils_ap(
				optionalArgs____,
				_List_fromArray(
					[
						A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'title', requiredArgs____.p, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string)
					])),
			object____,
			$elm$core$Basics$identity);
	});
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$fromJson = function (jsonValue) {
	return $dillonkearns$elm_graphql$Graphql$Internal$Encode$Json(jsonValue);
};
var $author$project$Api$Scalar$unwrapEncoder = F2(
	function (getter, _v0) {
		var unwrappedCodecs = _v0;
		return A2(
			$elm$core$Basics$composeR,
			getter(unwrappedCodecs).ax,
			$dillonkearns$elm_graphql$Graphql$Internal$Encode$fromJson);
	});
var $author$project$Api$Mutation$deleteCampaign = function (requiredArgs____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
		'Bool',
		'deleteCampaign',
		_List_fromArray(
			[
				A3(
				$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
				'id',
				requiredArgs____.j,
				A2(
					$author$project$Api$Scalar$unwrapEncoder,
					function ($) {
						return $.a5;
					},
					$author$project$IdScalarCodecs$codecs))
			]),
		$elm$json$Json$Decode$bool);
};
var $dillonkearns$elm_graphql$Graphql$Http$Mutation = function (a) {
	return {$: 1, a: a};
};
var $dillonkearns$elm_graphql$Graphql$Http$mutationRequest = F2(
	function (baseUrl, mutationSelectionSet) {
		return {
			X: baseUrl,
			ah: $dillonkearns$elm_graphql$Graphql$Http$Mutation(mutationSelectionSet),
			P: $dillonkearns$elm_graphql$Graphql$Document$decoder(mutationSelectionSet),
			l: _List_Nil,
			E: $elm$core$Maybe$Nothing,
			G: _List_Nil,
			o: $elm$core$Maybe$Nothing,
			K: false
		};
	});
var $author$project$Api$Mutation$updateCampaign = F2(
	function (requiredArgs____, object____) {
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'updateCampaign',
			_List_fromArray(
				[
					A3(
					$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
					'id',
					requiredArgs____.j,
					A2(
						$author$project$Api$Scalar$unwrapEncoder,
						function ($) {
							return $.a5;
						},
						$author$project$IdScalarCodecs$codecs)),
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'title', requiredArgs____.p, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string)
				]),
			object____,
			$elm$core$Basics$identity);
	});
var $author$project$CampaignForm$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var formMsg = msg.a;
				var updatedModel = function () {
					if (!formMsg.$) {
						var t = formMsg.a;
						return _Utils_update(
							model,
							{p: t});
					} else {
						var nod = formMsg.a;
						return _Utils_update(
							model,
							{ai: nod});
					}
				}();
				return _Utils_Tuple2(updatedModel, $author$project$CampaignForm$None);
			case 1:
				var action = msg.a;
				switch (action.$) {
					case 0:
						var dayList = A2(
							$elm$core$List$map,
							function (i) {
								return 'Tag ' + $elm$core$String$fromInt(i);
							},
							A2($elm$core$List$range, 1, model.ai));
						var optionalArgs = function (args) {
							return _Utils_update(
								args,
								{
									ak: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(dayList)
								});
						};
						return _Utils_Tuple2(
							model,
							$author$project$CampaignForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$CampaignForm$GotNew,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A3(
											$author$project$Api$Mutation$addCampaign,
											optionalArgs,
											$author$project$Api$Mutation$AddCampaignRequiredArguments(model.p),
											$author$project$Data$campaingSelectionSet)))));
					case 1:
						var objId = action.a;
						return _Utils_Tuple2(
							model,
							$author$project$CampaignForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$CampaignForm$GotUpdated,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A2(
											$author$project$Api$Mutation$updateCampaign,
											A2($author$project$Api$Mutation$UpdateCampaignRequiredArguments, objId, model.p),
											$author$project$Data$campaingSelectionSet)))));
					default:
						var objId = action.a;
						return _Utils_Tuple2(
							model,
							$author$project$CampaignForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$CampaignForm$GotDelete(objId),
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										$author$project$Api$Mutation$deleteCampaign(
											$author$project$Api$Mutation$DeleteCampaignRequiredArguments(objId))))));
				}
			case 2:
				return _Utils_Tuple2(model, $author$project$CampaignForm$ClosedWithoutChange);
			case 3:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$CampaignForm$Done(
							$author$project$CampaignForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$CampaignForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			case 4:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$CampaignForm$Done(
							$author$project$CampaignForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$CampaignForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			default:
				var objId = msg.a;
				var res = msg.b;
				if (!res.$) {
					return _Utils_Tuple2(
						model,
						$author$project$CampaignForm$Done(
							$author$project$CampaignForm$Deleted(objId)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$CampaignForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
		}
	});
var $author$project$Main$updateCampaignForm = F3(
	function (model, msg, formModel) {
		var _v0 = A2($author$project$CampaignForm$update, msg, formModel);
		var updatedFormModel = _v0.a;
		var effect = _v0.b;
		switch (effect.$) {
			case 0:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$Main$FormPage(
								$author$project$Main$CampaignFormPage(updatedFormModel))
						}),
					$elm$core$Platform$Cmd$none);
			case 1:
				var innerCmd = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{d: $author$project$Main$Loading}),
					innerCmd);
			case 2:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{b: $author$project$Main$Overview}),
					$elm$core$Platform$Cmd$none);
			case 3:
				var returnValue = effect.a;
				if (!returnValue.$) {
					var obj = returnValue.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A2($author$project$Main$insertOrUpdateInList, obj, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$CampaignPage(obj.j)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					var objId = returnValue.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A2($author$project$Main$deleteFromList, objId, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$Overview
							}),
						$elm$core$Platform$Cmd$none);
				}
			default:
				var err = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							d: $author$project$Main$Failure(err)
						}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$findCampaigns = F3(
	function (innerChangeFn, campaignId, campaigns) {
		if (campaigns.b) {
			var one = campaigns.a;
			var rest = campaigns.b;
			return _Utils_eq(one.j, campaignId) ? A2(
				$elm$core$List$cons,
				innerChangeFn(one),
				rest) : A2(
				$elm$core$List$cons,
				one,
				A3($author$project$Main$findCampaigns, innerChangeFn, campaignId, rest));
		} else {
			return _List_Nil;
		}
	});
var $author$project$Api$Mutation$AddDayRequiredArguments = F2(
	function (campaignID, title) {
		return {L: campaignID, p: title};
	});
var $author$project$DayForm$ClosedWithoutChange = {$: 2};
var $author$project$Api$Mutation$DeleteDayRequiredArguments = function (id) {
	return {j: id};
};
var $author$project$DayForm$Deleted = function (a) {
	return {$: 1, a: a};
};
var $author$project$DayForm$Done = function (a) {
	return {$: 3, a: a};
};
var $author$project$DayForm$Error = function (a) {
	return {$: 4, a: a};
};
var $author$project$DayForm$GotDelete = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $author$project$DayForm$GotNew = function (a) {
	return {$: 3, a: a};
};
var $author$project$DayForm$GotUpdated = function (a) {
	return {$: 4, a: a};
};
var $author$project$DayForm$Loading = function (a) {
	return {$: 1, a: a};
};
var $author$project$DayForm$NewOrUpdated = function (a) {
	return {$: 0, a: a};
};
var $author$project$DayForm$None = {$: 0};
var $author$project$Api$Mutation$UpdateDayRequiredArguments = F2(
	function (id, title) {
		return {j: id, p: title};
	});
var $author$project$Api$Mutation$addDay = F2(
	function (requiredArgs____, object____) {
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'addDay',
			_List_fromArray(
				[
					A3(
					$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
					'campaignID',
					requiredArgs____.L,
					A2(
						$author$project$Api$Scalar$unwrapEncoder,
						function ($) {
							return $.a5;
						},
						$author$project$IdScalarCodecs$codecs)),
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'title', requiredArgs____.p, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string)
				]),
			object____,
			$elm$core$Basics$identity);
	});
var $author$project$Api$Mutation$deleteDay = function (requiredArgs____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
		'Bool',
		'deleteDay',
		_List_fromArray(
			[
				A3(
				$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
				'id',
				requiredArgs____.j,
				A2(
					$author$project$Api$Scalar$unwrapEncoder,
					function ($) {
						return $.a5;
					},
					$author$project$IdScalarCodecs$codecs))
			]),
		$elm$json$Json$Decode$bool);
};
var $author$project$Api$Mutation$updateDay = F2(
	function (requiredArgs____, object____) {
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'updateDay',
			_List_fromArray(
				[
					A3(
					$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
					'id',
					requiredArgs____.j,
					A2(
						$author$project$Api$Scalar$unwrapEncoder,
						function ($) {
							return $.a5;
						},
						$author$project$IdScalarCodecs$codecs)),
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'title', requiredArgs____.p, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string)
				]),
			object____,
			$elm$core$Basics$identity);
	});
var $author$project$DayForm$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var formMsg = msg.a;
				var updatedModel = function () {
					var t = formMsg;
					return _Utils_update(
						model,
						{p: t});
				}();
				return _Utils_Tuple2(updatedModel, $author$project$DayForm$None);
			case 1:
				var action = msg.a;
				switch (action.$) {
					case 0:
						return _Utils_Tuple2(
							model,
							$author$project$DayForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$DayForm$GotNew,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A2(
											$author$project$Api$Mutation$addDay,
											A2($author$project$Api$Mutation$AddDayRequiredArguments, model.as, model.p),
											$author$project$Data$daySelectionSet)))));
					case 1:
						var objId = action.a;
						return _Utils_Tuple2(
							model,
							$author$project$DayForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$DayForm$GotUpdated,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A2(
											$author$project$Api$Mutation$updateDay,
											A2($author$project$Api$Mutation$UpdateDayRequiredArguments, objId, model.p),
											$author$project$Data$daySelectionSet)))));
					default:
						var objId = action.a;
						return _Utils_Tuple2(
							model,
							$author$project$DayForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$DayForm$GotDelete(objId),
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										$author$project$Api$Mutation$deleteDay(
											$author$project$Api$Mutation$DeleteDayRequiredArguments(objId))))));
				}
			case 2:
				return _Utils_Tuple2(model, $author$project$DayForm$ClosedWithoutChange);
			case 3:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$DayForm$Done(
							$author$project$DayForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$DayForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			case 4:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$DayForm$Done(
							$author$project$DayForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$DayForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			default:
				var objId = msg.a;
				var res = msg.b;
				if (!res.$) {
					return _Utils_Tuple2(
						model,
						$author$project$DayForm$Done(
							$author$project$DayForm$Deleted(objId)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$DayForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
		}
	});
var $author$project$Main$updateDayForm = F3(
	function (model, msg, formModel) {
		var _v0 = A2($author$project$DayForm$update, msg, formModel);
		var updatedFormModel = _v0.a;
		var effect = _v0.b;
		switch (effect.$) {
			case 0:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$Main$FormPage(
								$author$project$Main$DayFormPage(updatedFormModel))
						}),
					$elm$core$Platform$Cmd$none);
			case 1:
				var innerCmd = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{d: $author$project$Main$Loading}),
					innerCmd);
			case 2:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$Main$CampaignPage(updatedFormModel.as)
						}),
					$elm$core$Platform$Cmd$none);
			case 3:
				var returnValue = effect.a;
				if (!returnValue.$) {
					var obj = returnValue.a;
					var newOrEditObj = function (campaign) {
						return _Utils_update(
							campaign,
							{
								ak: A2($author$project$Main$insertOrUpdateInList, obj, campaign.ak)
							});
					};
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A3($author$project$Main$findCampaigns, newOrEditObj, updatedFormModel.as, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$CampaignPage(updatedFormModel.as)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					var objId = returnValue.a;
					var deleteObj = function (campaign) {
						return _Utils_update(
							campaign,
							{
								ak: A2($author$project$Main$deleteFromList, objId, campaign.ak)
							});
					};
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A3($author$project$Main$findCampaigns, deleteObj, updatedFormModel.as, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$CampaignPage(updatedFormModel.as)
							}),
						$elm$core$Platform$Cmd$none);
				}
			default:
				var err = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							d: $author$project$Main$Failure(err)
						}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Api$Mutation$AddEventRequiredArguments = F4(
	function (campaignID, title, capacity, maxSpecialPupils) {
		return {L: campaignID, Y: capacity, ab: maxSpecialPupils, p: title};
	});
var $author$project$EventForm$ClosedWithoutChange = {$: 2};
var $author$project$Api$Mutation$DeleteEventRequiredArguments = function (id) {
	return {j: id};
};
var $author$project$EventForm$Deleted = function (a) {
	return {$: 1, a: a};
};
var $author$project$EventForm$Done = function (a) {
	return {$: 3, a: a};
};
var $author$project$EventForm$Error = function (a) {
	return {$: 4, a: a};
};
var $author$project$EventForm$GotDelete = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $author$project$EventForm$GotNew = function (a) {
	return {$: 3, a: a};
};
var $author$project$EventForm$GotUpdated = function (a) {
	return {$: 4, a: a};
};
var $author$project$EventForm$Loading = function (a) {
	return {$: 1, a: a};
};
var $author$project$EventForm$NewOrUpdated = function (a) {
	return {$: 0, a: a};
};
var $author$project$EventForm$None = {$: 0};
var $author$project$Api$Mutation$UpdateEventRequiredArguments = function (id) {
	return {j: id};
};
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$int = function (value) {
	return $dillonkearns$elm_graphql$Graphql$Internal$Encode$Json(
		$elm$json$Json$Encode$int(value));
};
var $author$project$Api$Mutation$addEvent = F3(
	function (fillInOptionals____, requiredArgs____, object____) {
		var filledInOptionals____ = fillInOptionals____(
			{N: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent});
		var optionalArgs____ = A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					A3(
					$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional,
					'dayIDs',
					filledInOptionals____.N,
					$dillonkearns$elm_graphql$Graphql$Internal$Encode$list(
						A2(
							$author$project$Api$Scalar$unwrapEncoder,
							function ($) {
								return $.a5;
							},
							$author$project$IdScalarCodecs$codecs)))
				]));
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'addEvent',
			_Utils_ap(
				optionalArgs____,
				_List_fromArray(
					[
						A3(
						$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
						'campaignID',
						requiredArgs____.L,
						A2(
							$author$project$Api$Scalar$unwrapEncoder,
							function ($) {
								return $.a5;
							},
							$author$project$IdScalarCodecs$codecs)),
						A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'title', requiredArgs____.p, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string),
						A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'capacity', requiredArgs____.Y, $dillonkearns$elm_graphql$Graphql$Internal$Encode$int),
						A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'maxSpecialPupils', requiredArgs____.ab, $dillonkearns$elm_graphql$Graphql$Internal$Encode$int)
					])),
			object____,
			$elm$core$Basics$identity);
	});
var $author$project$Api$Mutation$deleteEvent = function (requiredArgs____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
		'Bool',
		'deleteEvent',
		_List_fromArray(
			[
				A3(
				$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
				'id',
				requiredArgs____.j,
				A2(
					$author$project$Api$Scalar$unwrapEncoder,
					function ($) {
						return $.a5;
					},
					$author$project$IdScalarCodecs$codecs))
			]),
		$elm$json$Json$Decode$bool);
};
var $author$project$Api$Mutation$updateEvent = F3(
	function (fillInOptionals____, requiredArgs____, object____) {
		var filledInOptionals____ = fillInOptionals____(
			{Y: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent, N: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent, ab: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent, p: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent});
		var optionalArgs____ = A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional, 'title', filledInOptionals____.p, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string),
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional, 'capacity', filledInOptionals____.Y, $dillonkearns$elm_graphql$Graphql$Internal$Encode$int),
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional, 'maxSpecialPupils', filledInOptionals____.ab, $dillonkearns$elm_graphql$Graphql$Internal$Encode$int),
					A3(
					$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional,
					'dayIDs',
					filledInOptionals____.N,
					$dillonkearns$elm_graphql$Graphql$Internal$Encode$list(
						A2(
							$author$project$Api$Scalar$unwrapEncoder,
							function ($) {
								return $.a5;
							},
							$author$project$IdScalarCodecs$codecs)))
				]));
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'updateEvent',
			_Utils_ap(
				optionalArgs____,
				_List_fromArray(
					[
						A3(
						$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
						'id',
						requiredArgs____.j,
						A2(
							$author$project$Api$Scalar$unwrapEncoder,
							function ($) {
								return $.a5;
							},
							$author$project$IdScalarCodecs$codecs))
					])),
			object____,
			$elm$core$Basics$identity);
	});
var $author$project$EventForm$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var formMsg = msg.a;
				var updatedModel = function () {
					switch (formMsg.$) {
						case 0:
							var t = formMsg.a;
							return _Utils_update(
								model,
								{p: t});
						case 1:
							var cap = formMsg.a;
							return _Utils_update(
								model,
								{Y: cap});
						default:
							var msp = formMsg.a;
							return _Utils_update(
								model,
								{ab: msp});
					}
				}();
				return _Utils_Tuple2(updatedModel, $author$project$EventForm$None);
			case 1:
				var action = msg.a;
				switch (action.$) {
					case 0:
						var optionalArgs = function (args) {
							return args;
						};
						return _Utils_Tuple2(
							model,
							$author$project$EventForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$EventForm$GotNew,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A3(
											$author$project$Api$Mutation$addEvent,
											optionalArgs,
											A4($author$project$Api$Mutation$AddEventRequiredArguments, model.as, model.p, model.Y, model.ab),
											$author$project$Data$eventSelectionSet)))));
					case 1:
						var objId = action.a;
						var optionalArgs = function (args) {
							return _Utils_update(
								args,
								{
									Y: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(model.Y),
									ab: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(model.ab),
									p: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(model.p)
								});
						};
						return _Utils_Tuple2(
							model,
							$author$project$EventForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$EventForm$GotUpdated,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A3(
											$author$project$Api$Mutation$updateEvent,
											optionalArgs,
											$author$project$Api$Mutation$UpdateEventRequiredArguments(objId),
											$author$project$Data$eventSelectionSet)))));
					default:
						var objId = action.a;
						return _Utils_Tuple2(
							model,
							$author$project$EventForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$EventForm$GotDelete(objId),
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										$author$project$Api$Mutation$deleteEvent(
											$author$project$Api$Mutation$DeleteEventRequiredArguments(objId))))));
				}
			case 2:
				return _Utils_Tuple2(model, $author$project$EventForm$ClosedWithoutChange);
			case 3:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$EventForm$Done(
							$author$project$EventForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$EventForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			case 4:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$EventForm$Done(
							$author$project$EventForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$EventForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			default:
				var objId = msg.a;
				var res = msg.b;
				if (!res.$) {
					return _Utils_Tuple2(
						model,
						$author$project$EventForm$Done(
							$author$project$EventForm$Deleted(objId)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$EventForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
		}
	});
var $author$project$Main$updateEventForm = F3(
	function (model, msg, formModel) {
		var _v0 = A2($author$project$EventForm$update, msg, formModel);
		var updatedFormModel = _v0.a;
		var effect = _v0.b;
		switch (effect.$) {
			case 0:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$Main$FormPage(
								$author$project$Main$EventFormPage(updatedFormModel))
						}),
					$elm$core$Platform$Cmd$none);
			case 1:
				var innerCmd = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{d: $author$project$Main$Loading}),
					innerCmd);
			case 2:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$Main$CampaignPage(updatedFormModel.as)
						}),
					$elm$core$Platform$Cmd$none);
			case 3:
				var returnValue = effect.a;
				if (!returnValue.$) {
					var obj = returnValue.a;
					var newOrEditObj = function (campaign) {
						return _Utils_update(
							campaign,
							{
								aA: A2($author$project$Main$insertOrUpdateInList, obj, campaign.aA)
							});
					};
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A3($author$project$Main$findCampaigns, newOrEditObj, updatedFormModel.as, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$CampaignPage(updatedFormModel.as)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					var objId = returnValue.a;
					var deleteObj = function (campaign) {
						return _Utils_update(
							campaign,
							{
								aA: A2($author$project$Main$deleteFromList, objId, campaign.aA)
							});
					};
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A3($author$project$Main$findCampaigns, deleteObj, updatedFormModel.as, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$CampaignPage(updatedFormModel.as)
							}),
						$elm$core$Platform$Cmd$none);
				}
			default:
				var err = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							d: $author$project$Main$Failure(err)
						}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Api$Mutation$AddPupilRequiredArguments = F3(
	function (campaignID, name, _class) {
		return {L: campaignID, _: _class, ac: name};
	});
var $author$project$PupilForm$ClosedWithoutChange = {$: 2};
var $author$project$Api$Mutation$DeletePupilRequiredArguments = function (id) {
	return {j: id};
};
var $author$project$PupilForm$Deleted = function (a) {
	return {$: 1, a: a};
};
var $author$project$PupilForm$Done = function (a) {
	return {$: 3, a: a};
};
var $author$project$PupilForm$Error = function (a) {
	return {$: 4, a: a};
};
var $author$project$PupilForm$GotDelete = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $author$project$PupilForm$GotNew = function (a) {
	return {$: 3, a: a};
};
var $author$project$PupilForm$GotUpdated = function (a) {
	return {$: 4, a: a};
};
var $author$project$PupilForm$Loading = function (a) {
	return {$: 1, a: a};
};
var $author$project$PupilForm$NewOrUpdated = function (a) {
	return {$: 0, a: a};
};
var $author$project$PupilForm$None = {$: 0};
var $author$project$Api$Mutation$UpdatePupilRequiredArguments = function (id) {
	return {j: id};
};
var $elm$json$Json$Encode$bool = _Json_wrap;
var $dillonkearns$elm_graphql$Graphql$Internal$Encode$bool = function (value) {
	return $dillonkearns$elm_graphql$Graphql$Internal$Encode$Json(
		$elm$json$Json$Encode$bool(value));
};
var $author$project$Api$Mutation$addPupil = F3(
	function (fillInOptionals____, requiredArgs____, object____) {
		var filledInOptionals____ = fillInOptionals____(
			{T: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent});
		var optionalArgs____ = A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional, 'special', filledInOptionals____.T, $dillonkearns$elm_graphql$Graphql$Internal$Encode$bool)
				]));
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'addPupil',
			_Utils_ap(
				optionalArgs____,
				_List_fromArray(
					[
						A3(
						$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
						'campaignID',
						requiredArgs____.L,
						A2(
							$author$project$Api$Scalar$unwrapEncoder,
							function ($) {
								return $.a5;
							},
							$author$project$IdScalarCodecs$codecs)),
						A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'name', requiredArgs____.ac, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string),
						A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required, 'class', requiredArgs____._, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string)
					])),
			object____,
			$elm$core$Basics$identity);
	});
var $author$project$Api$Mutation$deletePupil = function (requiredArgs____) {
	return A4(
		$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForField,
		'Bool',
		'deletePupil',
		_List_fromArray(
			[
				A3(
				$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
				'id',
				requiredArgs____.j,
				A2(
					$author$project$Api$Scalar$unwrapEncoder,
					function ($) {
						return $.a5;
					},
					$author$project$IdScalarCodecs$codecs))
			]),
		$elm$json$Json$Decode$bool);
};
var $author$project$Api$Mutation$updatePupil = F3(
	function (fillInOptionals____, requiredArgs____, object____) {
		var filledInOptionals____ = fillInOptionals____(
			{_: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent, ac: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent, T: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Absent});
		var optionalArgs____ = A2(
			$elm$core$List$filterMap,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional, 'name', filledInOptionals____.ac, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string),
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional, 'class', filledInOptionals____._, $dillonkearns$elm_graphql$Graphql$Internal$Encode$string),
					A3($dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$optional, 'special', filledInOptionals____.T, $dillonkearns$elm_graphql$Graphql$Internal$Encode$bool)
				]));
		return A4(
			$dillonkearns$elm_graphql$Graphql$Internal$Builder$Object$selectionForCompositeField,
			'updatePupil',
			_Utils_ap(
				optionalArgs____,
				_List_fromArray(
					[
						A3(
						$dillonkearns$elm_graphql$Graphql$Internal$Builder$Argument$required,
						'id',
						requiredArgs____.j,
						A2(
							$author$project$Api$Scalar$unwrapEncoder,
							function ($) {
								return $.a5;
							},
							$author$project$IdScalarCodecs$codecs))
					])),
			object____,
			$elm$core$Basics$identity);
	});
var $author$project$PupilForm$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var formMsg = msg.a;
				var updatedModel = function () {
					switch (formMsg.$) {
						case 0:
							var n = formMsg.a;
							return _Utils_update(
								model,
								{ac: n});
						case 1:
							var cls = formMsg.a;
							return _Utils_update(
								model,
								{_: cls});
						default:
							var isp = formMsg.a;
							return _Utils_update(
								model,
								{bf: isp});
					}
				}();
				return _Utils_Tuple2(updatedModel, $author$project$PupilForm$None);
			case 1:
				var action = msg.a;
				switch (action.$) {
					case 0:
						var optionalArguments = function (args) {
							return _Utils_update(
								args,
								{
									T: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(model.bf)
								});
						};
						return _Utils_Tuple2(
							model,
							$author$project$PupilForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$PupilForm$GotNew,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A3(
											$author$project$Api$Mutation$addPupil,
											optionalArguments,
											A3($author$project$Api$Mutation$AddPupilRequiredArguments, model.as, model.ac, model._),
											$author$project$Data$pupilSelectionSet)))));
					case 1:
						var objId = action.a;
						var optionalArgs = function (args) {
							return _Utils_update(
								args,
								{
									_: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(model._),
									ac: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(model.ac),
									T: $dillonkearns$elm_graphql$Graphql$OptionalArgument$Present(model.bf)
								});
						};
						return _Utils_Tuple2(
							model,
							$author$project$PupilForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$PupilForm$GotUpdated,
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										A3(
											$author$project$Api$Mutation$updatePupil,
											optionalArgs,
											$author$project$Api$Mutation$UpdatePupilRequiredArguments(objId),
											$author$project$Data$pupilSelectionSet)))));
					default:
						var objId = action.a;
						return _Utils_Tuple2(
							model,
							$author$project$PupilForm$Loading(
								A2(
									$dillonkearns$elm_graphql$Graphql$Http$send,
									$author$project$PupilForm$GotDelete(objId),
									A2(
										$dillonkearns$elm_graphql$Graphql$Http$mutationRequest,
										$author$project$Shared$queryUrl,
										$author$project$Api$Mutation$deletePupil(
											$author$project$Api$Mutation$DeletePupilRequiredArguments(objId))))));
				}
			case 2:
				return _Utils_Tuple2(model, $author$project$PupilForm$ClosedWithoutChange);
			case 3:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$PupilForm$Done(
							$author$project$PupilForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$PupilForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			case 4:
				var res = msg.a;
				if (!res.$) {
					var obj = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$PupilForm$Done(
							$author$project$PupilForm$NewOrUpdated(obj)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$PupilForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
			default:
				var objId = msg.a;
				var res = msg.b;
				if (!res.$) {
					return _Utils_Tuple2(
						model,
						$author$project$PupilForm$Done(
							$author$project$PupilForm$Deleted(objId)));
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						model,
						$author$project$PupilForm$Error(
							$author$project$Shared$parseGraphqlError(err)));
				}
		}
	});
var $author$project$Main$updatePupilForm = F3(
	function (model, msg, formModel) {
		var _v0 = A2($author$project$PupilForm$update, msg, formModel);
		var updatedFormModel = _v0.a;
		var effect = _v0.b;
		switch (effect.$) {
			case 0:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$Main$FormPage(
								$author$project$Main$PupilFormPage(updatedFormModel))
						}),
					$elm$core$Platform$Cmd$none);
			case 1:
				var innerCmd = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{d: $author$project$Main$Loading}),
					innerCmd);
			case 2:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							b: $author$project$Main$CampaignPage(updatedFormModel.as)
						}),
					$elm$core$Platform$Cmd$none);
			case 3:
				var returnValue = effect.a;
				if (!returnValue.$) {
					var obj = returnValue.a;
					var newOrEditObj = function (campaign) {
						return _Utils_update(
							campaign,
							{
								bp: A2($author$project$Main$insertOrUpdateInList, obj, campaign.bp)
							});
					};
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A3($author$project$Main$findCampaigns, newOrEditObj, updatedFormModel.as, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$CampaignPage(updatedFormModel.as)
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					var objId = returnValue.a;
					var deleteObj = function (campaign) {
						return _Utils_update(
							campaign,
							{
								bp: A2($author$project$Main$deleteFromList, objId, campaign.bp)
							});
					};
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								a: A3($author$project$Main$findCampaigns, deleteObj, updatedFormModel.as, model.a),
								d: $author$project$Main$Success,
								b: $author$project$Main$CampaignPage(updatedFormModel.as)
							}),
						$elm$core$Platform$Cmd$none);
				}
			default:
				var err = effect.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							d: $author$project$Main$Failure(err)
						}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$updateForm = F3(
	function (model, msg, formPage) {
		switch (formPage.$) {
			case 0:
				var formModel = formPage.a;
				if (!msg.$) {
					var innerMsg = msg.a;
					return A2(
						$elm$core$Tuple$mapSecond,
						$elm$core$Platform$Cmd$map($author$project$Main$CampaignFormMsg),
						A3($author$project$Main$updateCampaignForm, model, innerMsg, formModel));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 1:
				var formModel = formPage.a;
				if (msg.$ === 1) {
					var innerMsg = msg.a;
					return A2(
						$elm$core$Tuple$mapSecond,
						$elm$core$Platform$Cmd$map($author$project$Main$DayFormMsg),
						A3($author$project$Main$updateDayForm, model, innerMsg, formModel));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 2:
				var formModel = formPage.a;
				if (msg.$ === 2) {
					var innerMsg = msg.a;
					return A2(
						$elm$core$Tuple$mapSecond,
						$elm$core$Platform$Cmd$map($author$project$Main$EventFormMsg),
						A3($author$project$Main$updateEventForm, model, innerMsg, formModel));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			default:
				var formModel = formPage.a;
				if (msg.$ === 3) {
					var innerMsg = msg.a;
					return A2(
						$elm$core$Tuple$mapSecond,
						$elm$core$Platform$Cmd$map($author$project$Main$PupilFormMsg),
						A3($author$project$Main$updatePupilForm, model, innerMsg, formModel));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
		}
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				var res = msg.a;
				if (!res.$) {
					var campaigns = res.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{a: campaigns, d: $author$project$Main$Success}),
						$elm$core$Platform$Cmd$none);
				} else {
					var err = res.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								d: $author$project$Main$Failure(
									$author$project$Shared$parseGraphqlError(err))
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 1:
				var s = msg.a;
				switch (s.$) {
					case 0:
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{b: $author$project$Main$Overview}),
							$elm$core$Platform$Cmd$none);
					case 2:
						var action = s.a;
						var formModel = function () {
							var emptyForm = $author$project$CampaignForm$init(action);
							switch (action.$) {
								case 0:
									return emptyForm;
								case 1:
									var objId = action.a;
									var _v4 = $elm$core$List$head(
										A2(
											$elm$core$List$filter,
											function (c) {
												return _Utils_eq(c.j, objId);
											},
											model.a));
									if (!_v4.$) {
										var obj = _v4.a;
										return _Utils_update(
											emptyForm,
											{p: obj.p});
									} else {
										return emptyForm;
									}
								default:
									var objId = action.a;
									var _v5 = $elm$core$List$head(
										A2(
											$elm$core$List$filter,
											function (c) {
												return _Utils_eq(c.j, objId);
											},
											model.a));
									if (!_v5.$) {
										var obj = _v5.a;
										return _Utils_update(
											emptyForm,
											{p: obj.p});
									} else {
										return emptyForm;
									}
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$Main$FormPage(
										$author$project$Main$CampaignFormPage(formModel))
								}),
							$elm$core$Platform$Cmd$none);
					case 3:
						var campaignId = s.a;
						var action = s.b;
						var formModel = function () {
							var emptyForm = A2($author$project$DayForm$init, campaignId, action);
							switch (action.$) {
								case 0:
									return emptyForm;
								case 1:
									var objId = action.a;
									var _v7 = A4(
										$author$project$Main$getObjFromCampaign,
										campaignId,
										objId,
										function ($) {
											return $.ak;
										},
										model.a);
									if (!_v7.$) {
										var obj = _v7.a;
										return _Utils_update(
											emptyForm,
											{p: obj.p});
									} else {
										return emptyForm;
									}
								default:
									var objId = action.a;
									var _v8 = A4(
										$author$project$Main$getObjFromCampaign,
										campaignId,
										objId,
										function ($) {
											return $.ak;
										},
										model.a);
									if (!_v8.$) {
										var obj = _v8.a;
										return _Utils_update(
											emptyForm,
											{p: obj.p});
									} else {
										return emptyForm;
									}
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$Main$FormPage(
										$author$project$Main$DayFormPage(formModel))
								}),
							$elm$core$Platform$Cmd$none);
					case 4:
						var campaignId = s.a;
						var action = s.b;
						var formModel = function () {
							var emptyForm = A2($author$project$EventForm$init, campaignId, action);
							switch (action.$) {
								case 0:
									return emptyForm;
								case 1:
									var objId = action.a;
									var _v10 = A4(
										$author$project$Main$getObjFromCampaign,
										campaignId,
										objId,
										function ($) {
											return $.aA;
										},
										model.a);
									if (!_v10.$) {
										var obj = _v10.a;
										return _Utils_update(
											emptyForm,
											{Y: obj.Y, ab: obj.ab, p: obj.p});
									} else {
										return emptyForm;
									}
								default:
									var objId = action.a;
									var _v11 = A4(
										$author$project$Main$getObjFromCampaign,
										campaignId,
										objId,
										function ($) {
											return $.aA;
										},
										model.a);
									if (!_v11.$) {
										var obj = _v11.a;
										return _Utils_update(
											emptyForm,
											{p: obj.p});
									} else {
										return emptyForm;
									}
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$Main$FormPage(
										$author$project$Main$EventFormPage(formModel))
								}),
							$elm$core$Platform$Cmd$none);
					case 5:
						var campaignId = s.a;
						var action = s.b;
						var formModel = function () {
							var emptyForm = A2($author$project$PupilForm$init, campaignId, action);
							switch (action.$) {
								case 0:
									return emptyForm;
								case 1:
									var objId = action.a;
									var _v13 = A4(
										$author$project$Main$getObjFromCampaign,
										campaignId,
										objId,
										function ($) {
											return $.bp;
										},
										model.a);
									if (!_v13.$) {
										var obj = _v13.a;
										return _Utils_update(
											emptyForm,
											{_: obj._, bf: obj.bf, ac: obj.ac});
									} else {
										return emptyForm;
									}
								default:
									var objId = action.a;
									var _v14 = A4(
										$author$project$Main$getObjFromCampaign,
										campaignId,
										objId,
										function ($) {
											return $.bp;
										},
										model.a);
									if (!_v14.$) {
										var obj = _v14.a;
										return _Utils_update(
											emptyForm,
											{ac: obj.ac});
									} else {
										return emptyForm;
									}
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$Main$FormPage(
										$author$project$Main$PupilFormPage(formModel))
								}),
							$elm$core$Platform$Cmd$none);
					case 1:
						var campaignId = s.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$Main$CampaignPage(campaignId)
								}),
							$elm$core$Platform$Cmd$none);
					default:
						var pupil = s.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									b: $author$project$Main$PupilPage(pupil)
								}),
							$elm$core$Platform$Cmd$none);
				}
			default:
				var formMsg = msg.a;
				var _v15 = model.b;
				if (_v15.$ === 2) {
					var fp = _v15.a;
					return A2(
						$elm$core$Tuple$mapSecond,
						$elm$core$Platform$Cmd$map($author$project$Main$FormMsg),
						A3($author$project$Main$updateForm, model, formMsg, fp));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
		}
	});
var $author$project$CampaignForm$New = {$: 0};
var $author$project$Main$SwitchPage = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$SwitchToCampaign = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$SwitchToCampaignFormPage = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$button = _VirtualDom_node('button');
var $author$project$CampaignForm$Delete = function (a) {
	return {$: 2, a: a};
};
var $author$project$CampaignForm$Edit = function (a) {
	return {$: 1, a: a};
};
var $author$project$DayForm$New = {$: 0};
var $author$project$EventForm$New = {$: 0};
var $author$project$PupilForm$New = {$: 0};
var $author$project$Main$SwitchToDayFormPage = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $author$project$Main$SwitchToEventFormPage = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $author$project$Main$SwitchToPupilFormPage = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $author$project$Shared$classes = function (s) {
	var cl = A2(
		$elm$core$List$map,
		function (c) {
			return _Utils_Tuple2(c, true);
		},
		A2($elm$core$String$split, ' ', s));
	return $elm$html$Html$Attributes$classList(cl);
};
var $author$project$DayForm$Delete = function (a) {
	return {$: 2, a: a};
};
var $author$project$DayForm$Edit = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$a = _VirtualDom_node('a');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $elm$html$Html$Attributes$name = $elm$html$Html$Attributes$stringProperty('name');
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$node = $elm$virtual_dom$VirtualDom$node;
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$span = _VirtualDom_node('span');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $author$project$Main$dayView = F2(
	function (campaign, day) {
		var unassignedPupils = _List_Nil;
		var events = _List_Nil;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('block')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$author$project$Shared$classes('field is-grouped is-grouped-multiline')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('control')
								]),
							A2(
								$elm$core$List$cons,
								A2(
									$elm$html$Html$h2,
									_List_fromArray(
										[
											$author$project$Shared$classes('title is-5')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(day.p)
										])),
								_Utils_ap(events, unassignedPupils))),
							A2(
							$elm$html$Html$a,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$title('Bearbeiten'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$SwitchPage(
										A2(
											$author$project$Main$SwitchToDayFormPage,
											campaign.j,
											$author$project$DayForm$Edit(day.j))))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('icon')
										]),
									_List_fromArray(
										[
											A3(
											$elm$html$Html$node,
											'ion-icon',
											_List_fromArray(
												[
													$elm$html$Html$Attributes$name('create-outline')
												]),
											_List_Nil)
										]))
								])),
							A2(
							$elm$html$Html$a,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$title('Löschen'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$SwitchPage(
										A2(
											$author$project$Main$SwitchToDayFormPage,
											campaign.j,
											$author$project$DayForm$Delete(day.j))))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('icon')
										]),
									_List_fromArray(
										[
											A3(
											$elm$html$Html$node,
											'ion-icon',
											_List_fromArray(
												[
													$elm$html$Html$Attributes$name('trash-outline')
												]),
											_List_Nil)
										]))
								]))
						]))
				]));
	});
var $author$project$EventForm$Delete = function (a) {
	return {$: 2, a: a};
};
var $author$project$EventForm$Edit = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $author$project$Main$eventView = F2(
	function (campaign, event) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('block')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$author$project$Shared$classes('field is-grouped is-grouped-multiline')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('control')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$h3,
									_List_fromArray(
										[
											$author$project$Shared$classes('subtitle is-5')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(event.p)
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('control')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$author$project$Shared$classes('tags has-addons')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tag')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('max.')
												])),
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$author$project$Shared$classes('tag is-primary')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													$elm$core$String$fromInt(event.Y))
												]))
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('control')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$author$project$Shared$classes('tags has-addons')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('tag')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('bes.')
												])),
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$author$project$Shared$classes('tag is-primary')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													$elm$core$String$fromInt(event.ab))
												]))
										]))
								])),
							A2(
							$elm$html$Html$a,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$title('Bearbeiten'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$SwitchPage(
										A2(
											$author$project$Main$SwitchToEventFormPage,
											campaign.j,
											$author$project$EventForm$Edit(event.j))))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('icon')
										]),
									_List_fromArray(
										[
											A3(
											$elm$html$Html$node,
											'ion-icon',
											_List_fromArray(
												[
													$elm$html$Html$Attributes$name('create-outline')
												]),
											_List_Nil)
										]))
								])),
							A2(
							$elm$html$Html$a,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$title('Löschen'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$SwitchPage(
										A2(
											$author$project$Main$SwitchToEventFormPage,
											campaign.j,
											$author$project$EventForm$Delete(event.j))))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('icon')
										]),
									_List_fromArray(
										[
											A3(
											$elm$html$Html$node,
											'ion-icon',
											_List_fromArray(
												[
													$elm$html$Html$Attributes$name('trash-outline')
												]),
											_List_Nil)
										]))
								]))
						]))
				]));
	});
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $author$project$PupilForm$Delete = function (a) {
	return {$: 2, a: a};
};
var $author$project$PupilForm$Edit = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$SwitchToPupil = function (a) {
	return {$: 6, a: a};
};
var $elm$html$Html$li = _VirtualDom_node('li');
var $author$project$Main$pupilToStr = function (p) {
	return p.ac + (' (Klasse ' + (p._ + ')'));
};
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Main$pupilUl = F2(
	function (campaign, pupils) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('block')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$ul,
					_List_Nil,
					A2(
						$elm$core$List$map,
						function (pupil) {
							return A2(
								$elm$html$Html$li,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										$elm$html$Html$a,
										_List_fromArray(
											[
												$elm$html$Html$Events$onClick(
												$author$project$Main$SwitchPage(
													$author$project$Main$SwitchToPupil(pupil)))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												$author$project$Main$pupilToStr(pupil))
											])),
										A2(
										$elm$html$Html$a,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$title('Bearbeiten'),
												$elm$html$Html$Events$onClick(
												$author$project$Main$SwitchPage(
													A2(
														$author$project$Main$SwitchToPupilFormPage,
														campaign.j,
														$author$project$PupilForm$Edit(pupil.j))))
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('icon')
													]),
												_List_fromArray(
													[
														A3(
														$elm$html$Html$node,
														'ion-icon',
														_List_fromArray(
															[
																$elm$html$Html$Attributes$name('create-outline')
															]),
														_List_Nil)
													]))
											])),
										A2(
										$elm$html$Html$a,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$title('Löschen'),
												$elm$html$Html$Events$onClick(
												$author$project$Main$SwitchPage(
													A2(
														$author$project$Main$SwitchToPupilFormPage,
														campaign.j,
														$author$project$PupilForm$Delete(pupil.j))))
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('icon')
													]),
												_List_fromArray(
													[
														A3(
														$elm$html$Html$node,
														'ion-icon',
														_List_fromArray(
															[
																$elm$html$Html$Attributes$name('trash-outline')
															]),
														_List_Nil)
													]))
											]))
									]));
						},
						pupils))
				]));
	});
var $author$project$Main$campaignView = function (c) {
	if (c.$ === 1) {
		return _List_Nil;
	} else {
		var campaign = c.a;
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$h1,
				_List_fromArray(
					[
						$author$project$Shared$classes('title is-3')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(campaign.p)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('block')
					]),
				_Utils_ap(
					A2(
						$elm$core$List$map,
						$author$project$Main$dayView(campaign),
						campaign.ak),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$author$project$Shared$classes('button is-primary'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$SwitchPage(
										A2($author$project$Main$SwitchToDayFormPage, campaign.j, $author$project$DayForm$New)))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Neuer Tag')
								]))
						]))),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('block')
					]),
				A2(
					$elm$core$List$cons,
					A2(
						$elm$html$Html$h2,
						_List_fromArray(
							[
								$author$project$Shared$classes('title is-5')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Alle Angebote')
							])),
					_Utils_ap(
						A2(
							$elm$core$List$map,
							$author$project$Main$eventView(campaign),
							campaign.aA),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$author$project$Shared$classes('button is-primary'),
										$elm$html$Html$Events$onClick(
										$author$project$Main$SwitchPage(
											A2($author$project$Main$SwitchToEventFormPage, campaign.j, $author$project$EventForm$New)))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Neues Angebot')
									]))
							])))),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('block')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h2,
						_List_fromArray(
							[
								$author$project$Shared$classes('title is-5')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Alle Schüler/innen')
							])),
						A2($author$project$Main$pupilUl, campaign, campaign.bp),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$author$project$Shared$classes('button is-primary'),
								$elm$html$Html$Events$onClick(
								$author$project$Main$SwitchPage(
									A2($author$project$Main$SwitchToPupilFormPage, campaign.j, $author$project$PupilForm$New)))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Neue Schüler/innen')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('block')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h2,
						_List_fromArray(
							[
								$author$project$Shared$classes('title is-5')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Administration')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('buttons')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$author$project$Shared$classes('button is-primary'),
										$elm$html$Html$Events$onClick(
										$author$project$Main$SwitchPage(
											$author$project$Main$SwitchToCampaignFormPage(
												$author$project$CampaignForm$Edit(campaign.j))))
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('icon')
											]),
										_List_fromArray(
											[
												A3(
												$elm$html$Html$node,
												'ion-icon',
												_List_fromArray(
													[
														$elm$html$Html$Attributes$name('create-sharp')
													]),
												_List_Nil)
											])),
										A2(
										$elm$html$Html$span,
										_List_Nil,
										_List_fromArray(
											[
												$elm$html$Html$text('Kampagne bearbeiten')
											]))
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$author$project$Shared$classes('button is-danger'),
										$elm$html$Html$Events$onClick(
										$author$project$Main$SwitchPage(
											$author$project$Main$SwitchToCampaignFormPage(
												$author$project$CampaignForm$Delete(campaign.j))))
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('icon')
											]),
										_List_fromArray(
											[
												A3(
												$elm$html$Html$node,
												'ion-icon',
												_List_fromArray(
													[
														$elm$html$Html$Attributes$name('trash-sharp')
													]),
												_List_Nil)
											])),
										A2(
										$elm$html$Html$span,
										_List_Nil,
										_List_fromArray(
											[
												$elm$html$Html$text('Kampagne löschen')
											]))
									]))
							]))
					]))
			]);
	}
};
var $author$project$Main$getCampaign = F2(
	function (campaignId, campaigns) {
		return $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (c) {
					return _Utils_eq(c.j, campaignId);
				},
				campaigns));
	});
var $elm$html$Html$main_ = _VirtualDom_node('main');
var $elm$virtual_dom$VirtualDom$map = _VirtualDom_map;
var $elm$html$Html$map = $elm$virtual_dom$VirtualDom$map;
var $author$project$Main$SwitchToOverview = {$: 0};
var $elm$html$Html$nav = _VirtualDom_node('nav');
var $author$project$Main$navbar = A2(
	$elm$html$Html$nav,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('navbar')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('navbar-brand')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$author$project$Shared$classes('navbar-item'),
							$elm$html$Html$Events$onClick(
							$author$project$Main$SwitchPage($author$project$Main$SwitchToOverview))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Home')
						]))
				]))
		]));
var $elm$html$Html$p = _VirtualDom_node('p');
var $author$project$Main$pupilView = function (pup) {
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$h1,
			_List_fromArray(
				[
					$author$project$Shared$classes('title is-3')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(
					$author$project$Main$pupilToStr(pup))
				])),
			A2(
			$elm$html$Html$p,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text('Lorem ipsum ...')
				]))
		]);
};
var $elm$html$Html$section = _VirtualDom_node('section');
var $author$project$CampaignForm$CloseForm = {$: 2};
var $author$project$CampaignForm$SendForm = function (a) {
	return {$: 1, a: a};
};
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$footer = _VirtualDom_node('footer');
var $elm$html$Html$header = _VirtualDom_node('header');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $author$project$CampaignForm$viewDelete = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$author$project$Shared$classes('modal is-active')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-background'),
						$elm$html$Html$Events$onClick($author$project$CampaignForm$CloseForm)
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-card')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-head')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-card-title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Kampagne löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('delete'),
										$elm$html$Html$Attributes$type_('button'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
										$elm$html$Html$Events$onClick($author$project$CampaignForm$CloseForm)
									]),
								_List_Nil)
							])),
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-body')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Wollen Sie die Kampagne ' + (model.p + ' wirklich löschen?'))
									]))
							])),
						A2(
						$elm$html$Html$footer,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-foot')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$author$project$Shared$classes('button is-success'),
										$elm$html$Html$Events$onClick(
										$author$project$CampaignForm$SendForm(model.V))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('button'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$CampaignForm$CloseForm)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Abbrechen')
									]))
							]))
					]))
			]));
};
var $author$project$CampaignForm$FormMsg = function (a) {
	return {$: 0, a: a};
};
var $elm$html$Html$form = _VirtualDom_node('form');
var $author$project$CampaignForm$NumOfDays = function (a) {
	return {$: 1, a: a};
};
var $author$project$CampaignForm$Title = function (a) {
	return {$: 0, a: a};
};
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$Attributes$max = $elm$html$Html$Attributes$stringProperty('max');
var $elm$html$Html$Attributes$min = $elm$html$Html$Attributes$stringProperty('min');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$required = $elm$html$Html$Attributes$boolProperty('required');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$CampaignForm$formFields = F2(
	function (model, withDays) {
		var labelNumOfDays = 'Anzahl der Tage';
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('field')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('control')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('input'),
										$elm$html$Html$Attributes$type_('text'),
										$elm$html$Html$Attributes$placeholder('Titel'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Titel'),
										$elm$html$Html$Attributes$required(true),
										$elm$html$Html$Events$onInput($author$project$CampaignForm$Title),
										$elm$html$Html$Attributes$value(model.p)
									]),
								_List_Nil)
							]))
					])),
				withDays ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('field')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('control')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('input'),
										$elm$html$Html$Attributes$type_('number'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', labelNumOfDays),
										$elm$html$Html$Attributes$min('1'),
										$elm$html$Html$Attributes$max('10'),
										$elm$html$Html$Events$onInput(
										A2(
											$elm$core$Basics$composeR,
											$elm$core$String$toInt,
											A2(
												$elm$core$Basics$composeR,
												$elm$core$Maybe$withDefault(0),
												$author$project$CampaignForm$NumOfDays))),
										$elm$html$Html$Attributes$value(
										$elm$core$String$fromInt(model.ai))
									]),
								_List_Nil)
							])),
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('help')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(labelNumOfDays)
							]))
					])) : A2($elm$html$Html$div, _List_Nil, _List_Nil)
			]);
	});
var $elm$html$Html$Events$alwaysPreventDefault = function (msg) {
	return _Utils_Tuple2(msg, true);
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $elm$html$Html$Events$onSubmit = function (msg) {
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'submit',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysPreventDefault,
			$elm$json$Json$Decode$succeed(msg)));
};
var $author$project$CampaignForm$viewNewAndEdit = F2(
	function (headline, model) {
		var withDays = function () {
			var _v0 = model.V;
			if (!_v0.$) {
				return true;
			} else {
				return false;
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$author$project$Shared$classes('modal is-active')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-background'),
							$elm$html$Html$Events$onClick($author$project$CampaignForm$CloseForm)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-card')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$form,
							_List_fromArray(
								[
									$elm$html$Html$Events$onSubmit(
									$author$project$CampaignForm$SendForm(model.V))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$header,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-head')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$p,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-card-title')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(headline)
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('delete'),
													$elm$html$Html$Attributes$type_('button'),
													A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
													$elm$html$Html$Events$onClick($author$project$CampaignForm$CloseForm)
												]),
											_List_Nil)
										])),
									A2(
									$elm$html$Html$section,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-body')
										]),
									A2(
										$elm$core$List$map,
										$elm$html$Html$map($author$project$CampaignForm$FormMsg),
										A2($author$project$CampaignForm$formFields, model, withDays))),
									A2(
									$elm$html$Html$footer,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-foot')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$author$project$Shared$classes('button is-success'),
													$elm$html$Html$Attributes$type_('submit')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Speichern')
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('button'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Events$onClick($author$project$CampaignForm$CloseForm)
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Abbrechen')
												]))
										]))
								]))
						]))
				]));
	});
var $author$project$CampaignForm$view = function (model) {
	var _v0 = model.V;
	switch (_v0.$) {
		case 0:
			return A2($author$project$CampaignForm$viewNewAndEdit, 'Neue Kampagne hinzufügen', model);
		case 1:
			return A2($author$project$CampaignForm$viewNewAndEdit, 'Kampagne bearbeiten', model);
		default:
			return $author$project$CampaignForm$viewDelete(model);
	}
};
var $author$project$DayForm$CloseForm = {$: 2};
var $author$project$DayForm$SendForm = function (a) {
	return {$: 1, a: a};
};
var $author$project$DayForm$viewDelete = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$author$project$Shared$classes('modal is-active')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-background'),
						$elm$html$Html$Events$onClick($author$project$DayForm$CloseForm)
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-card')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-head')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-card-title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Tag löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('delete'),
										$elm$html$Html$Attributes$type_('button'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
										$elm$html$Html$Events$onClick($author$project$DayForm$CloseForm)
									]),
								_List_Nil)
							])),
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-body')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Wollen Sie den Tag ' + (model.p + ' wirklich löschen?'))
									]))
							])),
						A2(
						$elm$html$Html$footer,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-foot')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$author$project$Shared$classes('button is-success'),
										$elm$html$Html$Events$onClick(
										$author$project$DayForm$SendForm(model.V))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('button'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$DayForm$CloseForm)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Abbrechen')
									]))
							]))
					]))
			]));
};
var $author$project$DayForm$FormMsg = function (a) {
	return {$: 0, a: a};
};
var $author$project$DayForm$Title = $elm$core$Basics$identity;
var $author$project$DayForm$formFields = function (model) {
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('field')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('control')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('input'),
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$placeholder('Titel'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Titel'),
									$elm$html$Html$Attributes$required(true),
									$elm$html$Html$Events$onInput($elm$core$Basics$identity),
									$elm$html$Html$Attributes$value(model.p)
								]),
							_List_Nil)
						]))
				]))
		]);
};
var $author$project$DayForm$viewNewAndEdit = F2(
	function (headline, model) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$author$project$Shared$classes('modal is-active')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-background'),
							$elm$html$Html$Events$onClick($author$project$DayForm$CloseForm)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-card')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$form,
							_List_fromArray(
								[
									$elm$html$Html$Events$onSubmit(
									$author$project$DayForm$SendForm(model.V))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$header,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-head')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$p,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-card-title')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(headline)
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('delete'),
													$elm$html$Html$Attributes$type_('button'),
													A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
													$elm$html$Html$Events$onClick($author$project$DayForm$CloseForm)
												]),
											_List_Nil)
										])),
									A2(
									$elm$html$Html$section,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-body')
										]),
									A2(
										$elm$core$List$map,
										$elm$html$Html$map($author$project$DayForm$FormMsg),
										$author$project$DayForm$formFields(model))),
									A2(
									$elm$html$Html$footer,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-foot')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$author$project$Shared$classes('button is-success'),
													$elm$html$Html$Attributes$type_('submit')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Speichern')
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('button'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Events$onClick($author$project$DayForm$CloseForm)
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Abbrechen')
												]))
										]))
								]))
						]))
				]));
	});
var $author$project$DayForm$view = function (model) {
	var _v0 = model.V;
	switch (_v0.$) {
		case 0:
			return A2($author$project$DayForm$viewNewAndEdit, 'Neuen Tag hinzufügen', model);
		case 1:
			return A2($author$project$DayForm$viewNewAndEdit, 'Tag bearbeiten', model);
		default:
			return $author$project$DayForm$viewDelete(model);
	}
};
var $author$project$EventForm$CloseForm = {$: 2};
var $author$project$EventForm$SendForm = function (a) {
	return {$: 1, a: a};
};
var $author$project$EventForm$viewDelete = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$author$project$Shared$classes('modal is-active')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-background'),
						$elm$html$Html$Events$onClick($author$project$EventForm$CloseForm)
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-card')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-head')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-card-title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Angebot löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('delete'),
										$elm$html$Html$Attributes$type_('button'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
										$elm$html$Html$Events$onClick($author$project$EventForm$CloseForm)
									]),
								_List_Nil)
							])),
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-body')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Wollen Sie das Angebot ' + (model.p + ' wirklich löschen?'))
									]))
							])),
						A2(
						$elm$html$Html$footer,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-foot')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$author$project$Shared$classes('button is-success'),
										$elm$html$Html$Events$onClick(
										$author$project$EventForm$SendForm(model.V))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('button'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$EventForm$CloseForm)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Abbrechen')
									]))
							]))
					]))
			]));
};
var $author$project$EventForm$FormMsg = function (a) {
	return {$: 0, a: a};
};
var $author$project$EventForm$Capacity = function (a) {
	return {$: 1, a: a};
};
var $author$project$EventForm$MaxSpecialPupil = function (a) {
	return {$: 2, a: a};
};
var $author$project$EventForm$Title = function (a) {
	return {$: 0, a: a};
};
var $author$project$EventForm$formFields = function (model) {
	var labelMaxSpecialPupils = 'Maximale Anzahl an besonderen Schüler/innen';
	var labelCapacity = 'Maximale Anzahl der Schüler/innen';
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('field')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('control')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('input'),
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$placeholder('Titel'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Titel'),
									$elm$html$Html$Attributes$required(true),
									$elm$html$Html$Events$onInput($author$project$EventForm$Title),
									$elm$html$Html$Attributes$value(model.p)
								]),
							_List_Nil)
						]))
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('field')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('control')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('input'),
									$elm$html$Html$Attributes$type_('number'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', labelCapacity),
									$elm$html$Html$Attributes$min('1'),
									$elm$html$Html$Attributes$max('10000'),
									$elm$html$Html$Events$onInput(
									A2(
										$elm$core$Basics$composeR,
										$elm$core$String$toInt,
										A2(
											$elm$core$Basics$composeR,
											$elm$core$Maybe$withDefault(0),
											$author$project$EventForm$Capacity))),
									$elm$html$Html$Attributes$value(
									$elm$core$String$fromInt(model.Y))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('help')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(labelCapacity)
						]))
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('field')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('control')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('input'),
									$elm$html$Html$Attributes$type_('number'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', labelMaxSpecialPupils),
									$elm$html$Html$Attributes$min('1'),
									$elm$html$Html$Attributes$max('10000'),
									$elm$html$Html$Events$onInput(
									A2(
										$elm$core$Basics$composeR,
										$elm$core$String$toInt,
										A2(
											$elm$core$Basics$composeR,
											$elm$core$Maybe$withDefault(0),
											$author$project$EventForm$MaxSpecialPupil))),
									$elm$html$Html$Attributes$value(
									$elm$core$String$fromInt(model.ab))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('help')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(labelMaxSpecialPupils)
						]))
				]))
		]);
};
var $author$project$EventForm$viewNewAndEdit = F2(
	function (headline, model) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$author$project$Shared$classes('modal is-active')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-background'),
							$elm$html$Html$Events$onClick($author$project$EventForm$CloseForm)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-card')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$form,
							_List_fromArray(
								[
									$elm$html$Html$Events$onSubmit(
									$author$project$EventForm$SendForm(model.V))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$header,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-head')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$p,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-card-title')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(headline)
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('delete'),
													$elm$html$Html$Attributes$type_('button'),
													A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
													$elm$html$Html$Events$onClick($author$project$EventForm$CloseForm)
												]),
											_List_Nil)
										])),
									A2(
									$elm$html$Html$section,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-body')
										]),
									A2(
										$elm$core$List$map,
										$elm$html$Html$map($author$project$EventForm$FormMsg),
										$author$project$EventForm$formFields(model))),
									A2(
									$elm$html$Html$footer,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-foot')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$author$project$Shared$classes('button is-success'),
													$elm$html$Html$Attributes$type_('submit')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Speichern')
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('button'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Events$onClick($author$project$EventForm$CloseForm)
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Abbrechen')
												]))
										]))
								]))
						]))
				]));
	});
var $author$project$EventForm$view = function (model) {
	var _v0 = model.V;
	switch (_v0.$) {
		case 0:
			return A2($author$project$EventForm$viewNewAndEdit, 'Neues Angebot hinzufügen', model);
		case 1:
			return A2($author$project$EventForm$viewNewAndEdit, 'Angebot bearbeiten', model);
		default:
			return $author$project$EventForm$viewDelete(model);
	}
};
var $author$project$PupilForm$CloseForm = {$: 2};
var $author$project$PupilForm$SendForm = function (a) {
	return {$: 1, a: a};
};
var $author$project$PupilForm$viewDelete = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$author$project$Shared$classes('modal is-active')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-background'),
						$elm$html$Html$Events$onClick($author$project$PupilForm$CloseForm)
					]),
				_List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('modal-card')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$header,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-head')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('modal-card-title')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Schüler/in löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('delete'),
										$elm$html$Html$Attributes$type_('button'),
										A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
										$elm$html$Html$Events$onClick($author$project$PupilForm$CloseForm)
									]),
								_List_Nil)
							])),
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-body')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Wollen Sie den Schüler bzw. die Schülerin ' + (model.ac + ' wirklich löschen?'))
									]))
							])),
						A2(
						$elm$html$Html$footer,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('modal-card-foot')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$author$project$Shared$classes('button is-success'),
										$elm$html$Html$Events$onClick(
										$author$project$PupilForm$SendForm(model.V))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Löschen')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('button'),
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Events$onClick($author$project$PupilForm$CloseForm)
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Abbrechen')
									]))
							]))
					]))
			]));
};
var $author$project$PupilForm$FormMsg = function (a) {
	return {$: 0, a: a};
};
var $author$project$PupilForm$Class = function (a) {
	return {$: 1, a: a};
};
var $author$project$PupilForm$IsSpecial = function (a) {
	return {$: 2, a: a};
};
var $author$project$PupilForm$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm$html$Html$Events$targetChecked = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'checked']),
	$elm$json$Json$Decode$bool);
var $elm$html$Html$Events$onCheck = function (tagger) {
	return A2(
		$elm$html$Html$Events$on,
		'change',
		A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetChecked));
};
var $author$project$PupilForm$formFields = function (model) {
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('field')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('control')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('input'),
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$placeholder('Name'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Name'),
									$elm$html$Html$Attributes$required(true),
									$elm$html$Html$Events$onInput($author$project$PupilForm$Name),
									$elm$html$Html$Attributes$value(model.ac)
								]),
							_List_Nil)
						]))
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('field')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('control')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('input'),
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$placeholder('Klasse'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Klasse'),
									$elm$html$Html$Attributes$required(true),
									$elm$html$Html$Events$onInput($author$project$PupilForm$Class),
									$elm$html$Html$Attributes$value(model._)
								]),
							_List_Nil)
						]))
				])),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('field')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('control')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$label,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('checkbox')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$input,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('mr-2'),
											$elm$html$Html$Attributes$type_('checkbox'),
											$elm$html$Html$Events$onCheck($author$project$PupilForm$IsSpecial),
											$elm$html$Html$Attributes$checked(model.bf)
										]),
									_List_Nil),
									$elm$html$Html$text('Besondere/r Schüler/in')
								]))
						]))
				]))
		]);
};
var $author$project$PupilForm$viewNewAndEdit = F2(
	function (headline, model) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$author$project$Shared$classes('modal is-active')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-background'),
							$elm$html$Html$Events$onClick($author$project$PupilForm$CloseForm)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('modal-card')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$form,
							_List_fromArray(
								[
									$elm$html$Html$Events$onSubmit(
									$author$project$PupilForm$SendForm(model.V))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$header,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-head')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$p,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('modal-card-title')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(headline)
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('delete'),
													$elm$html$Html$Attributes$type_('button'),
													A2($elm$html$Html$Attributes$attribute, 'aria-label', 'close'),
													$elm$html$Html$Events$onClick($author$project$PupilForm$CloseForm)
												]),
											_List_Nil)
										])),
									A2(
									$elm$html$Html$section,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-body')
										]),
									A2(
										$elm$core$List$map,
										$elm$html$Html$map($author$project$PupilForm$FormMsg),
										$author$project$PupilForm$formFields(model))),
									A2(
									$elm$html$Html$footer,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('modal-card-foot')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$author$project$Shared$classes('button is-success'),
													$elm$html$Html$Attributes$type_('submit')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Speichern')
												])),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('button'),
													$elm$html$Html$Attributes$type_('button'),
													$elm$html$Html$Events$onClick($author$project$PupilForm$CloseForm)
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Abbrechen')
												]))
										]))
								]))
						]))
				]));
	});
var $author$project$PupilForm$view = function (model) {
	var _v0 = model.V;
	switch (_v0.$) {
		case 0:
			return A2($author$project$PupilForm$viewNewAndEdit, 'Neue/n Schüler/in hinzufügen', model);
		case 1:
			return A2($author$project$PupilForm$viewNewAndEdit, 'Schüler/in bearbeiten', model);
		default:
			return $author$project$PupilForm$viewDelete(model);
	}
};
var $author$project$Main$view = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				$author$project$Main$navbar,
				A2(
				$elm$html$Html$main_,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$section,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('section')
							]),
						function () {
							var _v0 = model.d;
							switch (_v0.$) {
								case 0:
									return _List_fromArray(
										[
											$elm$html$Html$text('Loading')
										]);
								case 1:
									var f = _v0.a;
									return _List_fromArray(
										[
											$elm$html$Html$text(f)
										]);
								default:
									var thisCampaignView = function (cId) {
										return $author$project$Main$campaignView(
											A2($author$project$Main$getCampaign, cId, model.a));
									};
									var overview = _List_fromArray(
										[
											A2(
											$elm$html$Html$h1,
											_List_fromArray(
												[
													$author$project$Shared$classes('title is-3')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Überblick über alle Kampagnen')
												])),
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('buttons')
												]),
											A2(
												$elm$core$List$map,
												function (c) {
													return A2(
														$elm$html$Html$button,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class('button'),
																$elm$html$Html$Events$onClick(
																$author$project$Main$SwitchPage(
																	$author$project$Main$SwitchToCampaign(c.j)))
															]),
														_List_fromArray(
															[
																$elm$html$Html$text(c.p)
															]));
												},
												model.a)),
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$author$project$Shared$classes('button is-primary'),
													$elm$html$Html$Events$onClick(
													$author$project$Main$SwitchPage(
														$author$project$Main$SwitchToCampaignFormPage($author$project$CampaignForm$New)))
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Neue Kampagne')
												]))
										]);
									var _v1 = model.b;
									switch (_v1.$) {
										case 0:
											return overview;
										case 1:
											var campaignId = _v1.a;
											return thisCampaignView(campaignId);
										case 2:
											var fp = _v1.a;
											switch (fp.$) {
												case 0:
													var formModel = fp.a;
													return _Utils_ap(
														overview,
														_List_fromArray(
															[
																A2(
																$elm$html$Html$map,
																A2($elm$core$Basics$composeR, $author$project$Main$CampaignFormMsg, $author$project$Main$FormMsg),
																$author$project$CampaignForm$view(formModel))
															]));
												case 1:
													var formModel = fp.a;
													return _Utils_ap(
														thisCampaignView(formModel.as),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$map,
																A2($elm$core$Basics$composeR, $author$project$Main$DayFormMsg, $author$project$Main$FormMsg),
																$author$project$DayForm$view(formModel))
															]));
												case 2:
													var formModel = fp.a;
													return _Utils_ap(
														thisCampaignView(formModel.as),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$map,
																A2($elm$core$Basics$composeR, $author$project$Main$EventFormMsg, $author$project$Main$FormMsg),
																$author$project$EventForm$view(formModel))
															]));
												default:
													var formModel = fp.a;
													return _Utils_ap(
														thisCampaignView(formModel.as),
														_List_fromArray(
															[
																A2(
																$elm$html$Html$map,
																A2($elm$core$Basics$composeR, $author$project$Main$PupilFormMsg, $author$project$Main$FormMsg),
																$author$project$PupilForm$view(formModel))
															]));
											}
										default:
											var pup = _v1.a;
											return $author$project$Main$pupilView(pup);
									}
							}
						}())
					]))
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{be: $author$project$Main$init, bx: $author$project$Main$subscriptions, by: $author$project$Main$update, bz: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));