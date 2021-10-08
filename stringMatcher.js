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
function Match(pattern, match, wchar) {
    if (wchar === void 0) { wchar = '*'; }
    if (pattern === wchar) {
        return true;
    }
    var segments = [];
    var starCount = 0;
    var minLength = 0;
    var maxLength = 0;
    var segStartIndex = 0;
    for (var i = 0, len = pattern.length; i < len; i += 1) {
        var char = pattern[i];
        if (char === wchar) {
            starCount += 1;
            if (i > segStartIndex) {
                segments.push(pattern.substring(segStartIndex, i));
            }
            segments.push(char);
            segStartIndex = i + 1;
        }
    }
    if (segStartIndex < pattern.length) {
        segments.push(pattern.substring(segStartIndex));
    }
    if (starCount) {
        minLength = pattern.length - starCount;
        maxLength = Infinity;
    }
    else {
        maxLength = minLength = pattern.length;
    }
    if (segments.length === 0) {
        return pattern === match;
    }
    var length = match.length;
    if (length < minLength || length > maxLength) {
        return false;
    }
    var segLeftIndex = 0;
    var segRightIndex = segments.length - 1;
    var rightPos = match.length - 1;
    var rightIsStar = false;
    while (true) {
        var segment = segments[segRightIndex];
        segRightIndex -= 1;
        if (segment === wchar) {
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
}
exports.Match = Match;
