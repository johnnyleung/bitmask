function forEach (collection, callback) {
    if (!collection.length) { return; }
    var index = -1,
        length = collection.length;
    while (++index < length) {
        callback(collection[index], index, collection);
    }
}

function Bitmask (flags) {

    var TOO_MANY_FLAGS = 'Too many flags';

    if (flags.length > 31) {
        throw new Error(TOO_MANY_FLAGS);
    }

    function Mask (flags) {
        if (typeof flags === 'number') {
            this.value = flags;
        } else {
            this.add(flags);
        }
    }

    Mask.set = function (flags) {
        Mask.mask = {};
        forEach(flags, function (flag, index) {
            Mask.mask[flag] = 1 << index;
        });
    };

    Mask.get = function () {
        return this.mask;
    };

    Mask.all = function () {
        return Object.keys(this.mask);
    };

    Mask.validate = function (flags) {
        var valid = true;
        forEach(flags, function (flag) {
            if (!Mask.mask[flag]) {
                valid = false;
            }
        });
        return valid;
    };

    Mask.filter = function (flags) {
        var filtered = [];
        forEach(flags, function (flag) {
            if (Mask.mask[flag]) {
                filtered.push(flag);
            }
        });
        return filtered;
    };

    Mask.set(flags);

    function constructMask (data) {
        if (typeof data === 'number' ||
            typeof data === 'string' ||
            Object.prototype.toString.call(data) === '[object Array]'
        ) {
            return new Mask(data);
        } else {
            return data;
        }
    }

    Mask.prototype.valueOf = function () {
        return this.value;
    };

    Mask.prototype.reset = function (flags) {
        this.value = 0;
        if (flags) {
            this.add(flags);
        }
        return this;
    };

    Mask.prototype.add = function (flags) {
        if (flags instanceof Mask) {
            this.value |= flags.value;
            return this;
        }
        if (typeof flags === 'string') {
            flags = Array.prototype.slice.call(arguments);
        }
        var thisValue = this.value;
        forEach(flags, function (flag) {
            thisValue |= Mask.mask[flag];
        });
        this.value = thisValue;
        return this;
    };

    Mask.prototype.remove = function (flags) {
        if (flags instanceof Mask) {
            this.value &= ~flags.value;
            return this;
        }
        if (typeof flags === 'string') {
            flags = Array.prototype.slice.call(arguments);
        }
        var thisValue = this.value;
        forEach(flags, function (flag) {
            thisValue &= ~Mask.mask[flag];
        });
        this.value = thisValue;
        return this;
    };

    Mask.prototype.toggle = function (flags) {
        if (flags instanceof Mask) {
            this.value ^= flags.value;
            return this;
        }
        if (typeof flags === 'string') {
            flags = Array.prototype.slice.call(arguments);
        }
        var thisValue = this.value;
        forEach(flags, function (flag) {
            thisValue ^= Mask.mask[flag];
        });
        this.value = thisValue;
        return this;
    };

    Mask.prototype.get = function () {
        var flags = [],
            flag;
        for (flag in Mask.mask) {
            if ((this.value & Mask.mask[flag]) === Mask.mask[flag]) {
                flags.push(flag);
            }
        }
        return flags;
    };

    Mask.prototype.includes = function (mask) {
        mask = constructMask(mask);
        return ((this.value & mask.value) === mask.value);
    };

    Mask.prototype.equals = function (mask) {
        mask = constructMask(mask);
        return (this.value === mask.value);
    };

    Mask.prototype.and = function (mask) {
        mask = constructMask(mask);
        return new Mask(this.value | mask.value);
    };

    Mask.prototype.intersect = function (mask) {
        mask = constructMask(mask);
        return new Mask(this.value & mask.value);
    };

    Mask.prototype.clone = function () {
        return new Mask(this.value);
    };

    return Mask;
}

module.exports = Bitmask;