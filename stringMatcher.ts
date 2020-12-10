// forked from https://github.com/joonhocho/superwild

function Matcher(pattern: string, wchar: string = '*') {
  this.wchar = wchar;
  this.pattern = pattern;
  this.segments = [];
  this.starCount = 0;
  this.minLength = 0;
  this.maxLength = 0;

  this.segStartIndex = 0;
  for (let i = 0, len = pattern.length; i < len; i += 1) {
    const char = pattern[i];
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
  } else {
    this.maxLength = this.minLength = pattern.length;
  }
}

Matcher.prototype.match = function match(match: string): boolean {
  if (this.pattern === this.wchar) {
    return true;
  }
  if (this.segments.length === 0) {
    return this.pattern === match;
  }
  const { length } = match;
  if (length < this.minLength || length > this.maxLength) {
    return false;
  }

  let segLeftIndex = 0;
  let segRightIndex = this.segments.length - 1;
  let rightPos = match.length - 1;
  let rightIsStar = false;

  while (true) {
    const segment = this.segments[segRightIndex];
    segRightIndex -= 1;
    if (segment === this.wchar) {
      rightIsStar = true;
    } else {
      const lastIndex = rightPos + 1 - segment.length;
      const index = match.lastIndexOf(segment, lastIndex);
      if (index === -1 || index > lastIndex) {
        return false;
      }
      if (rightIsStar) {
        rightPos = index - 1;
        rightIsStar = false;
      } else {
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

export default Matcher;
export function Match(pattern: string, match: string, wchar: string = '*') {
  if (pattern === wchar) {
    return true;
  }
  let segments = [];
  let starCount = 0;
  let minLength = 0;
  let maxLength = 0;
  let segStartIndex = 0;
  for (let i = 0, len = pattern.length; i < len; i += 1) {
    const char = pattern[i];
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
  } else {
    maxLength = minLength = pattern.length;
  }

  if (segments.length === 0) {
    return pattern === match;
  }
  const length = match.length;
  if (length < minLength || length > maxLength) {
    return false;
  }

  let segLeftIndex = 0;
  let segRightIndex = segments.length - 1;
  let rightPos = match.length - 1;
  let rightIsStar = false;

  while (true) {
    const segment = segments[segRightIndex];
    segRightIndex -= 1;
    if (segment === wchar) {
      rightIsStar = true;
    } else {
      const lastIndex = rightPos + 1 - segment.length;
      const index = match.lastIndexOf(segment, lastIndex);
      if (index === -1 || index > lastIndex) {
        return false;
      }
      if (rightIsStar) {
        rightPos = index - 1;
        rightIsStar = false;
      } else {
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
