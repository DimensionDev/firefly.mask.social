(() => {
    /**
     * @license
     * This file includes the following runtime/polyfills.
     * regenerator-runtime
     * tslib
     * reflect-metadata
     * core-js:
     *     es.array.push
     *     es.string.is-well-formed
     *     es.string.to-well-formed
     *     web.dom-exception.stack
     *     web.immediate
     *     web.structured-clone
     *     web.url.can-parse
     *     web.url-search-params.delete
     *     web.url-search-params.has
     */
    if (!globalThis[Symbol.for('mask_init_polyfill')]) {
        globalThis[Symbol.for('mask_init_polyfill')] = !0;
        var commonjsGlobal =
                'undefined' != typeof globalThis
                    ? globalThis
                    : 'undefined' != typeof window
                      ? window
                      : 'undefined' != typeof global
                        ? global
                        : 'undefined' != typeof self
                          ? self
                          : {},
            check = function (it) {
                return it && it.Math === Math && it;
            },
            global$l =
                check('object' == typeof globalThis && globalThis) ||
                check('object' == typeof window && window) ||
                check('object' == typeof self && self) ||
                check('object' == typeof commonjsGlobal && commonjsGlobal) ||
                (function () {
                    return this;
                })() ||
                commonjsGlobal ||
                Function('return this')(),
            objectGetOwnPropertyDescriptor = {},
            fails$h = function (exec) {
                try {
                    return !!exec();
                } catch (error) {
                    return !0;
                }
            },
            descriptors = !fails$h(function () {
                return (
                    7 !==
                    Object.defineProperty({}, 1, {
                        get: function () {
                            return 7;
                        },
                    })[1]
                );
            }),
            functionBindNative = !fails$h(function () {
                var test = function () {}.bind();
                return 'function' != typeof test || test.hasOwnProperty('prototype');
            }),
            NATIVE_BIND$3 = functionBindNative,
            call$a = Function.prototype.call,
            functionCall = NATIVE_BIND$3
                ? call$a.bind(call$a)
                : function () {
                      return call$a.apply(call$a, arguments);
                  },
            objectPropertyIsEnumerable = {},
            $propertyIsEnumerable = {}.propertyIsEnumerable,
            getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor,
            NASHORN_BUG = getOwnPropertyDescriptor$2 && !$propertyIsEnumerable.call({ 1: 2 }, 1);
        objectPropertyIsEnumerable.f = NASHORN_BUG
            ? function (V) {
                  var descriptor = getOwnPropertyDescriptor$2(this, V);
                  return !!descriptor && descriptor.enumerable;
              }
            : $propertyIsEnumerable;
        var match,
            version,
            createPropertyDescriptor$5 = function (bitmap, value) {
                return {
                    enumerable: !(1 & bitmap),
                    configurable: !(2 & bitmap),
                    writable: !(4 & bitmap),
                    value: value,
                };
            },
            NATIVE_BIND$2 = functionBindNative,
            FunctionPrototype$2 = Function.prototype,
            call$9 = FunctionPrototype$2.call,
            uncurryThisWithBind = NATIVE_BIND$2 && FunctionPrototype$2.bind.bind(call$9, call$9),
            functionUncurryThis = NATIVE_BIND$2
                ? uncurryThisWithBind
                : function (fn) {
                      return function () {
                          return call$9.apply(fn, arguments);
                      };
                  },
            uncurryThis$n = functionUncurryThis,
            toString$8 = uncurryThis$n({}.toString),
            stringSlice$1 = uncurryThis$n(''.slice),
            classofRaw$2 = function (it) {
                return stringSlice$1(toString$8(it), 8, -1);
            },
            fails$e = fails$h,
            classof$8 = classofRaw$2,
            $Object$3 = Object,
            split = functionUncurryThis(''.split),
            indexedObject = fails$e(function () {
                return !$Object$3('z').propertyIsEnumerable(0);
            })
                ? function (it) {
                      return 'String' === classof$8(it) ? split(it, '') : $Object$3(it);
                  }
                : $Object$3,
            isNullOrUndefined$4 = function (it) {
                return null == it;
            },
            isNullOrUndefined$3 = isNullOrUndefined$4,
            $TypeError$d = TypeError,
            requireObjectCoercible$4 = function (it) {
                if (isNullOrUndefined$3(it)) throw new $TypeError$d("Can't call method on " + it);
                return it;
            },
            IndexedObject = indexedObject,
            requireObjectCoercible$3 = requireObjectCoercible$4,
            toIndexedObject$3 = function (it) {
                return IndexedObject(requireObjectCoercible$3(it));
            },
            documentAll$2 = 'object' == typeof document && document.all,
            documentAll_1 = { all: documentAll$2, IS_HTMLDDA: void 0 === documentAll$2 && void 0 !== documentAll$2 },
            documentAll$1 = documentAll_1.all,
            isCallable$h = documentAll_1.IS_HTMLDDA
                ? function (argument) {
                      return 'function' == typeof argument || argument === documentAll$1;
                  }
                : function (argument) {
                      return 'function' == typeof argument;
                  },
            isCallable$g = isCallable$h,
            documentAll = documentAll_1.all,
            isObject$7 = documentAll_1.IS_HTMLDDA
                ? function (it) {
                      return 'object' == typeof it ? null !== it : isCallable$g(it) || it === documentAll;
                  }
                : function (it) {
                      return 'object' == typeof it ? null !== it : isCallable$g(it);
                  },
            global$k = global$l,
            isCallable$f = isCallable$h,
            getBuiltIn$6 = function (namespace, method) {
                return arguments.length < 2
                    ? ((argument = global$k[namespace]), isCallable$f(argument) ? argument : void 0)
                    : global$k[namespace] && global$k[namespace][method];
                var argument;
            },
            objectIsPrototypeOf = functionUncurryThis({}.isPrototypeOf),
            engineUserAgent = ('undefined' != typeof navigator && String(navigator.userAgent)) || '',
            global$j = global$l,
            userAgent$1 = engineUserAgent,
            process$1 = global$j.process,
            Deno$1 = global$j.Deno,
            versions = (process$1 && process$1.versions) || (Deno$1 && Deno$1.version),
            v8 = versions && versions.v8;
        v8 && (version = (match = v8.split('.'))[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1])),
            !version &&
                userAgent$1 &&
                (!(match = userAgent$1.match(/Edge\/(\d+)/)) || match[1] >= 74) &&
                (match = userAgent$1.match(/Chrome\/(\d+)/)) &&
                (version = +match[1]);
        var engineV8Version = version,
            V8_VERSION = engineV8Version,
            fails$d = fails$h,
            $String$5 = global$l.String,
            symbolConstructorDetection =
                !!Object.getOwnPropertySymbols &&
                !fails$d(function () {
                    var symbol = Symbol('symbol detection');
                    return (
                        !$String$5(symbol) ||
                        !(Object(symbol) instanceof Symbol) ||
                        (!Symbol.sham && V8_VERSION && V8_VERSION < 41)
                    );
                }),
            useSymbolAsUid = symbolConstructorDetection && !Symbol.sham && 'symbol' == typeof Symbol.iterator,
            getBuiltIn$5 = getBuiltIn$6,
            isCallable$e = isCallable$h,
            isPrototypeOf$3 = objectIsPrototypeOf,
            $Object$2 = Object,
            isSymbol$3 = useSymbolAsUid
                ? function (it) {
                      return 'symbol' == typeof it;
                  }
                : function (it) {
                      var $Symbol = getBuiltIn$5('Symbol');
                      return isCallable$e($Symbol) && isPrototypeOf$3($Symbol.prototype, $Object$2(it));
                  },
            $String$4 = String,
            tryToString$3 = function (argument) {
                try {
                    return $String$4(argument);
                } catch (error) {
                    return 'Object';
                }
            },
            isCallable$d = isCallable$h,
            tryToString$2 = tryToString$3,
            $TypeError$c = TypeError,
            aCallable$4 = function (argument) {
                if (isCallable$d(argument)) return argument;
                throw new $TypeError$c(tryToString$2(argument) + ' is not a function');
            },
            aCallable$3 = aCallable$4,
            isNullOrUndefined$2 = isNullOrUndefined$4,
            getMethod$3 = function (V, P) {
                var func = V[P];
                return isNullOrUndefined$2(func) ? void 0 : aCallable$3(func);
            },
            call$8 = functionCall,
            isCallable$c = isCallable$h,
            isObject$6 = isObject$7,
            $TypeError$b = TypeError,
            shared$3 = { exports: {} },
            global$h = global$l,
            defineProperty$2 = Object.defineProperty,
            defineGlobalProperty$3 = function (key, value) {
                try {
                    defineProperty$2(global$h, key, { value: value, configurable: !0, writable: !0 });
                } catch (error) {
                    global$h[key] = value;
                }
                return value;
            },
            defineGlobalProperty$2 = defineGlobalProperty$3,
            sharedStore = global$l['__core-js_shared__'] || defineGlobalProperty$2('__core-js_shared__', {}),
            store$2 = sharedStore;
        (shared$3.exports = function (key, value) {
            return store$2[key] || (store$2[key] = void 0 !== value ? value : {});
        })('versions', []).push({
            version: '3.33.0',
            mode: 'global',
            copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
            license: 'https://github.com/zloirock/core-js/blob/v3.33.0/LICENSE',
            source: 'https://github.com/zloirock/core-js',
        });
        var sharedExports = shared$3.exports,
            requireObjectCoercible$2 = requireObjectCoercible$4,
            $Object$1 = Object,
            toObject$2 = function (argument) {
                return $Object$1(requireObjectCoercible$2(argument));
            },
            toObject$1 = toObject$2,
            hasOwnProperty = functionUncurryThis({}.hasOwnProperty),
            hasOwnProperty_1 =
                Object.hasOwn ||
                function (it, key) {
                    return hasOwnProperty(toObject$1(it), key);
                },
            uncurryThis$j = functionUncurryThis,
            id = 0,
            postfix = Math.random(),
            toString$7 = uncurryThis$j((1).toString),
            uid$3 = function (key) {
                return 'Symbol(' + (void 0 === key ? '' : key) + ')_' + toString$7(++id + postfix, 36);
            },
            shared$2 = sharedExports,
            hasOwn$a = hasOwnProperty_1,
            uid$2 = uid$3,
            NATIVE_SYMBOL = symbolConstructorDetection,
            USE_SYMBOL_AS_UID = useSymbolAsUid,
            Symbol$1 = global$l.Symbol,
            WellKnownSymbolsStore = shared$2('wks'),
            createWellKnownSymbol = USE_SYMBOL_AS_UID
                ? Symbol$1.for || Symbol$1
                : (Symbol$1 && Symbol$1.withoutSetter) || uid$2,
            wellKnownSymbol$6 = function (name) {
                return (
                    hasOwn$a(WellKnownSymbolsStore, name) ||
                        (WellKnownSymbolsStore[name] =
                            NATIVE_SYMBOL && hasOwn$a(Symbol$1, name)
                                ? Symbol$1[name]
                                : createWellKnownSymbol('Symbol.' + name)),
                    WellKnownSymbolsStore[name]
                );
            },
            call$7 = functionCall,
            isObject$5 = isObject$7,
            isSymbol$2 = isSymbol$3,
            getMethod$2 = getMethod$3,
            ordinaryToPrimitive = function (input, pref) {
                var fn, val;
                if ('string' === pref && isCallable$c((fn = input.toString)) && !isObject$6((val = call$8(fn, input))))
                    return val;
                if (isCallable$c((fn = input.valueOf)) && !isObject$6((val = call$8(fn, input)))) return val;
                if ('string' !== pref && isCallable$c((fn = input.toString)) && !isObject$6((val = call$8(fn, input))))
                    return val;
                throw new $TypeError$b("Can't convert object to primitive value");
            },
            $TypeError$a = TypeError,
            TO_PRIMITIVE = wellKnownSymbol$6('toPrimitive'),
            toPrimitive = function (input, pref) {
                if (!isObject$5(input) || isSymbol$2(input)) return input;
                var result,
                    exoticToPrim = getMethod$2(input, TO_PRIMITIVE);
                if (exoticToPrim) {
                    if (
                        (void 0 === pref && (pref = 'default'),
                        (result = call$7(exoticToPrim, input, pref)),
                        !isObject$5(result) || isSymbol$2(result))
                    )
                        return result;
                    throw new $TypeError$a("Can't convert object to primitive value");
                }
                return void 0 === pref && (pref = 'number'), ordinaryToPrimitive(input, pref);
            },
            isSymbol$1 = isSymbol$3,
            toPropertyKey$3 = function (argument) {
                var key = toPrimitive(argument, 'string');
                return isSymbol$1(key) ? key : key + '';
            },
            isObject$4 = isObject$7,
            document$1 = global$l.document,
            EXISTS$1 = isObject$4(document$1) && isObject$4(document$1.createElement),
            documentCreateElement = function (it) {
                return EXISTS$1 ? document$1.createElement(it) : {};
            },
            createElement$1 = documentCreateElement,
            ie8DomDefine =
                !descriptors &&
                !fails$h(function () {
                    return (
                        7 !==
                        Object.defineProperty(createElement$1('div'), 'a', {
                            get: function () {
                                return 7;
                            },
                        }).a
                    );
                }),
            DESCRIPTORS$8 = descriptors,
            call$6 = functionCall,
            propertyIsEnumerableModule = objectPropertyIsEnumerable,
            createPropertyDescriptor$4 = createPropertyDescriptor$5,
            toIndexedObject$2 = toIndexedObject$3,
            toPropertyKey$2 = toPropertyKey$3,
            hasOwn$9 = hasOwnProperty_1,
            IE8_DOM_DEFINE$1 = ie8DomDefine,
            $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
        objectGetOwnPropertyDescriptor.f = DESCRIPTORS$8
            ? $getOwnPropertyDescriptor$1
            : function (O, P) {
                  if (((O = toIndexedObject$2(O)), (P = toPropertyKey$2(P)), IE8_DOM_DEFINE$1))
                      try {
                          return $getOwnPropertyDescriptor$1(O, P);
                      } catch (error) {}
                  if (hasOwn$9(O, P))
                      return createPropertyDescriptor$4(!call$6(propertyIsEnumerableModule.f, O, P), O[P]);
              };
        var objectDefineProperty = {},
            v8PrototypeDefineBug =
                descriptors &&
                fails$h(function () {
                    return (
                        42 !== Object.defineProperty(function () {}, 'prototype', { value: 42, writable: !1 }).prototype
                    );
                }),
            isObject$3 = isObject$7,
            $String$3 = String,
            $TypeError$9 = TypeError,
            anObject$8 = function (argument) {
                if (isObject$3(argument)) return argument;
                throw new $TypeError$9($String$3(argument) + ' is not an object');
            },
            DESCRIPTORS$6 = descriptors,
            IE8_DOM_DEFINE = ie8DomDefine,
            V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug,
            anObject$7 = anObject$8,
            toPropertyKey$1 = toPropertyKey$3,
            $TypeError$8 = TypeError,
            $defineProperty = Object.defineProperty,
            $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        objectDefineProperty.f = DESCRIPTORS$6
            ? V8_PROTOTYPE_DEFINE_BUG
                ? function (O, P, Attributes) {
                      if (
                          (anObject$7(O),
                          (P = toPropertyKey$1(P)),
                          anObject$7(Attributes),
                          'function' == typeof O &&
                              'prototype' === P &&
                              'value' in Attributes &&
                              'writable' in Attributes &&
                              !Attributes.writable)
                      ) {
                          var current = $getOwnPropertyDescriptor(O, P);
                          current &&
                              current.writable &&
                              ((O[P] = Attributes.value),
                              (Attributes = {
                                  configurable:
                                      'configurable' in Attributes ? Attributes.configurable : current.configurable,
                                  enumerable: 'enumerable' in Attributes ? Attributes.enumerable : current.enumerable,
                                  writable: !1,
                              }));
                      }
                      return $defineProperty(O, P, Attributes);
                  }
                : $defineProperty
            : function (O, P, Attributes) {
                  if ((anObject$7(O), (P = toPropertyKey$1(P)), anObject$7(Attributes), IE8_DOM_DEFINE))
                      try {
                          return $defineProperty(O, P, Attributes);
                      } catch (error) {}
                  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError$8('Accessors not supported');
                  return 'value' in Attributes && (O[P] = Attributes.value), O;
              };
        var definePropertyModule$3 = objectDefineProperty,
            createPropertyDescriptor$3 = createPropertyDescriptor$5,
            createNonEnumerableProperty$3 = descriptors
                ? function (object, key, value) {
                      return definePropertyModule$3.f(object, key, createPropertyDescriptor$3(1, value));
                  }
                : function (object, key, value) {
                      return (object[key] = value), object;
                  },
            makeBuiltIn$2 = { exports: {} },
            DESCRIPTORS$4 = descriptors,
            hasOwn$8 = hasOwnProperty_1,
            FunctionPrototype$1 = Function.prototype,
            getDescriptor = DESCRIPTORS$4 && Object.getOwnPropertyDescriptor,
            EXISTS = hasOwn$8(FunctionPrototype$1, 'name'),
            functionName = {
                EXISTS: EXISTS,
                PROPER: EXISTS && 'something' === function () {}.name,
                CONFIGURABLE:
                    EXISTS &&
                    (!DESCRIPTORS$4 || (DESCRIPTORS$4 && getDescriptor(FunctionPrototype$1, 'name').configurable)),
            },
            isCallable$b = isCallable$h,
            store$1 = sharedStore,
            functionToString = functionUncurryThis(Function.toString);
        isCallable$b(store$1.inspectSource) ||
            (store$1.inspectSource = function (it) {
                return functionToString(it);
            });
        var set$1,
            get,
            has,
            inspectSource$2 = store$1.inspectSource,
            isCallable$a = isCallable$h,
            WeakMap$1 = global$l.WeakMap,
            weakMapBasicDetection = isCallable$a(WeakMap$1) && /native code/.test(String(WeakMap$1)),
            uid$1 = uid$3,
            keys = sharedExports('keys'),
            hiddenKeys$3 = {},
            NATIVE_WEAK_MAP = weakMapBasicDetection,
            global$c = global$l,
            isObject$2 = isObject$7,
            createNonEnumerableProperty$2 = createNonEnumerableProperty$3,
            hasOwn$7 = hasOwnProperty_1,
            shared = sharedStore,
            sharedKey = function (key) {
                return keys[key] || (keys[key] = uid$1(key));
            },
            hiddenKeys$2 = hiddenKeys$3,
            TypeError$3 = global$c.TypeError,
            WeakMap = global$c.WeakMap;
        if (NATIVE_WEAK_MAP || shared.state) {
            var store = shared.state || (shared.state = new WeakMap());
            (store.get = store.get),
                (store.has = store.has),
                (store.set = store.set),
                (set$1 = function (it, metadata) {
                    if (store.has(it)) throw new TypeError$3('Object already initialized');
                    return (metadata.facade = it), store.set(it, metadata), metadata;
                }),
                (get = function (it) {
                    return store.get(it) || {};
                }),
                (has = function (it) {
                    return store.has(it);
                });
        } else {
            var STATE = sharedKey('state');
            (hiddenKeys$2[STATE] = !0),
                (set$1 = function (it, metadata) {
                    if (hasOwn$7(it, STATE)) throw new TypeError$3('Object already initialized');
                    return (metadata.facade = it), createNonEnumerableProperty$2(it, STATE, metadata), metadata;
                }),
                (get = function (it) {
                    return hasOwn$7(it, STATE) ? it[STATE] : {};
                }),
                (has = function (it) {
                    return hasOwn$7(it, STATE);
                });
        }
        var internalState = {
                set: set$1,
                get: get,
                has: has,
                enforce: function (it) {
                    return has(it) ? get(it) : set$1(it, {});
                },
                getterFor: function (TYPE) {
                    return function (it) {
                        var state;
                        if (!isObject$2(it) || (state = get(it)).type !== TYPE)
                            throw new TypeError$3('Incompatible receiver, ' + TYPE + ' required');
                        return state;
                    };
                },
            },
            uncurryThis$h = functionUncurryThis,
            fails$a = fails$h,
            isCallable$9 = isCallable$h,
            hasOwn$6 = hasOwnProperty_1,
            DESCRIPTORS$3 = descriptors,
            CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE,
            inspectSource$1 = inspectSource$2,
            enforceInternalState = internalState.enforce,
            getInternalState = internalState.get,
            $String$2 = String,
            defineProperty$1 = Object.defineProperty,
            stringSlice = uncurryThis$h(''.slice),
            replace$1 = uncurryThis$h(''.replace),
            join$1 = uncurryThis$h([].join),
            CONFIGURABLE_LENGTH =
                DESCRIPTORS$3 &&
                !fails$a(function () {
                    return 8 !== defineProperty$1(function () {}, 'length', { value: 8 }).length;
                }),
            TEMPLATE = String(String).split('String'),
            makeBuiltIn$1 = (makeBuiltIn$2.exports = function (value, name, options) {
                'Symbol(' === stringSlice($String$2(name), 0, 7) &&
                    (name = '[' + replace$1($String$2(name), /^Symbol\(([^)]*)\)/, '$1') + ']'),
                    options && options.getter && (name = 'get ' + name),
                    options && options.setter && (name = 'set ' + name),
                    (!hasOwn$6(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) &&
                        (DESCRIPTORS$3
                            ? defineProperty$1(value, 'name', { value: name, configurable: !0 })
                            : (value.name = name)),
                    CONFIGURABLE_LENGTH &&
                        options &&
                        hasOwn$6(options, 'arity') &&
                        value.length !== options.arity &&
                        defineProperty$1(value, 'length', { value: options.arity });
                try {
                    options && hasOwn$6(options, 'constructor') && options.constructor
                        ? DESCRIPTORS$3 && defineProperty$1(value, 'prototype', { writable: !1 })
                        : value.prototype && (value.prototype = void 0);
                } catch (error) {}
                var state = enforceInternalState(value);
                return (
                    hasOwn$6(state, 'source') || (state.source = join$1(TEMPLATE, 'string' == typeof name ? name : '')),
                    value
                );
            });
        Function.prototype.toString = makeBuiltIn$1(function () {
            return (isCallable$9(this) && getInternalState(this).source) || inspectSource$1(this);
        }, 'toString');
        var makeBuiltInExports = makeBuiltIn$2.exports,
            isCallable$8 = isCallable$h,
            definePropertyModule$2 = objectDefineProperty,
            makeBuiltIn = makeBuiltInExports,
            defineGlobalProperty$1 = defineGlobalProperty$3,
            defineBuiltIn$3 = function (O, key, value, options) {
                options || (options = {});
                var simple = options.enumerable,
                    name = void 0 !== options.name ? options.name : key;
                if ((isCallable$8(value) && makeBuiltIn(value, name, options), options.global))
                    simple ? (O[key] = value) : defineGlobalProperty$1(key, value);
                else {
                    try {
                        options.unsafe ? O[key] && (simple = !0) : delete O[key];
                    } catch (error) {}
                    simple
                        ? (O[key] = value)
                        : definePropertyModule$2.f(O, key, {
                              value: value,
                              enumerable: !1,
                              configurable: !options.nonConfigurable,
                              writable: !options.nonWritable,
                          });
                }
                return O;
            },
            objectGetOwnPropertyNames = {},
            ceil = Math.ceil,
            floor = Math.floor,
            trunc =
                Math.trunc ||
                function (x) {
                    var n = +x;
                    return (n > 0 ? floor : ceil)(n);
                },
            toIntegerOrInfinity$3 = function (argument) {
                var number = +argument;
                return number != number || 0 === number ? 0 : trunc(number);
            },
            toIntegerOrInfinity$2 = toIntegerOrInfinity$3,
            max = Math.max,
            min$2 = Math.min,
            toIntegerOrInfinity$1 = toIntegerOrInfinity$3,
            min$1 = Math.min,
            toLength$2 = function (argument) {
                return argument > 0 ? min$1(toIntegerOrInfinity$1(argument), 9007199254740991) : 0;
            },
            toLength$1 = toLength$2,
            lengthOfArrayLike$4 = function (obj) {
                return toLength$1(obj.length);
            },
            toIndexedObject$1 = toIndexedObject$3,
            toAbsoluteIndex = function (index, length) {
                var integer = toIntegerOrInfinity$2(index);
                return integer < 0 ? max(integer + length, 0) : min$2(integer, length);
            },
            lengthOfArrayLike$3 = lengthOfArrayLike$4,
            createMethod = function (IS_INCLUDES) {
                return function ($this, el, fromIndex) {
                    var value,
                        O = toIndexedObject$1($this),
                        length = lengthOfArrayLike$3(O),
                        index = toAbsoluteIndex(fromIndex, length);
                    if (IS_INCLUDES && el != el) {
                        for (; length > index; ) if ((value = O[index++]) != value) return !0;
                    } else
                        for (; length > index; index++)
                            if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
                    return !IS_INCLUDES && -1;
                };
            },
            arrayIncludes = { includes: createMethod(!0), indexOf: createMethod(!1) },
            hasOwn$5 = hasOwnProperty_1,
            toIndexedObject = toIndexedObject$3,
            indexOf = arrayIncludes.indexOf,
            hiddenKeys$1 = hiddenKeys$3,
            push$2 = functionUncurryThis([].push),
            internalObjectKeys = function (object, names) {
                var key,
                    O = toIndexedObject(object),
                    i = 0,
                    result = [];
                for (key in O) !hasOwn$5(hiddenKeys$1, key) && hasOwn$5(O, key) && push$2(result, key);
                for (; names.length > i; )
                    hasOwn$5(O, (key = names[i++])) && (~indexOf(result, key) || push$2(result, key));
                return result;
            },
            hiddenKeys = [
                'constructor',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'toLocaleString',
                'toString',
                'valueOf',
            ].concat('length', 'prototype');
        objectGetOwnPropertyNames.f =
            Object.getOwnPropertyNames ||
            function (O) {
                return internalObjectKeys(O, hiddenKeys);
            };
        var objectGetOwnPropertySymbols = {};
        objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;
        var getBuiltIn$4 = getBuiltIn$6,
            getOwnPropertyNamesModule = objectGetOwnPropertyNames,
            getOwnPropertySymbolsModule = objectGetOwnPropertySymbols,
            anObject$6 = anObject$8,
            concat = functionUncurryThis([].concat),
            ownKeys$1 =
                getBuiltIn$4('Reflect', 'ownKeys') ||
                function (it) {
                    var keys = getOwnPropertyNamesModule.f(anObject$6(it)),
                        getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
                    return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
                },
            hasOwn$4 = hasOwnProperty_1,
            ownKeys = ownKeys$1,
            getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor,
            definePropertyModule$1 = objectDefineProperty,
            fails$9 = fails$h,
            isCallable$7 = isCallable$h,
            replacement = /#|\.prototype\./,
            isForced$1 = function (feature, detection) {
                var value = data[normalize(feature)];
                return (
                    value === POLYFILL ||
                    (value !== NATIVE && (isCallable$7(detection) ? fails$9(detection) : !!detection))
                );
            },
            normalize = (isForced$1.normalize = function (string) {
                return String(string).replace(replacement, '.').toLowerCase();
            }),
            data = (isForced$1.data = {}),
            NATIVE = (isForced$1.NATIVE = 'N'),
            POLYFILL = (isForced$1.POLYFILL = 'P'),
            isForced_1 = isForced$1,
            global$b = global$l,
            getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f,
            createNonEnumerableProperty$1 = createNonEnumerableProperty$3,
            defineBuiltIn$2 = defineBuiltIn$3,
            defineGlobalProperty = defineGlobalProperty$3,
            copyConstructorProperties = function (target, source, exceptions) {
                for (
                    var keys = ownKeys(source),
                        defineProperty = definePropertyModule$1.f,
                        getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f,
                        i = 0;
                    i < keys.length;
                    i++
                ) {
                    var key = keys[i];
                    hasOwn$4(target, key) ||
                        (exceptions && hasOwn$4(exceptions, key)) ||
                        defineProperty(target, key, getOwnPropertyDescriptor(source, key));
                }
            },
            isForced = isForced_1,
            _export = function (options, source) {
                var target,
                    key,
                    targetProperty,
                    sourceProperty,
                    descriptor,
                    TARGET = options.target,
                    GLOBAL = options.global,
                    STATIC = options.stat;
                if (
                    (target = GLOBAL
                        ? global$b
                        : STATIC
                          ? global$b[TARGET] || defineGlobalProperty(TARGET, {})
                          : (global$b[TARGET] || {}).prototype)
                )
                    for (key in source) {
                        if (
                            ((sourceProperty = source[key]),
                            (targetProperty = options.dontCallGetSet
                                ? (descriptor = getOwnPropertyDescriptor$1(target, key)) && descriptor.value
                                : target[key]),
                            !isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced) &&
                                void 0 !== targetProperty)
                        ) {
                            if (typeof sourceProperty == typeof targetProperty) continue;
                            copyConstructorProperties(sourceProperty, targetProperty);
                        }
                        (options.sham || (targetProperty && targetProperty.sham)) &&
                            createNonEnumerableProperty$1(sourceProperty, 'sham', !0),
                            defineBuiltIn$2(target, key, sourceProperty, options);
                    }
            },
            classof$7 = classofRaw$2,
            DESCRIPTORS$2 = descriptors,
            isArray =
                Array.isArray ||
                function (argument) {
                    return 'Array' === classof$7(argument);
                },
            $TypeError$7 = TypeError,
            getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
            SILENT_ON_NON_WRITABLE_LENGTH_SET =
                DESCRIPTORS$2 &&
                !(function () {
                    if (void 0 !== this) return !0;
                    try {
                        Object.defineProperty([], 'length', { writable: !1 }).length = 1;
                    } catch (error) {
                        return error instanceof TypeError;
                    }
                })(),
            $TypeError$6 = TypeError,
            toObject = toObject$2,
            lengthOfArrayLike$2 = lengthOfArrayLike$4,
            setArrayLength = SILENT_ON_NON_WRITABLE_LENGTH_SET
                ? function (O, length) {
                      if (isArray(O) && !getOwnPropertyDescriptor(O, 'length').writable)
                          throw new $TypeError$7('Cannot set read only .length');
                      return (O.length = length);
                  }
                : function (O, length) {
                      return (O.length = length);
                  },
            doesNotExceedSafeInteger = function (it) {
                if (it > 9007199254740991) throw $TypeError$6('Maximum allowed index exceeded');
                return it;
            };
        _export(
            {
                target: 'Array',
                proto: !0,
                arity: 1,
                forced:
                    fails$h(function () {
                        return 4294967297 !== [].push.call({ length: 4294967296 }, 1);
                    }) ||
                    !(function () {
                        try {
                            Object.defineProperty([], 'length', { writable: !1 }).push();
                        } catch (error) {
                            return error instanceof TypeError;
                        }
                    })(),
            },
            {
                push: function (item) {
                    var O = toObject(this),
                        len = lengthOfArrayLike$2(O),
                        argCount = arguments.length;
                    doesNotExceedSafeInteger(len + argCount);
                    for (var i = 0; i < argCount; i++) (O[len] = arguments[i]), len++;
                    return setArrayLength(O, len), len;
                },
            },
        );
        var test = {};
        test[wellKnownSymbol$6('toStringTag')] = 'z';
        var TO_STRING_TAG_SUPPORT = '[object z]' === String(test),
            isCallable$6 = isCallable$h,
            classofRaw$1 = classofRaw$2,
            TO_STRING_TAG = wellKnownSymbol$6('toStringTag'),
            $Object = Object,
            CORRECT_ARGUMENTS =
                'Arguments' ===
                classofRaw$1(
                    (function () {
                        return arguments;
                    })(),
                ),
            classof$6 = TO_STRING_TAG_SUPPORT
                ? classofRaw$1
                : function (it) {
                      var O, tag, result;
                      return void 0 === it
                          ? 'Undefined'
                          : null === it
                            ? 'Null'
                            : 'string' ==
                                typeof (tag = (function (it, key) {
                                    try {
                                        return it[key];
                                    } catch (error) {}
                                })((O = $Object(it)), TO_STRING_TAG))
                              ? tag
                              : CORRECT_ARGUMENTS
                                ? classofRaw$1(O)
                                : 'Object' === (result = classofRaw$1(O)) && isCallable$6(O.callee)
                                  ? 'Arguments'
                                  : result;
                  },
            classof$5 = classof$6,
            $String$1 = String,
            toString$6 = function (argument) {
                if ('Symbol' === classof$5(argument)) throw new TypeError('Cannot convert a Symbol value to a string');
                return $String$1(argument);
            },
            $$6 = _export,
            requireObjectCoercible$1 = requireObjectCoercible$4,
            toString$5 = toString$6,
            charCodeAt$1 = functionUncurryThis(''.charCodeAt);
        $$6(
            { target: 'String', proto: !0 },
            {
                isWellFormed: function () {
                    for (
                        var S = toString$5(requireObjectCoercible$1(this)), length = S.length, i = 0;
                        i < length;
                        i++
                    ) {
                        var charCode = charCodeAt$1(S, i);
                        if (
                            55296 == (63488 & charCode) &&
                            (charCode >= 56320 || ++i >= length || 56320 != (64512 & charCodeAt$1(S, i)))
                        )
                            return !1;
                    }
                    return !0;
                },
            },
        );
        var $$5 = _export,
            call$5 = functionCall,
            uncurryThis$d = functionUncurryThis,
            requireObjectCoercible = requireObjectCoercible$4,
            toString$4 = toString$6,
            fails$7 = fails$h,
            $Array = Array,
            charAt = uncurryThis$d(''.charAt),
            charCodeAt = uncurryThis$d(''.charCodeAt),
            join = uncurryThis$d([].join),
            $toWellFormed = ''.toWellFormed,
            TO_STRING_CONVERSION_BUG =
                $toWellFormed &&
                fails$7(function () {
                    return '1' !== call$5($toWellFormed, 1);
                });
        $$5(
            { target: 'String', proto: !0, forced: TO_STRING_CONVERSION_BUG },
            {
                toWellFormed: function () {
                    var S = toString$4(requireObjectCoercible(this));
                    if (TO_STRING_CONVERSION_BUG) return call$5($toWellFormed, S);
                    for (var length = S.length, result = $Array(length), i = 0; i < length; i++) {
                        var charCode = charCodeAt(S, i);
                        55296 != (63488 & charCode)
                            ? (result[i] = charAt(S, i))
                            : charCode >= 56320 || i + 1 >= length || 56320 != (64512 & charCodeAt(S, i + 1))
                              ? (result[i] = '�')
                              : ((result[i] = charAt(S, i)), (result[++i] = charAt(S, i)));
                    }
                    return join(result, '');
                },
            },
        );
        var isPrototypeOf$2 = objectIsPrototypeOf,
            $TypeError$5 = TypeError,
            uncurryThis$c = functionUncurryThis,
            aCallable$2 = aCallable$4,
            functionUncurryThisAccessor = function (object, key, method) {
                try {
                    return uncurryThis$c(aCallable$2(Object.getOwnPropertyDescriptor(object, key)[method]));
                } catch (error) {}
            },
            isCallable$5 = isCallable$h,
            $String = String,
            $TypeError$4 = TypeError,
            uncurryThisAccessor$2 = functionUncurryThisAccessor,
            anObject$5 = anObject$8,
            aPossiblePrototype = function (argument) {
                if ('object' == typeof argument || isCallable$5(argument)) return argument;
                throw new $TypeError$4("Can't set " + $String(argument) + ' as a prototype');
            },
            objectSetPrototypeOf =
                Object.setPrototypeOf ||
                ('__proto__' in {}
                    ? (function () {
                          var setter,
                              CORRECT_SETTER = !1,
                              test = {};
                          try {
                              (setter = uncurryThisAccessor$2(Object.prototype, '__proto__', 'set'))(test, []),
                                  (CORRECT_SETTER = test instanceof Array);
                          } catch (error) {}
                          return function (O, proto) {
                              return (
                                  anObject$5(O),
                                  aPossiblePrototype(proto),
                                  CORRECT_SETTER ? setter(O, proto) : (O.__proto__ = proto),
                                  O
                              );
                          };
                      })()
                    : void 0),
            isCallable$4 = isCallable$h,
            isObject$1 = isObject$7,
            setPrototypeOf = objectSetPrototypeOf,
            toString$3 = toString$6,
            $Error = Error,
            replace = functionUncurryThis(''.replace),
            TEST = String(new $Error('zxcasd').stack),
            V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/,
            IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST),
            $$4 = _export,
            global$a = global$l,
            getBuiltIn$3 = getBuiltIn$6,
            createPropertyDescriptor$2 = createPropertyDescriptor$5,
            defineProperty = objectDefineProperty.f,
            hasOwn$3 = hasOwnProperty_1,
            anInstance = function (it, Prototype) {
                if (isPrototypeOf$2(Prototype, it)) return it;
                throw new $TypeError$5('Incorrect invocation');
            },
            inheritIfRequired = function ($this, dummy, Wrapper) {
                var NewTarget, NewTargetPrototype;
                return (
                    setPrototypeOf &&
                        isCallable$4((NewTarget = dummy.constructor)) &&
                        NewTarget !== Wrapper &&
                        isObject$1((NewTargetPrototype = NewTarget.prototype)) &&
                        NewTargetPrototype !== Wrapper.prototype &&
                        setPrototypeOf($this, NewTargetPrototype),
                    $this
                );
            },
            normalizeStringArgument = function (argument, $default) {
                return void 0 === argument ? (arguments.length < 2 ? '' : $default) : toString$3(argument);
            },
            DOMExceptionConstants = {
                IndexSizeError: { s: 'INDEX_SIZE_ERR', c: 1, m: 1 },
                DOMStringSizeError: { s: 'DOMSTRING_SIZE_ERR', c: 2, m: 0 },
                HierarchyRequestError: { s: 'HIERARCHY_REQUEST_ERR', c: 3, m: 1 },
                WrongDocumentError: { s: 'WRONG_DOCUMENT_ERR', c: 4, m: 1 },
                InvalidCharacterError: { s: 'INVALID_CHARACTER_ERR', c: 5, m: 1 },
                NoDataAllowedError: { s: 'NO_DATA_ALLOWED_ERR', c: 6, m: 0 },
                NoModificationAllowedError: { s: 'NO_MODIFICATION_ALLOWED_ERR', c: 7, m: 1 },
                NotFoundError: { s: 'NOT_FOUND_ERR', c: 8, m: 1 },
                NotSupportedError: { s: 'NOT_SUPPORTED_ERR', c: 9, m: 1 },
                InUseAttributeError: { s: 'INUSE_ATTRIBUTE_ERR', c: 10, m: 1 },
                InvalidStateError: { s: 'INVALID_STATE_ERR', c: 11, m: 1 },
                SyntaxError: { s: 'SYNTAX_ERR', c: 12, m: 1 },
                InvalidModificationError: { s: 'INVALID_MODIFICATION_ERR', c: 13, m: 1 },
                NamespaceError: { s: 'NAMESPACE_ERR', c: 14, m: 1 },
                InvalidAccessError: { s: 'INVALID_ACCESS_ERR', c: 15, m: 1 },
                ValidationError: { s: 'VALIDATION_ERR', c: 16, m: 0 },
                TypeMismatchError: { s: 'TYPE_MISMATCH_ERR', c: 17, m: 1 },
                SecurityError: { s: 'SECURITY_ERR', c: 18, m: 1 },
                NetworkError: { s: 'NETWORK_ERR', c: 19, m: 1 },
                AbortError: { s: 'ABORT_ERR', c: 20, m: 1 },
                URLMismatchError: { s: 'URL_MISMATCH_ERR', c: 21, m: 1 },
                QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
                TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
                InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
                DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 },
            },
            clearErrorStack = function (stack, dropEntries) {
                if (IS_V8_OR_CHAKRA_STACK && 'string' == typeof stack && !$Error.prepareStackTrace)
                    for (; dropEntries--; ) stack = replace(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
                return stack;
            },
            DESCRIPTORS$1 = descriptors,
            Error$2 = getBuiltIn$3('Error'),
            NativeDOMException = getBuiltIn$3('DOMException'),
            $DOMException = function () {
                anInstance(this, DOMExceptionPrototype);
                var argumentsLength = arguments.length,
                    message = normalizeStringArgument(argumentsLength < 1 ? void 0 : arguments[0]),
                    name = normalizeStringArgument(argumentsLength < 2 ? void 0 : arguments[1], 'Error'),
                    that = new NativeDOMException(message, name),
                    error = new Error$2(message);
                return (
                    (error.name = 'DOMException'),
                    defineProperty(that, 'stack', createPropertyDescriptor$2(1, clearErrorStack(error.stack, 1))),
                    inheritIfRequired(that, this, $DOMException),
                    that
                );
            },
            DOMExceptionPrototype = ($DOMException.prototype = NativeDOMException.prototype),
            ERROR_HAS_STACK = 'stack' in new Error$2('DOMException'),
            DOM_EXCEPTION_HAS_STACK = 'stack' in new NativeDOMException(1, 2),
            descriptor =
                NativeDOMException && DESCRIPTORS$1 && Object.getOwnPropertyDescriptor(global$a, 'DOMException'),
            BUGGY_DESCRIPTOR = !(!descriptor || (descriptor.writable && descriptor.configurable)),
            FORCED_CONSTRUCTOR = ERROR_HAS_STACK && !BUGGY_DESCRIPTOR && !DOM_EXCEPTION_HAS_STACK;
        $$4(
            { global: !0, constructor: !0, forced: FORCED_CONSTRUCTOR },
            { DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException },
        );
        var PolyfilledDOMException = getBuiltIn$3('DOMException'),
            PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;
        if (PolyfilledDOMExceptionPrototype.constructor !== PolyfilledDOMException)
            for (var key in (defineProperty(
                PolyfilledDOMExceptionPrototype,
                'constructor',
                createPropertyDescriptor$2(1, PolyfilledDOMException),
            ),
            DOMExceptionConstants))
                if (hasOwn$3(DOMExceptionConstants, key)) {
                    var constant = DOMExceptionConstants[key],
                        constantName = constant.s;
                    hasOwn$3(PolyfilledDOMException, constantName) ||
                        defineProperty(PolyfilledDOMException, constantName, createPropertyDescriptor$2(6, constant.c));
                }
        var $location,
            defer,
            channel$1,
            port,
            NATIVE_BIND$1 = functionBindNative,
            FunctionPrototype = Function.prototype,
            apply$2 = FunctionPrototype.apply,
            call$4 = FunctionPrototype.call,
            functionApply =
                ('object' == typeof Reflect && Reflect.apply) ||
                (NATIVE_BIND$1
                    ? call$4.bind(apply$2)
                    : function () {
                          return call$4.apply(apply$2, arguments);
                      }),
            classofRaw = classofRaw$2,
            uncurryThis$a = functionUncurryThis,
            uncurryThis$9 = function (fn) {
                if ('Function' === classofRaw(fn)) return uncurryThis$a(fn);
            },
            aCallable$1 = aCallable$4,
            NATIVE_BIND = functionBindNative,
            bind$2 = uncurryThis$9(uncurryThis$9.bind),
            functionBindContext = function (fn, that) {
                return (
                    aCallable$1(fn),
                    void 0 === that
                        ? fn
                        : NATIVE_BIND
                          ? bind$2(fn, that)
                          : function () {
                                return fn.apply(that, arguments);
                            }
                );
            },
            html$1 = getBuiltIn$6('document', 'documentElement'),
            arraySlice$2 = functionUncurryThis([].slice),
            $TypeError$3 = TypeError,
            validateArgumentsLength$6 = function (passed, required) {
                if (passed < required) throw new $TypeError$3('Not enough arguments');
                return passed;
            },
            engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(engineUserAgent),
            engineIsNode = 'process' === classofRaw$2(global$l.process),
            global$8 = global$l,
            apply$1 = functionApply,
            bind$1 = functionBindContext,
            isCallable$3 = isCallable$h,
            hasOwn$2 = hasOwnProperty_1,
            fails$6 = fails$h,
            html = html$1,
            arraySlice$1 = arraySlice$2,
            createElement = documentCreateElement,
            validateArgumentsLength$5 = validateArgumentsLength$6,
            IS_IOS = engineIsIos,
            IS_NODE$3 = engineIsNode,
            set = global$8.setImmediate,
            clear = global$8.clearImmediate,
            process = global$8.process,
            Dispatch = global$8.Dispatch,
            Function$2 = global$8.Function,
            MessageChannel = global$8.MessageChannel,
            String$1 = global$8.String,
            counter = 0,
            queue = {};
        fails$6(function () {
            $location = global$8.location;
        });
        var run = function (id) {
                if (hasOwn$2(queue, id)) {
                    var fn = queue[id];
                    delete queue[id], fn();
                }
            },
            runner = function (id) {
                return function () {
                    run(id);
                };
            },
            eventListener = function (event) {
                run(event.data);
            },
            globalPostMessageDefer = function (id) {
                global$8.postMessage(String$1(id), $location.protocol + '//' + $location.host);
            };
        (set && clear) ||
            ((set = function (handler) {
                validateArgumentsLength$5(arguments.length, 1);
                var fn = isCallable$3(handler) ? handler : Function$2(handler),
                    args = arraySlice$1(arguments, 1);
                return (
                    (queue[++counter] = function () {
                        apply$1(fn, void 0, args);
                    }),
                    defer(counter),
                    counter
                );
            }),
            (clear = function (id) {
                delete queue[id];
            }),
            IS_NODE$3
                ? (defer = function (id) {
                      process.nextTick(runner(id));
                  })
                : Dispatch && Dispatch.now
                  ? (defer = function (id) {
                        Dispatch.now(runner(id));
                    })
                  : MessageChannel && !IS_IOS
                    ? ((port = (channel$1 = new MessageChannel()).port2),
                      (channel$1.port1.onmessage = eventListener),
                      (defer = bind$1(port.postMessage, port)))
                    : global$8.addEventListener &&
                        isCallable$3(global$8.postMessage) &&
                        !global$8.importScripts &&
                        $location &&
                        'file:' !== $location.protocol &&
                        !fails$6(globalPostMessageDefer)
                      ? ((defer = globalPostMessageDefer), global$8.addEventListener('message', eventListener, !1))
                      : (defer =
                            'onreadystatechange' in createElement('script')
                                ? function (id) {
                                      html.appendChild(createElement('script')).onreadystatechange = function () {
                                          html.removeChild(this), run(id);
                                      };
                                  }
                                : function (id) {
                                      setTimeout(runner(id), 0);
                                  }));
        var task = { set: set, clear: clear },
            clearImmediate = task.clear;
        _export(
            { global: !0, bind: !0, enumerable: !0, forced: global$l.clearImmediate !== clearImmediate },
            { clearImmediate: clearImmediate },
        );
        var engineIsBun = 'function' == typeof Bun && Bun && 'string' == typeof Bun.version,
            global$6 = global$l,
            apply = functionApply,
            isCallable$2 = isCallable$h,
            ENGINE_IS_BUN = engineIsBun,
            USER_AGENT = engineUserAgent,
            arraySlice = arraySlice$2,
            validateArgumentsLength$4 = validateArgumentsLength$6,
            Function$1 = global$6.Function,
            WRAP =
                /MSIE .\./.test(USER_AGENT) ||
                (ENGINE_IS_BUN &&
                    (function () {
                        var version = global$6.Bun.version.split('.');
                        return (
                            version.length < 3 ||
                            ('0' === version[0] && (version[1] < 3 || ('3' === version[1] && '0' === version[2])))
                        );
                    })()),
            $$2 = _export,
            global$5 = global$l,
            setTask = task.set,
            schedulersFix = function (scheduler, hasTimeArg) {
                var firstParamIndex = hasTimeArg ? 2 : 1;
                return WRAP
                    ? function (handler, timeout) {
                          var boundArgs = validateArgumentsLength$4(arguments.length, 1) > firstParamIndex,
                              fn = isCallable$2(handler) ? handler : Function$1(handler),
                              params = boundArgs ? arraySlice(arguments, firstParamIndex) : [],
                              callback = boundArgs
                                  ? function () {
                                        apply(fn, this, params);
                                    }
                                  : fn;
                          return hasTimeArg ? scheduler(callback, timeout) : scheduler(callback);
                      }
                    : scheduler;
            },
            setImmediate = global$5.setImmediate ? schedulersFix(setTask, !1) : setTask;
        $$2(
            { global: !0, bind: !0, enumerable: !0, forced: global$5.setImmediate !== setImmediate },
            { setImmediate: setImmediate },
        );
        var uncurryThis$7 = functionUncurryThis,
            fails$5 = fails$h,
            isCallable$1 = isCallable$h,
            classof$3 = classof$6,
            inspectSource = inspectSource$2,
            noop = function () {},
            empty = [],
            construct = getBuiltIn$6('Reflect', 'construct'),
            constructorRegExp = /^\s*(?:class|function)\b/,
            exec = uncurryThis$7(constructorRegExp.exec),
            INCORRECT_TO_STRING = !constructorRegExp.test(noop),
            isConstructorModern = function (argument) {
                if (!isCallable$1(argument)) return !1;
                try {
                    return construct(noop, empty, argument), !0;
                } catch (error) {
                    return !1;
                }
            },
            isConstructorLegacy = function (argument) {
                if (!isCallable$1(argument)) return !1;
                switch (classof$3(argument)) {
                    case 'AsyncFunction':
                    case 'GeneratorFunction':
                    case 'AsyncGeneratorFunction':
                        return !1;
                }
                try {
                    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
                } catch (error) {
                    return !0;
                }
            };
        isConstructorLegacy.sham = !0;
        var WorkerThreads,
            channel,
            buffer,
            $detach,
            isConstructor$1 =
                !construct ||
                fails$5(function () {
                    var called;
                    return (
                        isConstructorModern(isConstructorModern.call) ||
                        !isConstructorModern(Object) ||
                        !isConstructorModern(function () {
                            called = !0;
                        }) ||
                        called
                    );
                })
                    ? isConstructorLegacy
                    : isConstructorModern,
            iterators = {},
            Iterators$1 = iterators,
            ITERATOR$2 = wellKnownSymbol$6('iterator'),
            ArrayPrototype = Array.prototype,
            classof$2 = classof$6,
            getMethod$1 = getMethod$3,
            isNullOrUndefined$1 = isNullOrUndefined$4,
            Iterators = iterators,
            ITERATOR$1 = wellKnownSymbol$6('iterator'),
            getIteratorMethod$2 = function (it) {
                if (!isNullOrUndefined$1(it))
                    return getMethod$1(it, ITERATOR$1) || getMethod$1(it, '@@iterator') || Iterators[classof$2(it)];
            },
            call$3 = functionCall,
            aCallable = aCallable$4,
            anObject$4 = anObject$8,
            tryToString$1 = tryToString$3,
            getIteratorMethod$1 = getIteratorMethod$2,
            $TypeError$2 = TypeError,
            call$2 = functionCall,
            anObject$3 = anObject$8,
            getMethod = getMethod$3,
            bind = functionBindContext,
            call$1 = functionCall,
            anObject$2 = anObject$8,
            tryToString = tryToString$3,
            isArrayIteratorMethod = function (it) {
                return void 0 !== it && (Iterators$1.Array === it || ArrayPrototype[ITERATOR$2] === it);
            },
            lengthOfArrayLike$1 = lengthOfArrayLike$4,
            isPrototypeOf$1 = objectIsPrototypeOf,
            getIterator = function (argument, usingIterator) {
                var iteratorMethod = arguments.length < 2 ? getIteratorMethod$1(argument) : usingIterator;
                if (aCallable(iteratorMethod)) return anObject$4(call$3(iteratorMethod, argument));
                throw new $TypeError$2(tryToString$1(argument) + ' is not iterable');
            },
            getIteratorMethod = getIteratorMethod$2,
            iteratorClose = function (iterator, kind, value) {
                var innerResult, innerError;
                anObject$3(iterator);
                try {
                    if (!(innerResult = getMethod(iterator, 'return'))) {
                        if ('throw' === kind) throw value;
                        return value;
                    }
                    innerResult = call$2(innerResult, iterator);
                } catch (error) {
                    (innerError = !0), (innerResult = error);
                }
                if ('throw' === kind) throw value;
                if (innerError) throw innerResult;
                return anObject$3(innerResult), value;
            },
            $TypeError$1 = TypeError,
            Result = function (stopped, result) {
                (this.stopped = stopped), (this.result = result);
            },
            ResultPrototype = Result.prototype,
            toPropertyKey = toPropertyKey$3,
            definePropertyModule = objectDefineProperty,
            createPropertyDescriptor$1 = createPropertyDescriptor$5,
            anObject$1 = anObject$8,
            call = functionCall,
            hasOwn$1 = hasOwnProperty_1,
            isPrototypeOf = objectIsPrototypeOf,
            regExpFlags = function () {
                var that = anObject$1(this),
                    result = '';
                return (
                    that.hasIndices && (result += 'd'),
                    that.global && (result += 'g'),
                    that.ignoreCase && (result += 'i'),
                    that.multiline && (result += 'm'),
                    that.dotAll && (result += 's'),
                    that.unicode && (result += 'u'),
                    that.unicodeSets && (result += 'v'),
                    that.sticky && (result += 'y'),
                    result
                );
            },
            RegExpPrototype = RegExp.prototype,
            uncurryThis$6 = functionUncurryThis,
            MapPrototype = Map.prototype,
            mapHelpers = {
                Map: Map,
                set: uncurryThis$6(MapPrototype.set),
                get: uncurryThis$6(MapPrototype.get),
                has: uncurryThis$6(MapPrototype.has),
                remove: uncurryThis$6(MapPrototype.delete),
                proto: MapPrototype,
            },
            uncurryThis$5 = functionUncurryThis,
            SetPrototype = Set.prototype,
            setHelpers = {
                Set: Set,
                add: uncurryThis$5(SetPrototype.add),
                has: uncurryThis$5(SetPrototype.has),
                remove: uncurryThis$5(SetPrototype.delete),
                proto: SetPrototype,
            },
            toIntegerOrInfinity = toIntegerOrInfinity$3,
            toLength = toLength$2,
            $RangeError = RangeError,
            classof$1 = classofRaw$2,
            $TypeError = TypeError,
            arrayBufferByteLength$2 =
                functionUncurryThisAccessor(ArrayBuffer.prototype, 'byteLength', 'get') ||
                function (O) {
                    if ('ArrayBuffer' !== classof$1(O)) throw new $TypeError('ArrayBuffer expected');
                    return O.byteLength;
                },
            arrayBufferByteLength$1 = arrayBufferByteLength$2,
            slice$1 = functionUncurryThis(ArrayBuffer.prototype.slice),
            IS_NODE$2 = engineIsNode,
            engineIsDeno = 'object' == typeof Deno && Deno && 'object' == typeof Deno.version,
            engineIsBrowser =
                !engineIsDeno && !engineIsNode && 'object' == typeof window && 'object' == typeof document,
            fails$4 = fails$h,
            V8 = engineV8Version,
            IS_BROWSER = engineIsBrowser,
            IS_DENO = engineIsDeno,
            IS_NODE = engineIsNode,
            structuredClone$2 = global$l.structuredClone,
            structuredCloneProperTransfer =
                !!structuredClone$2 &&
                !fails$4(function () {
                    if ((IS_DENO && V8 > 92) || (IS_NODE && V8 > 94) || (IS_BROWSER && V8 > 97)) return !1;
                    var buffer = new ArrayBuffer(8),
                        clone = structuredClone$2(buffer, { transfer: [buffer] });
                    return 0 !== buffer.byteLength || 8 !== clone.byteLength;
                }),
            global$3 = global$l,
            tryNodeRequire = function (name) {
                try {
                    if (IS_NODE$2) return Function('return require("' + name + '")')();
                } catch (error) {}
            },
            PROPER_STRUCTURED_CLONE_TRANSFER$2 = structuredCloneProperTransfer,
            structuredClone$1 = global$3.structuredClone,
            $ArrayBuffer = global$3.ArrayBuffer,
            $MessageChannel = global$3.MessageChannel,
            detach = !1;
        if (PROPER_STRUCTURED_CLONE_TRANSFER$2)
            detach = function (transferable) {
                structuredClone$1(transferable, { transfer: [transferable] });
            };
        else if ($ArrayBuffer)
            try {
                $MessageChannel ||
                    ((WorkerThreads = tryNodeRequire('worker_threads')) &&
                        ($MessageChannel = WorkerThreads.MessageChannel)),
                    $MessageChannel &&
                        ((channel = new $MessageChannel()),
                        (buffer = new $ArrayBuffer(2)),
                        ($detach = function (transferable) {
                            channel.port1.postMessage(null, [transferable]);
                        }),
                        2 === buffer.byteLength && ($detach(buffer), 0 === buffer.byteLength && (detach = $detach)));
            } catch (error) {}
        var global$2 = global$l,
            uncurryThis$3 = functionUncurryThis,
            uncurryThisAccessor = functionUncurryThisAccessor,
            toIndex = function (it) {
                if (void 0 === it) return 0;
                var number = toIntegerOrInfinity(it),
                    length = toLength(number);
                if (number !== length) throw new $RangeError('Wrong length or index');
                return length;
            },
            isDetached = function (O) {
                if (0 !== arrayBufferByteLength$1(O)) return !1;
                try {
                    return slice$1(O, 0, 0), !1;
                } catch (error) {
                    return !0;
                }
            },
            arrayBufferByteLength = arrayBufferByteLength$2,
            detachTransferable = detach,
            PROPER_STRUCTURED_CLONE_TRANSFER$1 = structuredCloneProperTransfer,
            structuredClone = global$2.structuredClone,
            ArrayBuffer$1 = global$2.ArrayBuffer,
            DataView = global$2.DataView,
            TypeError$2 = global$2.TypeError,
            min = Math.min,
            ArrayBufferPrototype = ArrayBuffer$1.prototype,
            DataViewPrototype = DataView.prototype,
            slice = uncurryThis$3(ArrayBufferPrototype.slice),
            isResizable = uncurryThisAccessor(ArrayBufferPrototype, 'resizable', 'get'),
            maxByteLength = uncurryThisAccessor(ArrayBufferPrototype, 'maxByteLength', 'get'),
            getInt8 = uncurryThis$3(DataViewPrototype.getInt8),
            setInt8 = uncurryThis$3(DataViewPrototype.setInt8),
            arrayBufferTransfer$1 =
                (PROPER_STRUCTURED_CLONE_TRANSFER$1 || detachTransferable) &&
                function (arrayBuffer, newLength, preserveResizability) {
                    var newBuffer,
                        byteLength = arrayBufferByteLength(arrayBuffer),
                        newByteLength = void 0 === newLength ? byteLength : toIndex(newLength),
                        fixedLength = !isResizable || !isResizable(arrayBuffer);
                    if (isDetached(arrayBuffer)) throw new TypeError$2('ArrayBuffer is detached');
                    if (
                        PROPER_STRUCTURED_CLONE_TRANSFER$1 &&
                        ((arrayBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] })),
                        byteLength === newByteLength && (preserveResizability || fixedLength))
                    )
                        return arrayBuffer;
                    if (byteLength >= newByteLength && (!preserveResizability || fixedLength))
                        newBuffer = slice(arrayBuffer, 0, newByteLength);
                    else {
                        var options =
                            preserveResizability && !fixedLength && maxByteLength
                                ? { maxByteLength: maxByteLength(arrayBuffer) }
                                : void 0;
                        newBuffer = new ArrayBuffer$1(newByteLength, options);
                        for (
                            var a = new DataView(arrayBuffer),
                                b = new DataView(newBuffer),
                                copyLength = min(newByteLength, byteLength),
                                i = 0;
                            i < copyLength;
                            i++
                        )
                            setInt8(b, i, getInt8(a, i));
                    }
                    return PROPER_STRUCTURED_CLONE_TRANSFER$1 || detachTransferable(arrayBuffer), newBuffer;
                },
            createPropertyDescriptor = createPropertyDescriptor$5,
            errorStackInstallable = !fails$h(function () {
                var error = new Error('a');
                return (
                    !('stack' in error) ||
                    (Object.defineProperty(error, 'stack', createPropertyDescriptor(1, 7)), 7 !== error.stack)
                );
            }),
            $$1 = _export,
            global$1 = global$l,
            getBuiltin = getBuiltIn$6,
            uncurryThis$2 = functionUncurryThis,
            fails$2 = fails$h,
            uid = uid$3,
            isCallable = isCallable$h,
            isConstructor = isConstructor$1,
            isNullOrUndefined = isNullOrUndefined$4,
            isObject = isObject$7,
            isSymbol = isSymbol$3,
            iterate = function (iterable, unboundFunction, options) {
                var iterator,
                    iterFn,
                    index,
                    length,
                    result,
                    next,
                    step,
                    that = options && options.that,
                    AS_ENTRIES = !(!options || !options.AS_ENTRIES),
                    IS_RECORD = !(!options || !options.IS_RECORD),
                    IS_ITERATOR = !(!options || !options.IS_ITERATOR),
                    INTERRUPTED = !(!options || !options.INTERRUPTED),
                    fn = bind(unboundFunction, that),
                    stop = function (condition) {
                        return iterator && iteratorClose(iterator, 'normal', condition), new Result(!0, condition);
                    },
                    callFn = function (value) {
                        return AS_ENTRIES
                            ? (anObject$2(value), INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]))
                            : INTERRUPTED
                              ? fn(value, stop)
                              : fn(value);
                    };
                if (IS_RECORD) iterator = iterable.iterator;
                else if (IS_ITERATOR) iterator = iterable;
                else {
                    if (!(iterFn = getIteratorMethod(iterable)))
                        throw new $TypeError$1(tryToString(iterable) + ' is not iterable');
                    if (isArrayIteratorMethod(iterFn)) {
                        for (index = 0, length = lengthOfArrayLike$1(iterable); length > index; index++)
                            if ((result = callFn(iterable[index])) && isPrototypeOf$1(ResultPrototype, result))
                                return result;
                        return new Result(!1);
                    }
                    iterator = getIterator(iterable, iterFn);
                }
                for (next = IS_RECORD ? iterable.next : iterator.next; !(step = call$1(next, iterator)).done; ) {
                    try {
                        result = callFn(step.value);
                    } catch (error) {
                        iteratorClose(iterator, 'throw', error);
                    }
                    if ('object' == typeof result && result && isPrototypeOf$1(ResultPrototype, result)) return result;
                }
                return new Result(!1);
            },
            anObject = anObject$8,
            classof = classof$6,
            hasOwn = hasOwnProperty_1,
            createProperty = function (object, key, value) {
                var propertyKey = toPropertyKey(key);
                propertyKey in object
                    ? definePropertyModule.f(object, propertyKey, createPropertyDescriptor$1(0, value))
                    : (object[propertyKey] = value);
            },
            createNonEnumerableProperty = createNonEnumerableProperty$3,
            lengthOfArrayLike = lengthOfArrayLike$4,
            validateArgumentsLength$3 = validateArgumentsLength$6,
            getRegExpFlags = function (R) {
                var flags = R.flags;
                return void 0 !== flags ||
                    'flags' in RegExpPrototype ||
                    hasOwn$1(R, 'flags') ||
                    !isPrototypeOf(RegExpPrototype, R)
                    ? flags
                    : call(regExpFlags, R);
            },
            MapHelpers = mapHelpers,
            SetHelpers = setHelpers,
            arrayBufferTransfer = arrayBufferTransfer$1,
            ERROR_STACK_INSTALLABLE = errorStackInstallable,
            PROPER_STRUCTURED_CLONE_TRANSFER = structuredCloneProperTransfer,
            Object$1 = global$1.Object,
            Array$1 = global$1.Array,
            Date = global$1.Date,
            Error$1 = global$1.Error,
            EvalError = global$1.EvalError,
            RangeError$1 = global$1.RangeError,
            ReferenceError = global$1.ReferenceError,
            SyntaxError = global$1.SyntaxError,
            TypeError$1 = global$1.TypeError,
            URIError = global$1.URIError,
            PerformanceMark = global$1.PerformanceMark,
            WebAssembly = global$1.WebAssembly,
            CompileError = (WebAssembly && WebAssembly.CompileError) || Error$1,
            LinkError = (WebAssembly && WebAssembly.LinkError) || Error$1,
            RuntimeError = (WebAssembly && WebAssembly.RuntimeError) || Error$1,
            DOMException = getBuiltin('DOMException'),
            Map$1 = MapHelpers.Map,
            mapHas = MapHelpers.has,
            mapGet = MapHelpers.get,
            mapSet = MapHelpers.set,
            Set$1 = SetHelpers.Set,
            setAdd = SetHelpers.add,
            objectKeys = getBuiltin('Object', 'keys'),
            push$1 = uncurryThis$2([].push),
            thisBooleanValue = uncurryThis$2((!0).valueOf),
            thisNumberValue = uncurryThis$2((1).valueOf),
            thisStringValue = uncurryThis$2(''.valueOf),
            thisTimeValue = uncurryThis$2(Date.prototype.getTime),
            PERFORMANCE_MARK = uid('structuredClone'),
            checkBasicSemantic = function (structuredCloneImplementation) {
                return (
                    !fails$2(function () {
                        var set1 = new global$1.Set([7]),
                            set2 = structuredCloneImplementation(set1),
                            number = structuredCloneImplementation(Object$1(7));
                        return set2 === set1 || !set2.has(7) || 'object' != typeof number || 7 != +number;
                    }) && structuredCloneImplementation
                );
            },
            checkErrorsCloning = function (structuredCloneImplementation, $Error) {
                return !fails$2(function () {
                    var error = new $Error(),
                        test = structuredCloneImplementation({ a: error, b: error });
                    return !(test && test.a === test.b && test.a instanceof $Error && test.a.stack === error.stack);
                });
            },
            nativeStructuredClone = global$1.structuredClone,
            FORCED_REPLACEMENT =
                !checkErrorsCloning(nativeStructuredClone, Error$1) ||
                !checkErrorsCloning(nativeStructuredClone, DOMException) ||
                ((structuredCloneImplementation = nativeStructuredClone),
                !!fails$2(function () {
                    var test = structuredCloneImplementation(
                        new global$1.AggregateError([1], PERFORMANCE_MARK, { cause: 3 }),
                    );
                    return (
                        'AggregateError' !== test.name ||
                        1 !== test.errors[0] ||
                        test.message !== PERFORMANCE_MARK ||
                        3 !== test.cause
                    );
                })),
            structuredCloneFromMark =
                !nativeStructuredClone &&
                checkBasicSemantic(function (value) {
                    return new PerformanceMark(PERFORMANCE_MARK, { detail: value }).detail;
                }),
            nativeRestrictedStructuredClone = checkBasicSemantic(nativeStructuredClone) || structuredCloneFromMark,
            throwUncloneable = function (type) {
                throw new DOMException('Uncloneable type: ' + type, 'DataCloneError');
            },
            throwUnpolyfillable = function (type, action) {
                throw new DOMException(
                    (action || 'Cloning') + ' of ' + type + ' cannot be properly polyfilled in this engine',
                    'DataCloneError',
                );
            },
            tryNativeRestrictedStructuredClone = function (value, type) {
                return (
                    nativeRestrictedStructuredClone || throwUnpolyfillable(type), nativeRestrictedStructuredClone(value)
                );
            },
            cloneBuffer = function (value, map, $type) {
                if (mapHas(map, value)) return mapGet(map, value);
                var clone, length, options, source, target, i;
                if ('SharedArrayBuffer' === ($type || classof(value)))
                    clone = nativeRestrictedStructuredClone ? nativeRestrictedStructuredClone(value) : value;
                else {
                    var DataView = global$1.DataView;
                    DataView || 'function' == typeof value.slice || throwUnpolyfillable('ArrayBuffer');
                    try {
                        if ('function' != typeof value.slice || value.resizable) {
                            (length = value.byteLength),
                                (options = 'maxByteLength' in value ? { maxByteLength: value.maxByteLength } : void 0),
                                (clone = new ArrayBuffer(length, options)),
                                (source = new DataView(value)),
                                (target = new DataView(clone));
                            for (i = 0; i < length; i++) target.setUint8(i, source.getUint8(i));
                        } else clone = value.slice(0);
                    } catch (error) {
                        throw new DOMException('ArrayBuffer is detached', 'DataCloneError');
                    }
                }
                return mapSet(map, value, clone), clone;
            },
            cloneView = function (value, type, offset, length, map) {
                var C = global$1[type];
                return isObject(C) || throwUnpolyfillable(type), new C(cloneBuffer(value.buffer, map), offset, length);
            },
            Placeholder = function (object, type, metadata) {
                (this.object = object), (this.type = type), (this.metadata = metadata);
            },
            structuredCloneInternal = function (value, map, transferredBuffers) {
                if ((isSymbol(value) && throwUncloneable('Symbol'), !isObject(value))) return value;
                if (map) {
                    if (mapHas(map, value)) return mapGet(map, value);
                } else map = new Map$1();
                var C,
                    name,
                    cloned,
                    dataTransfer,
                    i,
                    length,
                    keys,
                    key,
                    type = classof(value);
                switch (type) {
                    case 'Array':
                        cloned = Array$1(lengthOfArrayLike(value));
                        break;
                    case 'Object':
                        cloned = {};
                        break;
                    case 'Map':
                        cloned = new Map$1();
                        break;
                    case 'Set':
                        cloned = new Set$1();
                        break;
                    case 'RegExp':
                        cloned = new RegExp(value.source, getRegExpFlags(value));
                        break;
                    case 'Error':
                        switch ((name = value.name)) {
                            case 'AggregateError':
                                cloned = new (getBuiltin('AggregateError'))([]);
                                break;
                            case 'EvalError':
                                cloned = new EvalError();
                                break;
                            case 'RangeError':
                                cloned = new RangeError$1();
                                break;
                            case 'ReferenceError':
                                cloned = new ReferenceError();
                                break;
                            case 'SyntaxError':
                                cloned = new SyntaxError();
                                break;
                            case 'TypeError':
                                cloned = new TypeError$1();
                                break;
                            case 'URIError':
                                cloned = new URIError();
                                break;
                            case 'CompileError':
                                cloned = new CompileError();
                                break;
                            case 'LinkError':
                                cloned = new LinkError();
                                break;
                            case 'RuntimeError':
                                cloned = new RuntimeError();
                                break;
                            default:
                                cloned = new Error$1();
                        }
                        break;
                    case 'DOMException':
                        cloned = new DOMException(value.message, value.name);
                        break;
                    case 'ArrayBuffer':
                    case 'SharedArrayBuffer':
                        cloned = transferredBuffers ? new Placeholder(value, type) : cloneBuffer(value, map, type);
                        break;
                    case 'DataView':
                    case 'Int8Array':
                    case 'Uint8Array':
                    case 'Uint8ClampedArray':
                    case 'Int16Array':
                    case 'Uint16Array':
                    case 'Int32Array':
                    case 'Uint32Array':
                    case 'Float16Array':
                    case 'Float32Array':
                    case 'Float64Array':
                    case 'BigInt64Array':
                    case 'BigUint64Array':
                        (length = 'DataView' === type ? value.byteLength : value.length),
                            (cloned = transferredBuffers
                                ? new Placeholder(value, type, { offset: value.byteOffset, length: length })
                                : cloneView(value, type, value.byteOffset, length, map));
                        break;
                    case 'DOMQuad':
                        try {
                            cloned = new DOMQuad(
                                structuredCloneInternal(value.p1, map, transferredBuffers),
                                structuredCloneInternal(value.p2, map, transferredBuffers),
                                structuredCloneInternal(value.p3, map, transferredBuffers),
                                structuredCloneInternal(value.p4, map, transferredBuffers),
                            );
                        } catch (error) {
                            cloned = tryNativeRestrictedStructuredClone(value, type);
                        }
                        break;
                    case 'File':
                        if (nativeRestrictedStructuredClone)
                            try {
                                (cloned = nativeRestrictedStructuredClone(value)),
                                    classof(cloned) !== type && (cloned = void 0);
                            } catch (error) {}
                        if (!cloned)
                            try {
                                cloned = new File([value], value.name, value);
                            } catch (error) {}
                        cloned || throwUnpolyfillable(type);
                        break;
                    case 'FileList':
                        if (
                            (dataTransfer = (function () {
                                var dataTransfer;
                                try {
                                    dataTransfer = new global$1.DataTransfer();
                                } catch (error) {
                                    try {
                                        dataTransfer = new global$1.ClipboardEvent('').clipboardData;
                                    } catch (error2) {}
                                }
                                return dataTransfer && dataTransfer.items && dataTransfer.files ? dataTransfer : null;
                            })())
                        ) {
                            for (i = 0, length = lengthOfArrayLike(value); i < length; i++)
                                dataTransfer.items.add(structuredCloneInternal(value[i], map, transferredBuffers));
                            cloned = dataTransfer.files;
                        } else cloned = tryNativeRestrictedStructuredClone(value, type);
                        break;
                    case 'ImageData':
                        try {
                            cloned = new ImageData(
                                structuredCloneInternal(value.data, map, transferredBuffers),
                                value.width,
                                value.height,
                                { colorSpace: value.colorSpace },
                            );
                        } catch (error) {
                            cloned = tryNativeRestrictedStructuredClone(value, type);
                        }
                        break;
                    default:
                        if (nativeRestrictedStructuredClone) cloned = nativeRestrictedStructuredClone(value);
                        else
                            switch (type) {
                                case 'BigInt':
                                    cloned = Object$1(value.valueOf());
                                    break;
                                case 'Boolean':
                                    cloned = Object$1(thisBooleanValue(value));
                                    break;
                                case 'Number':
                                    cloned = Object$1(thisNumberValue(value));
                                    break;
                                case 'String':
                                    cloned = Object$1(thisStringValue(value));
                                    break;
                                case 'Date':
                                    cloned = new Date(thisTimeValue(value));
                                    break;
                                case 'Blob':
                                    try {
                                        cloned = value.slice(0, value.size, value.type);
                                    } catch (error) {
                                        throwUnpolyfillable(type);
                                    }
                                    break;
                                case 'DOMPoint':
                                case 'DOMPointReadOnly':
                                    C = global$1[type];
                                    try {
                                        cloned = C.fromPoint
                                            ? C.fromPoint(value)
                                            : new C(value.x, value.y, value.z, value.w);
                                    } catch (error) {
                                        throwUnpolyfillable(type);
                                    }
                                    break;
                                case 'DOMRect':
                                case 'DOMRectReadOnly':
                                    C = global$1[type];
                                    try {
                                        cloned = C.fromRect
                                            ? C.fromRect(value)
                                            : new C(value.x, value.y, value.width, value.height);
                                    } catch (error) {
                                        throwUnpolyfillable(type);
                                    }
                                    break;
                                case 'DOMMatrix':
                                case 'DOMMatrixReadOnly':
                                    C = global$1[type];
                                    try {
                                        cloned = C.fromMatrix ? C.fromMatrix(value) : new C(value);
                                    } catch (error) {
                                        throwUnpolyfillable(type);
                                    }
                                    break;
                                case 'AudioData':
                                case 'VideoFrame':
                                    isCallable(value.clone) || throwUnpolyfillable(type);
                                    try {
                                        cloned = value.clone();
                                    } catch (error) {
                                        throwUncloneable(type);
                                    }
                                    break;
                                case 'CropTarget':
                                case 'CryptoKey':
                                case 'FileSystemDirectoryHandle':
                                case 'FileSystemFileHandle':
                                case 'FileSystemHandle':
                                case 'GPUCompilationInfo':
                                case 'GPUCompilationMessage':
                                case 'ImageBitmap':
                                case 'RTCCertificate':
                                case 'WebAssembly.Module':
                                    throwUnpolyfillable(type);
                                default:
                                    throwUncloneable(type);
                            }
                }
                switch ((mapSet(map, value, cloned), type)) {
                    case 'Array':
                    case 'Object':
                        for (keys = objectKeys(value), i = 0, length = lengthOfArrayLike(keys); i < length; i++)
                            (key = keys[i]),
                                createProperty(
                                    cloned,
                                    key,
                                    structuredCloneInternal(value[key], map, transferredBuffers),
                                );
                        break;
                    case 'Map':
                        value.forEach(function (v, k) {
                            mapSet(
                                cloned,
                                structuredCloneInternal(k, map, transferredBuffers),
                                structuredCloneInternal(v, map, transferredBuffers),
                            );
                        });
                        break;
                    case 'Set':
                        value.forEach(function (v) {
                            setAdd(cloned, structuredCloneInternal(v, map, transferredBuffers));
                        });
                        break;
                    case 'Error':
                        createNonEnumerableProperty(
                            cloned,
                            'message',
                            structuredCloneInternal(value.message, map, transferredBuffers),
                        ),
                            hasOwn(value, 'cause') &&
                                createNonEnumerableProperty(
                                    cloned,
                                    'cause',
                                    structuredCloneInternal(value.cause, map, transferredBuffers),
                                ),
                            'AggregateError' === name &&
                                (cloned.errors = structuredCloneInternal(value.errors, map, transferredBuffers));
                    case 'DOMException':
                        ERROR_STACK_INSTALLABLE &&
                            createNonEnumerableProperty(
                                cloned,
                                'stack',
                                structuredCloneInternal(value.stack, map, transferredBuffers),
                            );
                }
                return cloned;
            },
            replacePlaceholders = function (value, map) {
                if (!isObject(value)) return value;
                if (mapHas(map, value)) return mapGet(map, value);
                var type, object, metadata, i, length, keys, key, replacement;
                if (value instanceof Placeholder)
                    switch (((type = value.type), (object = value.object), type)) {
                        case 'ArrayBuffer':
                        case 'SharedArrayBuffer':
                            replacement = cloneBuffer(object, map, type);
                            break;
                        case 'DataView':
                        case 'Int8Array':
                        case 'Uint8Array':
                        case 'Uint8ClampedArray':
                        case 'Int16Array':
                        case 'Uint16Array':
                        case 'Int32Array':
                        case 'Uint32Array':
                        case 'Float16Array':
                        case 'Float32Array':
                        case 'Float64Array':
                        case 'BigInt64Array':
                        case 'BigUint64Array':
                            (metadata = value.metadata),
                                (replacement = cloneView(object, type, metadata.offset, metadata.length, map));
                    }
                else
                    switch (classof(value)) {
                        case 'Array':
                        case 'Object':
                            for (keys = objectKeys(value), i = 0, length = lengthOfArrayLike(keys); i < length; i++)
                                value[(key = keys[i])] = replacePlaceholders(value[key], map);
                            break;
                        case 'Map':
                            (replacement = new Map$1()),
                                value.forEach(function (v, k) {
                                    mapSet(replacement, replacePlaceholders(k, map), replacePlaceholders(v, map));
                                });
                            break;
                        case 'Set':
                            (replacement = new Set$1()),
                                value.forEach(function (v) {
                                    setAdd(replacement, replacePlaceholders(v, map));
                                });
                            break;
                        case 'Error':
                            (value.message = replacePlaceholders(value.message, map)),
                                hasOwn(value, 'cause') && (value.cause = replacePlaceholders(value.cause, map)),
                                'AggregateError' === value.name &&
                                    (value.errors = replacePlaceholders(value.errors, map));
                        case 'DOMException':
                            ERROR_STACK_INSTALLABLE && (value.stack = replacePlaceholders(value.stack, map));
                    }
                return mapSet(map, value, replacement || value), replacement || value;
            };
        $$1(
            { global: !0, enumerable: !0, sham: !PROPER_STRUCTURED_CLONE_TRANSFER, forced: FORCED_REPLACEMENT },
            {
                structuredClone: function (value) {
                    var map,
                        buffers,
                        options =
                            validateArgumentsLength$3(arguments.length, 1) > 1 && !isNullOrUndefined(arguments[1])
                                ? anObject(arguments[1])
                                : void 0,
                        transfer = options ? options.transfer : void 0,
                        transferredBuffers = !1;
                    void 0 !== transfer &&
                        ((buffers = (function (rawTransfer, map) {
                            if (!isObject(rawTransfer))
                                throw new TypeError$1('Transfer option cannot be converted to a sequence');
                            var transfer = [];
                            iterate(rawTransfer, function (value) {
                                push$1(transfer, anObject(value));
                            });
                            for (
                                var value,
                                    type,
                                    C,
                                    transferred,
                                    canvas,
                                    i = 0,
                                    length = lengthOfArrayLike(transfer),
                                    buffers = [];
                                i < length;

                            )
                                if (((value = transfer[i++]), 'ArrayBuffer' !== (type = classof(value)))) {
                                    if (mapHas(map, value))
                                        throw new DOMException('Duplicate transferable', 'DataCloneError');
                                    if (PROPER_STRUCTURED_CLONE_TRANSFER)
                                        transferred = nativeStructuredClone(value, { transfer: [value] });
                                    else
                                        switch (type) {
                                            case 'ImageBitmap':
                                                (C = global$1.OffscreenCanvas),
                                                    isConstructor(C) || throwUnpolyfillable(type, 'Transferring');
                                                try {
                                                    (canvas = new C(value.width, value.height))
                                                        .getContext('bitmaprenderer')
                                                        .transferFromImageBitmap(value),
                                                        (transferred = canvas.transferToImageBitmap());
                                                } catch (error) {}
                                                break;
                                            case 'AudioData':
                                            case 'VideoFrame':
                                                (isCallable(value.clone) && isCallable(value.close)) ||
                                                    throwUnpolyfillable(type, 'Transferring');
                                                try {
                                                    (transferred = value.clone()), value.close();
                                                } catch (error) {}
                                                break;
                                            case 'MediaSourceHandle':
                                            case 'MessagePort':
                                            case 'OffscreenCanvas':
                                            case 'ReadableStream':
                                            case 'TransformStream':
                                            case 'WritableStream':
                                                throwUnpolyfillable(type, 'Transferring');
                                        }
                                    if (void 0 === transferred)
                                        throw new DOMException(
                                            'This object cannot be transferred: ' + type,
                                            'DataCloneError',
                                        );
                                    mapSet(map, value, transferred);
                                } else push$1(buffers, value);
                            return buffers;
                        })(transfer, (map = new Map$1()))),
                        (transferredBuffers = !!lengthOfArrayLike(buffers)));
                    var clone = structuredCloneInternal(value, map, transferredBuffers);
                    return (
                        transferredBuffers &&
                            ((function (transfer, map) {
                                for (
                                    var value, transferred, i = 0, length = lengthOfArrayLike(transfer);
                                    i < length;

                                ) {
                                    if (((value = transfer[i++]), mapHas(map, value)))
                                        throw new DOMException('Duplicate transferable', 'DataCloneError');
                                    arrayBufferTransfer
                                        ? (transferred = arrayBufferTransfer(value, void 0, !0))
                                        : (isCallable(value.transfer) ||
                                              throwUnpolyfillable('ArrayBuffer', 'Transferring'),
                                          (transferred = value.transfer())),
                                        mapSet(map, value, transferred);
                                }
                            })(transfer, (map = new Map$1())),
                            (clone = replacePlaceholders(clone, map))),
                        clone
                    );
                },
            },
        );
        var fails$1 = fails$h,
            DESCRIPTORS = descriptors,
            ITERATOR = wellKnownSymbol$6('iterator'),
            urlConstructorDetection = !fails$1(function () {
                var url = new URL('b?a=1&b=2&c=3', 'http://a'),
                    params = url.searchParams,
                    params2 = new URLSearchParams('a=1&a=2&b=3'),
                    result = '';
                return (
                    (url.pathname = 'c%20d'),
                    params.forEach(function (value, key) {
                        params.delete('b'), (result += key + value);
                    }),
                    params2.delete('a', 2),
                    params2.delete('b', void 0),
                    (!params.size && !DESCRIPTORS) ||
                        !params.sort ||
                        'http://a/c%20d?a=1&c=3' !== url.href ||
                        '3' !== params.get('c') ||
                        'a=1' !== String(new URLSearchParams('?a=1')) ||
                        !params[ITERATOR] ||
                        'a' !== new URL('https://a@b').username ||
                        'b' !== new URLSearchParams(new URLSearchParams('a=b')).get('a') ||
                        'xn--e1aybc' !== new URL('http://тест').host ||
                        '#%D0%B1' !== new URL('http://a#б').hash ||
                        'a1c3' !== result ||
                        'x' !== new URL('http://x', void 0).host
                );
            }),
            $ = _export,
            fails = fails$h,
            validateArgumentsLength$2 = validateArgumentsLength$6,
            toString$2 = toString$6,
            USE_NATIVE_URL = urlConstructorDetection,
            URL$1 = getBuiltIn$6('URL');
        $(
            {
                target: 'URL',
                stat: !0,
                forced: !(
                    USE_NATIVE_URL &&
                    fails(function () {
                        URL$1.canParse();
                    })
                ),
            },
            {
                canParse: function (url) {
                    var length = validateArgumentsLength$2(arguments.length, 1),
                        urlString = toString$2(url),
                        base = length < 2 || void 0 === arguments[1] ? void 0 : toString$2(arguments[1]);
                    try {
                        return !!new URL$1(urlString, base);
                    } catch (error) {
                        return !1;
                    }
                },
            },
        );
        var defineBuiltIn$1 = defineBuiltIn$3,
            uncurryThis$1 = functionUncurryThis,
            toString$1 = toString$6,
            validateArgumentsLength$1 = validateArgumentsLength$6,
            $URLSearchParams$1 = URLSearchParams,
            URLSearchParamsPrototype$1 = $URLSearchParams$1.prototype,
            append = uncurryThis$1(URLSearchParamsPrototype$1.append),
            $delete = uncurryThis$1(URLSearchParamsPrototype$1.delete),
            forEach = uncurryThis$1(URLSearchParamsPrototype$1.forEach),
            push = uncurryThis$1([].push),
            params$1 = new $URLSearchParams$1('a=1&a=2&b=3');
        params$1.delete('a', 1),
            params$1.delete('b', void 0),
            params$1 + '' != 'a=2' &&
                defineBuiltIn$1(
                    URLSearchParamsPrototype$1,
                    'delete',
                    function (name) {
                        var length = arguments.length,
                            $value = length < 2 ? void 0 : arguments[1];
                        if (length && void 0 === $value) return $delete(this, name);
                        var entries = [];
                        forEach(this, function (v, k) {
                            push(entries, { key: k, value: v });
                        }),
                            validateArgumentsLength$1(length, 1);
                        for (
                            var entry,
                                key = toString$1(name),
                                value = toString$1($value),
                                index = 0,
                                dindex = 0,
                                found = !1,
                                entriesLength = entries.length;
                            index < entriesLength;

                        )
                            (entry = entries[index++]),
                                found || entry.key === key ? ((found = !0), $delete(this, entry.key)) : dindex++;
                        for (; dindex < entriesLength; )
                            ((entry = entries[dindex++]).key === key && entry.value === value) ||
                                append(this, entry.key, entry.value);
                    },
                    { enumerable: !0, unsafe: !0 },
                );
        var defineBuiltIn = defineBuiltIn$3,
            uncurryThis = functionUncurryThis,
            toString = toString$6,
            validateArgumentsLength = validateArgumentsLength$6,
            $URLSearchParams = URLSearchParams,
            URLSearchParamsPrototype = $URLSearchParams.prototype,
            getAll = uncurryThis(URLSearchParamsPrototype.getAll),
            $has = uncurryThis(URLSearchParamsPrototype.has),
            params = new $URLSearchParams('a=1');
        (!params.has('a', 2) && params.has('a', void 0)) ||
            defineBuiltIn(
                URLSearchParamsPrototype,
                'has',
                function (name) {
                    var length = arguments.length,
                        $value = length < 2 ? void 0 : arguments[1];
                    if (length && void 0 === $value) return $has(this, name);
                    var values = getAll(this, name);
                    validateArgumentsLength(length, 1);
                    for (var value = toString($value), index = 0; index < values.length; )
                        if (values[index++] === value) return !0;
                    return !1;
                },
                { enumerable: !0, unsafe: !0 },
            );
    }
    var structuredCloneImplementation;
})();
null;
