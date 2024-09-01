var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var buffer = {};
var base64Js = {};
base64Js.byteLength = byteLength;
base64Js.toByteArray = toByteArray;
base64Js.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var i$1 = 0, len = code.length; i$1 < len; ++i$1) {
  lookup[i$1] = code[i$1];
  revLookup[code.charCodeAt(i$1)] = i$1;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  var len2 = b64.length;
  if (len2 % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1)
    validLen = len2;
  var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i2;
  for (i2 = 0; i2 < len2; i2 += 4) {
    tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
    arr[curByte++] = tmp >> 16 & 255;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i2 = start; i2 < end; i2 += 3) {
    tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp;
  var len2 = uint8.length;
  var extraBytes = len2 % 3;
  var parts = [];
  var maxChunkLength = 16383;
  for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
    parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
  }
  if (extraBytes === 1) {
    tmp = uint8[len2 - 1];
    parts.push(
      lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
    );
  } else if (extraBytes === 2) {
    tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
    parts.push(
      lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
    );
  }
  return parts.join("");
}
var ieee754 = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
ieee754.read = function(buffer2, offset, isLE, mLen, nBytes) {
  var e2, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i2 = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer2[offset + i2];
  i2 += d;
  e2 = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e2 = e2 * 256 + buffer2[offset + i2], i2 += d, nBits -= 8) {
  }
  m = e2 & (1 << -nBits) - 1;
  e2 >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer2[offset + i2], i2 += d, nBits -= 8) {
  }
  if (e2 === 0) {
    e2 = 1 - eBias;
  } else if (e2 === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e2 = e2 - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e2 - mLen);
};
ieee754.write = function(buffer2, value, offset, isLE, mLen, nBytes) {
  var e2, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i2 = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e2 = eMax;
  } else {
    e2 = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e2)) < 1) {
      e2--;
      c *= 2;
    }
    if (e2 + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e2++;
      c /= 2;
    }
    if (e2 + eBias >= eMax) {
      m = 0;
      e2 = eMax;
    } else if (e2 + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e2 = e2 + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e2 = 0;
    }
  }
  for (; mLen >= 8; buffer2[offset + i2] = m & 255, i2 += d, m /= 256, mLen -= 8) {
  }
  e2 = e2 << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer2[offset + i2] = e2 & 255, i2 += d, e2 /= 256, eLen -= 8) {
  }
  buffer2[offset + i2 - d] |= s * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(exports2) {
  const base64 = base64Js;
  const ieee754$1 = ieee754;
  const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
  exports2.Buffer = Buffer2;
  exports2.SlowBuffer = SlowBuffer;
  exports2.INSPECT_MAX_BYTES = 50;
  const K_MAX_LENGTH = 2147483647;
  exports2.kMaxLength = K_MAX_LENGTH;
  Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
  if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
    console.error(
      "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
    );
  }
  function typedArraySupport() {
    try {
      const arr = new Uint8Array(1);
      const proto = { foo: function() {
        return 42;
      } };
      Object.setPrototypeOf(proto, Uint8Array.prototype);
      Object.setPrototypeOf(arr, proto);
      return arr.foo() === 42;
    } catch (e2) {
      return false;
    }
  }
  Object.defineProperty(Buffer2.prototype, "parent", {
    enumerable: true,
    get: function() {
      if (!Buffer2.isBuffer(this))
        return void 0;
      return this.buffer;
    }
  });
  Object.defineProperty(Buffer2.prototype, "offset", {
    enumerable: true,
    get: function() {
      if (!Buffer2.isBuffer(this))
        return void 0;
      return this.byteOffset;
    }
  });
  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }
    const buf = new Uint8Array(length);
    Object.setPrototypeOf(buf, Buffer2.prototype);
    return buf;
  }
  function Buffer2(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string") {
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      }
      return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
  }
  Buffer2.poolSize = 8192;
  function from(value, encodingOrOffset, length) {
    if (typeof value === "string") {
      return fromString(value, encodingOrOffset);
    }
    if (ArrayBuffer.isView(value)) {
      return fromArrayView(value);
    }
    if (value == null) {
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
      );
    }
    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof value === "number") {
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    }
    const valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) {
      return Buffer2.from(valueOf, encodingOrOffset, length);
    }
    const b = fromObject(value);
    if (b)
      return b;
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
      return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    }
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
    );
  }
  Buffer2.from = function(value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };
  Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(Buffer2, Uint8Array);
  function assertSize(size) {
    if (typeof size !== "number") {
      throw new TypeError('"size" argument must be of type number');
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"');
    }
  }
  function alloc(size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(size);
    }
    if (fill !== void 0) {
      return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    }
    return createBuffer(size);
  }
  Buffer2.alloc = function(size, fill, encoding) {
    return alloc(size, fill, encoding);
  };
  function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
  }
  Buffer2.allocUnsafe = function(size) {
    return allocUnsafe(size);
  };
  Buffer2.allocUnsafeSlow = function(size) {
    return allocUnsafe(size);
  };
  function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer2.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding);
    }
    const length = byteLength2(string, encoding) | 0;
    let buf = createBuffer(length);
    const actual = buf.write(string, encoding);
    if (actual !== length) {
      buf = buf.slice(0, actual);
    }
    return buf;
  }
  function fromArrayLike(array) {
    const length = array.length < 0 ? 0 : checked(array.length) | 0;
    const buf = createBuffer(length);
    for (let i2 = 0; i2 < length; i2 += 1) {
      buf[i2] = array[i2] & 255;
    }
    return buf;
  }
  function fromArrayView(arrayView) {
    if (isInstance(arrayView, Uint8Array)) {
      const copy = new Uint8Array(arrayView);
      return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return fromArrayLike(arrayView);
  }
  function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds');
    }
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds');
    }
    let buf;
    if (byteOffset === void 0 && length === void 0) {
      buf = new Uint8Array(array);
    } else if (length === void 0) {
      buf = new Uint8Array(array, byteOffset);
    } else {
      buf = new Uint8Array(array, byteOffset, length);
    }
    Object.setPrototypeOf(buf, Buffer2.prototype);
    return buf;
  }
  function fromObject(obj) {
    if (Buffer2.isBuffer(obj)) {
      const len2 = checked(obj.length) | 0;
      const buf = createBuffer(len2);
      if (buf.length === 0) {
        return buf;
      }
      obj.copy(buf, 0, 0, len2);
      return buf;
    }
    if (obj.length !== void 0) {
      if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
        return createBuffer(0);
      }
      return fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data);
    }
  }
  function checked(length) {
    if (length >= K_MAX_LENGTH) {
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
    }
    return length | 0;
  }
  function SlowBuffer(length) {
    if (+length != length) {
      length = 0;
    }
    return Buffer2.alloc(+length);
  }
  Buffer2.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== Buffer2.prototype;
  };
  Buffer2.compare = function compare(a, b) {
    if (isInstance(a, Uint8Array))
      a = Buffer2.from(a, a.offset, a.byteLength);
    if (isInstance(b, Uint8Array))
      b = Buffer2.from(b, b.offset, b.byteLength);
    if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    }
    if (a === b)
      return 0;
    let x = a.length;
    let y = b.length;
    for (let i2 = 0, len2 = Math.min(x, y); i2 < len2; ++i2) {
      if (a[i2] !== b[i2]) {
        x = a[i2];
        y = b[i2];
        break;
      }
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer2.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  };
  Buffer2.concat = function concat2(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
      return Buffer2.alloc(0);
    }
    let i2;
    if (length === void 0) {
      length = 0;
      for (i2 = 0; i2 < list.length; ++i2) {
        length += list[i2].length;
      }
    }
    const buffer2 = Buffer2.allocUnsafe(length);
    let pos = 0;
    for (i2 = 0; i2 < list.length; ++i2) {
      let buf = list[i2];
      if (isInstance(buf, Uint8Array)) {
        if (pos + buf.length > buffer2.length) {
          if (!Buffer2.isBuffer(buf))
            buf = Buffer2.from(buf);
          buf.copy(buffer2, pos);
        } else {
          Uint8Array.prototype.set.call(
            buffer2,
            buf,
            pos
          );
        }
      } else if (!Buffer2.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      } else {
        buf.copy(buffer2, pos);
      }
      pos += buf.length;
    }
    return buffer2;
  };
  function byteLength2(string, encoding) {
    if (Buffer2.isBuffer(string)) {
      return string.length;
    }
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
      return string.byteLength;
    }
    if (typeof string !== "string") {
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
      );
    }
    const len2 = string.length;
    const mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len2 === 0)
      return 0;
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len2;
        case "utf8":
        case "utf-8":
          return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len2 * 2;
        case "hex":
          return len2 >>> 1;
        case "base64":
          return base64ToBytes(string).length;
        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length;
          }
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer2.byteLength = byteLength2;
  function slowToString(encoding, start, end) {
    let loweredCase = false;
    if (start === void 0 || start < 0) {
      start = 0;
    }
    if (start > this.length) {
      return "";
    }
    if (end === void 0 || end > this.length) {
      end = this.length;
    }
    if (end <= 0) {
      return "";
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
      return "";
    }
    if (!encoding)
      encoding = "utf8";
    while (true) {
      switch (encoding) {
        case "hex":
          return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice(this, start, end);
        case "ascii":
          return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice(this, start, end);
        case "base64":
          return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer2.prototype._isBuffer = true;
  function swap(b, n2, m) {
    const i2 = b[n2];
    b[n2] = b[m];
    b[m] = i2;
  }
  Buffer2.prototype.swap16 = function swap16() {
    const len2 = this.length;
    if (len2 % 2 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for (let i2 = 0; i2 < len2; i2 += 2) {
      swap(this, i2, i2 + 1);
    }
    return this;
  };
  Buffer2.prototype.swap32 = function swap32() {
    const len2 = this.length;
    if (len2 % 4 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for (let i2 = 0; i2 < len2; i2 += 4) {
      swap(this, i2, i2 + 3);
      swap(this, i2 + 1, i2 + 2);
    }
    return this;
  };
  Buffer2.prototype.swap64 = function swap64() {
    const len2 = this.length;
    if (len2 % 8 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for (let i2 = 0; i2 < len2; i2 += 8) {
      swap(this, i2, i2 + 7);
      swap(this, i2 + 1, i2 + 6);
      swap(this, i2 + 2, i2 + 5);
      swap(this, i2 + 3, i2 + 4);
    }
    return this;
  };
  Buffer2.prototype.toString = function toString() {
    const length = this.length;
    if (length === 0)
      return "";
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
  Buffer2.prototype.equals = function equals(b) {
    if (!Buffer2.isBuffer(b))
      throw new TypeError("Argument must be a Buffer");
    if (this === b)
      return true;
    return Buffer2.compare(this, b) === 0;
  };
  Buffer2.prototype.inspect = function inspect() {
    let str = "";
    const max = exports2.INSPECT_MAX_BYTES;
    str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max)
      str += " ... ";
    return "<Buffer " + str + ">";
  };
  if (customInspectSymbol) {
    Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
  }
  Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
      target = Buffer2.from(target, target.offset, target.byteLength);
    }
    if (!Buffer2.isBuffer(target)) {
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
      );
    }
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = target ? target.length : 0;
    }
    if (thisStart === void 0) {
      thisStart = 0;
    }
    if (thisEnd === void 0) {
      thisEnd = this.length;
    }
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError("out of range index");
    }
    if (thisStart >= thisEnd && start >= end) {
      return 0;
    }
    if (thisStart >= thisEnd) {
      return -1;
    }
    if (start >= end) {
      return 1;
    }
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target)
      return 0;
    let x = thisEnd - thisStart;
    let y = end - start;
    const len2 = Math.min(x, y);
    const thisCopy = this.slice(thisStart, thisEnd);
    const targetCopy = target.slice(start, end);
    for (let i2 = 0; i2 < len2; ++i2) {
      if (thisCopy[i2] !== targetCopy[i2]) {
        x = thisCopy[i2];
        y = targetCopy[i2];
        break;
      }
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
    if (buffer2.length === 0)
      return -1;
    if (typeof byteOffset === "string") {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 2147483647) {
      byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (numberIsNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer2.length - 1;
    }
    if (byteOffset < 0)
      byteOffset = buffer2.length + byteOffset;
    if (byteOffset >= buffer2.length) {
      if (dir)
        return -1;
      else
        byteOffset = buffer2.length - 1;
    } else if (byteOffset < 0) {
      if (dir)
        byteOffset = 0;
      else
        return -1;
    }
    if (typeof val === "string") {
      val = Buffer2.from(val, encoding);
    }
    if (Buffer2.isBuffer(val)) {
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf(buffer2, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      val = val & 255;
      if (typeof Uint8Array.prototype.indexOf === "function") {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer2, val, byteOffset);
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer2, val, byteOffset);
        }
      }
      return arrayIndexOf(buffer2, [val], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    let indexSize = 1;
    let arrLength = arr.length;
    let valLength = val.length;
    if (encoding !== void 0) {
      encoding = String(encoding).toLowerCase();
      if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }
    function read(buf, i3) {
      if (indexSize === 1) {
        return buf[i3];
      } else {
        return buf.readUInt16BE(i3 * indexSize);
      }
    }
    let i2;
    if (dir) {
      let foundIndex = -1;
      for (i2 = byteOffset; i2 < arrLength; i2++) {
        if (read(arr, i2) === read(val, foundIndex === -1 ? 0 : i2 - foundIndex)) {
          if (foundIndex === -1)
            foundIndex = i2;
          if (i2 - foundIndex + 1 === valLength)
            return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1)
            i2 -= i2 - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength)
        byteOffset = arrLength - valLength;
      for (i2 = byteOffset; i2 >= 0; i2--) {
        let found = true;
        for (let j = 0; j < valLength; j++) {
          if (read(arr, i2 + j) !== read(val, j)) {
            found = false;
            break;
          }
        }
        if (found)
          return i2;
      }
    }
    return -1;
  }
  Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };
  Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };
  Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    const remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    const strLen = string.length;
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    let i2;
    for (i2 = 0; i2 < length; ++i2) {
      const parsed = parseInt(string.substr(i2 * 2, 2), 16);
      if (numberIsNaN(parsed))
        return i2;
      buf[offset + i2] = parsed;
    }
    return i2;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  Buffer2.prototype.write = function write(string, offset, length, encoding) {
    if (offset === void 0) {
      encoding = "utf8";
      length = this.length;
      offset = 0;
    } else if (length === void 0 && typeof offset === "string") {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset >>> 0;
      if (isFinite(length)) {
        length = length >>> 0;
        if (encoding === void 0)
          encoding = "utf8";
      } else {
        encoding = length;
        length = void 0;
      }
    } else {
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    }
    const remaining = this.length - offset;
    if (length === void 0 || length > remaining)
      length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
      throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding)
      encoding = "utf8";
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "hex":
          return hexWrite(this, string, offset, length);
        case "utf8":
        case "utf-8":
          return utf8Write(this, string, offset, length);
        case "ascii":
        case "latin1":
        case "binary":
          return asciiWrite(this, string, offset, length);
        case "base64":
          return base64Write(this, string, offset, length);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer2.prototype.toJSON = function toJSON() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i2 = start;
    while (i2 < end) {
      const firstByte = buf[i2];
      let codePoint = null;
      let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i2 + bytesPerSequence <= end) {
        let secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i2 + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i2 + 1];
            thirdByte = buf[i2 + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i2 + 1];
            thirdByte = buf[i2 + 2];
            fourthByte = buf[i2 + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      i2 += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  const MAX_ARGUMENTS_LENGTH = 4096;
  function decodeCodePointsArray(codePoints) {
    const len2 = codePoints.length;
    if (len2 <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    let res = "";
    let i2 = 0;
    while (i2 < len2) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i2, i2 += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i2 = start; i2 < end; ++i2) {
      ret += String.fromCharCode(buf[i2] & 127);
    }
    return ret;
  }
  function latin1Slice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i2 = start; i2 < end; ++i2) {
      ret += String.fromCharCode(buf[i2]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    const len2 = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len2)
      end = len2;
    let out = "";
    for (let i2 = start; i2 < end; ++i2) {
      out += hexSliceLookupTable[buf[i2]];
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    const bytes = buf.slice(start, end);
    let res = "";
    for (let i2 = 0; i2 < bytes.length - 1; i2 += 2) {
      res += String.fromCharCode(bytes[i2] + bytes[i2 + 1] * 256);
    }
    return res;
  }
  Buffer2.prototype.slice = function slice(start, end) {
    const len2 = this.length;
    start = ~~start;
    end = end === void 0 ? len2 : ~~end;
    if (start < 0) {
      start += len2;
      if (start < 0)
        start = 0;
    } else if (start > len2) {
      start = len2;
    }
    if (end < 0) {
      end += len2;
      if (end < 0)
        end = 0;
    } else if (end > len2) {
      end = len2;
    }
    if (end < start)
      end = start;
    const newBuf = this.subarray(start, end);
    Object.setPrototypeOf(newBuf, Buffer2.prototype);
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
      throw new RangeError("offset is not uint");
    if (offset + ext > length)
      throw new RangeError("Trying to access beyond buffer length");
  }
  Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i2 = 0;
    while (++i2 < byteLength3 && (mul *= 256)) {
      val += this[offset + i2] * mul;
    }
    return val;
  };
  Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      checkOffset(offset, byteLength3, this.length);
    }
    let val = this[offset + --byteLength3];
    let mul = 1;
    while (byteLength3 > 0 && (mul *= 256)) {
      val += this[offset + --byteLength3] * mul;
    }
    return val;
  };
  Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };
  Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };
  Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
  };
  Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };
  Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
    const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
  });
  Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
  });
  Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i2 = 0;
    while (++i2 < byteLength3 && (mul *= 256)) {
      val += this[offset + i2] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let i2 = byteLength3;
    let mul = 1;
    let val = this[offset + --i2];
    while (i2 > 0 && (mul *= 256)) {
      val += this[offset + --i2] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 128))
      return this[offset];
    return (255 - this[offset] + 1) * -1;
  };
  Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset] | this[offset + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset + 1] | this[offset] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };
  Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };
  Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
    return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
  });
  Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
  });
  Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, true, 23, 4);
  };
  Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, false, 23, 4);
  };
  Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, true, 52, 8);
  };
  Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer2.isBuffer(buf))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min)
      throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
  }
  Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
      checkInt(this, value, offset, byteLength3, maxBytes, 0);
    }
    let mul = 1;
    let i2 = 0;
    this[offset] = value & 255;
    while (++i2 < byteLength3 && (mul *= 256)) {
      this[offset + i2] = value / mul & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
      checkInt(this, value, offset, byteLength3, maxBytes, 0);
    }
    let i2 = byteLength3 - 1;
    let mul = 1;
    this[offset + i2] = value & 255;
    while (--i2 >= 0 && (mul *= 256)) {
      this[offset + i2] = value / mul & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 255, 0);
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
    return offset + 4;
  };
  Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  function wrtBigUInt64LE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    return offset;
  }
  function wrtBigUInt64BE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset + 7] = lo;
    lo = lo >> 8;
    buf[offset + 6] = lo;
    lo = lo >> 8;
    buf[offset + 5] = lo;
    lo = lo >> 8;
    buf[offset + 4] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset + 3] = hi;
    hi = hi >> 8;
    buf[offset + 2] = hi;
    hi = hi >> 8;
    buf[offset + 1] = hi;
    hi = hi >> 8;
    buf[offset] = hi;
    return offset + 8;
  }
  Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit - 1, -limit);
    }
    let i2 = 0;
    let mul = 1;
    let sub = 0;
    this[offset] = value & 255;
    while (++i2 < byteLength3 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i2 - 1] !== 0) {
        sub = 1;
      }
      this[offset + i2] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit - 1, -limit);
    }
    let i2 = byteLength3 - 1;
    let mul = 1;
    let sub = 0;
    this[offset + i2] = value & 255;
    while (--i2 >= 0 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i2 + 1] !== 0) {
        sub = 1;
      }
      this[offset + i2] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 127, -128);
    if (value < 0)
      value = 255 + value + 1;
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
  };
  Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    if (value < 0)
      value = 4294967295 + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
    if (offset < 0)
      throw new RangeError("Index out of range");
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer2.isBuffer(target))
      throw new TypeError("argument should be a Buffer");
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0) {
      throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length)
      throw new RangeError("Index out of range");
    if (end < 0)
      throw new RangeError("sourceEnd out of bounds");
    if (end > this.length)
      end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }
    const len2 = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
      this.copyWithin(targetStart, start, end);
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, end),
        targetStart
      );
    }
    return len2;
  };
  Buffer2.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === "string") {
      if (typeof start === "string") {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === "string") {
        encoding = end;
        end = this.length;
      }
      if (encoding !== void 0 && typeof encoding !== "string") {
        throw new TypeError("encoding must be a string");
      }
      if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      if (val.length === 1) {
        const code2 = val.charCodeAt(0);
        if (encoding === "utf8" && code2 < 128 || encoding === "latin1") {
          val = code2;
        }
      }
    } else if (typeof val === "number") {
      val = val & 255;
    } else if (typeof val === "boolean") {
      val = Number(val);
    }
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError("Out of range index");
    }
    if (end <= start) {
      return this;
    }
    start = start >>> 0;
    end = end === void 0 ? this.length : end >>> 0;
    if (!val)
      val = 0;
    let i2;
    if (typeof val === "number") {
      for (i2 = start; i2 < end; ++i2) {
        this[i2] = val;
      }
    } else {
      const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
      const len2 = bytes.length;
      if (len2 === 0) {
        throw new TypeError('The value "' + val + '" is invalid for argument "value"');
      }
      for (i2 = 0; i2 < end - start; ++i2) {
        this[i2 + start] = bytes[i2 % len2];
      }
    }
    return this;
  };
  const errors = {};
  function E(sym, getMessage, Base) {
    errors[sym] = class NodeError extends Base {
      constructor() {
        super();
        Object.defineProperty(this, "message", {
          value: getMessage.apply(this, arguments),
          writable: true,
          configurable: true
        });
        this.name = `${this.name} [${sym}]`;
        this.stack;
        delete this.name;
      }
      get code() {
        return sym;
      }
      set code(value) {
        Object.defineProperty(this, "code", {
          configurable: true,
          enumerable: true,
          value,
          writable: true
        });
      }
      toString() {
        return `${this.name} [${sym}]: ${this.message}`;
      }
    };
  }
  E(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(name) {
      if (name) {
        return `${name} is outside of buffer bounds`;
      }
      return "Attempt to access memory outside buffer bounds";
    },
    RangeError
  );
  E(
    "ERR_INVALID_ARG_TYPE",
    function(name, actual) {
      return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
    },
    TypeError
  );
  E(
    "ERR_OUT_OF_RANGE",
    function(str, range, input) {
      let msg = `The value of "${str}" is out of range.`;
      let received = input;
      if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
        received = addNumericalSeparator(String(input));
      } else if (typeof input === "bigint") {
        received = String(input);
        if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
          received = addNumericalSeparator(received);
        }
        received += "n";
      }
      msg += ` It must be ${range}. Received ${received}`;
      return msg;
    },
    RangeError
  );
  function addNumericalSeparator(val) {
    let res = "";
    let i2 = val.length;
    const start = val[0] === "-" ? 1 : 0;
    for (; i2 >= start + 4; i2 -= 3) {
      res = `_${val.slice(i2 - 3, i2)}${res}`;
    }
    return `${val.slice(0, i2)}${res}`;
  }
  function checkBounds(buf, offset, byteLength3) {
    validateNumber(offset, "offset");
    if (buf[offset] === void 0 || buf[offset + byteLength3] === void 0) {
      boundsError(offset, buf.length - (byteLength3 + 1));
    }
  }
  function checkIntBI(value, min, max, buf, offset, byteLength3) {
    if (value > max || value < min) {
      const n2 = typeof min === "bigint" ? "n" : "";
      let range;
      if (byteLength3 > 3) {
        if (min === 0 || min === BigInt(0)) {
          range = `>= 0${n2} and < 2${n2} ** ${(byteLength3 + 1) * 8}${n2}`;
        } else {
          range = `>= -(2${n2} ** ${(byteLength3 + 1) * 8 - 1}${n2}) and < 2 ** ${(byteLength3 + 1) * 8 - 1}${n2}`;
        }
      } else {
        range = `>= ${min}${n2} and <= ${max}${n2}`;
      }
      throw new errors.ERR_OUT_OF_RANGE("value", range, value);
    }
    checkBounds(buf, offset, byteLength3);
  }
  function validateNumber(value, name) {
    if (typeof value !== "number") {
      throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
    }
  }
  function boundsError(value, length, type) {
    if (Math.floor(value) !== value) {
      validateNumber(value, type);
      throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
    }
    if (length < 0) {
      throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
    }
    throw new errors.ERR_OUT_OF_RANGE(
      type || "offset",
      `>= ${type ? 1 : 0} and <= ${length}`,
      value
    );
  }
  const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = str.split("=")[0];
    str = str.trim().replace(INVALID_BASE64_RE, "");
    if (str.length < 2)
      return "";
    while (str.length % 4 !== 0) {
      str = str + "=";
    }
    return str;
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for (let i2 = 0; i2 < length; ++i2) {
      codePoint = string.charCodeAt(i2);
      if (codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          } else if (i2 + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0)
          break;
        bytes.push(
          codePoint >> 6 | 192,
          codePoint & 63 | 128
        );
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0)
          break;
        bytes.push(
          codePoint >> 12 | 224,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0)
          break;
        bytes.push(
          codePoint >> 18 | 240,
          codePoint >> 12 & 63 | 128,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else {
        throw new Error("Invalid code point");
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    const byteArray = [];
    for (let i2 = 0; i2 < str.length; ++i2) {
      byteArray.push(str.charCodeAt(i2) & 255);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    let c, hi, lo;
    const byteArray = [];
    for (let i2 = 0; i2 < str.length; ++i2) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i2);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    let i2;
    for (i2 = 0; i2 < length; ++i2) {
      if (i2 + offset >= dst.length || i2 >= src.length)
        break;
      dst[i2 + offset] = src[i2];
    }
    return i2;
  }
  function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
  }
  function numberIsNaN(obj) {
    return obj !== obj;
  }
  const hexSliceLookupTable = function() {
    const alphabet = "0123456789abcdef";
    const table = new Array(256);
    for (let i2 = 0; i2 < 16; ++i2) {
      const i16 = i2 * 16;
      for (let j = 0; j < 16; ++j) {
        table[i16 + j] = alphabet[i2] + alphabet[j];
      }
    }
    return table;
  }();
  function defineBigIntMethod(fn) {
    return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
  }
  function BufferBigIntNotDefined() {
    throw new Error("BigInt not supported");
  }
})(buffer);
class LocalStorage {
  get(key) {
    return new Promise((res) => {
      const record = window.localStorage.getItem(key);
      if (!record) {
        res(null);
      } else {
        res(JSON.parse(record));
      }
    });
  }
  async remove(key) {
    window.localStorage.removeItem(key);
    return new Promise((res) => {
      res(null);
    });
  }
  set(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
    return new Promise((res) => {
      res(null);
    });
  }
}
const PKCE_KEY = "pkce";
const GRANT_KEY = "grant";
const USER_KEY = "user";
class Storage {
  constructor(store) {
    this.Storage = new LocalStorage();
    if (store) {
      this.Storage = store;
      return;
    }
  }
  setPKCE(value) {
    const encrypt = buffer.Buffer.from(value);
    this.Storage.set(PKCE_KEY, encrypt.toString("base64"));
  }
  async getPKCE() {
    try {
      const pkce = await this.Storage.get(PKCE_KEY);
      if (pkce) {
        const b = buffer.Buffer.from(pkce, "base64");
        return b.toString("utf8");
      }
    } catch (error) {
      return null;
    }
    return null;
  }
  removePKCE() {
    this.Storage.remove(PKCE_KEY);
  }
  setGrant(resp, multiAccount = false) {
    const { grant_id } = resp;
    this.Storage.set(`${GRANT_KEY}${multiAccount ? "-" + grant_id : ""}`, resp);
  }
  removeGrant(id, multiAccount = false) {
    this.Storage.remove(`${GRANT_KEY}${multiAccount ? "-" + id : ""}`);
  }
  async getGrant(id, multiAccount = false) {
    const grant = await this.Storage.get(
      `${GRANT_KEY}${multiAccount ? "-" + id : ""}`
    );
    if (grant) {
      return grant;
    }
    return null;
  }
  // setUserToken is used to store the IDToken in storage
  async setUserToken(token) {
    const userTokens = await this.getUserTokens();
    if (userTokens) {
      const userToken = userTokens.find((t2) => t2.sub === token.sub);
      if (!userToken) {
        const newTokens = [...userTokens, token];
        this.Storage.set(USER_KEY, newTokens);
      } else {
        const newUserTokens = userTokens.map((t2) => {
          if (t2.sub === token.sub) {
            t2 = token;
          }
          return t2;
        });
        this.Storage.set(USER_KEY, newUserTokens);
      }
    } else {
      this.Storage.set(USER_KEY, [token]);
    }
  }
  // getUserToken is used to retrieve a specific IDToken from storage
  async getUserToken(id = "") {
    const tokens = await this.Storage.get(USER_KEY);
    if (tokens) {
      if (id === "") {
        return tokens[0];
      }
      const userToken = tokens.find(
        (token) => token.sub === id
      );
      return userToken;
    }
    return null;
  }
  // getUserTokens is used to retrieve all IDTokens from storage
  async getUserTokens() {
    const tokens = await this.Storage.get(USER_KEY);
    if (tokens) {
      return tokens;
    }
    return null;
  }
  // removeUserTokens is used to remove all IDTokens from storage
  removeUserTokens() {
    this.Storage.remove(USER_KEY);
  }
  // removeUserToken is used to remove a specific IDToken from storage
  async removeUserToken(id) {
    const userTokens = await this.getUserTokens();
    const tokens = userTokens == null ? void 0 : userTokens.filter((token) => token.sub !== id);
    this.Storage.set(USER_KEY, tokens);
  }
  async clearSession() {
    const tokens = await this.getUserTokens();
    tokens == null ? void 0 : tokens.forEach((token) => {
      this.removeGrant(token.sub);
    });
    this.removePKCE();
    this.removeUserTokens();
  }
}
class IndexedDBStorage {
  constructor() {
    this.databaseName = "identity-db";
    this.storeName = "identity";
  }
  get(key) {
    const self2 = this;
    return new Promise((resolve, reject) => {
      self2.openDatabase().then(function(db) {
        const transaction = db.transaction(self2.storeName, "readwrite");
        const objectStore = transaction.objectStore(self2.storeName);
        const getRequest = objectStore.get(key);
        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };
        getRequest.onerror = () => {
          reject(getRequest.error);
        };
        transaction.oncomplete = () => {
          db.close();
        };
      });
    });
  }
  async remove(key) {
    const self2 = this;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName);
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore(self2.storeName);
      };
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(this.storeName, "readwrite");
        const objectStore = transaction.objectStore(this.storeName);
        const deleteRequest = objectStore.delete(key);
        deleteRequest.onsuccess = () => {
          resolve(null);
        };
        deleteRequest.onerror = () => {
          reject(deleteRequest.error);
        };
        transaction.oncomplete = () => {
          db.close();
        };
      };
    });
  }
  set(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName);
      request.onerror = () => {
        reject(request.error);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(this.storeName);
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(this.storeName, "readwrite");
        const objectStore = transaction.objectStore(this.storeName);
        const setRequest = objectStore.put(value, key);
        setRequest.onsuccess = () => {
          resolve(value);
        };
        setRequest.onerror = () => {
          reject(setRequest.error);
        };
        transaction.oncomplete = () => {
          db.close();
        };
      };
    });
  }
  openDatabase() {
    const self2 = this;
    return new Promise(function(resolve, reject) {
      const request = indexedDB.open(self2.databaseName, 2);
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore(self2.storeName);
      };
      request.onsuccess = function(event) {
        resolve(event.target.result);
      };
      request.onerror = function(event) {
        reject(event.error);
      };
    });
  }
}
var sha256 = { exports: {} };
/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
(function(module) {
  (function() {
    var ERROR = "input is invalid type";
    var WINDOW = typeof window === "object";
    var root = WINDOW ? window : {};
    if (root.JS_SHA256_NO_WINDOW) {
      WINDOW = false;
    }
    var WEB_WORKER = !WINDOW && typeof self === "object";
    var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
    if (NODE_JS) {
      root = commonjsGlobal;
    } else if (WEB_WORKER) {
      root = self;
    }
    var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && true && module.exports;
    var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
    var HEX_CHARS = "0123456789abcdef".split("");
    var EXTRA = [-2147483648, 8388608, 32768, 128];
    var SHIFT = [24, 16, 8, 0];
    var K = [
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ];
    var OUTPUT_TYPES = ["hex", "array", "digest", "arrayBuffer"];
    var blocks = [];
    if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
      Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      };
    }
    if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
      ArrayBuffer.isView = function(obj) {
        return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
      };
    }
    var createOutputMethod = function(outputType, is2242) {
      return function(message) {
        return new Sha256(is2242, true).update(message)[outputType]();
      };
    };
    var createMethod = function(is2242) {
      var method2 = createOutputMethod("hex", is2242);
      if (NODE_JS) {
        method2 = nodeWrap(method2, is2242);
      }
      method2.create = function() {
        return new Sha256(is2242);
      };
      method2.update = function(message) {
        return method2.create().update(message);
      };
      for (var i2 = 0; i2 < OUTPUT_TYPES.length; ++i2) {
        var type = OUTPUT_TYPES[i2];
        method2[type] = createOutputMethod(type, is2242);
      }
      return method2;
    };
    var nodeWrap = function(method, is224) {
      var crypto = eval("require('crypto')");
      var Buffer = eval("require('buffer').Buffer");
      var algorithm = is224 ? "sha224" : "sha256";
      var nodeMethod = function(message) {
        if (typeof message === "string") {
          return crypto.createHash(algorithm).update(message, "utf8").digest("hex");
        } else {
          if (message === null || message === void 0) {
            throw new Error(ERROR);
          } else if (message.constructor === ArrayBuffer) {
            message = new Uint8Array(message);
          }
        }
        if (Array.isArray(message) || ArrayBuffer.isView(message) || message.constructor === Buffer) {
          return crypto.createHash(algorithm).update(new Buffer(message)).digest("hex");
        } else {
          return method(message);
        }
      };
      return nodeMethod;
    };
    var createHmacOutputMethod = function(outputType, is2242) {
      return function(key, message) {
        return new HmacSha256(key, is2242, true).update(message)[outputType]();
      };
    };
    var createHmacMethod = function(is2242) {
      var method2 = createHmacOutputMethod("hex", is2242);
      method2.create = function(key) {
        return new HmacSha256(key, is2242);
      };
      method2.update = function(key, message) {
        return method2.create(key).update(message);
      };
      for (var i2 = 0; i2 < OUTPUT_TYPES.length; ++i2) {
        var type = OUTPUT_TYPES[i2];
        method2[type] = createHmacOutputMethod(type, is2242);
      }
      return method2;
    };
    function Sha256(is2242, sharedMemory) {
      if (sharedMemory) {
        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        this.blocks = blocks;
      } else {
        this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
      if (is2242) {
        this.h0 = 3238371032;
        this.h1 = 914150663;
        this.h2 = 812702999;
        this.h3 = 4144912697;
        this.h4 = 4290775857;
        this.h5 = 1750603025;
        this.h6 = 1694076839;
        this.h7 = 3204075428;
      } else {
        this.h0 = 1779033703;
        this.h1 = 3144134277;
        this.h2 = 1013904242;
        this.h3 = 2773480762;
        this.h4 = 1359893119;
        this.h5 = 2600822924;
        this.h6 = 528734635;
        this.h7 = 1541459225;
      }
      this.block = this.start = this.bytes = this.hBytes = 0;
      this.finalized = this.hashed = false;
      this.first = true;
      this.is224 = is2242;
    }
    Sha256.prototype.update = function(message) {
      if (this.finalized) {
        return;
      }
      var notString, type = typeof message;
      if (type !== "string") {
        if (type === "object") {
          if (message === null) {
            throw new Error(ERROR);
          } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
            message = new Uint8Array(message);
          } else if (!Array.isArray(message)) {
            if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
              throw new Error(ERROR);
            }
          }
        } else {
          throw new Error(ERROR);
        }
        notString = true;
      }
      var code2, index = 0, i2, length = message.length, blocks2 = this.blocks;
      while (index < length) {
        if (this.hashed) {
          this.hashed = false;
          blocks2[0] = this.block;
          blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
        }
        if (notString) {
          for (i2 = this.start; index < length && i2 < 64; ++index) {
            blocks2[i2 >> 2] |= message[index] << SHIFT[i2++ & 3];
          }
        } else {
          for (i2 = this.start; index < length && i2 < 64; ++index) {
            code2 = message.charCodeAt(index);
            if (code2 < 128) {
              blocks2[i2 >> 2] |= code2 << SHIFT[i2++ & 3];
            } else if (code2 < 2048) {
              blocks2[i2 >> 2] |= (192 | code2 >> 6) << SHIFT[i2++ & 3];
              blocks2[i2 >> 2] |= (128 | code2 & 63) << SHIFT[i2++ & 3];
            } else if (code2 < 55296 || code2 >= 57344) {
              blocks2[i2 >> 2] |= (224 | code2 >> 12) << SHIFT[i2++ & 3];
              blocks2[i2 >> 2] |= (128 | code2 >> 6 & 63) << SHIFT[i2++ & 3];
              blocks2[i2 >> 2] |= (128 | code2 & 63) << SHIFT[i2++ & 3];
            } else {
              code2 = 65536 + ((code2 & 1023) << 10 | message.charCodeAt(++index) & 1023);
              blocks2[i2 >> 2] |= (240 | code2 >> 18) << SHIFT[i2++ & 3];
              blocks2[i2 >> 2] |= (128 | code2 >> 12 & 63) << SHIFT[i2++ & 3];
              blocks2[i2 >> 2] |= (128 | code2 >> 6 & 63) << SHIFT[i2++ & 3];
              blocks2[i2 >> 2] |= (128 | code2 & 63) << SHIFT[i2++ & 3];
            }
          }
        }
        this.lastByteIndex = i2;
        this.bytes += i2 - this.start;
        if (i2 >= 64) {
          this.block = blocks2[16];
          this.start = i2 - 64;
          this.hash();
          this.hashed = true;
        } else {
          this.start = i2;
        }
      }
      if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
      }
      return this;
    };
    Sha256.prototype.finalize = function() {
      if (this.finalized) {
        return;
      }
      this.finalized = true;
      var blocks2 = this.blocks, i2 = this.lastByteIndex;
      blocks2[16] = this.block;
      blocks2[i2 >> 2] |= EXTRA[i2 & 3];
      this.block = blocks2[16];
      if (i2 >= 56) {
        if (!this.hashed) {
          this.hash();
        }
        blocks2[0] = this.block;
        blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
      }
      blocks2[14] = this.hBytes << 3 | this.bytes >>> 29;
      blocks2[15] = this.bytes << 3;
      this.hash();
    };
    Sha256.prototype.hash = function() {
      var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e2 = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks2 = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;
      for (j = 16; j < 64; ++j) {
        t1 = blocks2[j - 15];
        s0 = (t1 >>> 7 | t1 << 25) ^ (t1 >>> 18 | t1 << 14) ^ t1 >>> 3;
        t1 = blocks2[j - 2];
        s1 = (t1 >>> 17 | t1 << 15) ^ (t1 >>> 19 | t1 << 13) ^ t1 >>> 10;
        blocks2[j] = blocks2[j - 16] + s0 + blocks2[j - 7] + s1 << 0;
      }
      bc = b & c;
      for (j = 0; j < 64; j += 4) {
        if (this.first) {
          if (this.is224) {
            ab = 300032;
            t1 = blocks2[0] - 1413257819;
            h = t1 - 150054599 << 0;
            d = t1 + 24177077 << 0;
          } else {
            ab = 704751109;
            t1 = blocks2[0] - 210244248;
            h = t1 - 1521486534 << 0;
            d = t1 + 143694565 << 0;
          }
          this.first = false;
        } else {
          s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
          s1 = (e2 >>> 6 | e2 << 26) ^ (e2 >>> 11 | e2 << 21) ^ (e2 >>> 25 | e2 << 7);
          ab = a & b;
          maj = ab ^ a & c ^ bc;
          ch = e2 & f ^ ~e2 & g;
          t1 = h + s1 + ch + K[j] + blocks2[j];
          t2 = s0 + maj;
          h = d + t1 << 0;
          d = t1 + t2 << 0;
        }
        s0 = (d >>> 2 | d << 30) ^ (d >>> 13 | d << 19) ^ (d >>> 22 | d << 10);
        s1 = (h >>> 6 | h << 26) ^ (h >>> 11 | h << 21) ^ (h >>> 25 | h << 7);
        da = d & a;
        maj = da ^ d & b ^ ab;
        ch = h & e2 ^ ~h & f;
        t1 = g + s1 + ch + K[j + 1] + blocks2[j + 1];
        t2 = s0 + maj;
        g = c + t1 << 0;
        c = t1 + t2 << 0;
        s0 = (c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10);
        s1 = (g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7);
        cd = c & d;
        maj = cd ^ c & a ^ da;
        ch = g & h ^ ~g & e2;
        t1 = f + s1 + ch + K[j + 2] + blocks2[j + 2];
        t2 = s0 + maj;
        f = b + t1 << 0;
        b = t1 + t2 << 0;
        s0 = (b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10);
        s1 = (f >>> 6 | f << 26) ^ (f >>> 11 | f << 21) ^ (f >>> 25 | f << 7);
        bc = b & c;
        maj = bc ^ b & d ^ cd;
        ch = f & g ^ ~f & h;
        t1 = e2 + s1 + ch + K[j + 3] + blocks2[j + 3];
        t2 = s0 + maj;
        e2 = a + t1 << 0;
        a = t1 + t2 << 0;
      }
      this.h0 = this.h0 + a << 0;
      this.h1 = this.h1 + b << 0;
      this.h2 = this.h2 + c << 0;
      this.h3 = this.h3 + d << 0;
      this.h4 = this.h4 + e2 << 0;
      this.h5 = this.h5 + f << 0;
      this.h6 = this.h6 + g << 0;
      this.h7 = this.h7 + h << 0;
    };
    Sha256.prototype.hex = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
      var hex = HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15] + HEX_CHARS[h5 >> 28 & 15] + HEX_CHARS[h5 >> 24 & 15] + HEX_CHARS[h5 >> 20 & 15] + HEX_CHARS[h5 >> 16 & 15] + HEX_CHARS[h5 >> 12 & 15] + HEX_CHARS[h5 >> 8 & 15] + HEX_CHARS[h5 >> 4 & 15] + HEX_CHARS[h5 & 15] + HEX_CHARS[h6 >> 28 & 15] + HEX_CHARS[h6 >> 24 & 15] + HEX_CHARS[h6 >> 20 & 15] + HEX_CHARS[h6 >> 16 & 15] + HEX_CHARS[h6 >> 12 & 15] + HEX_CHARS[h6 >> 8 & 15] + HEX_CHARS[h6 >> 4 & 15] + HEX_CHARS[h6 & 15];
      if (!this.is224) {
        hex += HEX_CHARS[h7 >> 28 & 15] + HEX_CHARS[h7 >> 24 & 15] + HEX_CHARS[h7 >> 20 & 15] + HEX_CHARS[h7 >> 16 & 15] + HEX_CHARS[h7 >> 12 & 15] + HEX_CHARS[h7 >> 8 & 15] + HEX_CHARS[h7 >> 4 & 15] + HEX_CHARS[h7 & 15];
      }
      return hex;
    };
    Sha256.prototype.toString = Sha256.prototype.hex;
    Sha256.prototype.digest = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
      var arr = [
        h0 >> 24 & 255,
        h0 >> 16 & 255,
        h0 >> 8 & 255,
        h0 & 255,
        h1 >> 24 & 255,
        h1 >> 16 & 255,
        h1 >> 8 & 255,
        h1 & 255,
        h2 >> 24 & 255,
        h2 >> 16 & 255,
        h2 >> 8 & 255,
        h2 & 255,
        h3 >> 24 & 255,
        h3 >> 16 & 255,
        h3 >> 8 & 255,
        h3 & 255,
        h4 >> 24 & 255,
        h4 >> 16 & 255,
        h4 >> 8 & 255,
        h4 & 255,
        h5 >> 24 & 255,
        h5 >> 16 & 255,
        h5 >> 8 & 255,
        h5 & 255,
        h6 >> 24 & 255,
        h6 >> 16 & 255,
        h6 >> 8 & 255,
        h6 & 255
      ];
      if (!this.is224) {
        arr.push(h7 >> 24 & 255, h7 >> 16 & 255, h7 >> 8 & 255, h7 & 255);
      }
      return arr;
    };
    Sha256.prototype.array = Sha256.prototype.digest;
    Sha256.prototype.arrayBuffer = function() {
      this.finalize();
      var buffer2 = new ArrayBuffer(this.is224 ? 28 : 32);
      var dataView = new DataView(buffer2);
      dataView.setUint32(0, this.h0);
      dataView.setUint32(4, this.h1);
      dataView.setUint32(8, this.h2);
      dataView.setUint32(12, this.h3);
      dataView.setUint32(16, this.h4);
      dataView.setUint32(20, this.h5);
      dataView.setUint32(24, this.h6);
      if (!this.is224) {
        dataView.setUint32(28, this.h7);
      }
      return buffer2;
    };
    function HmacSha256(key, is2242, sharedMemory) {
      var i2, type = typeof key;
      if (type === "string") {
        var bytes = [], length = key.length, index = 0, code2;
        for (i2 = 0; i2 < length; ++i2) {
          code2 = key.charCodeAt(i2);
          if (code2 < 128) {
            bytes[index++] = code2;
          } else if (code2 < 2048) {
            bytes[index++] = 192 | code2 >> 6;
            bytes[index++] = 128 | code2 & 63;
          } else if (code2 < 55296 || code2 >= 57344) {
            bytes[index++] = 224 | code2 >> 12;
            bytes[index++] = 128 | code2 >> 6 & 63;
            bytes[index++] = 128 | code2 & 63;
          } else {
            code2 = 65536 + ((code2 & 1023) << 10 | key.charCodeAt(++i2) & 1023);
            bytes[index++] = 240 | code2 >> 18;
            bytes[index++] = 128 | code2 >> 12 & 63;
            bytes[index++] = 128 | code2 >> 6 & 63;
            bytes[index++] = 128 | code2 & 63;
          }
        }
        key = bytes;
      } else {
        if (type === "object") {
          if (key === null) {
            throw new Error(ERROR);
          } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
            key = new Uint8Array(key);
          } else if (!Array.isArray(key)) {
            if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
              throw new Error(ERROR);
            }
          }
        } else {
          throw new Error(ERROR);
        }
      }
      if (key.length > 64) {
        key = new Sha256(is2242, true).update(key).array();
      }
      var oKeyPad = [], iKeyPad = [];
      for (i2 = 0; i2 < 64; ++i2) {
        var b = key[i2] || 0;
        oKeyPad[i2] = 92 ^ b;
        iKeyPad[i2] = 54 ^ b;
      }
      Sha256.call(this, is2242, sharedMemory);
      this.update(iKeyPad);
      this.oKeyPad = oKeyPad;
      this.inner = true;
      this.sharedMemory = sharedMemory;
    }
    HmacSha256.prototype = new Sha256();
    HmacSha256.prototype.finalize = function() {
      Sha256.prototype.finalize.call(this);
      if (this.inner) {
        this.inner = false;
        var innerHash = this.array();
        Sha256.call(this, this.is224, this.sharedMemory);
        this.update(this.oKeyPad);
        this.update(innerHash);
        Sha256.prototype.finalize.call(this);
      }
    };
    var exports = createMethod();
    exports.sha256 = exports;
    exports.sha224 = createMethod(true);
    exports.sha256.hmac = createHmacMethod();
    exports.sha224.hmac = createHmacMethod(true);
    if (COMMON_JS) {
      module.exports = exports;
    } else {
      root.sha256 = exports.sha256;
      root.sha224 = exports.sha224;
    }
  })();
})(sha256);
var sha256Exports = sha256.exports;
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function validate(uuid) {
  return typeof uuid === "string" && REGEX.test(uuid);
}
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (var i2 = 0; i2 < 16; ++i2) {
      buf[offset + i2] = rnds[i2];
    }
    return buf;
  }
  return stringify(rnds);
}
async function getBytes(stream, onChunk) {
  const reader = stream.getReader();
  let result;
  while (!(result = await reader.read()).done) {
    onChunk(result.value);
  }
}
function getLines(onLine) {
  let buffer2;
  let position;
  let fieldLength;
  let discardTrailingNewline = false;
  return function onChunk(arr) {
    if (buffer2 === void 0) {
      buffer2 = arr;
      position = 0;
      fieldLength = -1;
    } else {
      buffer2 = concat(buffer2, arr);
    }
    const bufLength = buffer2.length;
    let lineStart = 0;
    while (position < bufLength) {
      if (discardTrailingNewline) {
        if (buffer2[position] === 10) {
          lineStart = ++position;
        }
        discardTrailingNewline = false;
      }
      let lineEnd = -1;
      for (; position < bufLength && lineEnd === -1; ++position) {
        switch (buffer2[position]) {
          case 58:
            if (fieldLength === -1) {
              fieldLength = position - lineStart;
            }
            break;
          case 13:
            discardTrailingNewline = true;
          case 10:
            lineEnd = position;
            break;
        }
      }
      if (lineEnd === -1) {
        break;
      }
      onLine(buffer2.subarray(lineStart, lineEnd), fieldLength);
      lineStart = position;
      fieldLength = -1;
    }
    if (lineStart === bufLength) {
      buffer2 = void 0;
    } else if (lineStart !== 0) {
      buffer2 = buffer2.subarray(lineStart);
      position -= lineStart;
    }
  };
}
function getMessages(onId, onRetry, onMessage) {
  let message = newMessage();
  const decoder = new TextDecoder();
  return function onLine(line, fieldLength) {
    if (line.length === 0) {
      onMessage === null || onMessage === void 0 ? void 0 : onMessage(message);
      message = newMessage();
    } else if (fieldLength > 0) {
      const field = decoder.decode(line.subarray(0, fieldLength));
      const valueOffset = fieldLength + (line[fieldLength + 1] === 32 ? 2 : 1);
      const value = decoder.decode(line.subarray(valueOffset));
      switch (field) {
        case "data":
          message.data = message.data ? message.data + "\n" + value : value;
          break;
        case "event":
          message.event = value;
          break;
        case "id":
          onId(message.id = value);
          break;
        case "retry":
          const retry = parseInt(value, 10);
          if (!isNaN(retry)) {
            onRetry(message.retry = retry);
          }
          break;
      }
    }
  };
}
function concat(a, b) {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
}
function newMessage() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
var __rest = globalThis && globalThis.__rest || function(s, e2) {
  var t2 = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0)
      t2[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p = Object.getOwnPropertySymbols(s); i2 < p.length; i2++) {
      if (e2.indexOf(p[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i2]))
        t2[p[i2]] = s[p[i2]];
    }
  return t2;
};
const EventStreamContentType = "text/event-stream";
const DefaultRetryInterval = 1e3;
const LastEventId = "last-event-id";
function fetchEventSource(input, _a) {
  var { signal: inputSignal, headers: inputHeaders, onopen: inputOnOpen, onmessage, onclose, onerror, openWhenHidden, fetch: inputFetch } = _a, rest = __rest(_a, ["signal", "headers", "onopen", "onmessage", "onclose", "onerror", "openWhenHidden", "fetch"]);
  return new Promise((resolve, reject) => {
    const headers = Object.assign({}, inputHeaders);
    if (!headers.accept) {
      headers.accept = EventStreamContentType;
    }
    let curRequestController;
    function onVisibilityChange() {
      curRequestController.abort();
      if (!document.hidden) {
        create();
      }
    }
    if (!openWhenHidden) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    let retryInterval = DefaultRetryInterval;
    let retryTimer = 0;
    function dispose() {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearTimeout(retryTimer);
      curRequestController.abort();
    }
    inputSignal === null || inputSignal === void 0 ? void 0 : inputSignal.addEventListener("abort", () => {
      dispose();
      resolve();
    });
    const fetch2 = inputFetch !== null && inputFetch !== void 0 ? inputFetch : window.fetch;
    const onopen = inputOnOpen !== null && inputOnOpen !== void 0 ? inputOnOpen : defaultOnOpen;
    async function create() {
      var _a2;
      curRequestController = new AbortController();
      try {
        const response = await fetch2(input, Object.assign(Object.assign({}, rest), { headers, signal: curRequestController.signal }));
        await onopen(response);
        await getBytes(response.body, getLines(getMessages((id) => {
          if (id) {
            headers[LastEventId] = id;
          } else {
            delete headers[LastEventId];
          }
        }, (retry) => {
          retryInterval = retry;
        }, onmessage)));
        onclose === null || onclose === void 0 ? void 0 : onclose();
        dispose();
        resolve();
      } catch (err) {
        if (!curRequestController.signal.aborted) {
          try {
            const interval = (_a2 = onerror === null || onerror === void 0 ? void 0 : onerror(err)) !== null && _a2 !== void 0 ? _a2 : retryInterval;
            window.clearTimeout(retryTimer);
            retryTimer = window.setTimeout(create, interval);
          } catch (innerErr) {
            dispose();
            reject(innerErr);
          }
        }
      }
    }
    create();
  });
}
function defaultOnOpen(response) {
  const contentType = response.headers.get("content-type");
  if (!(contentType === null || contentType === void 0 ? void 0 : contentType.startsWith(EventStreamContentType))) {
    throw new Error(`Expected content-type to be ${EventStreamContentType}, Actual: ${contentType}`);
  }
}
function Base64EncodeUrl(str) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function getTimestamp() {
  return Math.floor(Date.now() / 1e3);
}
function e(e2) {
  this.message = e2;
}
e.prototype = new Error(), e.prototype.name = "InvalidCharacterError";
var r = "undefined" != typeof window && window.atob && window.atob.bind(window) || function(r2) {
  var t2 = String(r2).replace(/=+$/, "");
  if (t2.length % 4 == 1)
    throw new e("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var n2, o2, a = 0, i2 = 0, c = ""; o2 = t2.charAt(i2++); ~o2 && (n2 = a % 4 ? 64 * n2 + o2 : o2, a++ % 4) ? c += String.fromCharCode(255 & n2 >> (-2 * a & 6)) : 0)
    o2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o2);
  return c;
};
function t(e2) {
  var t2 = e2.replace(/-/g, "+").replace(/_/g, "/");
  switch (t2.length % 4) {
    case 0:
      break;
    case 2:
      t2 += "==";
      break;
    case 3:
      t2 += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return function(e3) {
      return decodeURIComponent(r(e3).replace(/(.)/g, function(e4, r2) {
        var t3 = r2.charCodeAt(0).toString(16).toUpperCase();
        return t3.length < 2 && (t3 = "0" + t3), "%" + t3;
      }));
    }(t2);
  } catch (e3) {
    return r(t2);
  }
}
function n(e2) {
  this.message = e2;
}
function o(e2, r2) {
  if ("string" != typeof e2)
    throw new n("Invalid token specified");
  var o2 = true === (r2 = r2 || {}).header ? 0 : 1;
  try {
    return JSON.parse(t(e2.split(".")[o2]));
  } catch (e3) {
    throw new n("Invalid token specified: " + e3.message);
  }
}
n.prototype = new Error(), n.prototype.name = "InvalidTokenError";
class NylasSessions {
  constructor(config) {
    this.accessType = "online";
    this.domain = "http://api.nylas.com";
    this.versioned = false;
    this.hosted = false;
    this.multiAccount = false;
    this.loginId = "";
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    if (config.domain) {
      this.domain = config.domain;
      const versionedPart = this.domain.substring(this.domain.length - 3);
      if (versionedPart.includes("/v")) {
        this.versioned = true;
      }
    }
    if (config.multiAccount) {
      this.multiAccount = config.multiAccount;
    }
    if (config.sw) {
      const storage = new IndexedDBStorage();
      this.Storage = new Storage(storage);
    } else {
      this.Storage = new Storage();
    }
    if (config.accessType) {
      this.accessType = config.accessType;
    }
    if (config.loginId) {
      this.loginId = config.loginId;
    }
    if (config.hosted) {
      this.hosted = config.hosted;
    }
    this.codeExchange(null);
  }
  // Validates access token
  async validateAccessToken(grant_id = "") {
    const grant = await this.Storage.getGrant(grant_id, this.multiAccount);
    if (!grant) {
      return false;
    }
    const { access_token } = grant;
    try {
      const response = await fetch(
        `${this.domain}/connect/tokeninfo?access_token=${access_token}`,
        {
          method: "GET"
        }
      );
      const responseData = await response.json();
      if (!responseData.data) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  // Validates id token
  async validateIDToken(grant_id = "") {
    const grant = await this.Storage.getGrant(grant_id, this.multiAccount);
    if (!grant) {
      return false;
    }
    const { id_token } = grant;
    try {
      const response = await fetch(
        `${this.domain}/connect/tokeninfo?id_token=${id_token}`,
        {
          method: "GET"
        }
      );
      if (response.status !== 200) {
        return false;
      }
      const responseData = await response.json();
      if (!responseData.data) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  // Gets domain of UAS
  getDomain() {
    return this.domain;
  }
  // Gets auth link
  async auth(config) {
    if (this.hosted && (this.domain === window.location.origin || this.versioned && this.domain.includes(window.location.origin))) {
      await this.hostedSetCodeChallenge();
    }
    const url = await this.generateAuthURL(config);
    if (config.popup) {
      this.popUp(url);
      return;
    }
    return url;
  }
  // Generates auth URL
  async generateAuthURL(config) {
    const codeChallenge = await this.getCodeChallege();
    let url = `${this.domain}/connect/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&access_type=${this.accessType}&response_type=code`;
    if (codeChallenge) {
      url += `&code_challenge=${codeChallenge}&code_challenge_method=S256&options=rotate_refresh_token`;
    }
    if (config.provider) {
      url += `&provider=${config.provider}`;
    }
    if (config.loginHint) {
      url += `&login_hint=${config.loginHint}`;
      if (config.includeGrantScopes) {
        url += `&include_grant_scopes=${config.includeGrantScopes}`;
      }
    }
    if (config.scope) {
      url += `&scope=${config.scope.join(" ")}`;
    }
    if (config.prompt) {
      url += `&prompt=${config.prompt}`;
    }
    if (config.metadata) {
      url += `&metadata=${config.metadata}`;
    }
    if (config.state || this.loginId) {
      url += `&state=${this.loginId ? this.loginId : config.state}`;
    }
    return url;
  }
  // Generates auth URL
  async generateReauthURL(grant_id, scopes) {
    if (!grant_id) {
      throw new Error("Grant ID is required");
    }
    const userToken = await this.Storage.getUserToken(grant_id);
    const codeChallenge = await this.getCodeChallege();
    let url = `${this.domain}/connect/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&access_type=${this.accessType}&response_type=code`;
    if (codeChallenge) {
      url += `&code_challenge=${codeChallenge}&code_challenge_method=S256&options=rotate_refresh_token`;
    }
    if (userToken == null ? void 0 : userToken.provider) {
      url += `&provider=${userToken.provider}`;
    }
    if (userToken == null ? void 0 : userToken.email) {
      url += `&login_hint=${userToken.email}`;
    }
    if (scopes) {
      url += `&scope=${scopes.join(" ")}`;
    }
    return url;
  }
  // Generates UUID code challenge
  async generateCodeChallenge() {
    const code_verifier = await this.Storage.getPKCE();
    if (code_verifier) {
      return;
    }
    const codeChallenge = v4();
    this.Storage.setPKCE(codeChallenge);
    return;
  }
  // Gets code challenge from URL query params
  async hostedSetCodeChallenge() {
    if (!this.hosted) {
      throw console.error("Method only used with hosted flag enabled");
    }
    const params = new URLSearchParams(window.location.search);
    const codeChallenge = params.get("code_challenge");
    if (!codeChallenge) {
      const code_verifier = await this.Storage.getPKCE();
      if (code_verifier) {
        return;
      }
      console.warn("Code challenge is recomended");
      return;
    }
    this.Storage.setPKCE(codeChallenge);
  }
  // Gets code challenge from store
  async getCodeChallege() {
    if (this.hosted && (this.domain === window.location.origin || this.versioned && this.domain.includes(window.location.origin))) {
      const params = new URLSearchParams(window.location.search);
      const codeChallenge = params.get("code_challenge");
      if (!codeChallenge) {
        console.warn("Code challenge is recomended");
        return "";
      }
      return codeChallenge;
    }
    const code_verifier = await this.Storage.getPKCE();
    if (code_verifier) {
      const codeChallengeHashed = sha256Exports.sha256(code_verifier);
      let codeChallengeEncrypted = buffer.Buffer.from(codeChallengeHashed).toString("base64");
      codeChallengeEncrypted = Base64EncodeUrl(codeChallengeEncrypted);
      return codeChallengeEncrypted;
    }
    return "";
  }
  // checks if user is logged in
  async isLoggedIn() {
    if (this.hosted && (this.domain === window.location.origin || this.versioned && this.domain.includes(window.location.origin))) {
      return false;
    }
    const tokens = await this.Storage.getUserTokens();
    if (tokens && tokens.length > 0) {
      if (this.multiAccount) {
        await this.generateCodeChallenge();
      }
      return true;
    }
    await this.generateCodeChallenge();
    return false;
  }
  // Checks if user is multi account
  isMultiAccount() {
    return this.multiAccount;
  }
  // Logs user out
  async logout() {
    const profile = await this.getProfile();
    await this.Storage.clearSession();
    const payload = { detail: profile };
    window.dispatchEvent(new CustomEvent("onLogoutSuccess", payload));
  }
  // Gets profile info from ID token
  async getProfile(grant_id = "") {
    let tok;
    if (grant_id) {
      tok = await this.Storage.getUserToken(grant_id);
    } else {
      tok = await this.Storage.getUserToken();
    }
    if (tok) {
      return tok;
    }
    return null;
  }
  // Gets profile info from ID tokens
  async getProfiles() {
    const tok = await this.Storage.getUserTokens();
    if (tok) {
      return tok;
    }
    return null;
  }
  // Remove a specific profile
  async removeProfile(id) {
    await this.Storage.removeUserToken(id);
    await this.Storage.removeGrant(id);
    return null;
  }
  // IMAP authentication
  async authIMAP(data) {
    const code_challenge = await this.getCodeChallege();
    const payload = {
      imap_username: data.username,
      imap_password: data.password,
      imap_host: data.hostIMAP,
      imap_port: data.portIMAP,
      type: data.type,
      smtp_host: data.hostSMTP,
      smtp_port: data.portSMTP,
      provider: data.provider,
      redirect_uri: this.redirectUri,
      state: data.state,
      public_application_id: this.clientId,
      access_type: this.accessType
    };
    if (this.loginId) {
      payload.id = this.loginId;
    }
    if (code_challenge != "") {
      payload.code_challenge = code_challenge;
      payload.code_challenge_method = "S256";
    }
    const response = await fetch(`${this.domain}/connect/login/imap`, {
      method: "POST",
      // or 'PUT'
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify(payload)
    });
    const responseData = await response.json();
    return responseData;
  }
  // EWS authentication
  async authEWS(data) {
    const code_challenge = await this.getCodeChallege();
    const payload = {
      ...data,
      redirect_uri: this.redirectUri,
      public_application_id: this.clientId,
      access_type: this.accessType
    };
    if (this.loginId) {
      payload.id = this.loginId;
    }
    if (code_challenge != "") {
      payload.code_challenge = code_challenge;
      payload.code_challenge_method = "S256";
    }
    const response = await fetch(`${this.domain}/connect/login/ews`, {
      method: "POST",
      // or 'PUT'
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify(payload)
    });
    const responseData = await response.json();
    return responseData;
  }
  // Detects email
  async detectEmail(email) {
    const response = await fetch(
      `${this.versioned ? this.domain : this.domain + "/connect"}/providers/detect?client_id=${this.clientId}&email=${email}`,
      {
        method: "POST",
        // or 'PUT'
        headers: new Headers({ "content-type": "application/json" })
      }
    );
    const responseData = await response.json();
    return responseData.data;
  }
  // Gets app info from UAS
  async applicationInfo() {
    const response = await fetch(
      `${this.versioned ? this.domain : this.domain + "/connect"}/applications?client_id=${this.clientId}`,
      {
        method: "GET",
        // or 'PUT'
        headers: new Headers({ "content-type": "application/json" })
      }
    );
    const responseData = await response.json();
    return responseData.data;
  }
  // Gets providers form UAS
  async getAvailableProviders() {
    const response = await fetch(
      `${this.domain}/connect/providers/find?client_id=${this.clientId}`,
      {
        method: "GET",
        // or 'PUT'
        headers: new Headers({ "content-type": "application/json" })
      }
    );
    if (response) {
      const responseData = await response.json();
      const providers = responseData.data;
      return providers;
    }
    return null;
  }
  // EVENT HOOKS
  onLoginSuccess(callback) {
    window.addEventListener("onLoginSuccess", (e2) => callback(e2));
  }
  onLogoutSuccess(callback) {
    window.addEventListener("onLogoutSuccess", (e2) => callback(e2));
  }
  onLoginFail(callback) {
    window.addEventListener("onLoginFail", (e2) => callback(e2));
  }
  onTokenRefreshSuccess(callback) {
    window.addEventListener("onTokenRefreshSuccess", (e2) => callback(e2));
  }
  onTokenRefreshFail(callback) {
    window.addEventListener("onTokenRefreshFail", (e2) => callback(e2));
  }
  onSessionExpired(callback) {
    window.addEventListener("onSessionExpired", (e2) => callback(e2));
  }
  // Exchanges code for ID token and refresh and access tokens
  async codeExchange(search) {
    let params = new URLSearchParams(window.location.search);
    if (search) {
      params = new URLSearchParams(search);
    }
    const code2 = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const error_description = params.get("error_description");
    const error_code = params.get("error_code");
    if (error && error_description && error_code) {
      const payload = {
        detail: { error, error_description, error_code }
      };
      window.dispatchEvent(new CustomEvent("onLoginFail", payload));
      window.history.pushState({}, document.title, window.location.pathname);
      return false;
    }
    if (!code2) {
      console.warn("No code found");
      return false;
    }
    if (window.opener && window.name === "uas-popup") {
      console.warn("Popup window detected");
      return false;
    }
    const code_verifier = await this.Storage.getPKCE();
    if (!code_verifier) {
      console.warn("No code verifier found");
      return false;
    }
    try {
      const payload = {
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code: code2,
        grant_type: "authorization_code",
        code_verifier
      };
      const response = await fetch(`${this.domain}/connect/token`, {
        method: "POST",
        // or 'PUT'
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (responseData) {
        if (responseData.error) {
          const payload2 = { detail: responseData };
          window.dispatchEvent(new CustomEvent("onLoginFail", payload2));
          return true;
        }
        const exchangeResponse = await this.handleCodeExchangeResponse(responseData);
        if (!exchangeResponse.valid) {
          const payload2 = { detail: exchangeResponse.data };
          window.dispatchEvent(new CustomEvent("onLoginFail", payload2));
          return true;
        } else {
          if (state) {
            exchangeResponse.data.state = state;
          }
          const payload2 = { detail: exchangeResponse.data };
          window.dispatchEvent(new CustomEvent("onLoginSuccess", payload2));
          window.history.pushState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
      this.Storage.removePKCE();
      return true;
    } catch (error2) {
      const payload = { detail: error2 };
      window.dispatchEvent(new CustomEvent("onLoginFail", payload));
      window.history.pushState({}, document.title, window.location.pathname);
      return false;
    }
  }
  // Token Exchange for session  maintenece
  async tokenExchange(grant_id = "") {
    const grant = await this.Storage.getGrant(grant_id, this.multiAccount);
    if (!grant) {
      return false;
    }
    const refresh_token = grant.refresh_token;
    try {
      const payload = {
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        refresh_token,
        grant_type: "refresh_token"
      };
      const response = await fetch(`${this.domain}/connect/token`, {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (responseData) {
        if (responseData.error) {
          const payload3 = { detail: responseData };
          window.dispatchEvent(new CustomEvent("onTokenRefreshFail", payload3));
          return true;
        }
        const now = getTimestamp();
        responseData.expires_in = now + responseData.expires_in;
        this.Storage.setGrant(responseData, this.multiAccount);
        const isValidToken = await this.validateIDToken(grant_id);
        if (!isValidToken) {
          const payload3 = { detail: responseData };
          window.dispatchEvent(new CustomEvent("onTokenRefreshFail", payload3));
          return true;
        }
        const payload2 = { detail: responseData };
        window.dispatchEvent(new CustomEvent("onTokenRefreshSuccess", payload2));
        return true;
      }
      this.Storage.removePKCE();
    } catch (error) {
      const payload = { detail: error };
      window.dispatchEvent(new CustomEvent("onTokenRefreshFail", payload));
      return false;
    }
  }
  // Handles the response of code exchange
  async handleCodeExchangeResponse(responseData) {
    const isValid = true;
    if (responseData.error) {
      return {
        data: responseData,
        valid: false
      };
    }
    const now = getTimestamp();
    responseData.expires_in = now + responseData.expires_in;
    this.Storage.setGrant(responseData, this.multiAccount);
    const user = o(responseData.id_token);
    user.status = "authenticated";
    this.Storage.setUserToken(user);
    const isValidToken = await this.validateIDToken(user.sub);
    if (!isValidToken) {
      return {
        data: responseData,
        valid: false
      };
    }
    return {
      data: responseData,
      valid: isValid
    };
  }
  // Regulates POPUP behaivior
  async popUp(url) {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const title = `uas-popup`;
    const popupURL = url;
    const externalPopup = window.open(
      popupURL,
      title,
      `width=${width},height=${height},left=${left},top=${top}`
    );
    if (!externalPopup) {
      return;
    }
    const timer = setInterval(async () => {
      if (externalPopup.closed) {
        const payload = {
          detail: { error_description: "OAuth provider window closed" }
        };
        window.dispatchEvent(new CustomEvent("onLoginFail", payload));
        timer && clearInterval(timer);
        return;
      }
      try {
        const currentUrl = externalPopup.location.href.split("?");
        if (!currentUrl[0]) {
          return;
        }
        const search = externalPopup.location.search;
        externalPopup.history.pushState(
          {},
          document.title,
          window.location.pathname
        );
        if (currentUrl[0] === this.redirectUri && currentUrl.length > 1) {
          const success = await this.codeExchange(search);
          externalPopup.close();
          if (success) {
            location.reload();
          }
          timer && clearInterval(timer);
          return;
        }
      } catch (error) {
        return;
      }
    }, 1e3);
  }
  // Returns access token
  async getAccessToken(grant_id = "") {
    const now = getTimestamp();
    const grantResponse = await this.Storage.getGrant(
      grant_id,
      this.multiAccount
    );
    if (!grantResponse) {
      return null;
    }
    const { access_token, expires_in } = grantResponse;
    const token = access_token;
    if (token) {
      if (expires_in && expires_in > getTimestamp()) {
        const timeLeft = expires_in - now;
        if (timeLeft > 30) {
          return token;
        }
      }
    }
    await this.tokenExchange(grant_id);
    const grant = await this.Storage.getGrant(grant_id, this.multiAccount);
    return grant.access_token;
  }
  async sse(url, request) {
    const headers = request.headers || {};
    const grant_id = headers["Grant-ID"];
    let token = "";
    if (this.multiAccount) {
      if (!grant_id) {
        this.logout();
        throw new Error("Grant ID is required for multi account calls");
      }
      token = await this.getAccessToken(grant_id);
    } else {
      token = await this.getAccessToken();
    }
    delete headers["Grant-ID"];
    headers["Authorization"] = `Bearer ${token}`;
    if (!headers["content-type"]) {
      headers["content-type"] = "application/json";
    }
    return fetchEventSource(`${this.domain}/${url}`, {
      ...request,
      headers
    });
  }
  // Used to call Nylas API endpoints
  async fetch(url, request, parseJSON = true, domain) {
    let token = "";
    let profileCount = 1;
    if (this.multiAccount) {
      if (!request.grant_id) {
        this.logout();
        throw new Error("Grant ID is required for multi account calls");
      }
      const profiles = await this.getProfiles();
      profileCount = profiles ? profiles.length : 1;
      token = await this.getAccessToken(request.grant_id);
    } else {
      token = await this.getAccessToken();
    }
    if (!token) {
      throw new Error("Access token not found");
    }
    let headers = request.headers;
    if (!Headers.prototype.isPrototypeOf(headers)) {
      headers = new Headers({
        Authorization: `Bearer ${token}`,
        "content-type": "application/json"
      });
    } else {
      headers.append("Authorization", `Bearer ${token}`);
      if (!headers.has("content-type")) {
        headers.append("content-type", "application/json");
      }
    }
    try {
      if (request == null ? void 0 : request.body) {
        request.body = JSON.stringify(request == null ? void 0 : request.body);
      }
      const response = await fetch(`${domain || this.domain}/${url}`, {
        ...request,
        headers
      });
      if (!parseJSON) {
        return response;
      }
      const responseData = await (response == null ? void 0 : response.json());
      const isAuthenticated = await this.isAuthenticatedResponse(
        response.status,
        responseData
      );
      if (!isAuthenticated) {
        if (profileCount > 1) {
          const user = await this.getProfile(request.grant_id);
          if (user) {
            user.status = "unauthorized";
            await this.Storage.setUserToken(user);
            const payload = {
              detail: { user }
            };
            window.dispatchEvent(new CustomEvent("onSessionExpired", payload));
          }
        } else {
          const user = await this.Storage.getUserToken();
          const payload = {
            detail: { user }
          };
          window.dispatchEvent(new CustomEvent("onSessionExpired", payload));
        }
        this.logout();
        return;
      }
      return responseData;
    } catch (e2) {
      throw e2;
    }
  }
  async fetchRequest(path, method2, body, parseJSON = true, domain, request) {
    const isLoggedIn = await this.isLoggedIn();
    const url = new URL(path, domain ?? this.domain);
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("User-Agent", "nylas-identity");
    if (isLoggedIn) {
      const accessToken = await this.getAccessToken();
      headers.append("Authorization", `Bearer ${accessToken}`);
    }
    const response = await fetch(url.toString(), {
      method: method2 || "GET",
      headers,
      mode: "cors",
      referrer: location.origin,
      body: body ? JSON.stringify(body) : void 0,
      ...request || {}
    });
    if (!parseJSON) {
      return response.body;
    }
    const json = await response.json();
    return json;
  }
  // Checks if the response is not 401
  async isAuthenticatedResponse(status, responseData) {
    var _a;
    if (status == 401 && ((_a = responseData == null ? void 0 : responseData.error) == null ? void 0 : _a.type) == "token.unauthorized_access") {
      return false;
    }
    return true;
  }
  addAPIKey(grant_id, email, key) {
    this.Storage.setUserToken({
      aud: "https://api-staging.us.nylas.com/",
      exp: 2e9,
      email_verified: true,
      iat: getTimestamp(),
      iss: "",
      email,
      provider: "virtual-calendar",
      status: "authenticated",
      name: email,
      sub: grant_id
    });
    this.Storage.setGrant(
      {
        grant_id,
        access_token: key,
        expires_in: 2e9
      },
      this.multiAccount
    );
  }
}
export {
  NylasSessions
};
