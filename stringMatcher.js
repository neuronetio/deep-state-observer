"use strict";
// forked from https://github.com/joonhocho/superwild
exports.__esModule = true;
function Matcher(pattern, wchar) {
    if (wchar === void 0) { wchar = '*'; }
    this.wchar = wchar;
    this.pattern = pattern;
    this.segments = [];
    this.starCount = 0;
    this.minLength = 0;
    this.maxLength = 0;
    this.segStartIndex = 0;
    for (var i = 0, len = pattern.length; i < len; i += 1) {
        var char = pattern[i];
        if (char === wchar) {
            this.starCount += 1;
            if (i > this.segStartIndex) {
                this.segments.push(pattern.substring(this.segStartIndex, i));
            }
            this.segments.push(char);
            this.segStartIndex = i + 1;
        }
    }
    if (this.segStartIndex < pattern.length) {
        this.segments.push(pattern.substring(this.segStartIndex));
    }
    if (this.starCount) {
        this.minLength = pattern.length - this.starCount;
        this.maxLength = Infinity;
    }
    else {
        this.maxLength = this.minLength = pattern.length;
    }
}
Matcher.prototype.match = function match(match) {
    if (this.pattern === this.wchar) {
        return true;
    }
    if (this.segments.length === 0) {
        return this.pattern === match;
    }
    var length = match.length;
    if (length < this.minLength || length > this.maxLength) {
        return false;
    }
    var segLeftIndex = 0;
    var segRightIndex = this.segments.length - 1;
    var rightPos = match.length - 1;
    var rightIsStar = false;
    while (true) {
        var segment = this.segments[segRightIndex];
        segRightIndex -= 1;
        if (segment === this.wchar) {
            rightIsStar = true;
        }
        else {
            var lastIndex = rightPos + 1 - segment.length;
            var index = match.lastIndexOf(segment, lastIndex);
            if (index === -1 || index > lastIndex) {
                return false;
            }
            if (rightIsStar) {
                rightPos = index - 1;
                rightIsStar = false;
            }
            else {
                if (index !== lastIndex) {
                    return false;
                }
                rightPos -= segment.length;
            }
        }
        if (segLeftIndex > segRightIndex) {
            break;
        }
    }
    return true;
};
exports["default"] = Matcher;
