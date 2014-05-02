(function () {

    function forEach (collection, callback) {
        if (!collection || !collection.length) { return; }
        var index = -1,
            length = collection.length;
        while (++index < length) {
            callback(collection[index], index, collection);
        }
    }

    function isArray (data) {
        return Object.prototype.toString.call(data) === '[object Array]';
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
                this.value = 0;
                this.add.apply(this, arguments);
            }
        }

        Mask.set = function (flags) {
            if (!isArray(flags)) {
                flags = Array.prototype.slice.call(arguments);
            }
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
            if (typeof flags === 'string') {
                flags = Array.prototype.slice.call(arguments);
            }
            forEach(flags, function (flag) {
                if (!Mask.mask[flag]) {
                    valid = false;
                }
            });
            return valid;
        };

        Mask.filter = function (flags) {
            var filtered = [];
            if (typeof flags === 'string') {
                flags = Array.prototype.slice.call(arguments);
            }
            forEach(flags, function (flag) {
                if (Mask.mask[flag]) {
                    filtered.push(flag);
                }
            });
            return filtered;
        };

        Mask.set.apply(Mask, arguments);

        function constructMask (data) {
            if (data instanceof Mask) {
                return data;
            } else {
                data = Array.prototype.slice.call(arguments);
                return new Mask(data);
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
            if (!isArray(flags)) {
                flags = Array.prototype.slice.call(arguments);
            }
            var thisValue = this.value;
            forEach(flags, function (flag) {
                if (Mask.mask[flag]) {
                    thisValue |= Mask.mask[flag];
                } else {
                    thisValue = -1;
                }
            });
            this.value = thisValue;
            return this;
        };

        Mask.prototype.remove = function (flags) {
            var mask = constructMask.apply(this, arguments);
            this.value &= ~mask.value;
            return this;
        };

        Mask.prototype.toggle = function (flags) {
            var mask = constructMask.apply(this, arguments);
            this.value ^= mask.value;
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

        Mask.prototype.includes = function () {
            var mask = constructMask.apply(this, arguments);
            return ((this.value & mask.value) === mask.value);
        };

        Mask.prototype.excludes = function () {
            return !this.includes.apply(this, arguments);
        };

        Mask.prototype.equals = function () {
            var mask = constructMask.apply(this, arguments);
            return (this.value === mask.value);
        };

        Mask.prototype.and = function () {
            var mask = constructMask.apply(this, arguments);
            return new Mask(this.value | mask.value);
        };

        Mask.prototype.intersect = function () {
            var mask = constructMask.apply(this, arguments);
            return new Mask(this.value & mask.value);
        };

        Mask.prototype.clone = function () {
            return new Mask(this.value);
        };

        return Mask;
    }


    if (typeof module !== 'undefined') {
        module.exports = Bitmask;
    } else if (typeof window !== 'undefined') {
        window.Bitmask = Bitmask;
    }

} ());