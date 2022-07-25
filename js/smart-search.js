"use strict";

var _match = function (pattern, text, offset, options) {
  var insertions = 0;
  var matchIndexes = [];
  var iPattern = 0;
  for (var iText = offset; iText < text.length; iText++) {
    if (text[iText] === pattern[iPattern]) {
      matchIndexes.push(iText);
      if (++iPattern === pattern.length) {
        return {
          insertions: insertions,
          matchIndexes: matchIndexes,
        };
      }
    } else if (matchIndexes.length) {
      insertions++;
      if (options.maxInsertions > -1 && insertions > options.maxInsertions) {
        return null;
      }
    }
  }
  return null;
};
var _find = function (pattern, text, options) {
  var match = false;
  var insertions = null;
  var matchIndexes = null;
  var iPattern = 0;
  if (options.caseSensitive === false) {
    pattern = pattern.toLowerCase();
    text = text.toLowerCase();
  }
  for (var iText = 0; iText < text.length; iText++) {
    if (text[iText] === pattern[iPattern]) {
      var res = _match(pattern, text, iText, options);
      if (res && (match === false || res.insertions <= insertions)) {
        if (match === false || res.insertions < insertions) {
          match = true;
          insertions = res.insertions;
          matchIndexes = res.matchIndexes;
        } else {
          matchIndexes = matchIndexes.concat(res.matchIndexes);
        }
      }
    }
  }
  if (match) {
    return {
      value: pattern,
      insertions: insertions,
      matchIndexes: matchIndexes,
    };
  }
  return null;
};

var _score = function (entryResults) {
  var patternsMinInsertions = {};
  var patternsMinMatchIndex = {};
  entryResults.forEach(function (fieldResults) {
    fieldResults.patterns.forEach(function (pattern) {
      if (
        patternsMinInsertions[pattern.value] === undefined ||
        pattern.insertions < patternsMinInsertions[pattern.value]
      ) {
        patternsMinInsertions[pattern.value] = pattern.insertions;
        patternsMinMatchIndex[pattern.value] = pattern.matchIndexes;
      }
    });
  });
  var minInsertions = 0;
  var minMatchIndex = [];
  for (var pattern in patternsMinInsertions) {
    if (patternsMinInsertions.hasOwnProperty(pattern)) {
      minInsertions += patternsMinInsertions[pattern];
      minMatchIndex = minMatchIndex.concat(patternsMinMatchIndex[pattern]);
    }
  }
  return minInsertions + minMatchIndex.sort()[0] / 1000;
};

var _getFieldString = function (entry, field) {
  var path = field;
  var current = entry;
  for (var i = 0; i < path.length; i++) {
    if (current[path[i]] === undefined) {
      return null;
    } else {
      current = current[path[i]];
    }
  }
  if (typeof current !== "string") {
    return null;
  }
  return current;
};

var _forEachObject = function (object, fn) {
  var _locals = [];

  (function _private(object) {
    for (var key in object) {
      _locals.push(key);
      if (typeof object[key] === "object") {
        _private(object[key]);
      } else {
        fn([].concat(_locals));
      }
      _locals.pop();
    }
  })(object);
};

var _search = function (entries, patterns, fields, options) {
  var results = [];
  entries.forEach(function (entry) {
    var match = false;
    var entryMatch = [];
    var entryResults = [];
    _forEachObject(fields, function (field) {
      var fieldString = _getFieldString(entry, field);
      if (fieldString === null) {
        return;
      }
      var fieldMatch = [];
      var fieldResults = { field: field.join("."), patterns: [] };
      patterns.forEach(function (pattern) {
        var res = _find(pattern, fieldString, options);
        if (res) {
          fieldResults.patterns.push(res);
          fieldMatch.push(pattern);
          if (entryMatch.indexOf(pattern) === -1) {
            entryMatch.push(pattern);
          }
        }
      });
      if (fieldMatch.length === patterns.length) {
        entryResults.push(fieldResults);
        match = true;
      } else if (
        options.fieldMatching === false &&
        fieldResults.patterns.length > 0
      ) {
        entryResults.push(fieldResults);
      }
    });
    if (
      (options.fieldMatching === true && match === true) ||
      (options.fieldMatching === false && entryMatch.length === patterns.length)
    ) {
      results.push({
        entry: entry,
        info: entryResults,
        score: _score(entryResults),
      });
    }
  });
  return results;
};

var _buildOptions = function (options) {
  var defaultOptions = {
    caseSensitive: false,
    fieldMatching: false,
    maxInsertions: -1,
  };
  if (options === undefined) {
    return defaultOptions;
  }
  for (var option in defaultOptions) {
    if (options[option] !== undefined) {
      defaultOptions[option] = options[option];
    }
  }
  return defaultOptions;
};

var sanitizeArray = function (array, caseSensitive) {
  if (array === undefined || array.length === undefined || array.length === 0) {
    return [];
  }
  var values = {};
  var newArray = [];
  array.forEach(function (elem) {
    if (typeof elem !== "string") {
      return;
    }
    var element = !caseSensitive ? elem.toLowerCase() : elem;
    if (element && element in values === false) {
      values[element] = true;
      newArray.push(element);
    }
  });
  return newArray;
};

function smartSearch(entries, patterns, fields, options) {
  options = _buildOptions(options);
  patterns = sanitizeArray([].concat(patterns), options.caseSensitive);
  fields =
    typeof fields === "string"
      ? {
          [fields]: true,
        }
      : fields;
  if (entries.length === 0 || patterns.length === 0) {
    return;
  }
  var results = _search(entries, patterns, fields, options);
  results.sort(function (a, b) {
    return a.score - b.score;
  });
  return results;
}

function didYouMean(str, list, key) {
  if (!str) return null;

  // If we're running a case-insensitive search, smallify str.
  if (!didYouMean.caseSensitive) {
    str = str.toLowerCase();
  }

  // Calculate the initial value (the threshold) if present.
  var thresholdRelative =
      didYouMean.threshold === null ? null : didYouMean.threshold * str.length,
    thresholdAbsolute = didYouMean.thresholdAbsolute,
    winningVal;
  if (thresholdRelative !== null && thresholdAbsolute !== null)
    winningVal = Math.min(thresholdRelative, thresholdAbsolute);
  else if (thresholdRelative !== null) winningVal = thresholdRelative;
  else if (thresholdAbsolute !== null) winningVal = thresholdAbsolute;
  else winningVal = null;

  // Get the edit distance to each option. If the closest one is less than 40% (by default) of str's length,
  // then return it.
  var winner,
    candidate,
    testCandidate,
    val,
    i,
    len = list.length;
  for (i = 0; i < len; i++) {
    // Get item.
    candidate = list[i];
    // If there's a key, get the candidate value out of the object.
    if (key) {
      candidate = candidate[key];
    }
    // Gatekeep.
    if (!candidate) {
      continue;
    }
    // If we're running a case-insensitive search, smallify the candidate.
    if (!didYouMean.caseSensitive) {
      testCandidate = candidate.toLowerCase();
    } else {
      testCandidate = candidate;
    }
    // Get and compare edit distance.
    val = getEditDistance(str, testCandidate, winningVal);
    // If this value is smaller than our current winning value, OR if we have no winning val yet (i.e. the
    // threshold option is set to null, meaning the caller wants a match back no matter how bad it is), then
    // this is our new winner.
    if (winningVal === null || val < winningVal) {
      winningVal = val;
      // Set the winner to either the value or its object, depending on the returnWinningObject option.
      if (key && didYouMean.returnWinningObject) winner = list[i];
      else winner = candidate;
      // If we're returning the first match, return it now.
      if (didYouMean.returnFirstMatch) return winner;
    }
  }

  // If we have a winner, return it.
  return winner || didYouMean.nullResultValue;
}

// Set default options.
didYouMean.threshold = 0.4;
didYouMean.thresholdAbsolute = 20;
didYouMean.caseSensitive = false;
didYouMean.nullResultValue = null;
didYouMean.returnWinningObject = null;
didYouMean.returnFirstMatch = false;

// Expose.
// In node...
if (typeof module !== "undefined" && module.exports) {
  module.exports = didYouMean;
}
// Otherwise...
else {
  window.didYouMean = didYouMean;
}

var MAX_INT = Math.pow(2, 32) - 1; // We could probably go higher than this, but for practical reasons let's not.
function getEditDistance(a, b, max) {
  // Handle null or undefined max.
  max = max || max === 0 ? max : MAX_INT;

  var lena = a.length;
  var lenb = b.length;

  // Fast path - no A or B.
  if (lena === 0) return Math.min(max + 1, lenb);
  if (lenb === 0) return Math.min(max + 1, lena);

  // Fast path - length diff larger than max.
  if (Math.abs(lena - lenb) > max) return max + 1;

  // Slow path.
  var matrix = [],
    i,
    j,
    colMin,
    minJ,
    maxJ;

  // Set up the first row ([0, 1, 2, 3, etc]).
  for (i = 0; i <= lenb; i++) {
    matrix[i] = [i];
  }

  // Set up the first column (same).
  for (j = 0; j <= lena; j++) {
    matrix[0][j] = j;
  }

  // Loop over the rest of the columns.
  for (i = 1; i <= lenb; i++) {
    colMin = MAX_INT;
    minJ = 1;
    if (i > max) minJ = i - max;
    maxJ = lenb + 1;
    if (maxJ > max + i) maxJ = max + i;
    // Loop over the rest of the rows.
    for (j = 1; j <= lena; j++) {
      // If j is out of bounds, just put a large value in the slot.
      if (j < minJ || j > maxJ) {
        matrix[i][j] = max + 1;
      }

      // Otherwise do the normal Levenshtein thing.
      else {
        // If the characters are the same, there's no change in edit distance.
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        }
        // Otherwise, see if we're substituting, inserting or deleting.
        else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Substitute
            Math.min(
              matrix[i][j - 1] + 1, // Insert
              matrix[i - 1][j] + 1
            )
          ); // Delete
        }
      }

      // Either way, update colMin.
      if (matrix[i][j] < colMin) colMin = matrix[i][j];
    }

    // If this column's minimum is greater than the allowed maximum, there's no point
    // in going on with life.
    if (colMin > max) return max + 1;
  }
  // If we made it this far without running into the max, then return the final matrix value.
  return matrix[lenb][lena];
}

// if (typeof exports !== 'undefined') {
//     if (typeof module !== 'undefined' && module.exports) {
//         exports = module.exports = smartSearch;
//     }
//     exports.smartSearch = smartSearch;
// } else if (angular) {
//     angular
//         .module('ngSmartSearch', [])
//         .filter('smartSearch', function() {
//             return smartSearch;
//         });
// } else {
//     window.smartSearch = smartSearch;
// }

const data444 = [
  {
    link: "pos3072.html",
    title: "Кассовый сенсорный монитор 3072, белый",
    desc: "Кассовый сенсорный моноблок 3072 имеет новый компактный дизайн. Сенсорный экран с высокой чувствительностью идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/monitor/p4.png",
    price: 163800,
    diagonal: 12.1,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1001,
  },
  {
    link: "pos3072_black.html",
    title: "Кассовый сенсорный монитор 3072, черный",
    desc: "Кассовый сенсорный моноблок 3072 имеет новый компактный дизайн. Сенсорный экран с высокой чувствительностью идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/monitor/p5.png",
    price: 163800,
    diagonal: 12.1,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1002,
  },
  {
    link: "pos_t8_white.html",
    title: "Кассовый сенсорный моноблок Т8, белый",
    desc: "Кассовый сенсорный моноблок 15.6-дюймовым диагональю экрана с высокой чувствительностью является главным отличием и достоинством. Модель имеет жесткий диск типа SSD 32 ГБ. Дисплей покупателя имеет возможность показывать клиенту то, что он заказывает.",
    img: "/images/fulls/monitor/24.jpg",
    price: 163800,
    diagonal: 15.6,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1003,
  },
  {
    link: "pos_t8.html",
    title: "Кассовый сенсорный моноблок T8, черный",
    desc: "Кассовый сенсорный моноблок 15.6-дюймовым диагональю экрана с высокой чувствительностью является главным отличием и достоинством. Модель имеет жесткий диск типа SSD 32 ГБ. Дисплей покупателя имеет возможность показывать клиенту то, что он заказывает.",
    img: "/images/fulls/monitor/t8_black_printer.png",
    price: 163800,
    diagonal: 15.6,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1004,
  },
  {
    link: "pos_t8_white_printer.html",
    title: "Кассовый сенсорный моноблок T8 с принтером чеков, белый",
    desc: "Кассовый сенсорный моноблок 15.6-дюймовым диагональю экрана с высокой чувствительностью и с принтером чеков 58мм является главным отличием и достоинством. Дисплей покупателя имеет возможность показывать клиенту то, что он заказывает.",
    img: "/images/fulls/monitor/t8_white_printer.jpg",
    price: 182700,
    diagonal: 15.6,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1005,
  },
  {
    link: "pos_t8_black_printer.html",
    title: "Кассовый сенсорный моноблок T8 с принтером чеков, черный",
    desc: "Кассовый сенсорный моноблок для кассы 15.6-дюймовым диагональю экрана с высокой чувствительностью и с принтером чеков 58мм является главным отличием и достоинством. Дисплей покупателя имеет возможность показывать клиенту то, что он заказывает.",
    img: "/images/fulls/monitor/t8_black_printer.png",
    price: 182700,
    diagonal: 15.6,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1006,
  },
  {
    link: "pos_3021_white.html",
    title: "Кассовый сенсорный Моноблок 3021, белый",
    desc: "15-дюймовый кассовый сенсорный моноблок 3021 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark44.png",
    price: 145200,
    diagonal: 15,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 4491,
  },
  {
    link: "pos_3021.html",
    title: "Кассовый сенсорный Моноблок 3021, черный",
    desc: "15-дюймовый кассовый сенсорный моноблок 3021 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark55.png",
    price: 145200,
    diagonal: 15,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 4492,
  },
  {
    link: "pos_t8_white_pro.html",
    title: "Кассовый сенсорный моноблок T8 Pro, белый",
    desc: "Кассовый сенсорный моноблок 15.6-дюймовым диагональю экрана с высокой чувствительностью является главным отличием и достоинством. Модель имеет жесткий диск типа SSD 64 ГБ. Дисплей покупателя имеет возможность показывать клиенту то, что он заказывает.",
    img: "/images/fulls/monitor/24_pro.jpg",
    price: 198000,
    diagonal: 15.6,
    color: "white",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1007,
  },
  {
    link: "pos_t8_black_pro.html",
    title: "Кассовый сенсорный моноблок T8 Pro, черный",
    desc: "Кассовый сенсорный монитор для кассы 15.6-дюймовым диагональю экрана с высокой чувствительностью является главным отличием и достоинством. Модель имеет жесткий диск типа SSD 64 ГБ. Дисплей покупателя имеет возможность показывать клиенту то, что он заказывает.",
    img: "/images/fulls/monitor/21_pro.jpg",
    price: 198000,
    diagonal: 15.6,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1008,
  },
  {
    link: "pos_3021_pro_white.html",
    title: "Кассовый сенсорный Моноблок 3021 PRO, белый",
    desc: "15-дюймовый кассовый сенсорный моноблок 3021 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark7.png",
    price: 162360,
    diagonal: 15,
    color: "white",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 4493,
  },
  {
    link: "pos_3021_pro_black.html",
    title: "Кассовый сенсорный Моноблок 3021 PRO, черный",
    desc: "15-дюймовый кассовый сенсорный моноблок 3021 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark8.png",
    price: 162360,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 4494,
  },
  {
    link: "pos_3068.html",
    title: "Кассовый сенсорный Моноблок 3068",
    desc: "Кассовый сенсорный моноблок 3068 отличается от других моноблоков с размером дисплея. Диогональ экрана состовляет 17 дюймов. Модель имеет жесткий диск типа SSD 32 ГБ. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/nomark/mark55.png",
    price: 171600,
    diagonal: 17,
    color: "black",
    ram: 4,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 4495,
  },
  {
    link: "post6.html",
    title: "Кассовый сенсорный моноблок T6",
    desc: "15,6-дюймовая кассовый сенсорный моноблок Touch Touch LVDS с высокой чувствительностью и широким экраном отвечает всем современным требованиям. Модель имеет превосходный дизайн. А также имеет дисплей для клиента с двумя линиями.",
    img: "/images/fulls/monitor/p2.jpg",
    price: 215160,
    diagonal: 15.6,
    color: "black",
    ram: 4,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1009,
  },
  {
    link: "pos_3068_pro.html",
    title: "Кассовый сенсорный Моноблок 3068 PRO",
    desc: "Кассовый сенсорный моноблок 3068 PRO отличается от других моноблоков с размером дисплея. Диогональ экрана состовляет 17 дюймов. Модель имеет жесткий диск типа SSD 64 ГБ. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/nomark/mark11.png",
    price: 184800,
    diagonal: 17,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 4496,
  },
  {
    link: "post3.html",
    title: "Кассовый сенсорный моноблок T3",
    desc: "Кассовый сенсорный моноблок 15-дюймовым диагональю экрана с высокой чувствительностью и с модной экранной панелью на спине является главным отличием и достоинством. Экранная панель имеет возможность показывать клиенту, что он заказывает.",
    img: "/images/fulls/monitor/p3.png",
    price: 205000,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 1013,
  },
  {
    link: "pos_1701.html",
    title: "Кассовый сенсорный Моноблок 1701",
    desc: "15-дюймовый кассовый сенсорный моноблок 1701 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark1.png",
    price: 130000,
    diagonal: 15,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 5150,
  },
  {
    link: "pos_1701_pro.html",
    title: "Кассовый сенсорный Моноблок 1701 PRO",
    desc: "15-дюймовый кассовый сенсорный моноблок 1701 PRO — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark9.png",
    price: 156090,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 5151,
  },
  {
    link: "pos_1702.html",
    title: "Кассовый сенсорный Моноблок 1702",
    desc: "15-дюймовый кассовый сенсорный моноблок 1702 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark22.png",
    price: 130000,
    diagonal: 15,
    color: "white",
    ram: 2,
    ssd: 34,
    clientDisplay: true,
    displayType: "capacitive",
    code: 5146,
  },
  {
    link: "pos_1702_pro.html",
    title: "Кассовый сенсорный Моноблок 1702 PRO",
    desc: "15-дюймовый кассовый сенсорный моноблок 1702 PRO — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/fulls/nomark/mark10.png",
    price: 156090,
    diagonal: 15,
    color: "white",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 5151,
  },
  {
    link: "pos_1905.html",
    title: "Кассовый сенсорный Моноблок 1905",
    desc: "Кассовый сенсорный монитор 1905 белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/nomark/mark2.png",
    price: 130000,
    diagonal: 15,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "capacitive",
    code: 5148,
  },
  {
    link: "pos_1905_pro.html",
    title: "Кассовый сенсорный Моноблок 1905 PRO",
    desc: "Кассовый сенсорный монитор 1905 PRO белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/nomark/mark222.png",
    price: 162540,
    diagonal: 15,
    color: "white",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "capacitive",
    code: 5149,
  },
  {
    link: "pos_r10.html",
    title: "Кассовый сенсорный Моноблок R10",
    desc: "Кассовый сенсорный монитор R10 белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/nomark/mark3.png",
    price: 130000,
    diagonal: 15,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "resistive",
    code: 5158,
  },
  {
    link: "pos_r10_pro.html",
    title: "Кассовый сенсорный Моноблок R10 PRO",
    desc: "Кассовый сенсорный монитор R10 PRO белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/fulls/nomark/mark6.png",
    price: 148450,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s4.html",
    title: "Кассовый сенсорный Моноблок S4",
    desc: "Кассовый сенсорный монитор S4 белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/thumbs/monitor/monoNew2.png",
    price: 128250,
    diagonal: 15,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s4_pro.html",
    title: "Кассовый сенсорный Моноблок S4 PRO",
    desc: "Кассовый сенсорный монитор S4 PRO белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/thumbs/monitor/monoNew3.png",
    price: 163350,
    diagonal: 15,
    color: "white",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s6.html",
    title: "Кассовый сенсорный Моноблок S6",
    desc: "Кассовый сенсорный монитор S6 белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/thumbs/monitor/monoNew4.png",
    price: 135000,
    diagonal: 15,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s6_pro.html",
    title: "Кассовый сенсорный Моноблок S6 PRO",
    desc: "Кассовый сенсорный монитор S6 PRO белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/thumbs/monitor/monoNew5.png",
    price: 170100,
    diagonal: 15,
    color: "white",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s8.html",
    title: "Кассовый сенсорный Моноблок S8",
    desc: "Кассовый сенсорный монитор S8 белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/thumbs/monitor/monoNew6.png",
    price: 132000,
    diagonal: 15,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: false,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s8_pro.html",
    title: "Кассовый сенсорный Моноблок S8 PRO",
    desc: "Кассовый сенсорный монитор S8 PRO белый имеет новый компактный дизайн, кассовый сенсорный монитор с высокой чувствительностью. Идеально подойдет для автоматизации любой торговли: супермаркетов, магазинов, кафе или же аптек.",
    img: "/images/thumbs/monitor/monoNew7.png",
    price: 163200,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: false,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s10.html",
    title: "Кассовый сенсорный Моноблок S10",
    desc: "15-дюймовый кассовый сенсорный моноблок S10 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/thumbs/monitor/monoNew8.png",
    price: 150000,
    diagonal: 15.6,
    color: "white",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s10_pro.html",
    title: "Кассовый сенсорный Моноблок S10 PRO",
    desc: "15,6-дюймовый кассовый сенсорный моноблок S10 PRO — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/thumbs/monitor/monoNew9.png",
    price: 169200,
    diagonal: 15.6,
    color: "white",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_r26_pro.html",
    title: "Кассовый сенсорный Моноблок R 26 PRO",
    desc: "15-дюймовый кассовый сенсорный моноблок R 26 PRO — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/thumbs/monitor/monoNew10.png",
    price: 168750,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s2.html",
    title: "Кассовый сенсорный Моноблок S2",
    desc: "15,6-дюймовый кассовый сенсорный моноблок S2 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/thumbs/monitor/monoNew900.png",
    price: 128250,
    diagonal: 15,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: false,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_s2_pro.html",
    title: "Кассовый сенсорный Моноблок S2 PRO",
    desc: "15-дюймовый кассовый сенсорный моноблок S2 PRO — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/thumbs/monitor/monoNew12.png",
    price: 163350,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "resistive",
    code: 5159,
  },

  {
    link: "pos_t610.html",
    title: "Кассовый резистивный Моноблок Т610",
    desc: "15-дюймовый кассовый резистивный монобло Т610 — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/thumbs/monitor/monoNewI1.png",
    price: 133000,
    diagonal: 15,
    color: "black",
    ram: 2,
    ssd: 32,
    clientDisplay: true,
    displayType: "resistive",
    code: 0,
  },

  {
    link: "pos_t610_pro.html",
    title: "Кассовый резистивный Моноблок Т610 PRO",
    desc: "15-дюймовый кассовый резистивный монобло Т610 PRO — это коммерческое решение для предприятий любого масштаба, работающих в сфере торговли, в ресторанном и гостиничном бизнесе. Служат долго и идеально справляются с задачами автоматизации обслуживания клиентов. Поддерживает все виды периферийных устройств. Имеет конструкцию без вентилятора, что обеспечивает низкий уровень шума.",
    img: "/images/thumbs/monitor/monoNewI01.png",
    price: 147000,
    diagonal: 15,
    color: "black",
    ram: 4,
    ssd: 64,
    clientDisplay: true,
    displayType: "resistive",
    code: 0,
  },

  // ============================================================== SCANNER =============================================================================
  {
    link: "scanner6900.html",
    title: "Сканер штрих кода 6900",
    desc: "Сканер штрих кода с подставкой обладает высоким уровнем обслуживания. Кнопка сканирования выдерживает не менее 100 нажатий в сек., поэтому может применяться в различных магазинах, супермаркетах, аптеках или же в любой торговли.",
    img: "/images/fulls/scanner/1.jpg",
    price: 11840,
    scanType: ["bar-code"],
    screenScan: false,
    connections: ["wired"],
    readType: "laser",
    scanMode: ["first", "second"],
    code: 2001,
  },
  {
    link: "scanner_t_5.html",
    title: "Сканер для считывания штрих кодов T5",
    desc: "Светодиодный сканер для считывания штрих кодов T5 может считывать любые штрих коды. Главным преимуществом сканера T5 является - считывание штрих-кодов прямо с экрана смартфона или монитора компьютера.",
    img: "/images/fulls/scanner/3.jpg",
    price: 15120,
    scanType: ["bar-code"],
    screenScan: false,
    connections: ["wired"],
    readType: "led",
    scanMode: ["first", "third", "fourth", "fifth"],
    code: 2002,
  },
  {
    link: "scanner_10t_2d.html",
    title: "Cканер QR и штрих-кодов 10T-2D",
    desc: "Cканер QR и штрих-кодов 10T- с 2D режимом считывания, сканирует любые штрих-коды: с экрана монитора, смартфона, а также считывает QR-коды. Применяется в розничной торговли, легкой промышленности, документообороте, а также в сфере банковских и коммунальных услуг.",
    img: "/images/fulls/scanner/9.png",
    price: 23940,
    scanType: ["bar-code", "qr-code"],
    screenScan: true,
    connections: ["wired"],
    readType: "image",
    scanMode: ["first", "second"],
    code: 2005,
  },
  {
    link: "scanner1880.html",
    title: "Беспроводной сканер штрих кода 1880",
    desc: "Беспроводной сканер штрих кода с подставкой обладает высокой производительностью. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
    img: "/images/fulls/scanner/7.jpg",
    price: 20160,
    scanType: ["bar-code"],
    screenScan: true,
    connections: ["wired", "wifi"],
    readType: "laser",
    scanMode: ["first", "second"],
    code: 2004,
  },
  {
    link: "scanner_6100_cg.html",
    title: "Беспроводной сканер штрих кода 6100 CG",
    desc: "Беспроводной сканер штрих кода обладает высокой производительностью. Имеет три вида сканирования: Штрих-код, QR-код, DATA Matrix. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
    img: "/images/fulls/scanner/dmx2.png",
    price: 20304,
    scanType: ["bar-code", "qr-code", "dmx-code"],
    screenScan: true,
    connections: ["wired", "wifi"],
    readType: "led",
    scanMode: ["first", "third", "fourth", "fifth"],
    code: 5311,
  },
  {
    link: "scanner_6600_g.html",
    title: "Беспроводной сканер штрих кода 6600 G",
    desc: "Беспроводной сканер штрих кода обладает высокой производительностью. Имеет три вида сканирования: Штрих-код, QR-код, DATA Matrix. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
    img: "/images/fulls/scanner/s-6600-1.png",
    price: 24335,
    scanType: ["bar-code", "qr-code", "dmx-code"],
    screenScan: true,
    connections: ["wired", "wifi"],
    readType: "image",
    scanMode: ["first", "fourth"],
    code: 5312,
  },
  {
    link: "scanner_6600_b.html",
    title: "Беспроводной сканер штрих кода 6600 B (Bluetooth)",
    desc: "Беспроводной сканер штрих кода обладает высокой производительностью и подключается через bluetooth. Имеет три вида сканирования: Штрих-код, QR-код, DATA Matrix. Ударопрочный сканер имеет возможность работать на расстоянии. Может использоваться непрерывно в течение более 20 часов без зарядки. Главным преимуществом сканера является - автоматическое хранение на расстоянии.",
    img: "/images/fulls/scanner/6600b1.png",
    price: 26690,
    scanType: ["bar-code", "qr-code", "dmx-code"],
    screenScan: true,
    connections: ["wired", "wifi", "bluetooth"],
    readType: "image",
    scanMode: ["first", "fourth"],
    code: 5313,
  },
  // ============================================================== PRINTER Чеков =============================================================================

  {
    link: "printer5802.html",
    title: "Принтер чеков 5802",
    desc: "Принтер чеков 5802 с термопечатью обладает высоким уровнем обслуживания в любых сферах. Принтер чеков имеет компактные размеры корпуса и предназначен для печати на 58 мм термоленте.",
    img: "/images/fulls/printer/1.jpg",
    price: 15840,
    paperWidth: 58,
    printSpeed: 90,
    thermSource: 100,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 3001,
  },
  {
    link: "printer8256.html",
    title: "Принтер кассовых чеков 8256",
    desc: "Принтер кассовых чеков 8256 обладает не только замечательными техническими параметрами, но и высокоскоростной печатью 300мм/сек. Функциональные возможности принтера чеков существенно экономят время оператора и помогают бесперебойно обслуживать большой поток клиентов.",
    img: "/images/fulls/printer/3.jpg",
    price: 35280,
    paperWidth: 80,
    printSpeed: 300,
    thermSource: 100,
    interfaces: ["USB", "LAN"],
    autoCut: true,
    connections: ["autonomous"],
    code: 3002,
  },
  {
    link: "printer_5860.html",
    title: "Мобильный термопринтер 5860 (bluetooth)",
    desc: "Мобильный термопринтер 5860 (bluetooth) легко синхронизируется с устройствами(Android) на смартфоне, планшете, компьютере и печатает на стандартной термоленте шириной 58 мм. Принтер чеков 5860 совместим с любыми программными обеспечениями и отлично впишется в малый или средний бизнес.",
    img: "/images/fulls/printer/10.png",
    price: 29040,
    paperWidth: 58,
    printSpeed: 50,
    thermSource: 80,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous", "bluetooth"],
    code: 3004,
  },
  {
    link: "printer_58_b.html",
    title: "Принтер чеков Rongta 58 B",
    desc: "Принтер чеков Rongta 58B `обладает скоростью печати 90 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте.",
    img: "/images/fulls/printer/58b1.jpg",
    price: 12096,
    paperWidth: 58,
    printSpeed: 90,
    thermSource: 50,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5382,
  },
  {
    link: "printer_58_a.html",
    title: "Принтер чеков Rongta 58A",
    desc: "Принтер чеков Rongta 58A обладает скоростью печати 90 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте.",
    img: "/images/fulls/printer/58a1.jpg",
    price: 12600,
    paperWidth: 58,
    printSpeed: 90,
    thermSource: 50,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5383,
  },
  {
    link: "printer_rp_58e.html",
    title: "Принтер чеков Rongta 58E",
    desc: "Принтер чеков Rongta 58 E обладает скоростью печати 90 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте. Термопринтер чеков успешно используется в крупных торговых сетях, гостиницах и ресторанах, интернет-магазинах с большим клиентским потоком.",
    img: "/images/fulls/printer/1.jpg",
    price: 14742,
    paperWidth: 58,
    printSpeed: 100,
    thermSource: 100,
    interfaces: ["USB"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5381,
  },
  {
    link: "printer_rp_328.html",
    title: "Принтер чеков Rongta RP 328",
    desc: "Принтер чеков Rongta RP 328 обладает скоростью печати 250 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 80мм термоленте. Термопринтер чеков успешно используется в крупных торговых сетях, гостиницах и ресторанах, интернет-магазинах с большим клиентским потоком.",
    img: "/images/fulls/printer/rp3281.jpg",
    price: 36280,
    paperWidth: 80,
    printSpeed: 250,
    thermSource: 100,
    interfaces: ["USB", "LAN", "Serial"],
    autoCut: true,
    connections: ["autonomous"],
    code: 5384,
  },
  {
    link: "printer_rp_326.html",
    title: "Принтер чеков RP 326",
    desc: "Принтер чеков RP 326 обладает скоростью печати 250 мм/сек. Термопринтер имеет компактные размеры корпуса и предназначен для печати на 58мм термоленте. Термопринтер чеков успешно используется в крупных торговых сетях, гостиницах и ресторанах, интернет-магазинах с большим клиентским потоком.",
    img: "/images/fulls/printer/3.jpg",
    price: 44220,
    paperWidth: 58,
    printSpeed: 250,
    thermSource: 100,
    interfaces: ["USB", "LAN", "Serial"],
    autoCut: false,
    connections: ["autonomous"],
    code: 5387,
  },

  // ============================================================== PRINTER Этикеток =============================================================================

  {
    link: "printer3120.html",
    title: "Принтер этикеток 3120T",
    desc: "Легкий и удобный принтер этикеток со скоростью 127мм/сек с разрешением 203 dpi имеет превосходные технические характеристики для печати этикеток шириной 76 мм. Принтер этикеток 3120T имеет функции: автоматической калибровки бумаги и функцию контроля температуры.",
    img: "/images/fulls/label/1.jpg",
    price: 45360,
    color: "black",
    paperWidth: 76,
    interfaces: ["usb"],
    autoCut: true,
    winding: true,
    code: 4001,
  },
  {
    link: "printer_2408_d.html",
    title: "Принтер этикеток 2408DC",
    desc: "Высокопроизводительный принтер GS-2408D со скоростью 203мм/сек с разрешением 203 dpi имеет превосходные технические характеристики для печати этикеток шириной 104 мм. Данный принетер является отличным решением для розничной торговли, маркировки полок, а также для сервисов доставки.",
    img: "/images/thumbs/label/2408d1.jpg",
    price: 47520,
    color: "white",
    paperWidth: 104,
    interfaces: ["usb", "serial", "wifi", "bluetooth"],
    autoCut: true,
    winding: true,
    code: 4940,
  },
  {
    link: "printer_3120_tub.html",
    title: "Принтер этикеток 3120TUB",
    desc: "Высокопроизводительный принтер 3120TUB со скоростью 127 мм/сек с разрешением 203 dpi имеет превосходные технические характеристики для печати этикеток шириной 76 мм. Данный принетер является безупречным решением для организации работы торговых компаний разной специализации.",
    img: "/images/thumbs/label/tub1.png",
    price: 34980,
    color: "gray",
    paperWidth: 76,
    interfaces: ["usb"],
    autoCut: false,
    winding: false,
    code: 4939,
  },
  {
    link: "printer_3120_tl.html",
    title: "Принтер этикеток 3120TL",
    desc: "Высокопроизводительный принтер GP-3120TL со скоростью 127 мм/сек с разрешением 203 dpi имеет превосходные технические характеристики для печати этикеток шириной 76 мм. Данный принетер является безупречным решением для организации работы торговых компаний разной специализации.",
    img: "/images/thumbs/label/3120tl1.png",
    price: 46200,
    color: "black",
    paperWidth: 76,
    interfaces: ["usb"],
    autoCut: true,
    winding: false,
    code: 1821,
  },
  {
    link: "printer_3120_tuc.html",
    title: "Принтер этикеток 3120TUC",
    desc: "Высокопроизводительный принтер GP-3120TL со скоростью 127 мм/сек с разрешением 203 dpi имеет превосходные технические характеристики для печати этикеток шириной 80 мм. Данный принетер является безупречным решением для организации работы торговых компаний разной специализации.",
    img: "/images/thumbs/label/tuc1.png",
    price: 34980,
    color: "black",
    paperWidth: 80,
    interfaces: ["usb"],
    autoCut: true,
    winding: false,
    code: 4938,
  },

  // ============================================================== ВЕСЫ =============================================================================

  {
    link: "scale_tm_30.html",
    title: "Весы электронные TM30A",
    desc: "Электронные торговые весы со стойкой TM30A предназначены для взвешивания и расчёта стоимости товара по измеренному весу и указанной цене за килограмм. Весы отлично применяются в различных сферах обслуживания, розничной и оптовой торговле.",
    price: "100800",
    img: "/images/fulls/scale/1.jpg",
    code: 5001,
  },
  {
    link: "scale_mk_rp_10.html",
    title: "Весы торговые с печатью этикеток МК_RP10",
    desc: "Весы предназначены для маркировки и учета весовых, штучных и счетных товаров. Память на 20 000 товаров. Весы печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов, регистрируют товароучетные операции (продажа, прием, отпуск, списание, инвентаризация). ",
    price: "156166",
    img: "/images/fulls/scale/10.jpg",

    code: 5009,
  },
  {
    link: "scale_mk_r2p_10.html",
    title: "Весы электронные с печатью этикеток МК_R2P10-1",
    desc: "Весы с устройством подмотки конца ленты предназначены для маркировки и учета весовых, штучных и счетных товаров за прилавком. Весы печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов.",
    price: "178258",
    img: "/images/fulls/scale/20.jpg",

    code: 444,
  },
  {
    link: "scale_rl_10.html",
    title: "Весы торговые с печатью этикеток МК_RL10-1",
    desc: "Весы предназначены для маркировки и учета весовых, штучных и счетных товаров. Память на 20000 товаров. Весы печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов, регистрируют товароучетные операции (прием, отпуск, списание, инвентаризация).",
    price: "210011",
    img: "/images/fulls/scale/30.jpg",

    code: 5010,
  },
  {
    link: "scale_tbs_rl.html",
    title: "Весы торговые с печатью этикеток TB-S_RL1",
    desc: "Весы состоят из модуля взвешивающего и терминала, которые соединены между собой кабелем. Грузоприемная платформа может быть размещена на полу или на столе. В комплект поставки входят два кронштейна, с помощью которых терминал можно прикрепить либо непосредственно к модулю ТВ-S, либо закрепить его на стене.",
    price: "210915",
    img: "/images/fulls/scale/50.jpg",

    code: 5013,
  },
  {
    link: "scale_mk_r2l.html",
    title: "Весы торговые с печатью этикеток МК_R2L10-1",
    desc: "Весы предназначены для маркировки и учета весовых, штучных и счетных товаров за прилавком. Память на 20000 товаров. Печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов, регистрируют товароучетные операции (прием, отпуск, списание, инвентаризация).",
    price: "217243",
    img: "/images/fulls/scale/40.jpg",

    code: 5012,
  },
  {
    link: "scale_tb_m.html",
    title: "Весы ТВ-M_RP с принтером этикеток",
    desc: "Напольные товарные весы с вертикальной стойкой. Жидкокристаллический индикатор с подсветкой. Встроенный аккумулятор обеспечивает автономную работу весов до 15 часов. Счетный режим.",
    price: "218655",
    img: "/images/fulls/scale/92.jpg",

    code: 5018,
  },
  // {
  //     link: "scale_tbs_ra.html",
  //     title: "Весы товарные ТВ-S_RA с регистрацией товароучетных операций",
  //     desc: "Напольные товарные весы с вертикальной стойкой. Возможна работа в счетном режиме. Обеспечена возможность подключения к весам сканера штрихкодов и дозатора. Весы регистрируют товароучетные операции (прием, отпуск, списание, инвентаризация). Легко интегрируются в системы учета, в том числе в режиме весового терминала сбора данных. ",
  //     price: "96285",
  //     img: "/images/scale/91.jpg",
  //     position: ["floor"],
  //     weight: 200,
  //     interface: ["serial", "usb"],
  //     integration: [],
  //     series: "tb",
  // },
  {
    link: "scale_rls_1100.html",
    title: "Весы Rongta RLS1100 с принтером этикеток",
    desc: "Весы Rongta RLS1100 успешно могут использоваться в магазинах, в супермаркетах и на фасовке, они не только могут взвешивать товар, но и производить полную калькуляцию покупки. Вакуумно-флуоресцентный дисплей покупателя установлен на высокой и устойчивой стойке, и хорошо виден над витринами.",
    price: "158921",
    img: "/images/thumbs/scale/rls1.png",

    code: 4488,
  },
  {
    link: "scale_rls_1100c.html",
    title: "Весы Rongta RLS1100 C с принтером этикеток",
    desc: "Весы Rongta RLS1100 C успешно могут использоваться в магазинах, в супермаркетах и на фасовке, они не только могут взвешивать товар, но и производить полную калькуляцию покупки.",
    price: "158920",
    img: "/images/thumbs/scale/rls11.png",

    code: 5089,
  },

  // ============================================================== банкноты =============================================================================

  {
    link: "dors_ct_1015.html",
    title: "Счетчики банкнот DORS CT1015",
    desc: "Весы предназначены для измерений массы различных грузов при торговых, учетных и технологических операциях. Легко интегрируются с учетными системами, POS-системами и смарт-терминалами. Позволяют работать в счетном и дозаторном режиме, режимах процентного взвешивания и контроля массы (компараторный режим).",
    price: "30988",
    img: "/images/fulls/schetchiki/11.jpg",

    code: 8001,
  },
  {
    link: "dors_ct_1040.html",
    title: "Счетчики банкнот жидкокристаллические DORS CT1040",
    desc: "Cчетчики банкнот DORS CT1040 Series позволяют пересчитывать банкноты различных валют. Рекомендуются для пересчета однородной по номиналу денежной массы в местах с небольшим и средним оборотом наличных средств.",
    price: "53582",
    img: "/images/fulls/schetchiki/2.png",

    code: 8002,
  },
  {
    link: "dors_600.html",
    title: "Счетчики банкнот светодиодные DORS 600 М2",
    desc: "Счетчик банкнот DORS 600М2 обладает повышенной надежностью и большим ресурсом работы и рекомендуется для пересчета однородной по номиналу денежной массы в местах с большим оборотом наличных средств.",
    price: "106907",
    img: "/images/fulls/schetchiki/3.png",

    code: 8003,
  },
  {
    link: "magner_35_s.html",
    title: "Счетчики банкнот светодиодные Magner 35S",
    desc: "Отсутствие широкого набора дополнительных функций обеспечивает счетчику банкнот Magner 35 S невысокую стоимость, сочетающуюся с отличными техническими характеристиками прибора.",
    price: "246239",
    img: "/images/fulls/schetchiki/6.jpg",

    code: 8004,
  },
  {
    link: "magner_35_2003.html",
    title: "Счетчики банкнот жидкокристаллические Magner 35-2003",
    desc: "Magner 35-2003 с обновленным дизайном и увеличенным приёмным карманом является продолжателем серии простых и надежных приборов Magner 35, предназначенных для пересчёта банкнот разной степени изношенности.",
    price: "209536",
    img: "/images/fulls/schetchiki/7.jpg",
    display: "crystal",
    speed: 1500,
    detection: ["geometry", "optic"],
    series: "magner",
    code: 8005,
  },
  {
    link: "magner_75_d.html",
    title: "Счетчики банкнот жидкокристаллические Magner 75 D",
    desc: "Счетчик банкнот Magner 75 D — высококачественный и надежный мультивалютный счетчик, предназначенный для быстрого пересчета банкнот с проверкой на подлинность по размеру купюры.",
    price: "301716",
    img: "/images/fulls/schetchiki/8.png",
    display: "crystal",
    speed: 1500,
    detection: ["geometry"],
    series: "magner",
    code: 8006,
  },
  {
    link: "magner_750.html",
    title: "Счетчики монохромные жидкокристаллические DORS 750",
    desc: "Dors 750 — это счетчик банкнот, оснащенный системой автоматического определения типа валюты, номинала и надежным блоком детекции подлинности. Высокая скорость счета, безотказность и емкие карманы обеспечивают Dors 750 производительностью.",
    price: "351107",
    img: "/images/fulls/schetchiki/4.jpg",
    display: "crystal",
    speed: 1500,
    detection: ["optic", "uf", "geometry", "ik"],
    series: "dors",
    code: 8007,
  },
  {
    link: "magner_800.html",
    title: "Счетчики банкнот цветные сенсорные DORS 800",
    desc: "Двухкарманный мультивалютный счетчик банкнот банковского класса DORS 800 Multi с определением номинала, детекцией по 9 признакам и функцией сортировки, гарантирует Вам быстрое решение любой задачи по обработке наличности.",
    price: "432632",
    img: "/images/fulls/schetchiki/5.jpg",
    display: "crystal",
    speed: 1500,
    detection: ["optic", "uf", "geometry", "ik", "magnit"],
    series: "dors",
    code: 8008,
  },
  {
    link: "magner_100.html",
    title: "Счетчики банкнот графические Magner 100",
    desc: "Интеллектуальный мультивалютный счётчик банкнот Magner 100 Digital предназначен для пересчёта и проверки подлинности тенге, долларов и евро с определением номинала и ориентации.",
    price: "708158",
    img: "/images/fulls/schetchiki/9.png",
    display: "crystal",
    speed: 1100,
    detection: ["uf", "geometry", "ik", "magnit", "optic"],
    series: "magner",
    code: 8009,
  },
  {
    link: "magner_150.html",
    title: "Счетчики банкнот графические Magner 150",
    desc: "Профессиональный двухкарманный счетчик банкнот Magner 150 Digital — самая популярная модель среди устройств своего уровня. Аппарат обеспечивает надежные пересчет, сортировку и детекцию на подлинность тенге, долларов США и евро.",
    price: "767000",
    img: "/images/fulls/schetchiki/10.jpg",
    display: "crystal",
    speed: 1500,
    detection: ["optic", "uf", "geometry", "ik", "magnit"],
    series: "magner",
    code: 8010,
  },
  {
    link: "magner_175.html",
    title: "Счетчики банкнот жидкокристаллические Magner 175",
    desc: "Мультивалютный двухкарманный сортировщик банкнот Magner 175F с функцией сортировки по ветхости предназначен для работы с любым объемом наличности. Предусмотрен режим раздельного учета операций для двух кассиров. Возможно расширение до 10 валют.",
    price: "1235000",
    img: "/images/fulls/schetchiki/20.png",
    display: "crystal",
    speed: 1500,
    detection: ["optic", "uf", "geometry", "ik", "magnit", "doubled"],
    series: "magner",
    code: 8011,
  },

  {
    // ____________________________________Холодильные шкафы стеклянные однодверные___________________________________________
    link: "dm105s.html",
    title: "Холодильный шкаф Polair DM105-S",
    desc: "Холодильный шкаф Polair DM105-S – идеальное решение для продажи напитков и продуктов. Современный и надежный шкаф оснащен профессиональной динамической холодильной системой, имеет цельнозаливной пенополиуретаном корпус из стали с полимерным покрытием (снаружи и изнутри).",
    img: "/images/fulls/holod/shkaf/polair/9.jpg",
    price: 349650,
    code: "1517",
  },
  {
    link: "dm107s.html",
    title: "Холодильный шкаф Polair DM107-S без канапе",
    desc: "Холодильный шкаф DM107-S – вместительный и функциональный, позволяет хранить и экспонировать значительные объемы продуктов и напитков. Подходит для предприятий общественного питания и магазинов всех форматов и форм торговли. Вертикальная подсветка равномерно освещает товар на всех полках шкафа.",
    img: "/images/fulls/holod/shkaf/polair/10.png",
    price: 425130,
    code: "1518",
  },
  {
    link: "dp102s.html",
    title: "Холодильный шкаф Polair DP102-S",
    desc: "Шкаф разработан в соответствии с требованиями самых взыскательных покупателей к высокому качеству демонстрации и продажи икры и пресервов, надежному хранению этих деликатных продуктов, оптимизации торговых площадей и работы персонала, элегантному и современному дизайну оборудования, способному органично вписаться в любой интерьер.",
    img: "/images/fulls/holod/shkaf/polair/16.jpg",
    price: 320235,
    code: "1522",
  },
  {
    link: "dm102_bravo.html",
    title: "Холодильный шкаф Polair DM102-Bravo",
    desc: "Холодильный шкаф Polair DM102-Bravo с замком предназначен для демонстрации и продажи продуктов и напитков.",
    img: "/images/fulls/holod/shkaf/polair/17.jpg",
    price: 298035,
    code: "1523",
  },
  {
    link: "dm104_bravo.html",
    title: "Холодильный шкаф Polair DM104-Bravo",
    desc: "POLAIR Bravo – компактные и вместительные холодильные шкафы объемом до 400 л. Цельнозаливной корпус, динамическая система охлаждения, увеличенная нагрузка на полку - до 50 кг, подсветка выкладки и канапе светодиодными лампами.",
    img: "/images/fulls/holod/shkaf/polair/19.jpg",
    price: 344100,
    code: "1524",
  },
  {
    link: "bc105.html",
    title: "Холодильный шкаф Polair BC105",
    desc: "Холодильный шкаф Polair со стеклянными дверьми Polair BC105 предназначен для охлаждения, хранения, демонстрации и продажи практически любого вида товара. Данный шкаф изготовлен из цельнозаливного корпуса, а так же имеет небольшой воздухоохладитель и обладает высокой эффективностью и пониженным шумом.",
    img: "/images/fulls/holod/shkaf/polair/20.jpg",
    price: 167960,
    code: "1525",
  },
  {
    link: "shx.html",
    title: "Холодильный шкаф ШХ",
    desc: "Холодильный шкаф ШХ специально разработан для демонстрации и продажи икры, рыбных деликатесов и пресервов с учетом всех требований к условиям хранения и экспозиции этих деликатных продуктов с температурой хранения от -6°С до 6°С.",
    img: "/images/fulls/holod/shkaf/1.jpg",
    price: 162504,
    code: "1502",
  },
  {
    link: "bonvini.html",
    title: "Холодильный шкаф Bonvini",
    desc: "Bonvini - профессиональные холодильные шкафы, современная светодиодная подсветка, имеющая компактные размеры, своим белым холодным цветом свечения, придает особый, привлекательный вид охлаждаемому продукту.",
    img: "/images/fulls/holod/shkaf/20.jpg",
    price: 429000,
    code: "1515",
  },
  {
    link: "capri390.html",
    title: "Холодильный шкаф Capri П-390С",
    desc: "Шкаф холодильный Capri П-390С среднетемпературный предназначен для кратковременного хранения, демонстрации и продажи, пред- варительно охлаждённых до температуры охлаждаемого объёма, пищевых продуктов и напитков.",
    img: "/images/fulls/holod/shkaf/2.jpg",
    price: 309393,
    code: "1503",
  },
  {
    link: "capri490ck.html",
    title: "Холодильный шкаф Capri П-490СК",
    desc: "Шкаф холодильный Capri П-490СК среднетемпературный предназначен для кратковременного хранения, демонстрации и продажи, пред- варительно охлаждённых до температуры охлаждаемого объёма, пищевых продуктов и напитков.",
    img: "/images/fulls/holod/shkaf/3.jpg",
    price: 162410,
    code: "1504",
  },
  {
    link: "carboma.html",
    title: "Холодильный шкаф Carboma ULTRA",
    desc: "Холодильный шкаф Carboma ULTRA - это современный элегантный дизайн Вашего магазина, бара, ресторана, высокая надежность,значительная экономия в потреблении электроэнергии.",
    img: "/images/fulls/holod/polus/shkaf/1.png",
    price: 391870,
    code: "1512",
  },
  {
    link: "holodilnyi_shkaf_carboma.html",
    title: "Холодильный шкаф Carboma Premium",
    desc: "Холодильный шкаф Carboma Premium предназначен для демонстрации напитков, кондитерских изделий и десертов в магазинах, кафе, ресторанах.",
    img: "/images/fulls/holod/polus/shkaf/3.png",
    price: 422330,
    code: "1513",
  },
  {
    link: "capri05ck.html",
    title: "Холодильный шкаф Capri 0,5СК",
    desc: "Холодильные шкафы Капри 0,5СК бывают двух размеров. Данные шкафы предназначены для кратковременного хранения, демонстрации и продажи, предварительно охлажденных до температуры охлаждаемого объема, пищевых продуктов и напитков.",
    img: "/images/fulls/holod/shkaf/4.jpg",
    price: 340805,
    code: "1505",
  },

  // _________________________________Холодильные шкафы стеклянные двухдверные________________________________________________________

  {
    link: "dm110s.html",
    title: "Холодильный шкаф Polair DM110-S без канапе",
    desc: "Компактный и вместительный шкаф с распашными дверьми в алюминиевых рамах с легко заменяемыми стеклопакетами, съемным уплотнителем с магнитной вставкой, механизмом самозакрывания.",
    img: "/images/fulls/holod/shkaf/polair/12.png",
    price: 563325,
    code: "1519",
  },
  {
    link: "dm110sd.html",
    title: "Холодильный шкаф Polair DM110Sd-S",
    desc: "Холодильный шкаф Polair DM110Sd-S с раздвижными дверьми – купе – отличное решение для продажи напитков и продуктов на предприятиях торговли и общественного питания любых форматов и любой площади.",
    img: "/images/fulls/holod/shkaf/polair/14.jpg",
    price: 569430,
    code: "1520",
  },
  {
    link: "dv110s.html",
    title: "Холодильный шкаф Polair DV110-S",
    desc: "Холодильный шкаф Polair с универсальным температурным режимом подойдет для хранения и продажи широкого ассортимента охлажденных продуктов и пресервов.",
    img: "/images/fulls/holod/shkaf/polair/15.jpg",
    price: 628260,
    code: "1521",
  },
  {
    link: "bc110sd.html",
    title: "Холодильный шкаф Polair BC110Sd",
    desc: "Холодильный шкаф Polair со стеклянными дверьми Polair BC110Sd предназначен для охлаждения, хранения, демонстрации и продажи практически любого вида товара. Данный шкаф изготовлен из цельнозаливного корпуса.",
    img: "/images/fulls/holod/shkaf/polair/21.jpg",
    price: 237960,
    code: "1526",
  },
  {
    link: "capri080c.html",
    title: "Холодильный шкаф ШХ 0,80C Купе",
    desc: "Холодильный шкаф ШХ 0,80С Купе бывает двух видов - со статическим охлаждением и с динамическим охлаждением. Данные шкафы предназначены для хранения, демонстрации и продажи пищевых продуктов и напитков в предприятиях торговли: магазинах различных форматов, рынках, павильонах.",
    img: "/images/fulls/holod/shkaf/5.jpg",
    price: 448490,
    code: "1506",
  },
  {
    link: "shx080c.html",
    title: "Холодильный шкаф ШХ 0,80C",
    desc: "Холодильный шкаф ШХ 0,80С предназначен для хранения, демонстрации и продажи пищевых продуктов и напитков в предприятиях торговли: магазинах различных форматов, рынках, павильонах. В холодильном шкафу ШХ используется динамическое охлаждение.",
    img: "/images/fulls/holod/shkaf/6.jpg",
    price: 487205,
    code: "1507",
  },
  {
    link: "elton07.html",
    title: "Холодильный шкаф Elton 0,7 купе",
    desc: "Холодильный шкаф Elton 0,7 купе — используется во всех форматах продовольственных магазинов, барах, ресторанах, кафе, столовых.",
    img: "/images/fulls/holod/shkaf/7.jpg",
    price: 271585,
    code: "1508",
  },
  {
    link: "capri112ck.html",
    title: "Холодильный шкаф Capri 1,12СК Купе",
    desc: "Холодильные шкафы Capri 1,12СК Купе бывают двух видов - со статическим охлаждением и с динамическим охлаждением.",
    img: "/images/fulls/holod/shkaf/8.jpg",
    price: 571027,
    code: "1509",
  },
  {
    link: "capri15ck.html",
    title: "Холодильный шкаф Capri 1,5СК Купе",
    desc: "Холодильный шкаф Capri 1,5СК Купе бывает двух видов - со статическим охлаждением и с динамическим охлаждением. Данные шкафы используются во всех форматах продовольственных магазинов, барах, ресторанах, кафе, столовых.",
    img: "/images/fulls/holod/shkaf/9.jpg",
    price: 619616,
    code: "1510",
  },
  {
    link: "elton15c.html",
    title: "Холодильный шкаф Elton 1,5С Купе",
    desc: "Холодильный шкаф Elton 1,5С Купе используется во всех форматах продовольственных магазинов, барах, ресторанах, кафе, столовых.Холодильный шкаф является универсальным видом оборудования.",
    img: "/images/fulls/holod/shkaf/10.jpg",
    price: 437190,
    code: "1511",
  },

  // ________________________________Холодильные шкафы с глухими дверьми_____________________________________________________
  {
    link: "cm105s.html",
    title: "Холодильный шкаф CM105-S",
    desc: "Практичный и надежный, компактный и вместительный, создан для применения на предприятиях торговли и общественного питания. Удобен для хранения упакованных молочных, гастрономических продуктов, кулинарии, кондитерских изделий, фруктов и овощей и т.п.",
    img: "/images/fulls/holod/shkaf/polair/1.jpg",
    price: 344655,
    code: "1525",
  },
  {
    link: "cm110s.html",
    title: "Холодильный шкаф CM110-S",
    desc: "Надежный и вместительный шкаф удобен для использования в помещениях различных назначений и размеров предприятий торговли и общепита. Благодаря продуманной конструкции корпуса легко пройдет в дверной проем любой ширины. СМ110-S предназначен для хранения охлажденных гастрономических изделий, молочных продуктов, полуфабрикатов различной степени готовности, кондитерских изделий и т.п.",
    img: "/images/fulls/holod/shkaf/polair/2.jpg",
    price: 512265,
    code: "1526",
  },
  {
    link: "cm105sm.html",
    title: "Холодильный шкаф CM105-Sm",
    desc: "Практичный и надежный, компактный и вместительный, создан для применения на предприятиях торговли и общественного питания. Удобен для хранения упакованных молочных, гастрономических продуктов, кулинарии, кондитерских изделий, фруктов и овощей и т.п.",
    img: "/images/fulls/holod/shkaf/polair/3.jpg",
    price: 391275,
    code: "1527",
  },
  {
    link: "cm110sm.html",
    title: "Холодильный шкаф CM110-Sm",
    desc: "Надежный и вместительный шкаф удобен для использования в помещениях различных назначений и размеров предприятий торговли и общепита. Благодаря продуманной конструкции корпуса легко пройдет в дверной проем любой ширины. СМ110-Sm предназначен для хранения охлажденных гастрономических изделий, молочных продуктов, полуфабрикатов различной степени готовности, кондитерских изделий и т.п.",
    img: "/images/fulls/holod/shkaf/polair/4.jpg",
    price: 572205,
    code: "1528",
  },
  {
    link: "cm105g.html",
    title: "Холодильный шкаф CM105-G",
    desc: "Холодильный шкаф POLAIR CM105-G серии Grande предназначен для демонстрации и хранения продуктов на предприятиях общественного питания и торговли. Корпус изготовлен из нержавеющей стали снаружи и изнутри (кроме задней стенки) и обеспечивает механическую прочность и долговечность шкафа.",
    img: "/images/fulls/holod/shkaf/polair/5.jpg",
    price: 523365,
    code: "1529",
  },
  {
    link: "cm110g.html",
    title: "Холодильный шкаф CM110-G",
    desc: "Холодильный шкаф POLAIR CM110-G серии Grande предназначен для демонстрации и хранения продуктов на предприятиях общественного питания и торговли. Корпус изготовлен из нержавеющей стали снаружи и изнутри (кроме задней стенки) и обеспечивает механическую прочность и долговечность шкафа.",
    img: "/images/fulls/holod/shkaf/polair/6.jpg",
    price: 733710,
    code: "1530",
  },
  {
    link: "cm105gm.html",
    title: "Холодильный шкаф CM105-Gm",
    desc: "Холодильный шкаф POLAIR CM105-Gm серии Grande modificato предназначен для демонстрации и хранения продуктов на предприятиях общественного питания и торговли. Цельнозаливной корпус изготовлен из нержавеющей стали снаружи и изнутри (кроме задней стенки) и обеспечивает механическую прочность и долговечность шкафа.",
    img: "/images/fulls/holod/shkaf/polair/8.jpg",
    price: 523365,
    code: "1531",
  },
  {
    link: "cm110gm.html",
    title: "Холодильный шкаф CM110-Gm",
    desc: "Холодильный шкаф POLAIR CM110-Gm серии Grande modificato предназначен для демонстрации и хранения продуктов на предприятиях общественного питания и торговли. Цельнозаливной корпус изготовлен из нержавеющей стали снаружи и изнутри (кроме задней стенки) и обеспечивает механическую прочность и долговечность шкафа. Оборудование рассчитано на работу при температуре окружающей среды до 40 °С и относительной влажности воздуха до 80%.",
    img: "/images/fulls/holod/shkaf/polair/7.jpg",
    price: 312151,
    code: "733710",
  },
  // {
  //     link: "carboma_met.html",
  //     title: "Холодильный шкаф с металлическими дверьми Carboma",
  //     desc: "Холодильные шкафы с металлическими дверьми Carboma - надежные в эксплуатации, многофункциональные шкафы, предназначенные для хранения и продажи охлажденных или замороженных пищевых продуктов и напитков на предприятиях торговли и общественного питания.",
  //     img: "themes/images/products/shkaf/main/2.png",
  //     price: 132219,
  //     code: "1516"
  // },
  {
    link: "kapri_nerjaveika.html",
    title: "Холодильный шкаф Capri нержавейка",
    desc: "Холодильные шкафы Капри нержавейка бывают двух размеров. Данные шкафы предназначены для кратковременного хранения, демонстрации и продажи, предварительно охлажденных до температуры охлаждаемого объема, пищевых продуктов и напитков.",
    img: "/images/fulls/holod/shkaf/polair/24.jpg",
    price: 678364,
    code: "1514",
  },
  // ____________________________________Фармацевтические холодильные шкафы________________________________________________
  {
    link: "shxf02.html",
    title: "Холодильный шкаф ШХФ-0,2",
    desc: "Холодильный шкаф ШХФ-0,2 предназначен для хранения лекарственных, биологических, ветеринарных препаратов в аптеках, медицинских, больничных и научно-исследовательских учреждениях, диагностических центрах и на предприятиях фармацевтической отрасли.",
    img: "/images/fulls/holod/shkaf/pharmacy/1.jpg",
    price: 325008,
    code: "1533",
  },
  {
    link: "shxf04.html",
    title: "Холодильный шкаф ШХФ-0,4",
    desc: "Холодильный шкаф ШХФ-0,4 серии Medico предназначен для хранения лекарственных, биологических, ветеринарных препаратов в аптеках, медицинских, больничных и научно-исследовательских учреждениях, диагностических центрах и на предприятиях фармацевтической отрасли.",
    img: "/images/fulls/holod/shkaf/pharmacy/2.jpg",
    price: 393606,
    code: "1534",
  },
  {
    link: "shxf05.html",
    title: "Холодильный шкаф ШХФ-0,5",
    desc: "Компактный и вместительный холодильный шкаф с динамической системой охлаждения, оснащен микропереключателем, светодиодной подсветкой, имеет механизм самозакрывания дверей, сторону открывания которых легко изменить. Предназначен для использования в качестве «холодного» и «прохладного» шкафов для хранения лекарственных средств.",
    img: "/images/fulls/holod/shkaf/pharmacy/3.jpg",
    price: 374958,
    code: "1535",
  },
  {
    link: "shxf1.html",
    title: "Холодильный шкаф ШХФ-1",
    desc: "Вместительный двухдверный холодильный шкаф объемом 1000 л, благодаря компактным размерам, легко пройдет в стандартный дверной проем. Электронный блок управления имеет настройки, позволяющие устанавливать нужную температуру в диапазоне от +1 до +15°С. Микропереключатель отключает вращение вентилятора воздухоохладителя и включает внутреннюю подсветку.",
    img: "/images/fulls/holod/shkaf/pharmacy/4.jpg",
    price: 525474,
    code: "1536",
  },
  {
    link: "shxf02_dc.html",
    title: "Холодильный шкаф ШХФ-0,2 ДС",
    desc: "Холодильный шкаф ШХФ-0,2 ДС серии Medico предназначен для хранения лекарственных, биологических, ветеринарных препаратов в аптеках, медицинских, больничных и научно-исследовательских учреждениях, диагностических центрах и на предприятиях фармацевтической отрасли.",
    img: "/images/fulls/holod/shkaf/pharmacy/5.jpg",
    price: 333666,
    code: "1537",
  },
  {
    link: "shxf04_dc.html",
    title: "Холодильный шкаф ШХФ-0,4 ДС",
    desc: "Холодильный шкаф ШХФ-0,4 ДС предназначен для хранения лекарственных, биологических, ветеринарных препаратов в аптеках, медицинских, больничных и научно-исследовательских учреждениях, диагностических центрах и на предприятиях фармацевтической отрасли.",
    img: "/images/fulls/holod/shkaf/pharmacy/6.jpg",
    price: 398934,
    code: "1538",
  },
  {
    link: "shxf05_dc.html",
    title: "Холодильный шкаф ШХФ-0,5 ДС",
    desc: "Холодильный шкаф со стеклянной дверью (стеклопакет в разборной алюминиевой раме) имеет вертикальную внутреннюю подсветку и подсветку канапе. Сторону открывания двери легко изменить. Внешние и внутренние обшивки шкафа изготовлены из стали с полимерным покрытием.",
    img: "/images/fulls/holod/shkaf/polair/9.jpg",
    price: 376956,
    code: "1539",
  },
  {
    link: "shxf1_dc.html",
    title: "Холодильный шкаф ШХФ-1,0 ДС",
    desc: "Холодильный шкаф объемом 1000 л с распашными стеклянными дверьми обеспечивает хранение существенного объема лекарственных средств, гарантируя их эффективное и равномерное охлаждение на всех полках шкафа. Динамическая система охлаждения, цельнозаливной корпус с обшивками из стали с полимерным покрытием – снаружи и изнутри, вертикальная внутренняя подсветка и подсветка канапе делают шкаф незаменимым для фармацевтических и медицинских учреждений.",
    img: "/images/fulls/holod/shkaf/polair/15.jpg",
    price: 604728,
    code: "1540",
  },

  // ________________________________Холодильные витрины_______________________________________________
  {
    link: "gc95.html",
    title: "Холодильная витрина GC95",
    desc: "Серия напольных холодильных витрин CARBOMA GC95 это: - лаконичные формы с одной целью: максимальный акцент на продукты; - только энергосберегающие технологии (низкоэмиссионное стекло, LED-освещение в базовой комплектации)",
    img: "/images/fulls/holod/polus/carboma/7.jpg",
    price: 329794,
    code: "1617",
  },
  {
    link: "gc110.html",
    title: "Холодильная витрина GC110",
    desc: "Серия напольных холодильных витрин CARBOMA GC110 это: - лаконичные формы с одной целью: максимальный акцент на продукты; - конфигурация любой формы и соединение в линии; - только энергосберегающие технологии (низкоэмиссионное стекло, LED-освещение в базовой комплектации)",
    img: "/images/fulls/holod/polus/carboma/8.jpg",
    price: 349700,
    code: "1639",
  },
  {
    link: "carboma_close.html",
    title: "Холодильная витрина Carboma закрытая",
    desc: "Холодильная витрина Carboma закрытая отличаются современным дизайном, оптимальными эргономическими показателями, эффективным уровнем энергопотребления и холодопроизводительности.",
    img: "/images/fulls/holod/polus/carboma/9.png",
    price: 378214,
    code: "1618",
  },
  {
    link: "carboma_open.html",
    title: "Холодильная витрина Carboma открытая",
    desc: "Холодильная витрина Carboma открытая отличаются современным дизайном, оптимальными эргономическими показателями, эффективным уровнем энергопотребления и холодопроизводительности.",
    img: "/images/fulls/holod/polus/carboma/999.jpg",
    price: 453534,
    code: "1619",
  },
  {
    link: "vitrina_polus.html",
    title: "Холодильная витрина Полюс",
    desc: "Холодильная витрина Полюс отличаются современным дизайном, оптимальными эргономическими показателями, эффективным уровнем энергопотребления и холодопроизводительности.",
    img: "/images/fulls/holod/polus/carboma/10.png",
    price: 319572,
    code: "1620",
  },
  {
    link: "vitrina_eko_maxi.html",
    title: "Холодильная витрина Эко Maxi",
    desc: "Холодильная витрина Эко Maxi отличаются современным дизайном, оптимальными эргономическими показателями, эффективным уровнем энергопотребления и холодопроизводительности.",
    img: "/images/fulls/holod/polus/carboma/20.jpg",
    price: 149093,
    code: "1621",
  },
  {
    link: "vitrina_eko_mini.html",
    title: "Холодильная витрина Эко Mini",
    desc: "Холодильная витрина Эко Mini отличаются современным дизайном, оптимальными эргономическими показателями, эффективным уровнем энергопотребления и холодопроизводительности.",
    img: "/images/fulls/holod/polus/carboma/30.jpg",
    price: 92093,
    code: "1622",
  },
  {
    link: "ilet_bhx.html",
    title: "Холодильная витрина ILET BXH",
    desc: "Холодильная витрина ILET BXH предназначены для презентации и продажи мяса, птицы, колбасно-молочных и гастрономических изделия в магазинах с небольшими торговыми площадями и узкими дверными проемами.",
    img: "/images/fulls/holod/vitrina/5.jpg",
    price: 482680,
    code: "1623",
  },
  {
    link: "ilet_bhc.html",
    title: "Холодильная витрина ILET BXC",
    desc: "Холодильная витрина ILET BXC для продовольственных магазинов любого формата, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, Carel или Danfoss, пенополиуретан BASF, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/5.jpg",
    price: 380260,
    code: "1624",
  },
  {
    link: "nova_bxh.html",
    title: "Холодильная витрина Nova ВХН",
    desc: "Холодильная витрина Nova ВХН эконом-класса для магазинов небольшой и средней площади, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, Carel или Danfoss, электродвигатели EBM PAPST, пенополиуретан BASF, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/7.jpg",
    price: 335116,
    code: "1625",
  },
  {
    link: "tair_bxh.html",
    title: "Холодильная витрина Tair ВХН",
    desc: "Холодильная витрина Tair ВХН для магазинов небольшой и средней площади, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, Carel или Danfoss, электродвигатели EBM PAPST, пенополиуретан BASF, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/8.jpg",
    price: 389060,
    code: "1626",
  },
  {
    link: "ilet_bxcd.html",
    title: "Холодильная витрина ILET BXCD",
    desc: "Холодильная витрина ILET BXCD для магазинов небольшой и средней площади, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, Carel или Danfoss, электродвигатели EBM PAPST, пенополиуретан BASF, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/9.jpg",
    price: 462837,
    code: "1627",
  },
  {
    link: "ilet_bxcho.html",
    title: "Холодильная витрина ILET BXCO",
    desc: "Холодильная витрина ILET BXCO для продовольственных магазинов любого формата, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, Carel или Danfoss, пенополиуретан BASF, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/1000.jpg",
    price: 368181,
    code: "1629",
  },
  {
    link: "holodilnaia_vitrina_bhco_uh.html",
    title: "Холодильная витрина ВХСо-УН",
    desc: "Холодильная витрина для продовольственных магазинов любого формата, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss, контроллер Evco, Carel или Danfoss, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/12.jpg",
    price: 265702,
    code: "1617",
  },
  {
    link: "holodilnaia_vitrina_bhc_uh.html",
    title: "Холодильная витрина ВХС-УН Илеть",
    desc: "Среднетемпературные холодильные витрины: угол внутренний ВХС-УВ Илеть и угол наружный ВХС-УН Илеть (внутренний и наружный угловые модули 90°), предназначены для хранения, демонстрации и продажи предварительно охлаждённых пищевых продуктов в продовольственных магазинах любого формата, кафе, других предприятиях общественного питания.",
    img: "/images/fulls/holod/vitrina/13.jpg",
    price: 282337,
    code: "1631",
  },
  {
    link: "tair_bxc_uh.html",
    title: "Холодильная витрина Tair ВХС-УН",
    desc: "Холодильная витрина Tair ВХС-УН (наружный и внутренний угловые модули 90°), обслуживаемые продавцом, предназначены для демонстрации и продажи предварительно охлаждённых пищевых продуктов и позволяют составлять из витрин марки Таир линии специальной конфигурации с поворотами.",
    img: "/images/fulls/holod/vitrina/14.jpg",
    price: 569655,
    code: "1633",
  },
  {
    link: "tair_bxc_ub.html",
    title: "Холодильная витрина Tair ВХС-УВ",
    desc: "Холодильная витрина Tair ВХС-УВ (наружный и внутренний угловые модули 90°), обслуживаемые продавцом, предназначены для демонстрации и продажи предварительно охлаждённых пищевых продуктов и позволяют составлять из витрин марки Таир линии специальной конфигурации с поворотами.",
    img: "/images/fulls/holod/vitrina/15.jpg",
    price: 573441,
    code: "1634",
  },
  {
    link: "parabel_bxc.html",
    title: "Холодильная витрина Parabel ВХС",
    desc: "Холодильная витрина Parabel ВХС c механизмом подъема стекла для магазинов небольшой и средней площади, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/19.jpg",
    price: 347870,
    code: "1635",
  },
  {
    link: "parabel_bxc_ub.html",
    title: "Холодильная витрина Parabel ВХС-УВ",
    desc: "Холодильная витрина Parabel ВХС-УВ c механизмом подъема стекла для магазинов небольшой и средней площади, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/17.jpg",
    price: 475990,
    code: "1636",
  },
  {
    link: "parabel_bxc_uh.html",
    title: "Холодильная витрина Parabel ВХС-УН",
    desc: "Холодильная витрина Parabel ВХС-УН c механизмом подъема стекла для магазинов небольшой и средней площади, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/17.jpg",
    price: 719778,
    code: "1637",
  },
  {
    link: "parabel_bxco.html",
    title: "Холодильная витрина Parabel ВХСo",
    desc: "Холодильная витрина Parabel ВХСo c механизмом подъема стекла для магазинов небольшой и средней площади, для продажи гастрономии, молочных продуктов, пресервов, кондитерских и замороженных продуктов. Используются импортные комплектущие: компрессор Danfoss или Tecumseh, контроллер Evco, пищевая нержавеющая сталь.",
    img: "/images/fulls/holod/vitrina/19.jpg",
    price: 299344,
    code: "1638",
  },
  {
    link: "cryspi_octava_SN_1200.html",
    title: "Холодильная витрина CRYSPI Octava SN 1200",
    desc: "Холодильная витрина Cryspi Octava SN 1200 предназначена для демонстрации, охлаждения и кратковременного хранения скоропортящихся продуктов на предприятиях торговли и общественного питания. Модель оснащена изогнутым фронтальным стеклом, люминесцентной подсветкой и вместительной охлаждаемой камерой для хранения запаса товара. Экспозиционная и рабочая поверхности выполнены из нержавеющей стали, боковые панели - из ударопрочного ABS-пластика, теплоизоляция - из пенополиуретана.",
    img: "/images/crispiOctava1.jpg",
    price: 203268,
    code: "",
  },
  {
    link: "cryspi_octava_SN_1500.html",
    title: "Холодильная витрина CRYSPI Octava SN 1500",
    desc: "Холодильная витрина Cryspi Octava SN 1500 предназначена для демонстрации, охлаждения и кратковременного хранения скоропортящихся продуктов на предприятиях торговли и общественного питания. Модель оснащена изогнутым фронтальным стеклом, люминесцентной подсветкой и вместительной охлаждаемой камерой для хранения запаса товара. Экспозиционная и рабочая поверхности выполнены из нержавеющей стали, боковые панели - из ударопрочного ABS-пластика, теплоизоляция - из пенополиуретана.",
    img: "/images/crispiOctava2.jpg",
    price: 229196,
    code: "",
  },
  {
    link: "cryspi_octava_SN_1800.html",
    title: "Холодильная витрина CRYSPI Octava SN 1800",
    desc: "Холодильная витрина Cryspi Octava SN 1800 предназначена для демонстрации, охлаждения и кратковременного хранения скоропортящихся продуктов на предприятиях торговли и общественного питания. Модель оснащена изогнутым фронтальным стеклом, люминесцентной подсветкой и вместительной охлаждаемой камерой для хранения запаса товара. Экспозиционная и рабочая поверхности выполнены из нержавеющей стали, боковые панели - из ударопрочного ABS-пластика, теплоизоляция - из пенополиуретана.",
    img: "/images/crispiOctava3.jpg",
    price: 254551,
    code: "",
  },
  {
    link: "kp_gamma_1200.html",
    title: "Холодильная витрина CRYSPI Gamma2 SN 1200",
    desc: "Витрина универсальная CRYSPI Gamma-2 SN 1200 — современное холодильное оборудование с автоматической разморозкой и встроенным холодильным агрегатом. Работает с системой гравитационного охлаждения. В качестве хладагента выбран экологически безопасный R404А.",
    img: "/images/crispiGamma1.jpg",
    price: 234027,
    code: "",
  },
  {
    link: "kp_gamma_1500.html",
    title: "Холодильная витрина CRYSPI Gamma2 SN 1500",
    desc: "Витрина универсальная CRYSPI Gamma-2 SN 1500 — современное холодильное оборудование с автоматической разморозкой и встроенным холодильным агрегатом. Работает с системой гравитационного охлаждения. В качестве хладагента выбран экологически безопасный R404А.",
    img: "/images/crispiGamma2.jpg",
    price: 262042,
    code: "",
  },
  {
    link: "kp_gamma_1800.html",
    title: "Холодильная витрина CRYSPI Gamma2 SN 1800",
    desc: "Витрина универсальная CRYSPI Gamma-2 SN 1800 — современное холодильное оборудование с автоматической разморозкой и встроенным холодильным агрегатом. Работает с системой гравитационного охлаждения. В качестве хладагента выбран экологически безопасный R404А.",
    img: "/images/crispiGamma3.jpg",
    price: 254551,
    code: "",
  },

  // ______________________________Пристенные холодильные витрины________________________________________
  {
    link: "gorka_snezh_garda_1250x710.html",
    title: "Горка СНЕЖ GARDA (1250 x 710)",
    desc: "Холодильная горка Снеж Garda 1250 используется на предприятиях общественного питания и торговли для охлаждения, кратковременного хранения, демонстрации и продажи напитков, мяса, птицы, колбасных, молочных и гастрономических изделий. Модель оснащена 4 навесными полками с ограничителями и ночной шторкой. ",
    img: "/images/fulls/holod/shkaf/shkafNew1.jpg",
    price: 787144,
    code: "0",
  },

  {
    link: "gorka_snezh_garda_1875x710.html",
    title: "Горка СНЕЖ GARDA (1875 x 710)",
    desc: "Холодильная горка Снеж Garda 1875 используется на предприятиях общественного питания и торговли для охлаждения, кратковременного хранения, демонстрации и продажи напитков, мяса, птицы, колбасных, молочных и гастрономических изделий. Модель оснащена 4 навесными полками с ограничителями и ночной шторкой.  ",
    img: "/images/fulls/holod/shkaf/shkafNew22.jpg",
    price: 941474,
    code: "0",
  },

  {
    link: "gorka_snezh_garda_2500x710.html",
    title: "Горка СНЕЖ GARDA (2500 x 710)",
    desc: "Холодильная горка Снеж Garda 2500 используется на предприятиях общественного питания и торговли для охлаждения, кратковременного хранения, демонстрации и продажи напитков, мяса, птицы, колбасных, молочных и гастрономических изделий. Модель оснащена 4 навесными полками с ограничителями и ночной шторкой. ",
    img: "/images/fulls/holod/shkaf/shkafNew333.jpg",
    price: 1216584,
    code: "0",
  },

  {
    link: "gorka_snezh_garda_1250x830.html",
    title: "Горка СНЕЖ GARDA (1250 x 830)",
    desc: "Холодильная горка Снеж Garda 1250 используется на предприятиях общественного питания и торговли для охлаждения, кратковременного хранения, демонстрации и продажи напитков, мяса, птицы, колбасных, молочных и гастрономических изделий. Модель оснащена 4 навесными полками с ограничителями и ночной шторкой.",
    img: "/images/fulls/holod/shkaf/shkafNewMain3.jpg",
    price: 807274,
    code: "0",
  },
  {
    link: "gorka_snezh_garda_1875x830.html",
    title: "Горка СНЕЖ GARDA (1875 x 830)",
    desc: "Холодильная горка Снеж Garda 1875 используется на предприятиях общественного питания и торговли для охлаждения, кратковременного хранения, демонстрации и продажи напитков, мяса, птицы, колбасных, молочных и гастрономических изделий. Модель оснащена 4 навесными полками с ограничителями и ночной шторкой. ",
    img: "/images/fulls/holod/shkaf/shkafNew555.jpg",
    price: 981734,
    code: "0",
  },
  {
    link: "gorka_snezh_garda_2500x830.html",
    title: "Горка СНЕЖ GARDA (2500 x 830)",
    desc: "Холодильная горка Снеж Garda 2500 используется на предприятиях общественного питания и торговли для охлаждения, кратковременного хранения, демонстрации и продажи напитков, мяса, птицы, колбасных, молочных и гастрономических изделий. Модель оснащена 4 навесными полками с ограничителями и ночной шторкой. ",
    img: "/images/fulls/holod/shkaf/shkafNew666.jpg",
    price: 1283684,
    code: "0",
  },
  {
    link: "carboma_cuba.html",
    title: "Пристенная холодильная витрина Carboma Cuba",
    desc: "Холодильная витрина Carboma Cuba отличаются современным дизайном, оптимальными эргономическими показателями, эффективным уровнем энергопотребления и холодопроизводительности.Пристенная холодильная витрина CARBOMA CUBA позволяют эффективно использовать торговое пространство благодаря компактным внешним размерам и эргономичному кубическому дизайну.",
    img: "/images/fulls/holod/polus/pristen/1.jpg",
    price: 618700,
    code: "1717",
  },
  {
    link: "carboma_tokyo.html",
    title: "Пристенная холодильная витрина Carboma Tokyo",
    desc: "Пристенная холодильная витрина Carboma Tokyo - идеальное предложение для магазинов любого формата. Благодаря своим небольшим размерам при увеличенной выкладке товара, может быть использована для промо-продаж.",
    img: "/images/fulls/holod/polus/pristen/2.jpg",
    price: 777410,
    code: "1718",
  },
  {
    link: "carboma_britany.html",
    title: "Пристенная холодильная витрина Carboma Britany",
    desc: "Пристенная холодильная витрина Carboma Britany - идеальное предложение для магазинов любого формата, а также для точек общественного питания. Обеспечит активные продажи как в пристенном, так и в островном размещении, привлекая покупателей современным дизайном, оптимальным мерчандайзингом при небольших габаритных размерах.",
    img: "/images/fulls/holod/polus/pristen/3.jpg",
    price: 480434,
    code: "1719",
  },
  {
    link: "carboma_crete.html",
    title: "Пристенная холодильная витрина Carboma Crete",
    desc: "Широкий модельный ряд пристенных холодильных витрин CARBOMA CRETE отличается повышенной обзорностью продуктов за счет панорамных боковин и увеличенной площадью выкладки.",
    img: "/images/fulls/holod/polus/pristen/4.jpg",
    price: 266019,
    code: "1720",
  },
  {
    link: "carboma_provance.html",
    title: "Пристенная холодильная витрина Carboma Provance",
    desc: "Пристенная холодильная витрина Carboma Provance предназначены для торговых залов малого и среднего формата. Сочетают в себе надежность, эргономичность.",
    img: "/images/fulls/holod/polus/pristen/5.jpg",
    price: 233079,
    code: "1721",
  },
  {
    link: "carboma_polus.html",
    title: "Пристенная холодильная витрина Carboma Polus",
    desc: "Увеличенная площадь выкладки в сочетании с Пристенная холодильная витрина ПОЛЮС. Высокая функциональность и точное соблюдение температурного режима обеспечивают надежную работу стеллажа и гарантируют сохранение свежести продуктов.",
    img: "/images/fulls/holod/polus/pristen/6.jpg",
    price: 333196,
    code: "1722",
  },
  {
    link: "florence.html",
    title: "Пристенная холодильная витрина Florence",
    desc: "Пристенная холодильная витрина Florence - эффективное решение для магазинов и супермаркетов небольшой площади. Она отличается энергоемкостью, удобна и проста в эксплуатации. Florence снабжена верхним освещением, емкостью для сбора талой воды с функцией выпаривания, высокоэффективным испарителем и четырьмя полками с возможностью установки под наклоном для удобства демонстрации содержимого покупателям.",
    img: "/images/fulls/holod/pristen/1.jpg",
    price: 513810,
    code: "1723",
  },
  //  {
  //     link: "varshava_bxc.html",
  //     title: "Пристенная холодильная витрина Varshava 210",
  //     desc: "Пристенная холодильная витрина Varshava 210: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин имеют возможность регулировки угла наклона полки 0°, -10° и -20°.",
  //     img: "themes/images/products/pristen/main/2.jpg",
  //     price: 698780,
  //     code: "1724"
  // },
  // {
  //     link: "varshava_bxc_fruit.html",
  //     title: "Пристенная холодильная витрина Varshava 210 фруктовая",
  //     desc: "Холодильная пристенная витрина Varshava фруктовая: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин имеют возможность регулировки угла наклона полки 0°, -10° и -20°.",
  //     img: "themes/images/products/pristen/list/3.jpg",
  //     price: 618286,
  //     code: "1725"
  // },
  // {
  //     link: "varshava_bxcp.html",
  //     title: "Пристенная холодильная витрина Varshava 160",
  //     desc: "Холодильная пристенная витрина Varshava: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин имеют возможность регулировки угла наклона полки 0°, -10° и -20°",
  //     img: "themes/images/products/pristen/main/5.jpg",
  //     price: 669224,
  //     code: "1726"
  // },
  //  {
  //     link: "varshava_bxc_1875.html",
  //     title: "Пристенная холодильная витрина Varshava 220",
  //     desc: "Холодильная пристенная витрина Varshava: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин имеют возможность регулировки угла наклона полки 0°, -10° и -20°",
  //     img: "themes/images/products/pristen/main/6.jpg",
  //     price: 698780,
  //     code: "1727"
  // },
  {
    link: "kupes.html",
    title: "Пристенная холодильная витрина Kupes",
    desc: "Холодильная пристенная витрина Kupes работает в среднетемпературном режиме, обеспечивая надежное хранение демонстрируемых продуктов в особых условиях. Длина полок достигает 2,5 м. Все поверхности витрины изготовлены из окрашенной стали в соответствии с санитарными нормами. Полиуретановая изоляция служит надежной защитой полезного объема от холодопотерь, повышая энергоэффективность.",
    img: "/images/fulls/holod/pristen/7.jpg",
    price: 852896,
    code: "1728",
  },
  {
    link: "nova_bxcp.html",
    title: "Пристенная холодильная витрина Nova ВХСп",
    desc: "Холодильная пристенная витрина Nova ВХСп работает в среднетемпературном режиме, обеспечивая надежное хранение демонстрируемых продуктов в особых условиях. Длина полок достигает 2,5 м. Все поверхности витрины изготовлены из окрашенной стали в соответствии с санитарными нормами. Полиуретановая изоляция служит надежной защитой полезного объема от холодопотерь, повышая энергоэффективность.",
    img: "/images/fulls/holod/pristen/10.jpg",
    price: 262144,
    code: "1729",
  },
  {
    link: "varshava_bxcp_1875.html",
    title: "Пристенная холодильная витрина Varshava BXCп-1,875",
    desc: "Холодильная пристенная витрина Varshava: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин серии «Varshava» имеют возможность регулировки угла наклона полки 0°, -10° и -20°.",
    img: "/images/fulls/holod/pristen/9.jpg",
    price: 908269,
    code: "1730",
  },
  {
    link: "kupes_bxcp.html",
    title: "Пристенная холодильная витрина Kupes ВХСп",
    desc: "Холодильная пристенная витрина Kupes работает в среднетемпературном режиме, обеспечивая надежное хранение демонстрируемых продуктов в особых условиях. Длина полок достигает 2,5 м. Все поверхности витрины изготовлены из окрашенной стали в соответствии с санитарными нормами.",
    img: "/images/fulls/holod/pristen/8.jpg",
    price: 852896,
    code: "1731",
  },
  {
    link: "varshava_bxcp_25.html",
    title: "Пристенная холодильная витрина Varshava BXCп-2,5",
    desc: "Холодильная пристенная витрина Varshava: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин имеют возможность регулировки угла наклона полки 0°, -10° и -20°.",
    img: "/images/fulls/holod/pristen/12.jpg",
    price: 1170225,
    code: "1733",
  },
  {
    link: "varshava_torcevaya.html",
    title: "Пристенная холодильная витрина Varshava торцевая",
    desc: "Холодильная пристенная витрина Varshava: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин серии «Varshava» имеют возможность регулировки угла наклона полки 0°, -10° и -20°.",
    img: "/images/fulls/holod/pristen/13.jpg",
    price: 1003393,
    code: "1734",
  },
  {
    link: "varshava_bxcp_375.html",
    title: "Пристенная холодильная витрина Varshava ВХСп-3,75",
    desc: "Холодильная пристенная витрина Varshava: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин серии «Varshava» имеют возможность регулировки угла наклона полки 0°, -10° и -20°.",
    img: "/images/fulls/holod/pristen/14.jpg",
    price: 1590097,
    code: "1735",
  },
  {
    link: "varshava_bxcnp_375.html",
    title: "Пристенная холодильная витрина Varshava BXCнп-3,75",
    desc: "Холодильная пристенная витрина Varshava: идеально подходит для демонстрации, кратковременного хранения и продажи продуктов питания в магазинах и точках продаж любого формата. Полки витрин имеют возможность регулировки угла наклона полки 0°, -10° и -20°.",
    img: "/images/fulls/holod/pristen/15.jpg",
    price: 689465,
    code: "1736",
  },
  {
    link: "barcelona.html",
    title: "Пристенная холодильная витрина Barcelona",
    desc: "Пристенная холодильная витрина Barcelona - эффективное решение для магазинов и супермаркетов небольшой площади. Она отличается энергоемкостью, удобна и проста в эксплуатации.",
    img: "/images/fulls/holod/pristen/16.jpg",
    price: 1638898,
    code: "1737",
  },
  // {
  //     link: "alt_new_s_1350.html",
  //     title: "Пристенный холодильник ALT NEW S 1350",
  //     desc: "Пристенный холодильник Cryspi ALT N S 1350 предназначена для демонстрации, охлаждения и кратковременного хранения скоропортящихся продуктов на предприятиях торговли и общественного питания. Модель оснащена 4 полками и люминесцентной подсветкой. Полки выполнены из окрашенной оцинкованной стали.",
  //     img: "themes/images/products/pristen/list/23.jpg",
  //     price: 859144,
  //     code: "1720"
  // },
  // {
  //     link: "alt_new_s_1950.html",
  //     title: "Пристенный холодильник ALT NEW S 1950",
  //     desc: "Пристенный холодильник Cryspi ALT N S 1950 предназначена для демонстрации, охлаждения и кратковременного хранения скоропортящихся продуктов на предприятиях торговли и общественного питания. Модель оснащена 4 полками и люминесцентной подсветкой. Полки выполнены из окрашенной оцинкованной стали.",
  //     img: "themes/images/products/pristen/list/24.jpg",
  //     price: 1071348,
  //     code: ""
  // },

  // __________________________________Кондитерские витрины__________________________________________
  {
    link: "veneto.html",
    title: "Кондитерский шкаф Veneto",
    desc: "Холодильная витрина Veneto является моделью бизнес-класса. Данная витрина украсит интерьер торговой точки любого формата: ресторана, кафе, бара, фойе отеля, магазина, кондитерской или супермаркета. Холодильная витрина Veneto идеально подходит для демонстрации и реализации: тортов, выпечки, кремовых пирожных и печенья, шоколадных изделий, пиццы, свежих салатов, цветов.",
    img: "/images/fulls/holod/kondit/1.jpg",
    price: 583098,
    code: "2001",
  },
  {
    link: "carboma_bxcb.html",
    title: "Кондитерская витрина Carboma ВХСв - 1,3д (ОТКРЫТАЯ)",
    desc: "Кондитерская витрина Carboma ВХСв - 1,3д (ОТКРЫТАЯ) идеальна для стильной демонстрации выпечки, тортов, пироженых, пиццы. Открытая выкладка используется для удобства клиента и стеклянные полки с подсветкой представляют товар с наилучшей стороны. Ночные шторки будет идеальным решением для экономии энергии.",
    img: "/images/fulls/holod/polus/carboma/1.jpg",
    price: 347010,
    code: "2009",
  },
  {
    link: "carboma_bxcb_09.html",
    title: "Кондитерская витрина Carboma",
    desc: "Кондитерская витрина Carboma были разработаны в качестве самого компактного предложения из напольных кондитерских холодильных витрин. Благодаря наличию вентиляции к охлаждаемой демонстрационной поверхности теперь можно отнести и 3 полки.",
    img: "themes/images/products/b6.jpg",
    price: 441698,
    code: "2010",
  },
  {
    link: "carboma_latium.html",
    title: "Кондитерские шкафы Carboma Latium",
    desc: "Кондитерская витрина Carboma Latium предназначены для демонстрации кондитерских изделий и десертов в магазинах, кафе, ресторанах. Стеклопакеты обеспечивают хорошую теплоизоляцию и обзор внутреннего объема со всех сторон.",
    img: "/images/fulls/holod/polus/shkaf/4.jpg",
    price: 310964,
    code: "2015",
  },
  // {
  //     link: "carboma_lux.html",
  //     title: "Кондитерские шкафы Carboma Lux",
  //     desc: "Кондитерская витрина Carboma LUX - идеальный вариант для демонстрации кондитерских изделий, аппетитных сэндвичей и бутербродов, выпечки, пиццы и деликатесов в кафе, барах и ресторанах.",
  //     img: "themes/images/products/kondit/main/77.jpg",
  //     price: 580502,
  //     code: "2016"
  // },
  {
    link: "carboma_mini.html",
    title: "Кондитерская витрина Carboma Mini",
    desc: "Небольшой охлаждаемый прилавок с динамическим охлаждением и современным техническим оснащением — именно такова кондитерская витрина Carboma MINI. Она вмещает довольно много продуктов, так как имеет дополнительную полку с охлаждением и LED-подсветкой.",
    img: "/images/fulls/holod/polus/carboma/3.jpg",
    price: 432014,
    code: "2011",
  },
  {
    link: "carboma_cube.html",
    title: "Кондитерская витрина Carboma Cube",
    desc: "Кондитерская витрина Carboma Cube подходит для продажи из нее слоек, булочек и другой выпечки. Эта небольшая витрина вместительна благодаря трем стеклянным полочкам. Равномерное охлаждение обеспечивается динамической вентиляцией.",
    img: "/images/fulls/holod/polus/carboma/4.jpg",
    price: 425020,
    code: "2012",
  },
  {
    link: "polus.html",
    title: "Кондитерская витрина Полюс",
    desc: "Кондитерская витрина ПОЛЮС применяются для продажи кондитерских изделий (тортов, пирогов, десертов) в охлаждённом виде. Эти витрины, обладая статической системе охлаждения создают более приемлемые условия для хранения нежной кулинарной продукции.",
    img: "/images/fulls/holod/polus/carboma/5.png",
    price: 440622,
    code: "2013",
  },
  {
    link: "polus_eco.html",
    title: "Кондитерская витрина Полюс Эко",
    desc: "Кондитерская витрина ПОЛЮС ЭКО разработан для удовлетворения требований выставления товара и создания индивидуальных решений в магазинах любого формата. Узкие кондитерские витрины Полюс были разработаны в качестве самого экономичного предложения из напольных кондитерских холодильных витрин.",
    img: "/images/fulls/holod/polus/carboma/6.jpg",
    price: 153173,
    code: "2014",
  },
  {
    link: "veneto_vs.html",
    title: "Кондитерская витрина Veneto VS-0,95",
    desc: "Кондитерская витрина Veneto VS-0,95 - отличное сочетание дизайна, цены, необходимой функциональности и качества. Витрины Veneto с успехом позволяет оснастить небольшое кафе или кондитерский магазин. Модельный ряд представлен не только прямыми секциями, но и угловыми решениями под 45 градусов.",
    img: "/images/fulls/holod/kondit/3.jpg",
    price: 574645,
    code: "2002",
  },
  {
    link: "veneto_vs_095.html",
    title: "Кондитерская витрина Veneto VS-0,95",
    desc: "Кондитерская витрина Veneto VS-0,95 (статика) - отличное сочетание дизайна, цены, необходимой функциональности и качества. Витрины Veneto с успехом позволяет оснастить небольшое кафе или кондитерский магазин. Модельный ряд представлен не только прямыми секциями, но и угловыми решениями под 45 градусов.",
    img: "/images/fulls/holod/kondit/2.jpg",
    price: 417275,
    code: "2003",
  },
  {
    link: "konditerskaya_vitrina_vs_un.html",
    title: "Кондитерская витрина Veneto VS-UN",
    desc: "• стильный дизайн; • светодиодная подсветка охлаждаемого объема каждой полки; • принудительная вентиляция охлажденного воздуха обеспечивает равномерное распределение температур внутри витрины; • в витринах Veneto применяется двойной стеклопакет.",
    img: "/images/fulls/holod/kondit/4.jpg",
    price: 711479,
    code: "2004",
  },
  {
    link: "konditerskaya_vitrina_vsk.html",
    title: "Кондитерская витрина Veneto VSk",
    desc: "Кондитерская витрина Veneto идеально подходит для демонстрации кондитерских изделий, мясных и рыбных деликатесов для кафе, баров и магазинов любого формата. Модельный ряд представлен не только прямыми секциями, но и угловыми решениями под 45 градусов.",
    img: "/images/fulls/holod/kondit/5.jpg",
    price: 681947,
    code: "2005",
  },
  {
    link: "konditerskaya_vitrina_vsn.html",
    title: "Кондитерская витрина VSn",
    desc: "Кондитерская витрина VSn украсит интерьер торговой точки любого формата: ресторана, кафе, бара, фойе отеля, магазина, кондитерской или супермаркета. Кондитерская витрина идеально подходит для демонстрации и реализации: тортов, выпечки, кремовых пирожных и печенья, шоколадных изделий, пиццы, свежих салатов, цветов.",
    img: "/images/fulls/holod/kondit/6.jpg",
    price: 568591,
    code: "2006",
  },
  {
    link: "konditerskaya_vitrina_vso.html",
    title: "Кондитерская витрина VSo",
    desc: "Холодильная витрина Veneto VSo может применяться заведениями общепита и в торговле для выкладки и хранения хлебобулочных и кондитерских изделий. Кондитерская витрина имеет динамическую систему охлаждения с мощным компрессором. Способ оттаивания - естественными теплопритоками.",
    img: "/images/fulls/holod/kondit/7.jpg",
    price: 675710,
    code: "2007",
  },
  {
    link: "konditerskaya_vitrina_vsp.html",
    title: "Кондитерская витрина пристенного типа Veneto VSp",
    desc: "Холодильная витрина Veneto VSo может применяться заведениями общепита и в торговле для выкладки и хранения хлебобулочных и кондитерских изделий. Кондитерская витрина имеет динамическую систему охлаждения с мощным компрессором. Способ оттаивания - естественными теплопритоками.",
    img: "/images/fulls/holod/kondit/8.jpg",
    price: 909119,
    code: "2008",
  },

  // {
  //     link: "adagio_classic_900.html",
  //     title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Classic К 900Д",
  //     desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Classic легко компонуется в линию с витриной ADAGIO Quadro и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
  //     img: "themes/images/products/kondit/main/adagio_classic_900_2.jpg",
  //     price: 440859,
  //     code: ""
  // }, {
  //     link: "adagio_classic_1200.html",
  //     title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Classic К 1200Д",
  //     desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Classic легко компонуется в линию с витриной ADAGIO Quadro и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
  //     img: "themes/images/products/kondit/main/adagio_classic_1200.jpg",
  //     price: 486853,
  //     code: ""
  // }, {
  //     link: "adagio_cube_900.html",
  //     title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Cube К 900Д",
  //     desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Cube легко компонуется в линию с витриной ADAGIO Classic и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
  //     img: "themes/images/products/kondit/main/adagio_cube_900_2.jpg",
  //     price: 477532,
  //     code: ""
  // }, {
  //     link: "adagio_cube_1200.html",
  //     title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Cube К 1200Д",
  //     desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Cube легко компонуется в линию с витриной ADAGIO Classic и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
  //     img: "themes/images/products/kondit/main/adagio_cube_1200.jpg",
  //     price: 504116,
  //     code: ""
  // }, {
  //     link: "adagio_knp_600.html",
  //     title: "Кассовый неохлаждаемый прилавок ADAGIO КНП 600",
  //     desc: "КНП – функциональное решение для организации прикассовой зоны и проведения расчётов, передачи заказа клиенту. Прилавок обеспечивает комфортную работу персонала кондитерского отдела. Для размещения инвентаря и вспомогательных материалов, сзади прилавка расположен выдвижной ящик глубиной 180 мм и открытые полки. Регулируемые по высоте опоры позволяют выставить прилавок ровно по уровню, не зависимо от погрешностей поверхности пола торгового зала.",
  //     img: "themes/images/products/kondit/main/adagio_knp_600_2.jpg",
  //     price: 115765,
  //     code: ""
  // }, {
  //     link: "adagio_knp_900.html",
  //     title: "Кассовый неохлаждаемый прилавок ADAGIO КНП 900",
  //     desc: "Кассовый неохлаждаемый прилавок ADAGIO КНП функциональное решение для организации прикассовой зоны и проведения расчётов, передачи заказа клиенту. Благодаря продуманному конструктиву, кондитерская неохлаждаемая прилавка ADAGIO КНП легко компонуется в линию с витриной ADAGIO Classic и с витриной ADAGIO Сube, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
  //     img: "themes/images/products/kondit/main/adagio_knp_900.jpg",
  //     price: 140767,
  //     code: ""
  // },

  // _________________________________________Бонеты____________________________________________________
  {
    link: "boneta_kalipso.html",
    title: "Бонета Kalipso",
    desc: "Бонета Kalipso низкотемпературная предназначена для демонстрации, кратковременного хранения и продажи, предварительно замороженных до температуры охлаждаемого объёма, пищевых продуктов, в том числе полуфабрикатов, на предприятиях торговли и общественного питания. Витрина обеспечивает хранение продуктов в диапазоне температур полезного объема не выше минус 18°С.",
    img: "/images/fulls/holod/ostrov/1.jpg",
    price: 3570220,
    code: "1801",
  },
  {
    link: "boneta_kupec.html",
    title: "Бонета Кupec",
    desc: "• Внутренняя облицовка, полки из стали, окрашенной белой порошковой краской; • Корпус из окрашенной оцинкованной стали с пенополиуретановым заполнением; • Пластиковые боковины с пенополиуретановым заполнением; • Ценникодержатели для полок надстройки; • Полки-решетки и перегородки из стальной проволоки, оцинкованные, окрашенные порошковой краской;",
    img: "/images/fulls/holod/ostrov/3.jpg",
    price: 662184,
    code: "1803",
  },
  {
    link: "boneta_malta.html",
    title: "Бонета Malta",
    desc: "Предназначена для демонстрации, кратковременного хранения и продажи, предварительно охлаждённых до температуры охлаждаемого объёма пищевых продуктов, на предприятиях торговли и общественного питания.",
    img: "/images/fulls/holod/ostrov/4.jpg",
    price: 885883,
    code: "1804",
  },
  {
    link: "boneta_rica.html",
    title: "Бонета Rica",
    desc: "Предназначена для демонстрации, кратковременного хранения и продажи, предварительно охлаждённых до температуры охлаждаемого объёма пищевых продуктов, на предприятиях торговли и общественного питания.",
    img: "/images/fulls/holod/ostrov/5.jpg",
    price: 605179,
    code: "1805",
  },
  {
    link: "boneta_bonvini.html",
    title: "Бонета Bonvini (со съемными створками)",
    desc: "Предназначена для демонстрации, кратковременного хранения и продажи, предварительно охлаждённых до температуры охлаждаемого объёма пищевых продуктов, на предприятиях торговли и общественного питания.",
    img: "/images/fulls/holod/ostrov/boneta/1.JPG",
    price: 696000,
    code: "1806",
  },
  {
    link: "boneta_bfg.html",
    title: "Бонета BFG с гнутым стеклом",
    desc: "Благодаря итальянским дизайнерам изменился и внешний вид новых бонет. Он стал более гармоничным и современным. Такая совокупность потребительских и эстетических качеств бонет, делает их лучшим предложением на рынке по соотношению цены и качества. Морозильная бонета закрытого типа «Bonvini BFG», может работать как в морозильном, так и в холодильном режиме.",
    img: "/images/fulls/holod/ostrov/boneta/3.jpg",
    price: 681500,
    code: "1807",
  },
  {
    link: "boneta_torcevaya.html",
    title: "Бонета BFG торцевая",
    desc: "Морозильная бонета закрытого типа может работать как в морозильном, так и в холодильном режиме. Энергосбережение, а так же высокое качество комплектации и сборки, являются важнейшими характеристиками данной бонеты.",
    img: "/images/fulls/holod/ostrov/boneta/4.jpg",
    price: 688460,
    code: "1808",
  },
  {
    link: "boneta_bf.html",
    title: "Бонета BF",
    desc: "Благодаря итальянским дизайнерам изменился и внешний вид новых бонет. Он стал более гармоничным и современным. Такая совокупность потребительских и эстетических качеств бонет, делает их лучшим предложением на рынке по соотношению цены и качества. Морозильная бонета закрытого типа «Bonvini BFG», может работать как в морозильном, так и в холодильном режиме.",
    img: "/images/fulls/holod/ostrov/boneta/7.JPG",
    price: 696000,
    code: "1809",
  },
  // {
  //     link: "boneta_lvn_1850.html",
  //     title: "Бонета Italfrost ЛВН 1850",
  //     desc: "Лари-бонеты Italfrost (со встроенным статическим холодоснабжением) предназначены для хранения и демонстрации замороженных овощей и ягод, мороженого, а также мясных и рыбных полуфабрикатов. Разнообразие дополнительных опций позволяет гибко подходить к оснащению торговых площадей: возможна установка в остров с суперструктурой,с использованием торцевых модулей, а также стандартное пристенное расположение.",
  //     img: "themes/images/products/boneta/moroz/list/19.jpg",
  //     price: 675742,
  //     code: ""
  // },
  //  {
  //     link: "boneta_lvn_1850_torec.html",
  //     title: "Бонета Italfrost ЛВН 1850 (торцевая)",
  //     desc: "Морозильная бонета ЛВН 1850 (торцевая) предназначена для хранения и демонстрации свежезамороженных продуктов. Конструкция с панорамными стеклянными раздвижными крышками и внутренним освещением идеальна для оснащения супер- и гипермаркетов.",
  //     img: "themes/images/products/boneta/moroz/list/22.jpg",
  //     price: 704803,
  //     code: ""
  // },
  // {
  //     link: "boneta_lvn_2100.html",
  //     title: "Бонета Italfrost ЛВН 2100",
  //     desc: "Лари-бонеты Italfrost (со встроенным статическим холодоснабжением) предназначены для хранения и демонстрации замороженных овощей и ягод, мороженого, а также мясных и рыбных полуфабрикатов. Разнообразие дополнительных опций позволяет гибко подходить к оснащению торговых площадей: возможна установка в остров с суперструктурой,с использованием торцевых модулей, а также стандартное пристенное расположение.",
  //     img: "themes/images/products/boneta/moroz/list/19.1.jpg",
  //     price: 704800,
  //     code: ""
  // },
  //  {
  //     link: "boneta_lvn_2500.html",
  //     title: "Бонета Italfrost ЛВН 2500",
  //     desc: "Лари-бонеты Italfrost (со встроенным статическим холодоснабжением) предназначены для хранения и демонстрации замороженных овощей и ягод, мороженого, а также мясных и рыбных полуфабрикатов. Разнообразие дополнительных опций позволяет гибко подходить к оснащению торговых площадей: возможна установка в остров с суперструктурой,с использованием торцевых модулей, а также стандартное пристенное расположение.",
  //     img: "themes/images/products/boneta/moroz/list/19.2.jpg",
  //     price: 726604,
  //     code: ""
  // },

  // ______________________________________Морозильные лари_______________________________________________
  {
    link: "morozilnyi_lar_gnutyi.html",
    title: "Морозильный ларь с гнутым стеклом красный",
    desc: "Морозильный ларь с гнутым стеклом красный оснащен стеклянной, выпуклой крышкой, с помощью которой легко можно рассмотреть содержимое морозильника, легок при открытии. Благодаря своему дизайну, широко используется для наглядности товаров. Морозильные лари представлены в разных объемах. Благодаря усовершенствованию корпуса морозильного ларя, ему требуется малое время для выхода на рабочую температуру. Кроме того, он отлично держит мороз даже при отключении электричества.",
    img: "/images/fulls/holod/lari/5.jpg",
    price: 192466,
    code: "2100",
  },
  {
    link: "morozilnyi_lar_gnutyi_siniy.html",
    title: "Морозильный ларь с гнутым стеклом синий",
    desc: "Морозильный ларь с гнутым стеклом красный оснащен стеклянной, выпуклой крышкой, с помощью которой легко можно рассмотреть содержимое морозильника, легок при открытии. Благодаря своему дизайну, широко используется для наглядности товаров. Морозильные лари представлены в разных объемах. Благодаря усовершенствованию корпуса морозильного ларя, ему требуется малое время для выхода на рабочую температуру. Кроме того, он отлично держит мороз даже при отключении электричества.",
    img: "/images/fulls/holod/lari/30.jpg",
    price: 192466,
    code: "2103",
  },
  {
    link: "morozilnyi_lar_gnutyi_seryi.html",
    title: "Морозильный ларь с гнутым стеклом серый",
    desc: "Морозильный ларь с гнутым стеклом красный оснащен стеклянной, выпуклой крышкой, с помощью которой легко можно рассмотреть содержимое морозильника, легок при открытии. Благодаря своему дизайну, широко используется для наглядности товаров. Морозильные лари представлены в разных объемах. Благодаря усовершенствованию корпуса морозильного ларя, ему требуется малое время для выхода на рабочую температуру. Кроме того, он отлично держит мороз даже при отключении электричества.",
    img: "/images/fulls/holod/lari/31.jpg",
    price: 192466,
    code: "2104",
  },
  {
    link: "morozilnyi_lar_gluhoi.html",
    title: "Морозильный ларь с глухой крышкой",
    desc: "Морозильный ларь с глухой крышкой обычно устанавливают в киосках или подсобных помещениях для хранения товарного запаса. Профессиональная холодильная система, рассчитанная на более интенсивное по сравнению с точками общепита и торговли использование, что позволяет очень экономично, без проблем, пользоваться ларями долгие годы.",
    img: "/images/fulls/holod/lari/12.png",
    price: 175258,
    code: "2101",
  },
  {
    link: "morozilnyi_lar_pryamoi.html",
    title: "Морозильный ларь с прямым стеклом красный",
    desc: "Морозильный ларь с прямым стеклом красный имеет точно просчитанный тепловой баланс, что гарантирует долгое и безопасное хранение продуктов. Морозильный ларь с прямым стеклом экологичен, противопожарен и обладает высокой электро безопасностью. Это делает его незаменимым в сетевых супермаркетах, где покупатели сами берут продукты. Представлен в нескольких цветовых расцветках.",
    img: "/images/fulls/holod/lari/18.jpg",
    price: 180379,
    code: "2102",
  },
  {
    link: "morozilnyi_lar_pryamoi_siniy.html",
    title: "Морозильный ларь с прямым стеклом синий",
    desc: "Морозильный ларь с прямым стеклом красный имеет точно просчитанный тепловой баланс, что гарантирует долгое и безопасное хранение продуктов. Морозильный ларь с прямым стеклом экологичен, противопожарен и обладает высокой электро безопасностью. Это делает его незаменимым в сетевых супермаркетах, где покупатели сами берут продукты. Представлен в нескольких цветовых расцветках.",
    img: "/images/fulls/holod/lari/32.jpg",
    price: 180379,
    code: "2105",
  },
  {
    link: "morozilnyi_lar_pryamoi_seryi.html",
    title: "Морозильный ларь с прямым стеклом серый",
    desc: "Морозильный ларь с прямым стеклом красный имеет точно просчитанный тепловой баланс, что гарантирует долгое и безопасное хранение продуктов. Морозильный ларь с прямым стеклом экологичен, противопожарен и обладает высокой электро безопасностью. Это делает его незаменимым в сетевых супермаркетах, где покупатели сами берут продукты. Представлен в нескольких цветовых расцветках.",
    img: "/images/fulls/holod/lari/33.jpg",
    price: 180379,
    code: "2106",
  },

  // __________________________________Настольные витрины_________________________________________
  {
    link: "nastolnye_vitriny_argo_87.html",
    title: "Настольные витрины ARGO A87",
    desc: "Настольные витрины ARGO A87 - широко востребованное и незаменимое оборудование для небольших торговых предприятий и заведений общественного питания.",
    img: "/images/fulls/holod/polus/nastol/1.jpg",
    price: 195294,
    code: "2301",
  },
  {
    link: "nastolnye_vitriny_argo_lux.html",
    title: "Настольные витрины ARGO XL",
    desc: "Настольные витрины ARGO XL - идеальное предложение для кафе, баров, рынков.",
    img: "/images/fulls/holod/polus/nastol/2.jpg",
    price: 307198,
    code: "2302",
  },
  {
    link: "nastolnye_vitriny_cube_argo.html",
    title: "Настольные витрины CUBE АРГО XL ТЕХНО",
    desc: "Настольные витрины CUBE АРГО XL ТЕХНО предназначены для демонстрации как готовых к употреблению продуктов питания, так и полуфабрикатов.",
    img: "/images/fulls/holod/polus/nastol/333.png",
    price: 285140,
    code: "2303",
  },
  {
    link: "nastolnye_vitriny_argo_xl.html",
    title: "Настольные витрины АРГО XL ТЕХНО",
    desc: "Настольные витрины АРГО XL ТЕХНО предназначены для демонстрации как готовых к употреблению продуктов питания, так и полуфабрикатов.",
    img: "/images/fulls/holod/polus/nastol/44444.png",
    price: 258778,
    code: "2304",
  },
  {
    link: "barnye_vitriny_carboma.html",
    title: "Барные витрины Carboma",
    desc: "Барные витрины Carboma предназначены для кратковременного хранения, презентации и продажи суши, бутербродов, мяса, птицы, салатов, десертов, в магазинах, кафе, барах, ресторанах.",
    img: "/images/fulls/holod/polus/nastol/5.jpg",
    price: 217890,
    code: "2305",
  },
  {
    link: "teplovye_vitriny_carboma.html",
    title: "Тепловые витрины CARBOMA",
    desc: "Тепловые витрины Carboma используются в магазинах, пунктах быстрого питания для поддержания подуктов в горячем состоянии.",
    img: "/images/fulls/holod/polus/nastol/6.jpg",
    price: 217890,
    code: "2306",
  },
  {
    link: "sushi_keicy_carboma.html",
    title: "Суши-кейсы Carboma",
    desc: "Cуши-кейсы Carboma предназначены для кратковременного хранения популярных японских блюд, таких как суши, сашими, роллы и др. Распределение холода производится снизу и сверху равномерно, что не дает заветриваться продуктам и сберегает их от замораживания и высыхания.",
    img: "/images/fulls/holod/polus/nastol/77.jpg",
    price: 207130,
    code: "2307",
  },
  {
    link: "vitriny_dlya_ingredientov.html",
    title: "Витрины для ингредиентов Carboma",
    desc: "Витрины для ингредиентов Carboma могут использоваться вместе со столами для пиццы и как отдельные единицы холодильного оборудования.",
    img: "/images/fulls/holod/polus/nastol/8.jpg",
    price: 177540,
    code: "2308",
  },
  {
    link: "barnye_vitriny_argo.html",
    title: "Барные витрины ARGO",
    desc: "Барные витрины ARGO предназначены для кратковременного хранения компонентов пиццы, суши. салатов в магазинах, кафе, барах.",
    img: "/images/fulls/holod/polus/nastol/9.jpg",
    price: 199060,
    code: "2309",
  },
  {
    link: "vitrina_dlya_ikry_preservov.html",
    title: "Витрина для икры и пресервов",
    desc: "Холодильная витрина для икры и пресервов предназначена для демонстрации и продажи икры, рыбных деликатесов и пресервов с учетом всех требований к условиям хранения и экспозиции этих деликатных продуктов",
    img: "/images/fulls/holod/polus/nastol/10.jpg",
    price: 131248,
    code: "2310",
  },

  // ________________________________Холодильные столы____________________________________________
  {
    link: "holodilnyi_stol_carboma_250.html",
    title: "Холодильные столы 570 BAR",
    desc: "Холодильные столы глубиной 570 мм - универсальное оборудование, совмещающее функции холодильного шкафа и полноценного рабочего стола. Цвет корпуса могут быть светлыми, а также темными. Данные столы могут использоваться как самостоятельная единица оборудования, так и встраиваться в барные стойки.",
    img: "/images/fulls/holod/polus/stol/11.jpg",
    price: 404576,
    code: "2201",
  },
  {
    link: "holodilnyi_stol_carboma_polus.html",
    title: "Столы под кофемашины",
    desc: "Холодильные столы глубиной 570 мм могут быть использованы под кофемашины и для хранения молока и кофейных зерен. В данных столах предусмотрен удобный отсек для выбивания холдера кофемашины.",
    img: "/images/fulls/holod/polus/stol/6.png",
    price: 354542,
    code: "2202",
  },
  {
    link: "holodilnyi_stol_carboma_2g.html",
    title: "Холодильные столы с боковым агрегатом",
    desc: "Серия холодильных столов глубиной 700 мм, с боковым отсеком для холодильного/морозильного агрегата - предназначена для использования в гастрономических отделах торговых павильонов, столовых, кафе, баров, ресторанов. Цвет корпуса могут быть светлыми, а также темными.",
    img: "/images/fulls/holod/polus/stol/10.jpg",
    price: 477245,
    code: "2203",
  },
  {
    link: "holodilnyi_stol_carboma_360.html",
    title: "Холодильные столы с нижним агрегатом",
    desc: "Холодильные столы глубиной 700 мм, с нижним расположением холодильного / морозильного агрегата - это многофункциональное оборудование из нержавеющей стали для предприятий общественного питания и торговли. Цвет корпуса могут быть светлыми, а также темными.",
    img: "/images/fulls/holod/polus/stol/7.jpg",
    price: 408208,
    code: "2204",
  },
  {
    link: "holodilnyi_stol_carboma_4g.html",
    title: "Холодильные столы для салатов",
    desc: "Серия холодильных столов глубиной 700 мм, предназначены для приготовления салатов и холодных закусок. Цвет корпуса могут быть светлыми, а также темными. Благодаря равномерному охлаждению и размещению продуктов в отдельных гастроемкостях продукты долгое время сохраняют свою свежесть, а ароматы разных блюд не смешиваются.",
    img: "/images/fulls/holod/polus/stol/8.jpg",
    price: 519708,
    code: "2205",
  },
  {
    link: "holodilnyi_stol_nadstroikoi.html",
    title: "Холодильные столы для салатов с надстройкой",
    desc: "Серия холодильных столов глубиной 700 мм, предназначены для приготовления салатов и холодных закусок. Цвет корпуса могут быть светлыми, а также темными. Благодаря равномерному охлаждению и размещению продуктов в отдельных гастроемкостях продукты долгое время сохраняют свою свежесть, а ароматы разных блюд не смешиваются.",
    img: "/images/fulls/holod/polus/stol/9.jpg",
    price: 197876,
    code: "2206",
  },

  // _____________________________Холодильные камеры_______________________________________
  {
    link: "holod_camera_standard.html",
    title: "Холодильная камера Standard",
    desc: "Холодильные камеры сборно-разборные из сэндвич-панелей с утеплителем из пенополиуретана (ППУ/PUR) изготавливаются на автоматизированной высокотехнологичной линии «Hennecke» (Германия) непрерывным способом.",
    img: "/images/fulls/holod/camera/1.jpg",
    price: 312354,
    code: "2401",
  },
  {
    link: "holod_camera_professional.html",
    title: "Холодильная камера Professional",
    desc: "Холодильные камеры со стеклом предназначены для хранения и демонстрации цветочной продукции, напитков и других продуктов. Одно из главных достоинств холодильной камеры – сверхнизкое потребление электроэнергии, соответствующее классу А++.",
    img: "/images/fulls/holod/camera/5.png",
    price: 556110,
    code: "2402",
  },
  {
    link: "holod_camera_steklo.html",
    title: "Холодильная камера со стеклянным фронтом",
    desc: "Холодильные камеры со стеклянным фронтом широко используются как альтернатива традиционным холодильным витринам, горкам и шкафам. Полотно двери представляет собой 2-х камерный стеклопакет с закаленным внешним стеклом.",
    img: "/images/fulls/holod/camera/3.jpg",
    price: 234155,
    code: "2403",
  },
  {
    link: "holod_camera_minicella.html",
    title: "Холодильная камера Minicella",
    desc: "Холодильные камеры - камера, имеющая достаточно большой внутренний объем – около 1500 литров при минимально занимаемой площади помещения. Камеры холодильные Minicella являются идеальным решением в сфере общественного питания и кейтеринга. Холодильные камеры поставляются в комплекте с холодильными машинами. Их можно без труда разобрать и перенести в другое нужное для использования помещение.",
    img: "/images/fulls/holod/camera/4.jpg",
    price: 752580,
    code: "2404",
  },

  // _____________________________________Холодильные установки____________________________________________
  {
    link: "monoblok_standard.html",
    title: "Моноблоки Standard",
    desc: "Моноблоки – холодильные машины среднетемпературные (тип ММ) и низкотемпературные (тип МВ). Моноблоки Standard предназначены для работы при температуре окружающего воздуха от +5°С до +40°С и относительной влажности не выше 80%.﻿ Моноблоки Standard заправлены хладагентом, протестированы на заводе и полностью готовы к эксплуатации.",
    img: "/images/fulls/holod/machine/2.jpg",
    price: 319572,
    code: "2501",
  },
  {
    link: "monoblok_mmn.html",
    title: "Моноблоки MMN и LMN",
    desc: "Холодильные машины среднетемпературные (тип ММ) и низкотемпературные (тип МВ). Моноблоки Standard предназначены для работы при температуре окружающего воздуха от +5°С до +40°С и относительной влажности не выше 80%.﻿ Моноблоки Standard заправлены хладагентом, протестированы на заводе и полностью готовы к эксплуатации.",
    img: "/images/fulls/holod/machine/3.jpg",
    price: 324095,
    code: "2502",
  },
  {
    link: "monoblok_mikrokanal.html",
    title: "Моноблоки с микроканальным конденсатором",
    desc: "Моноблоки серии R (ранцевого исполнения) - холодильные машины, как среднетемпературные, так и низкотемпературные, в отличие от серии Standard и MMN имеют микроканальный алюминиевый конденсатор.",
    img: "/images/fulls/holod/machine/1.jpg",
    price: 348596,
    code: "2503",
  },
  {
    link: "monoblok_potolochnyi.html",
    title: "Моноблоки потолочные",
    desc: "Моноблоки предназначены для потолочного монтажа, что позволяет максимально использовать объем холодильной камеры. Конструкция моноблоков и их исполнение соответствует лучшим европейским образцам, отличается высоким качеством и привлекательным дизайном.",
    img: "/images/fulls/holod/machine/4.jpg",
    price: 325175,
    code: "2504",
  },
  {
    link: "split_standard.html",
    title: "Сплит-системы Standard",
    desc: "Сплит-системы Standard - линия практичных коммерческих сплит-систем средне- и низкотемпературных. В сплит-системах Standard применяются герметичные поршневые компрессоры ведущих европейских производителей. В качестве дросселирующего устройства используется капиллярная трубка. Терморегулятор – электронный блок управления.",
    img: "/images/fulls/holod/machine/6.jpg",
    price: 352370,
    code: "2505",
  },
  {
    link: "split_mikrokanal.html",
    title: "Сплит-системы с микроканальным конденсатором",
    desc: "Сплит-системы с микроканальными конденсаторными блоками – это среднетемпературные и низкотемпературные холодильные машины, которые в отличии от серии Standard и Professionale имеют микроканальный алюминиевый конденсатор.",
    img: "/images/fulls/holod/machine/7.jpg",
    price: 447108,
    code: "2506",
  },
  {
    link: "split_professionale.html",
    title: "Сплит-системы Professionale",
    desc: "Сплит-системы Professionale – линия высокотехнологичных сплит-систем с муфтовыми соединениями выходов блоков и соединительных трубок, воздухоохладителем новой конструкции, выносным пультом управления в комплекте.",
    img: "/images/fulls/holod/machine/8.jpg",
    price: 618270,
    code: "2507",
  },
  {
    link: "split_msn.html",
    title: "Сплит-системы MSN",
    desc: "Низкотемпературные сплит-системы MSN предназначены для поддержания необходимого температурного режима в морозильных камерах. Оборудование работает при температуре окружающей среды от 12 до 45 °С и относительной влажности воздуха не выше 80%",
    img: "/images/fulls/holod/machine/9.jpg",
    price: 618270,
    code: "2508",
  },
  // _____________________________________Стеллаж____________________________________________
  {
    link: "pristennyj-bazovyj.html",
    title: "Торговые стеллажи Premium",
    desc: "Универсальные торговые стеллажи для магазина предназначены для выкладки, демонстрации различных видов товаров.",
    img: "/images/torg.png",
    price: 18639,
    code: "1001",
  },
  {
    link: "hleb.html",
    title: "Хлебные стеллажи",
    desc: "Хлебные стеллажи идут со специальными полками, которые предназначены для размещения хлебобулочных изделий.",
    img: "/images/13.png",
    price: 35179,
    code: "1039",
  },
  {
    link: "perfor.html",
    title: "Перфорированные стеллажи",
    desc: "Прочные стеллажи с лаконичным дизайном укомплектованы перфорированными стенками для демонстрации товаров.",
    img: "/images/14.png",
    price: 22739,
    code: "1040",
  },
  {
    link: "konfetnica.html",
    title: "Cтеллажи для сыпучего ",
    desc: "Стеллажи для сыпучего со специальными прозрачными корзинами предназначены для выкладки орехов, сухофруктов, конфет, чая, кофе и других сыпучих продуктов.",
    img: "/images/15.png",
    price: 35820,
    code: "1041",
  },
  {
    link: "pristennyjbazovyjultra.html",
    title: "Торговые стеллажи Ultra",
    desc: "Торговые стеллажи сериии Ultra являются экономичным вариантом стеллажей.Стеллажи практичны, функциональны в использовании.",
    img: "/images/opt.png",
    price: 16048,
    code: "1007",
  },
  {
    link: "pristennyjbazovyjmega.html",
    title: "Торговые стеллажи Mega",
    desc: "Усиленные торговые стеллажи с высокой грузоподъемностью отличаются от других видов стеллажей наличию дополнительных стоек.",
    img: "/images/mgvs.png",
    price: 47423,
    code: "1011",
  },
  {
    link: "pristennyjbazovyjmassiv.html",
    title: "Торговые стеллажи Massiv",
    desc: "Торговый стеллаж из высочайшего качества ЛДСП изготавливаются из ламинированных плит различных толщин.",
    img: "/images/mnvs.png",
    price: 31504,
    code: "1015",
  },
  {
    link: "stellazh_ldsp.html",
    title: "Cтеллажи из ЛДСП , ДСП",
    desc: "Стеллажи из ЛДСП для книг, библиотек изготавливается на заказ по индивидуальным размерам и вкусу.",
    img: "/images/ldcp.png",
    price: 14160,
    code: "2016",
  },
  {
    link: "accessories.html",
    title: "Аксессуары для торговых стеллажей",
    desc: "Фриз - украшающий аксессуар торгового стеллажа для верхней ее части. Придаст магазину своеобразный эстетичный образ.",
    img: "/images/33.png",
    price: 4386,
    code: "1021",
  },
  /* Мебель для бутика  */
  {
    link: "mebel_dlya_magazinov.html",
    title: "Мебель для магазинов одежды",
    desc: "Мебель для магазинов одежды изготавливаются на заказ по вашему индивидуальному вкусу.",
    img: "/images/fulls/butik/main/1.jpg",
    price: 65478,
    code: "3101",
  },
  {
    link: "torgovoe_oborudovanie_dlya_magazinov_odejdy.html",
    title: "Торговое оборудование для магазинов одежды",
    desc: "Торговое оборудование для магазинов одежды изготавливаются на заказ по вашему индивидуальному вкусу.",
    img: "/images/fulls/butik/main/2.jpg",
    price: 78648,
    code: "3102",
  },
  {
    link: "mebel_dlya_butika.html",
    title: "Витрины для магазина косметики",
    desc: "Витрины для магазина косметики изготавливаются на заказ по вашему индивидуальному вкусу.",
    img: "/images/fulls/butik/main/3.jpg",
    price: 68475,
    code: "3103",
  },
  {
    link: "vitriny_dlya_magazinov_odejdy.html",
    title: "Витрины для аксессуаров",
    desc: " Витрины для аксессуаров, подарков изготавливаются на заказ по вашему индивидуальному вкусу.",
    img: "/images/fulls/butik/main/4.jpg",
    price: 77859,
    code: "3104",
  },
  {
    link: "stellazhi_dlya_magazinov_odejdy.html",
    title: "Стеллажи для магазинов обуви",
    desc: " Наши стеллажи для магазинов изготавливается из высококачественных материалов. Они очень практичны, ваш любой товар на них будут смотрется изящно. Подходить абсолютно под все продукций,для одежды, обуви, а также косметики и сувениров.",
    img: "/images/fulls/butik/main/5.jpg",
    price: 72894,
    code: "3105",
  },
  {
    link: "oborudovanie_dlya_butika.html",
    title: "Оборудование для бутика",
    desc: " Оборудования для бутика изготавливаются на заказ по вашему индивидуальному вкусу.",
    img: "/images/fulls/butik/main/6.jpg",
    price: 87645,
    code: "3106",
  },
  // _____________________________________Мебель для аптек ____________________________________________

  {
    link: "aptechnoe_oborudovanie.html",
    title: "Аптечное оборудование",
    desc: " При изготовлении используются только выскокачественные материалы, позволяющие мебели прослужить долгие годы. Аптечное оборудование представлено различными видами стеллажей, витрин, кассовых прилавок.",
    img: "/images/fulls/pharmacy/main/6.jpg",
    price: 24372,
    code: "5100",
  },

  {
    link: "mebel_dlya_apteki.html",
    title: "Мебель для аптеки",
    desc: "Создает красивый и неповторимый дизайн вашей торговой площади для демонстрации товара. Дизайн конструкций для аптеки лаконичный, выполненный в спокойных тонах и максимально функциональный.",
    img: "/images/fulls/pharmacy/main/1.jpg",
    price: 42690,
    code: "5101",
  },

  {
    link: "oborudovanie_dlya_apteki.html",
    title: "Оборудование для аптеки",
    desc: "Стеллажи оборудования изготовлены из высококачественных материалов. Современный дизайн аптеки отличается от других, который не оставит равнодушным ни одного посетителя.",
    img: "/images/fulls/pharmacy/main/3.jpg",
    price: 69458,
    code: "5103",
  },

  {
    link: "vitriny_dlya_apteki.html",
    title: "Витрины для аптеки",
    desc: " Витрины изготовлены для удобства размещения и демонстрации товара в аптеке. Функциональные и практичные витрины сделаны с замком для хранения дорогостоящих препаратов.",
    img: "/images/fulls/pharmacy/main/4.jpg",
    price: 77895,
    code: "5104",
  },

  {
    link: "torgovoe_oborudovanie_dlya_apteki.html",
    title: "Торговое оборудование для аптеки",
    desc: "Удобное, многофункциональное оборудование - вот что нужно для современной аптеки. Одновременное использование нескольких моделей стеллажей и витрин позволило создать современный дизайн аптеки.",
    img: "/images/fulls/pharmacy/main/5.jpg",
    price: 88475,
    code: "5105",
  },

  {
    link: "aptechnaya_mebel.html",
    title: "Аптечная мебель",
    desc: "Мебель для аптеки отлично подходит как для закрытой, так и открытой формы торговли с любой площадью торгового зала. Она возможна в различных цветовых решениях и формах, что выделит Вашу аптеку среди остальных.",
    img: "/images/fulls/pharmacy/main/2.jpg",
    price: 54890,
    code: "5102",
  },
  // _____________________________________Гардеробные системы ____________________________________________
  {
    link: "garderob_hranenie.html",
    title: "Гардеробная система хранения",
    desc: "Предлагаемая нами гардеробная система хранения – это новое решение проблем хранения, основанное на принципах удобства, мобильности и эстетики, а также максимально эффективного использования пространства помещений любого назначения. Гардеробная система призвана решить вопросы хранения вещей в любом пространстве при отказе от шкафов–купе, мебельных стенок и спальных гарнитуров.",
    img: "/images/fulls/garderob/1.png",
    price: 49590,
    code: "9850",
  },

  {
    link: "hranenie_garaja.html",
    title: "Система хранения для гаража, мастерской",
    desc: "Гаражные системы хранения гарантируют надежное размещение и открытый доступ ко всем инструментам, запасным частям, метизам и другим мелким деталям, которые могут понадобиться при текущем ремонте автомобиля. Гаражные системы хранения – это рациональное инвестирование личных накоплений в обустройство обстановки внутри гаража. Гаражные системы хранения рассчитаны на максимальное использование полезной площади и внутреннего пространства автомастерской.",
    img: "/images/fulls/garderob/2.png",
    price: 26590,
    code: "9851",
  },

  {
    link: "navesnaya_sistema.html",
    title: "Навесная система хранения",
    desc: "Универсальная навесная система хранени, как новый и прогрессивный вид универсальной мебели для хранения самых разных вещей и оборудования, подойдет, как для офисных, так и жилых помещений, заменив собою отнимающие пространство объемные шкафы, которые отбирают у людей полезные метры в доме и создают неудобство и тесноту в офисе.",
    img: "/images/fulls/garderob/3.png",
    price: 29890,
    code: "9852",
  },

  {
    link: "sistema_dlya_detskoi.html",
    title: "Гардеробная система для детской",
    desc: "Гардеробная система для детской – один из множества вариантов по организации хранения в комнате ребенка. Открытость системы предоставит возможность незамедлительно найти все необходимое в считанные секунды. Гардеробная помогает обойтись без лишних шкафов, которые психологически давят на дошкольников из-за своих габаритов, экономит драгоценные метры для игровой зоны, бережёт одежду, поддерживает порядок и тем самым сохраняет родительские нервы.",
    img: "/images/fulls/garderob/4.png",
    price: 31690,
    code: "9853",
  },

  {
    link: "garderob_metal.html",
    title: "Сетчатые гардеробные",
    desc: "Удобство, надежность хранения вещей;",
    img: "/images/fulls/garderob/5.jpg",
    price: 19890,
    code: "9854",
  },

  // _____________________________________Офисная мебель____________________________________________

  {
    link: "mebel_dlya_ofica.html",
    title: "Мебель для офиса",
    desc: " Представлен широкий выбор мебели для офиса: от эффектной сдержанности классики, до ультрасовременного HI-TECH.",
    img: "/images/fulls/office/1.jpg",
    price: 24372,
    code: "5106",
  },

  {
    link: "office_stol.html",
    title: "Мебель для персонала",
    desc: " Дизайн мебели изготавливается с учетом наиболее удобного размещения на них компьютеров/ноутбуков, принтеров и прочих периферийных устройств.",
    img: "/images/fulls/office/2.jpg",
    price: 24372,
    code: "5107",
  },

  {
    link: "conference_stol.html",
    title: "Конференц столы",
    desc: "Размеры стола для переговоров зависит от габаритов комнаты и от предпочтения клиента. Практичные конференц-столы производятся из материалов ЛДСП/МДФ, устойчивые к появлению царапин и сколов.",
    img: "/images/fulls/office/3.jpg",
    price: 24372,
    code: "5108",
  },

  {
    link: "cabinet_rukovoditel.html",
    title: "Кабинет руководителя",
    desc: " Представлены стильные цветовые исполнения. Мебель изготовлена из высококачественных материалов, которые идут устойчивыми к истиранию и механическим повреждениям.",
    img: "/images/fulls/office/4.jpg",
    price: 24372,
    code: "5109",
  },
  {
    link: "shkaf_dlya_document.html",
    title: "Офисный шкаф для документов",
    desc: "Шкафы изготавливаются из высококачественных материалов ЛДСП/ДСП, которые идут устойчивыми к истиранию и механическим повреждениям.",
    img: "/images/fulls/office/5.jpg",
    price: 24372,
    code: "5110",
  },
  // _____________________________________Ресепшн, Барные стойки____________________________________________
  {
    link: "stoika_resepshn.html",
    title: "Стойка Ресепшн",
    desc: " Функциональные и респектабельные стойки ресепшн подойдут для любого офиса. Сочетание цветов гармонично настраивает ваших посетителей на эффективное общение.",
    img: "/images/fulls/front_desk/1.jpg",
    price: 24372,
    code: "5107",
  },

  {
    link: "stol_resepshn.html",
    title: "Стол Ресепшн",
    desc: " Для привлечения внимания посетителей используется подсветка. Для хранения документов предусматривается шкафы различной конфигурации, а также тумбы-купе.",
    img: "/images/fulls/front_desk/2.jpg",
    price: 24372,
    code: "5107",
  },

  {
    link: "mebel_dlya_priemnoi.html",
    title: "Мебель для приемной",
    desc: "Модульная мебель для приемной собирается из элементов различной формы, удовлетворит самые разнообразные требования по организации офисного пространства в любых помещениях.",
    img: "/images/fulls/front_desk/4.jpg",
    price: 24372,
    code: "5107",
  },

  {
    link: "barnaya_stoika.html",
    title: "Барная стойка",
    desc: "Внешний фасад барной стойки выполнен из деревянной вагонки необработанного, высшего сорта. А внутренняя часть идет из высококачественного, влагостойкого материала ЛДСП.",
    img: "/images/fulls/front_desk/6.jpg",
    price: 24372,
    code: "5107",
  },

  {
    link: "stoika_dlya_kafe.html",
    title: "Стойка для кафе",
    desc: "Качественные материалы изготовления, а также неповторимая дизайнерская работа – это является особенностью нашей работы. ",
    img: "/images/fulls/front_desk/3.jpg",
    price: 24372,
    code: "5107",
  },
  // _____________________________________Складские стеллажи____________________________________________

  {
    link: "stellazh500.html",
    title: "Архивные стеллажи с нагрузкой до 500кг",
    desc: "Архивные стеллажи изготовлены из высокопрочной стали специальной марки, имеют дополнительные ребра жесткости. Прочная стойка выдерживает равномерно распределенную нагрузку на секцию. Высокие эксплуатационные характеристики позволяют использовать стеллажи в складском деле для организации и хранения тяжелых предметов. Широкий размерный ряд полок дает возможность оптимально размещать на стеллажах как крупногабаритные, так и небольшие грузы",
    img: "/images/sklad_500_1.png",
    price: 8592,
    code: "2001",
  },

  {
    link: "stellazh900.html",
    title: "Cкладские стеллажи с нагрузкой до 900кг",
    desc: "Конструкция сборных металлических стеллажей изготовлена из высококачественной стали и окрашены полимерным покрытием. Стойка металлических стеллажей позволяет выдерживать равномерно распределенную нагрузку на секцию до 900 кг. Высокие эксплуатационные характеристики позволяют использовать стеллажи в складском деле для организации и хранения тяжелых предметов. Широкий размерный ряд полок дает возможность оптимально размещать на стеллажах как крупногабаритные, так и небольшие грузы.",
    img: "/images/sklad_900_1.png",
    price: 11748,
    code: "2003",
  },

  {
    link: "stellazh2200.html",
    title: "Cкладские стеллажи до 1500кг на зацепах",
    desc: "Полочные складские стеллажи серии Титан МС-Т предназначены для хранения различных грузов. Высокопрочные стеллажи состоят из стоек, продольных и боковых балок. Стойки стеллажа изготовлены из стали высочайшего качества, имеют дополнительные ребра жесткости. Стойка серии полочных стеллажей позволяет выдерживать равномерно распределенную нагрузку до 1500 кг (до 300 кг на полку). Настилом для стеллажа служат листы влагостойкой фанеры. Балки металлического стеллажа крепятся к стойкам при помощи двух замков с зацепом и надежно фиксируют стойки в вертикальном положении.",
    img: "/images/sklad_2200.png",
    price: 25532,
    code: "2004",
  },

  {
    link: "stellazh4000.html",
    title: "Cкладские стеллажи до 3500кг на зацепах",
    desc: "Среднегрузовые полочные стеллажи применяются на складах, в производственных помещениях и торговых залах больших магазинов. Стеллажи из первичного высококачественного материала характеризуется высокой прочностью, функциональностью. Предельная нагрузка, выдерживаемая среднегрузовыми полочными стеллажами составляет порядка 500-1000 кг на каждую полку. Загрузка и разгрузка стеллажей осуществляется персоналом вручную. Среднегрузовые полочные стеллажи возможно загружать коробками, товарами без упаковки.",
    img: "/images/sklad_4000.png",
    price: 27933,
    code: "2005",
  },

  {
    link: "sklad_stellazh_ldsp.html",
    title: "Складские стеллажи из ЛДСП",
    desc: "Складкие стеллажи из ЛДСП изготавливается на заказ по индивидуальным размерам и вкусу. Имея хорошие эксплуатационные характеристики, складские стеллажи из ЛДСП выдерживают большое механическое давление. Стеллажи используются на складах, в офисах, библиотеках, архивах, магазинах, рынках, домах и любых других хранилищах. Высокопрочные стеллажи специально изготавливается на определенную нагрузку.",
    img: "/images/ldsp.png",
    price: 18461,
    code: "2016",
  },

  // _____________________________________Cтеллажи из нержавейки____________________________________________
  {
    link: "stellazh_polka.html",
    title: "Стеллаж со сплошными полками",
    desc: "Стеллаж предназначен для хранения кухонного инвентаря, посуды, продуктов на предприятиях общественного питания, магазинах, заготовительных предприятиях, холодных, горячих цехах. Изделия сборно-разборные и поставляются в двух упаковках.",
    img: "/images/fulls/neutral/stellazh/4.jpg",
    price: 27755,
    code: "2574",
  },

  {
    link: "stellazh_reshetka.html",
    title: "Стеллажи решетчатые",
    desc: "Полки стеллажей решетчатых С-Р с округлыми отверстиями из нержавейки t=0,5 AISI 430",
    img: "/images/fulls/neutral/stellazh/3.jpg",
    price: 31645,
    code: "2573",
  },

  {
    link: "stellazh_dlya_tarelok.html",
    title: "Стеллаж для тарелок",
    desc: "Стеллаж предназначен для размещения, хранения и сушки в естественных условиях стандартных суповых и десертных тарелок различных диаметров.",
    img: "/images/fulls/neutral/stellazh/2.jpg",
    price: 50890,
    code: "2572",
  },

  {
    link: "stellazh_universal.html",
    title: "Стеллаж для сушки посуды",
    desc: "Полки стеллажа универсального СУ изготовлены из нержавейки t=0,5 AISI 430, 1 сплошная, 2 решетчатые, 2 полки для тарелок, каркас оцинкованный, стойки-уголок",
    img: "/images/fulls/neutral/stellazh/1.jpg",
    price: 44410,
    code: "2571",
  },
  // _____________________________________Паллетные стеллажи____________________________________________
  {
    link: "front.html",
    title: "Фронтальные стеллажи",
    desc: "Фронтальные стеллажи предназначены для хранения грузов на складах, где продукция размещается на паллетах. Если имеется широкий ассортимент товаров и необходим свободный доступ к каждой секции, то отличным помощником будут стеллажи для паллет (поддонов). Паллетные стеллажи высочайшего качества представляют собой сборно-разборную конструкцию, собираемую в одну или две линии любой длины с необходимыми количеством ярусов. Секция паллетного фронтального стеллажа состоит из вертикальных рам и горизонтальных балок, на которые ставится паллет.",
    img: "/images/pallet1.png",
    price: 31693,
    code: "3001",
  },

  {
    link: "images/pallet2.png",
    title: "Набивные (глубинные) стеллажи ",
    desc: "Набивные стеллажи предназначены для хранения и отбора товара из глубинных каналов. Глубинные (набивные) стеллажи чаще всего используются для хранения однородных грузов и сезонных товаров (Один канал – одно наименование). Также этот тип стеллажей применяется в камерах с искуственным микроклиматом (низкотемпературные, холодильные, с системой кондиционирования и т.д.)",
    img: "/images/pallet2.png",
    price: 96290,
    code: "3002",
  },

  {
    link: "mezon.html",
    title: "Мезонинные стеллажи",
    desc: "Мезонинный стеллаж — это многоуровневая система, предназначенная для складирования широкого спектра товаров. Мезонинные стеллажи еще называют «этажными»: секции и полки в них располагаются одна над другой. Область использования мезонинных стеллажей: хранение штучных товаров большого объема и ассортимента на складах с высокими (как правило, более 4 м) потолками.",
    img: "/images/pallet3.png",
    price: 123516,
    code: "3003",
  },

  {
    link: "acc_pallet.html",
    title: "Аксессуары для паллетных стеллажей",
    desc: "При обходе колонн помещения, либо в соединениях двух и более параллельных стеллажей в единый блок возникают разрывы в ряду стеллажей, в таких случаях необходим Соединители рядов.",
    img: "/images/pallet4.png",
    price: 377,
    code: "3004",
  },
  // _____________________________________Витрины____________________________________________
  {
    link: "4gran1.html",
    title: "4-гранные торговые прилавки",
    desc: " Торговые витрины и прилавки из четырех граней с алюминиевым профилем самые широко востребованные для малого магазина, так и для больших магазин. Данные оборудования служат для эффективного показа товара с стеклянными стенками. Данный тип торговых витрин часто используется в салонах мобильной связи, аптеках, продуктовых и хозяйственных магазинах, в бутиках для сувениров, косметики и парфюмерий, для ювелирных салонов. Под дизайн вашего магазина можно подобрать разные цвета самого профиля и пленки в заполнениях.",
    img: "/images/200.png",
    price: 16032,
    code: "5001",
  },

  {
    link: "4gran3.html",
    title: "4-гранные торговые витрины",
    desc: " Торговые витрины и прилавки из четырех граней с алюминиевым профилем самые широко востребованные для малого магазина, так и для больших магазин. Данные оборудования служат для эффективного показа товара с стеклянными стенками. Данный тип торговых витрин часто используется в салонах мобильной связи, аптеках, продуктовых и хозяйственных магазинах, в бутиках для сувениров, косметики и парфюмерий, для ювелирных салонов. Под дизайн вашего магазина можно подобрать разные цвета самого профиля и пленки в заполнениях.  ",
    img: "/images/201.png",
    price: 27365,
    code: "5003",
  },
  {
    link: "5gran1.html",
    title: "5-гранные торговые прилавки",
    desc: "Торговые витрины и прилавки из пяти  граней с алюминиевым профилем со стекла  можно изготовит разных размеров и идеально обыграть трудные углы магазина и придать совершенный вид всего отдела.  Данные оборудования служат для эффективного показа товара с стеклянными стенками. В частности данными оборудованиями оборудуют магазины под ювелирные изделия, под косметику, под часы и аксессуаров, под сотовые телефоны и т.д.",
    img: "/images/202.png",
    price: 12494,
    code: "5006",
  },
  {
    link: "5gran3.html",
    title: "5-гранные торговые витрины",
    desc: "Торговые витрины и прилавки из пяти  граней с алюминиевым профилем со стекла  можно изготовит разных размеров и идеально обыграть трудные углы магазина и придать совершенный вид всего отдела.  Данные оборудования служат для эффективного показа товара с стеклянными стенками. В частности данными оборудованиями оборудуют магазины под ювелирные изделия, под косметику, под часы и аксессуаров, под сотовые телефоны и т.д.",
    img: "/images/203.png",
    price: 22487,
    code: "5008",
  },

  {
    link: "6gran1.html",
    title: "6-гранные торговые прилавки",
    desc: "Торговые витрины и прилавки из шести  граней с алюминиевым профилем  можно изготовит разных размеров, и подобрать нужную комплектацию. Они могут служит как для выставления товара и как хранилище. Данные витрины дают возможность демонстраций товара с разных углов, в основном шестигранные витрины нужны для плавного поворота в рядах витрин, но и отдельно стоящим виде помогут для лучшей торговли.  ",
    img: "/images/204.png",
    price: 18225,
    code: "5010",
  },

  {
    link: "6gran3.html",
    title: "6-гранные торговые витрины Сальвадор",
    desc: "Торговые витрины и прилавки из шести  граней с алюминиевым профилем  можно изготовит разных размеров, и подобрать нужную комплектацию. Они могут служит как для выставления товара и как хранилище. Данные витрины дают возможность демонстраций товара с разных углов, в основном шестигранные витрины нужны для плавного поворота в рядах витрин, но и отдельно стоящим виде помогут для лучшей торговли.  ",
    img: "/images/205.png",
    price: 32206,
    code: "5012",
  },

  {
    link: "6gran5.html",
    title: "6-гранные торговые витрины Нур-Султан",
    desc: "Торговые витрины и прилавки из шести  граней с алюминиевым профилем  можно изготовит разных размеров, и подобрать нужную комплектацию. Они могут служит как для выставления товара и как хранилище. Данные витрины дают возможность демонстраций товара с разных углов, в основном шестигранные витрины нужны для плавного поворота в рядах витрин, но и отдельно стоящим виде помогут для лучшей торговли.  ",
    img: "/images/206.png",
    price: 36126,
    code: "5014",
  },
  {
    link: "8gran1.html",
    title: "8-гранные торговые прилавки ",
    desc: " Торговые витрины и прилавки из шести  граней со стекла изготовлены так, чтобы  прослужить долго и удобно в эксплуатации. Данные витрины хорошо смотрятся в центре магазина, показывают товар со всех сторон, обзор на изделия идет круговой. Модификация данных витрин часто привлекают клиентов, и создают стильный и необычный дизайн магазину.",
    img: "/images/207.png",
    price: 21678,
    code: "5016",
  },

  {
    link: "8gran3.html",
    title: "8-гранные торговые витрины",
    desc: " Торговые витрины и прилавки из шести  граней со стекла изготовлены так, чтобы  прослужить долго и удобно в эксплуатации. Данные витрины хорошо смотрятся в центре магазина, показывают товар со всех сторон, обзор на изделия идет круговой. Модификация данных витрин часто привлекают клиентов, и создают стильный и необычный дизайн магазину.",
    img: "/images/208.png",
    price: 39202,
    code: "5018",
  },
  {
    link: "stol1.html",
    title: "Торговые столы для кассовой зоны",
    desc: "Важна, как и оборудования самой торговой площадки, так и рабочая зона кассира. Под ваш дизайн мы подберем наилучший вариант обустройства кассовой зоны в профессиональном и современном стиле.  Рабочие столы для кассира могут по назначению включать в свою комплектацию: выдвижные ящики под замок, дополнительные полки под кассовый аппарат, полка под сумки для клиентов, оборудоваться для передвижения колесами. В кассовых терминалах  комфортно разместится кассовый аппарат, также можно на столе разместить весы для большего удобства продавца.",
    img: "/images/209.png",
    price: 29164,
    code: "5020",
  },

  // _____________________________________Стеклянные витрины островного типа____________________________________________
  {
    link: "steklyannyevitriny.html",
    title: "Островные витрины",
    desc: "Создает красивый и неповторимый дизайн вашей торговой площади. Подходить абсолютно под все продукций, для бижутерий, подарков, косметики и сувениров, а также автомобильных запчастей и бытовых техник.",
    img: "/images/fulls/steklo/new/main/1.jpg",
    price: 65478,
    code: "5045",
  },
  {
    link: "steklyannyevitriny1.html",
    title: "Торговые островки",
    desc: "Дополнительно можно установить двери на замках, различную подсветку, дополнительные полки. В нижней закрытой части установить выдвижные ящики. Установить и в верхней части закрытую часть, куда можно рекламу заклеить..",
    img: "/images/fulls/steklo/new/main/2.jpg",
    price: 73874,
    code: "5046",
  },

  {
    link: "steklyannyevitriny2.html",
    title: "Витрины островного типа",
    desc: "Витрины островного типа надежны и самое главное, благодаря изготавливаемому материалу, экономичная  цена.",
    img: "/images/fulls/steklo/new/main/3.jpg",
    price: 51849,
    code: "5047",
  },
  {
    link: "steklyannyevitriny6.html",
    title: "Островные павильоны",
    desc: "Островные павильоны могут иметь открытую или закрытую конструкцию, оборудоваться вращающим механизмом, а также иметь полное или частичное остекление. Но в независимости от выбранного вида, они всегда привлекают внимание покупателей и эффективно справляются со своей главной функциональной задачей. ",
    img: "/images/fulls/steklo/new/main/4.jpg",
    price: 69859,
    code: "5051",
  },
  {
    link: "steklyannyevitriny3.html",
    title: "Витрина островок",
    desc: "Витрины островки имеют неоспоримые преимущества. Так, прежде всего, стекло обеспечивает отличную видимость товара и возможность его детального изучения, при этом обеспечиваю его сохранность. Витрины, изготовленные из закаленного стекла, обладают очень высокой прочностью. Такое стекло в несколько раз прочнее обычного, и хорошо обеспечивает защиту от механических повреждений, достаточно устойчиво к ударным нагрузкам.",
    img: "/images/fulls/steklo/new/main/17.jpg",
    price: 52956,
    code: "5048",
  },
  {
    link: "steklyannyevitriny4.html",
    title: "Торговый островок",
    desc: "Торговый островок – неотъемлемая часть любого магазина, привлекающая покупателя и помогающая продавцам. Для создания дополнительного эффекта можно применить подсветку. Витрины могут быть оборудованы специальными замками, предохраняющими товар, находящийся в витрине от доступа посторонних. ",
    img: "/images/fulls/steklo/new/main/21.jpg",
    price: 18452,
    code: "5049",
  },
  // _____________________________________Стеклянные витрины____________________________________________
  {
    link: "steklyannyevitriny7.html",
    title: "Стеклянная витрина",
    desc: "Стеклянная витрина – это самый лучший способ для рекламы Вашего товара, с их помощью увеличивается популярность и привлекательность продукции. Стеклянные витрины, шкафы, стеллажи являются неотъемлемой частью интерьера в каждом торговом центре и в каждом магазине.",
    img: "/images/fulls/steklo/new/main/8.jpg",
    price: 33479,
    code: "5051",
  },
  {
    link: "vitrinydlyamagazinov.html",
    title: "Витрины для магазинов",
    desc: "Мы предлагаем Вашему вниманию витрины для магазинов, а также готовы выполнит изготовление по Вашему заказу или по собственным эскизам. У нас самый широкий ассортимент стекла различных видов.",
    img: "/images/fulls/steklo/new/main/9.jpg",
    price: 36789,
    code: "5052",
  },
  {
    link: "vitrinyizstekla.html",
    title: "Витрины из стекла",
    desc: "Витрины из стекла обладают высокой прочностью и надежностью , так как они изготовлены из специального закаленного стекла или стекла триплекс. Витрины обеспечивают особый уют и комфорт как для покупателей, так и для продавцов.",
    img: "/images/fulls/steklo/new/main/6.jpg",
    price: 34589,
    code: "5053",
  },

  // _____________________________________Торговые павильоны____________________________________________

  {
    link: "torgovyjpavilon.html",
    title: "Торговый Павильон О-образный",
    desc: " Торговые павильоны состоят: из профильного каркаса из алюминия, заполнение идет стекло и ДВП+ пленка. Цвет пленки можно подобрать.",
    img: "/images/fulls/pavil/1.jpg",
    price: 227210,
    code: "5025",
  },

  {
    link: "torgovyjpavilonp.html",
    title: "Торговый Павильон П-образный",
    desc: " Торговые павильоны состоят: из профильного каркаса из алюминия, заполнение идет стекло и ДВП+ пленка. Цвет пленки можно подобрать.",
    img: "/images/fulls/pavil/2.jpg",
    price: 194608,
    code: "5026",
  },
  {
    link: "torgovyjpavilong.html",
    title: "Торговый Павильон Г-образный",
    desc: " Торговые павильоны состоят: из профильного каркаса из алюминия, заполнение идет стекло и ДВП+ пленка. Цвет пленки можно подобрать.",
    img: "/images/fulls/pavil/4.jpg",
    price: 137806,
    code: "5027",
  },
  // _____________________________________Нестандартные витрины и прилавки____________________________________________
  {
    link: "torgovyjprilavokparizh.html",
    title: "Торговый прилавок 'Париж'",
    desc: "Торговый прилавок  модели «Париж»  состоит:  из профильного каркаса из алюминия,  заполнение идет стекло и ДВП с пленкой различных цветов.",
    img: "/images/fulls/nostandard/1.jpg",
    price: 33469,
    code: "5028",
  },
  {
    link: "torgovayavitrinapaloma.html",
    title: "Торговая Витрина 'Палома'",
    desc: "Торговый прилавок  модели «Палома»  состоит:  из профильного каркаса из алюминия,  заполнение идет стекло и ДВП с пленкой различных цветов.  Данная модель витрины привлекает внимания  клиентов, создает более удобный ракурс на товар.",
    img: "/images/fulls/nostandard/2.jpg",
    price: 25312,
    code: "5029",
  },

  {
    link: "torgovaya vitrina pallada.html",
    title: "Торговая Витрина 'Паллада'",
    desc: "Торговый прилавок модели «Паллада» состоит: из профильного каркаса из алюминия, заполнение идет стекло и ДВП с пленкой различных цветов. Данная витрина подходит для множество разных товаров вне зависимости от формы и размера товара, от мелких бижутерий до автомобильных запчастей и промышленных товаров.",
    img: "/images/fulls/nostandard/4.jpg",
    price: 28710,
    code: "5030",
  },
  {
    link: "aptechnayavitrina.html",
    title: "Аптечная витрина",
    desc: "Аптечные витрины состоят: из профильного каркаса из алюминия, заполнение идет стекло и ДВП с пленкой различных цветов. Красиво и удобно сделанные витрины для аптеки создадут лучшее рабочее место для работника для увеличения дохода компании.",
    img: "/images/fulls/nostandard/5.jpg",
    price: 35267,
    code: "5031",
  },

  {
    link: "promostojka.html",
    title: "Промо стойка",
    desc: "Промо – Стойка состоит: из профильного каркаса из алюминия, заполнение идет ДВП с пленкой различных цветов. Данные прилавки используются для презентаций продукции, проведении дегустации и разных промо акцией.",
    img: "/images/fulls/nostandard/7.jpg",
    price: 26391,
    code: "5032",
  },

  {
    link: "torgovaya vitrina palma.html",
    title: "Торговая Витрина 'Пальма'",
    desc: "Торговый прилавок  модели «Пальма» состоит: из профильного каркаса из алюминия, заполнение идет ДВП с пленкой различных цветов. Данная модель витрины используется в местах где потолок разной высоты.",
    img: "/images/fulls/nostandard/8.jpg",
    price: 31404,
    code: "5033",
  },
  // _____________________________________Дополнительная комплектация витрин____________________________________________
  {
    link: "dopvitrina.html",
    title: "Дополнительная комплектация торговых витрин и прилавков",
    desc: "Электронный замок - СКУД,Кодовый замок,Электронный замок ЕМ115,Браслеты для электронного замка,Механический открывающийся замок,Механический замок 'Крокодил',LED подсветка,LED прожектор,Люминесцентная подсветка,Точечная подсветка,Подиум для витрин,Профильная дверь,Дверь открывающаяся,Дверь скользящая",
    img: "/images/103.png",
    price: 653,
    code: "5034",
  },
  // _____________________________________Покупательские тележки, корзины и турникеты____________________________________________
  {
    link: "telezhka1.html",
    title: "Покупательские тележки",
    desc: " Покупательские тележки надежные, долгосрочные и исключительно прочные за счет корзины, которая приварена к базовой раме, к основанию.Удобство тележек при маневренности и подвижного хода обеспечивают 4 разноповоротных колес.Цельносварные тележки оснащаются дополнительным детским сидением из качественного пластика с нагрузкой до 15кг.Стандартный цвет декоративных деталей тележки – красный.Для экономии места и удобства потребительские тележки можно штабелировать.",
    img: "/images/fulls/korzina/1.png",
    price: 17698,
    code: "4031",
  },
  {
    link: "turniket.html",
    title: "Турникет",
    desc: "Особенностью турникета является то, что дуга прикреплена к вращающейся трубе, а стойка турникета неподвижна; это позволяет стыковать ограждения непосредственно к стойке турникета. ",
    img: "/images/fulls/telezhka/9.jpg",
    price: 73578,
    code: "4125",
  },
  {
    link: "telezhka10.html",
    title: "Турникет левый",
    desc: "Левые - поворот дуги возможен против часовой стрелки при виде сверху. При попытке пройти в обратном направлении они представляют собой преграду. На пластиковой вставке односторонних калиток с одной стороны изображена стрелка, с другой стороны - знак запрета.",
    img: "/images/fulls/telezhka/8.jpg",
    price: 36789,
    code: "4124",
  },
  {
    link: "telezhka9.html",
    title: "Турникет правый",
    desc: "Правые - поворот дуги возможен по часовой стрелке при виде сверху. На пластиковой вставке односторонних калиток с одной стороны изображена стрелка, с другой стороны - знак запрета.",
    img: "/images/fulls/telezhka/7.jpg",
    price: 36789,
    code: "4123",
  },
  // _____________________________________Корзины покупательские____________________________________________
  {
    link: "images/fulls/korzina/3.png",
    title: "Корзина покупательская 20л",
    desc: "Покупательские корзины цельносварные, поэтому удобны в использовании и высокопрочные.Объем корзины 20 л.Стандартный цвет декоративных деталей корзин – красный.Для экономии места и удобства потребительские корзины можно штабелировать.",
    img: "/images/fulls/korzina/3.png",
    price: 2182,
    code: "4035",
  },
  // _____________________________________Торговые манежи____________________________________________
  {
    link: "manezhcel.html",
    title: "Манеж разборный",
    desc: "Манежи служат для простой и удобной демонстрации  различного товара. С  хромированным покрытием  имеют привлекательный внешний дизайн.  Можно применять в любой деятельности, товар можно различного назначения хранить.",
    img: "/images/fulls/manezhcel/5.JPG",
    price: 7564,
    code: "4083",
  },

  {
    link: "manezhcel2.html",
    title: "6-гранный манеж торговый ",
    desc: "Манежи служат для простой и удобной демонстрации  различного товара. С  хромированным покрытием  имеют привлекательный внешний дизайн.  Можно применять в любой деятельности, товар можно различного назначения хранить.",
    img: "/images/fulls/manezhcel/6.jpg",
    price: 9276,
    code: "4084",
  },

  {
    link: "manezhcel3.html",
    title: "Манеж Складной",
    desc: "Манежи служат для простой и удобной демонстрации  различного товара. С  хромированным покрытием  имеют привлекательный внешний дизайн.  Можно применять в любой деятельности, товар можно различного назначения хранить.",
    img: "/images/fulls/manezhcel/7.jpg",
    price: 8566,
    code: "4085",
  },

  {
    link: "manezhcel4.html",
    title: "Усиленный манеж «Промо»",
    desc: "Манежи служат для простой и удобной демонстрации  различного товара. С  хромированным покрытием  имеют привлекательный внешний дизайн.  Можно применять в любой деятельности, товар можно различного назначения хранить.",
    img: "/images/fulls/manezhcel/8.jpg",
    price: 16152,
    code: "4086",
  },

  {
    link: "manezhcel5.html",
    title: "Сетчатый манеж «FAST»",
    desc: "Манежи служат для простой и удобной демонстрации  различного товара. С  хромированным покрытием  имеют привлекательный внешний дизайн.  Можно применять в любой деятельности, товар можно различного назначения хранить.",
    img: "/images/fulls/manezhcel/9.png",
    price: 16384,
    code: "4093",
  },

  // _____________________________________Стеллажи сетчатые____________________________________________
  {
    link: "setchstel3.html",
    title: "Стеллажи сетчатые",
    desc: "Стеллаж легко перемещается по торговому залу, а низкие борта корзин облегчают доступ к товару. На подставку с колёсами на друг друга устанавливаются корзины, это даёт возможность передвижения стеллажа. Стеллаж полностью разборный 4 поворотных колеса диаметром 70 мм.",
    img: "/images/setchatoe4.png",
    price: 15059,
    code: "4602",
  },
  // _____________________________________Стеллажи овощные____________________________________________
  {
    link: "setchstel2.html",
    title: "setchstel2.html",
    desc: "Овощной стеллаж полностью разборный, что облегчает его хранение. Стандартная комплектация: 2 наклонные полки, корзина для овощей, стойки и заглушки. Имеются места для хранения и демонстрации стандартных овощных ящиков.",
    img: "/images/setchatoe5.png",
    price: 31049,
    code: "4601",
  },
  // _____________________________________Торговые стойки____________________________________________
  {
    link: "stoika1.html",
    title: "Торговые стойки",
    desc: "• Торговая стойка СТ-2 с сетчатыми и навесными полками является универсальной для продаж различных видов товаров; • Максимальная допустимая нагрузка на 1 полку - 5 кг; • Полки съемные (расположение к каркасу под прямым углом); • Каркас разборный, предусмотрено крепление для пластикового топпера с рекламным изображением;",
    img: "/images/setchatoe6.png",
    price: 13874,
    code: "4701",
  },
  // _____________________________________Буклетницы____________________________________________
  {
    link: "bukletnica1.html",
    title: "Буклетница навесная",
    desc: "• Дисплей 8, 9, 10 ячеек А4 вертикальный (стальная проволока d=4 и 6 мм, стальной лист); • 8, 9, 10 вертикальных карманов формата А4;                • Вид: Навесная;",
    img: "/images/fulls/buklet/2.png",
    price: 2684,
    code: "4801",
  },

  {
    link: "bukletnica2.html",
    title: "Буклетница напольная 8 ячеек",
    desc: "Буклетница складная с дисплеем 8 ячеек А4 вертикальная предназначена для вертикального представления различной печатной продукции (книг, справочников, журналов и пр.) формата А4, преимущественно по периметру торгового или выставочного помещения.",
    img: "/images/fulls/buklet/4.png",
    price: 7985,
    code: "4802",
  },

  {
    link: "bukletnica3.html",
    title: "Буклетница напольная 32 ячеек",
    desc: "• Дисплей 32 ячеек А4 вертикальный;        • 32 вертикальных карманов формата А4;                • Вид: Напольная;                • Сборка простая и быстрая;",
    img: "/images/fulls/buklet/5.png",
    price: 23589,
    code: "4803",
  },
  // _____________________________________Полотно экономпанели____________________________________________
  {
    link: "polotno.html",
    title: "Полотно экономпанели",
    desc: " Экономпанель представляет собой панель из МДФ со специальными пазами по всей ее длине, в которые устанавливаются различные аксессуары.       Экономпанели превосходно монтируются к стенам и выставляется в центре зала в виде торговых островных конструкций.             Экономия на отделке помещения, т.к. экспопанелями можно полностью либо частично обшить стены торгового зала, одновременно решая задачи отделки помещения и оборудования полезной торговой площади.",
    img: "/images/econom1.png",
    price: 10850,
    code: "6001",
  },
  {
    link: "konstrukcii.html",
    title: "Конструкции из экономпанели",
    desc: "Конструкции из экономпанели",
    img: "/images/econom2.png",
    price: 35529,
    code: "6001",
  },
  {
    link: "complectuch.html",
    title: "Комплектующие на экономпанель",
    desc: " Вставки предназначены для увеличения прочности паза путем защиты от механических повреждений при размещении, замене, перемещении аксессуаров и комплектующих. Пластиковые вставки разных цветов решают проблему оформления интерьера в определенном стиле.Разнообразная цветовая гамма вставок: белай, черная, желтая, красная",
    img: "/images/econom3.png",
    price: 30384,
    code: "6002",
  },
  // _____________________________________Cерия Джокер хромированные трубы и аксессуары____________________________________________

  {
    link: "pristen.html",
    title: "Пристенные конструкции из трубы",
    desc: " Каркасные оборудования отлично подходят для магазинов любой деятельности от недорогих магазинов одежд, до элитного бутика. Они выглядеть стильно, современно и создают самые разные дизайны магазинов. Данные стеллажи не требуют особого ухода, легкий монтаж.С данной конструкцией удобно работать, так как с ними быстро можно сменить деятельность магазина на иную другую деятельность.Стеллажи изготавливаются под размеры клиента на заказ.",
    img: "/images/joker1.png",
    price: 11114,
    code: "4001",
  },
  {
    link: "ostrov.html",
    title: "Островные конструкции из трубы",
    desc: " Стильный, современный и в то же время лаконичный дизайн элементов позволяет вписать каркасные конструкции в интерьер любой торговой точки - от магазина недорогой молодежной одежды до элитного бутика. Стеллажи просто и удобно монтировать, за ними легко ухаживать.Сборные конструкции позволят быстро и легко переоборудовать магазин под другой вид товара.Стеллажи возможно изготовить по индивидуальным размерам.Можно самим создавать свою конструкцию стеллажа, используя готовые наработки или изобретая что-то уникальное.",
    img: "/images/joker2.png",
    price: 14956,
    code: "4005",
  },
  {
    link: "indiv2.html",
    title: "Стеллажи из трубы “Каскад”",
    desc: " Самый удобный и легкий доступ к каждому товару может обеспечить данная конструкция. Стойки удобны в использовании, не требуют ухода за ними, легкие, мобильные, многофункциональные.При переезде можно легко разобрать, а потом также легко собрать.Их эстетичный вид с хромированным покрытием, придают стильный внешний вид.Изготавливаются на заказ под размеры клиента.",
    img: "/images/joker6.png",
    price: 33191,
    code: "4011",
  },
  {
    link: "indiv4.html",
    title: "Стеллажи для автошин и дисков",
    desc: "Стильный, современный и в то же время лаконичный дизайн элементов позволяет вписать каркасные конструкции в интерьер любой торговой точки - от магазина недорогой молодежной одежды до элитного бутика. Стеллажи просто и удобно монтировать, за ними легко ухаживать.Сборные конструкции позволят быстро и легко переоборудовать магазин под другой вид товара.Стеллажи возможно изготовить по индивидуальным размерам.Можно самим создавать свою конструкцию стеллажа, используя готовые наработки или изобретая что-то уникальное.",
    img: "/images/joker3.png",
    price: 26930,
    code: "4013",
  },
  {
    link: "indiv5.html",
    title: "Стеллажи из трубы",
    desc: "Стильный, современный и в то же время лаконичный дизайн элементов позволяет вписать каркасные конструкции в интерьер любой торговой точки - от магазина недорогой молодежной одежды до элитного бутика. Стеллажи просто и удобно монтировать, за ними легко ухаживать.Сборные конструкции позволят быстро и легко переоборудовать магазин под другой вид товара.Стеллажи возможно изготовить по индивидуальным размерам.Можно самим создавать свою конструкцию стеллажа, используя готовые наработки или изобретая что-то уникальное",
    img: "/images/joker5.png",
    price: 16903,
    code: "4005",
  },
  // _____________________________________Навесное торговое оборудование "Атлант"____________________________________________
  {
    link: "stoika.html",
    title: "Стойки навесные",
    desc: "Стойки навесные",
    img: "/images/atlant1.png",
    price: 381,
    code: "4036",
  },
  {
    link: "kronshtein.html",
    title: "Кронштейны на навесные стойки",
    desc: "Кронштейны на навесные стойки",
    img: "/images/atlant2.png",
    price: 245,
    code: "4039",
  },
  {
    link: "veshala.html",
    title: "Вешала на навесные стойки",
    desc: "Вешала на навесные стойки",
    img: "/images/atlant3.png",
    price: 218,
    code: "4041",
  },

  {
    link: "planki.html",
    title: "Планки на навесные стойки",
    desc: "Планки на навесные стойки",
    img: "/images/atlant4.png",
    price: 1054,
    code: "4051",
  },

  {
    link: "raznoe.html",
    title: "Разное",
    desc: "Разное",
    img: "/images/atlant5.png",
    price: 262,
    code: "4054",
  },

  {
    link: "inform.html",
    title: "Информационные Рамки",
    desc: " Рамки изготавливаются из пластика красного цвета. Для удобного размещения информаций с различными содержаниями скидки, услуги, данные о товаре, размеры, фотографий и т.д. в формате А3 в рамках с боковой части есть прорез, через который легко вставляется лист.",
    img: "/images/accector1.png",
    price: 374,
    code: "4058",
  },

  {
    link: "derjram.html",
    title: "Держатели рамки",
    desc: "Материал изготовление держателя – пластик прозрачного цвета. Служат для скрепления двух или более рам между собой. Когда нужно разместить две или более рамок с информацией рядом используется данный вид компактного держателя.",
    img: "/images/accector2.png",
    price: 318,
    code: "4064",
  },

  {
    link: "derjinform.html",
    title: "Держатели информации",
    desc: "Материал изготовления держателя – прозрачный пластик. В комплектацию данного держателя входит крепления для носителя информаций и стойка.",
    img: "/images/accector4.png",
    price: 239,
    code: "4071",
  },
  // _____________________________________Кассовые боксы____________________________________________
  {
    link: "kassovyie_boksyi9.html",
    title: "Кассовый бокс универсальный",
    desc: "Кассовый бокс универсальный - идеальное решение для современного супермаркета или магазинов самообслуживания.",
    img: "/images/fulls/kas/shtrih11.png",
    price: 147455,
    code: "4109",
  },

  {
    link: "kassovyie_boksyi10.html",
    title: "Кассовый бокс с глубоким накопителем",
    desc: "Кассовый бокс с глубоким накопителем - идеальное решение для современного супермаркета или магазина.",
    img: "/images/fulls/kas/shtrih22.png",
    price: 149171,
    code: "4110",
  },

  {
    link: "kassovyie_boksyi11.html",
    title: "Кассовый бокс с широким накопителем",
    desc: "Кассовый бокс с широким двойным накопителем - идеальное решение для современного супермаркета или магазина.",
    img: "/images/fulls/kas/shtrih33.png",
    price: 206237,
    code: "4111",
  },

  {
    link: "kassovyie_boksyi12.html",
    title: "Кассовый бокс с широким двойным накопителем и транспортером",
    desc: "Кассовый бокс с широким двойным накопителем и транспортером - идеальное решение для современного супермаркета или магазина.",
    img: "/images/fulls/kas/shtrih33.png",
    price: 683071,
    code: "4112",
  },

  {
    link: "kassovyie_boksyi12.html",
    title: "Кассовый бокс с транспортером",
    desc: "Кассовый бокс с широким двойным накопителем и транспортером - идеальное решение для современного супермаркета или магазина.",
    img: "/images/fulls/kas/shtrih44.png",
    price: 99547,
    code: "4112",
  },

  {
    link: "kassovyie_boksyi13.html",
    title: "Кассовый бокс с удлиненным транспортером",
    desc: "Кассовый бокс с широким двойным накопителем и удлиненным транспортером - идеальное решение для современного супермаркета или магазина.",
    img: "/images/fulls/kas/shtrih55.png",
    price: 735147,
    code: "4110",
  },

  {
    link: "kassovyie_boksyi14.html",
    title: "Кассовый бокс с денежным ящиком",
    desc: "Кассовый бокс с денежным ящиком - идеальное решение для современного супермаркета или магазинов самообслуживания.",
    img: "/images/fulls/kas/shtrih66.png",
    price: 67854,
    code: "4109",
  },

  // _____________________________________Противокражные системы____________________________________________

  {
    link: "radio.html",
    title: "Радиочастотная противокражная система",
    desc: "Радиочастотные антикражные системы",
    img: "/images/radio.png",
    price: 65440,
    code: "4202",
  },

  {
    link: "magnetic.html",
    title: "Акустомагнитная противокражная система",
    desc: "Акустомагнитные противокражные системы",
    img: "/images/magnetic.png",
    price: 102800,
    code: "4201",
  },
  // _____________________________________Нейтральное оборудование в Алматы____________________________________________

  {
    link: "stol_stoiki_truba.html",
    title: "Стол разделочно-производственный, стойки - труба",
    desc: "Столешница и полка стола изготовлены из нержавейки t=0,5 AISI 430, столешница стола усилена ЛДСП t=16мм; стойки - труба d=40, t=1,0, каркас оцинкованный.",
    img: "/images/fulls/neutral/stol/12.jpg",
    price: 43515,
    code: "2511",
  },
  {
    link: "stol_tumba_moika.html",
    title: "Стол-тумба купе с мойкой",
    desc: "Все детали стола тумбы-купе с мойкой изготовлены из нержавеющей стали AISI 430. Детали разной толщины. Мойка изготовлена из из нержавеющей стали AISI 304. Гофросифон для слива воды и пробка для мойки в комплекте. Мойка без отверстия под смеситель.",
    img: "/images/fulls/neutral/stol/10.jpg",
    price: 97050,
    code: "2510",
  },
  {
    link: "stol_tumba.html",
    title: "Стол-тумба купе",
    desc: "Столы-тумбы купе (СТК) предназначены для использования в качестве профессионального стола и предназначены для разделки и последующей обработки пищевых продуктов. Благодаря наличию закрытого объема, столы-тумбы купе обеспечивают аккуратный внешний вид кухни и используются для хранения посуды, инвентаря, столовых приборов и сухих продуктов.",
    img: "/images/fulls/neutral/stol/9.jpg",
    price: 82970,
    code: "2509",
  },
  {
    link: "stol_reshetka.html",
    title: "Стол разделочный, полка-решетка",
    desc: "Столы разделочно-производственные предназначены для разделывания и обработки пищевых продуктов, а также для установки кухонного оборудования в предприятиях общественного питания, магазинах, заготовочных предприятиях.",
    img: "/images/fulls/neutral/stol/8.jpg",
    price: 26080,
    code: "2508",
  },
  {
    link: "stol_razdelochnyi.html",
    title: "Стол разделочный, полка сплошная",
    desc: "Столещница и полка стола разделочно-производственного изготовлены из нержавейки t=0,5 AISI 430, столешница усилена с внутренней стороны листом ламинированной древесностружечной плиты (ЛДСП), что увеличивает прочность и исключает прогиб столешницы.Каркас оцинкованный, стойки-уголок",
    img: "/images/fulls/neutral/stol/7.jpg",
    price: 26080,
    code: "2507",
  },

  {
    link: "obvalochnyi_stol.html",
    title: "Обвалочный стол",
    desc: "Обвалочные столы изготавливаются из нержавеющей стали, имеющей доступ к контакту с продуктами. Каркас сварной. Регулируемые по высоте ножки. Для столов длиной от 1400 мм в средней части стола для усиления конструкции устанавливаются дополнительные ножки.",
    img: "/images/fulls/neutral/stol/6.jpg",
    price: 119465,
    code: "2506",
  },
  {
    link: "stol_dlya_chistki_ryby.html",
    title: "Стол для чистки рыбы",
    desc: "Столы для чистки рыбы изготавливаются из нержавеющей стали, имеющей доступ к контакту с продуктами. Каркас сварной. Регулируемые по высоте ножки. На столешнице слева от ванны располагается отверстие для крепления душ-стойки (или смесителя). Душирующее устройство и гофросифон для ванны входят в комплект поставки.",
    img: "/images/fulls/neutral/stol/5.jpg",
    price: 354470,
    code: "2505",
  },
  {
    link: "stol_moika_dlya_ovochei.html",
    title: "Стол с мойкой для обработки овощей",
    desc: "Столы изготавливаются из нерж. стали, имеющей доступ к контакту с продуктами. Каркас сварной. Ножки регулируются по высоте. В столешницу по центру вварена ванна (сварная).  В столешнице предусмотрено технологическое отверстие под смеситель. В комплект поставки входит гофросифон.",
    img: "/images/fulls/neutral/stol/3.jpg",
    price: 123330,
    code: "2503",
  },

  {
    link: "stol_nerjaveika_close.html",
    title: "Стол, нержавеющая сталь, закрытый",
    desc: "Стол закрытый предназначен для использования в качестве профессионального стола, а также для хранения посуды и кухонного инвентаря в предприятиях общественного питания, магазинах, заготовочных предприятиях.",
    img: "/images/fulls/neutral/stol/2.jpg",
    price: 83970,
    code: "2502",
  },

  {
    link: "stol_nerjaveika_open.html",
    title: "Стол, нержавеющая сталь, открытый",
    desc: "Стол открытый предназначен для разделывания и обработки пищевых продуктов, а также для установки кухонного оборудования в предприятиях общественного питания, магазинах, заготовочных предприятиях.",
    img: "/images/fulls/neutral/stol/1.jpg",
    price: 22680,
    code: "2501",
  },
  // _____________________________________Поверхности рабочие____________________________________________

  {
    link: "poverh_4_7_o.html",
    title: "Поверхность рабочая 4/7О",
    desc: "Рабочая поверхность 4/7О предназначена для использования в составе линии раздачи 700 как вспомогательный элемент. На рабочей поверхности можно резать продукты, а на полке хранить посуду. Облицовка изделия выполнена из нержавеющей стали AISI 304, каркас и полка окрашены порошковой краской. Регулируемые по высоте ножки позволяют устранить все неровности пола и сделать процесс ее использования еще более удобным. Рабочая поверхность поставляется в надежной упаковке, состоящей из деревянных поддона и каркаса, а также картонного короба.",
    img: "/images/thumbs/horest/poverh/1.jpg",
    price: 38156,
    code: "2531",
  },

  {
    link: "poverh_4_7_h.html",
    title: "Поверхность рабочая 4/7Н",
    desc: "Рабочая поверхность 4/7Н предназначена для использования в составе линии раздачи 700 как вспомогательный элемент. На рабочей поверхности можно резать продукты, а на полке хранить посуду. Облицовка изделия выполнена из нержавеющей стали AISI 304, каркас и полка окрашены порошковой краской. Регулируемые по высоте ножки позволяют устранить все неровности пола и сделать процесс ее использования еще более удобным. Рабочая поверхность поставляется в надежной упаковке, состоящей из деревянных поддона и каркаса, а также картонного короба.",
    img: "/images/thumbs/horest/poverh/2.jpeg",
    price: 45910,
    code: "2532",
  },

  {
    link: "poverh_8_7_o.html",
    title: "Поверхность рабочая 8/7О",
    desc: "Рабочая поверхность 8/7О предназначена для использования в составе линии раздачи 700 как вспомогательный элемент. На рабочей поверхности можно резать продукты, а на полке хранить посуду. Облицовка изделия выполнена из нержавеющей стали AISI 304, каркас и полка окрашены порошковой краской. Регулируемые по высоте ножки позволяют устранить все неровности пола и сделать процесс ее использования еще более удобным. Рабочая поверхность поставляется в надежной упаковке, состоящей из деревянных поддона и каркаса, а также картонного короба.",
    img: "/images/thumbs/horest/poverh/3.jpg",
    price: 63499,
    code: "2533",
  },

  {
    link: "poverh_8_7_h.html",
    title: "Поверхность рабочая 8/7H",
    desc: "Рабочая поверхность 8/7H предназначена для использования в составе линии раздачи 700 как вспомогательный элемент. На рабочей поверхности можно резать продукты, а на полке хранить посуду. Облицовка изделия выполнена из нержавеющей стали AISI 304, каркас и полка окрашены порошковой краской. Регулируемые по высоте ножки позволяют устранить все неровности пола и сделать процесс ее использования еще более удобным. Рабочая поверхность поставляется в надежной упаковке, состоящей из деревянных поддона и каркаса, а также картонного короба.",
    img: "/images/thumbs/horest/poverh/4.jpg",
    price: 80532,
    code: "2534",
  },
  // _____________________________________Мойки____________________________________________
  {
    link: "moika_1_sekciya.html",
    title: "Мойка односекционная",
    desc: "Емкость мойки изготовлена из нержавейки t=0,6 AISI 304, гофросифон для слива воды в комплекте, каркас, стойки-уголок оцинкованный t=1,0. Мойки без отверстия под смеситель. ",
    img: "/images/fulls/neutral/moika/7.jpg",
    price: 23870,
    code: "2557",
  },

  {
    link: "moika_udlinennaya.html",
    title: "Мойка односекционная удлиненная",
    desc: "Мойка предназначена для использования в моечном отделении предприятия общественного питания для мытья, дезинфекции и ополаскивания использованной посуды. ",
    img: "/images/fulls/neutral/moika/1.jpg",
    price: 45880,
    code: "2551",
  },

  {
    link: "moika_2_sekciya.html",
    title: "Мойка двухсекционная",
    desc: "Емкость мойки изготовлена из нержавейки t=0,6 AISI 304, гофросифон для слива воды, каркас, стойки-уголок оцинкованный t=1,0. Мойки без отверстия под смеситель. ",
    img: "/images/fulls/neutral/moika/2.jpg",
    price: 45685,
    code: "2552",
  },

  {
    link: "moika_s_poverhnost.html",
    title: "Мойка с рабочей поверхностью",
    desc: "Столешница мойки с рабочей поверхностью МРП изготовлена из нержавейки t=0,5мм AISI 430 и усилена ЛДСП t=16мм, каркас оцинкованный, стойки-уголок.",
    img: "/images/fulls/neutral/moika/3.jpg",
    price: 53340,
    code: "2553",
  },

  {
    link: "moika_3_sekciya.html",
    title: "Мойка трехсекционная",
    desc: "Мойка предназначена для использования в моечном отделении предприятия общественного питания для мытья, дезинфекции и ополаскивания использованной посуды. ",
    img: "/images/fulls/neutral/moika/5.jpg",
    price: 69215,
    code: "2555",
  },

  {
    link: "moika_2_sekciya_s_bortom.html",
    title: "Мойка с бортом двухсекционная",
    desc: "Емкость изготовлена из нержавейки t=0,6 AISI 304, гофросифон для слива воды, с отверстием под смеситель, Каркас, стойки-уголок оцинкованный t=1,0.",
    img: "/images/fulls/neutral/moika/6.jpg",
    price: 52545,
    code: "2556",
  },

  {
    link: "vanna.html",
    title: "Ванна моечная",
    desc: "Емкость ванны моечной ВМ изготовлена из нержавейки t=0,6 AISI 304, гофросифон для слива воды, каркас оцинкованный, стойки-уголок.",
    img: "/images/fulls/neutral/moika/8.jpg",
    price: 31625,
    code: "2558",
  },

  {
    link: "Ванна-рукомойник",
    title: "Ванна-рукомойник",
    desc: "Ванна-рукомойник предназначена для использования на предприятиях общественного питания для мытья, дезинфекции и ополаскивания посуды.",
    img: "/images/fulls/neutral/moika/9.jpg",
    price: 29890,
    code: "2559",
  },

  {
    link: "rukomoinik.html",
    title: "Рукомойник с педальным приводом",
    desc: "Рукомойники изготовливаются из нержавеющей стали, имеющей доступ к контакту с продуктами. Каркас сварной. Регулируемые по высоте ножки. Отступ задних ножек от края столешницы - 50 мм. Рукомойники комплектуются надежным итальянским горизонтальным педальным смесителем.",
    img: "/images/fulls/neutral/moika/10.jpg",
    price: 167895,
    code: "2560",
  },

  {
    link: "poddon.html",
    title: "Душевой поддон для мойки туш",
    desc: "Душевой поддон для мойки туш предназначен для мойки туш в предприятиях общественного питания и торговли, мясоперерабатывающих и заготовочных предприятиях.",
    img: "/images/fulls/neutral/moika/12.jpg",
    price: 54315,
    code: "2561",
  },
  // _____________________________________Полки и подставки из нержавейки____________________________________________
  {
    link: "podstavka.html",
    title: "Подставка для кухонного инвентаря",
    desc: "Подставки для кухонного инвентаря предназначены для использования на предприятиях общественного питания, а также на продуктовых складах и магазинах, для временного складирования кухонного инвентаря и продуктов питания. Могут служить подставкой под котлы с первыми блюдами.",
    img: "/images/fulls/neutral/podstavka/1.jpg",
    price: 9790,
    code: "2581",
  },

  {
    link: "parokonvektomat.html",
    title: "Подставка для пароконвектомата",
    desc: "Подставка для пароконвектомата имеет направляющие, позволяющие разместить в ней 14 гастроемкостей типа GN-1/1 или 28 гастроемкостей GN-1/2. Также подставка имеет полку, на которую можно положить необходимые предметы.",
    img: "/images/fulls/neutral/podstavka/2.jpg",
    price: 92915,
    code: "2582",
  },

  {
    link: "polka_close.html",
    title: "Полка закрытая купе",
    desc: "Полка закрытая кухонная купе (ПЗК) предназначена для длительного хранения продуктов, инвентаря и посуды в закрытом объеме.",
    img: "/images/fulls/neutral/podstavka/3.jpg",
    price: 49745,
    code: "2583",
  },

  {
    link: "polka_dlya_dosok.html",
    title: "Полка кухонная для досок / для крышек",
    desc: "Полка кухонная для крышек ПКК предназначена для сушки и хранения крышек кастрюль и баков в моечных отделениях, горячих цехах.Полка для разделочных досок ПКД предназначена для хранения разделочных досок. Полка ПКД аналогична по конструкции с полкой для крышек, но имеет более широкие ячейки.",
    img: "/images/fulls/neutral/podstavka/4.jpg",
    price: 10690,
    code: "2584",
  },
  {
    link: "polka_nastennaya_open.html",
    title: "Полка настенная полуоткрытая",
    desc: "Полка настенная полуоткрытая ПНП предназначена для открытого хранения и демонстрации продуктов, требующих постоянной вентиляции, а также наиболее часто используемой посуды и инвентаря.",
    img: "/images/fulls/neutral/podstavka/5.jpg",
    price: 22350,
    code: "2585",
  },

  {
    link: "polka_nastennaya_tarelka.html",
    title: "Полка настенная для тарелок",
    desc: "Полка состоит из кассеты для тарелок и поддона. Кассета представляет собой решетку из прутка, в ячейки которой помещают тарелки. В поддоне предусмотрен небольшой уклон, обеспечивающий сток жидкости, поступающей с мокрой посуды к сливному отверстию.",
    img: "/images/fulls/neutral/podstavka/66.jpg",
    price: 19770,
    code: "2586",
  },

  {
    link: "polka_nastennaya_reshetka.html",
    title: "Полка настенная решетчатая",
    desc: "Полка настенная решетчатая ПН-Р предназначена для хранения и временной расстановки посуды и кухонного инвентаря в предприятиях общественного питания, магазинах, заготовочных предприятиях.",
    img: "/images/fulls/neutral/podstavka/7.jpg",
    price: 7052,
    code: "2587",
  },

  {
    link: "polka_nastennaya.html",
    title: "Полка настенная",
    desc: "Полка настенная предназначена для хранения и временной расстановки посуды и кухонного инвентаря на предприятиях общественного питания, магазинах, заготовительных предприятиях.",
    img: "/images/fulls/neutral/podstavka/8.jpg",
    price: 6850,
    code: "2588",
  },
  // _____________________________________Тележки для транспортировки____________________________________________
  {
    link: "shpilka.html",
    title: "Тележка-шпилька для противней 14 уровней",
    desc: "Тележки используется для транспортировки противней и гастроемкостей GN1/1 (325х530 мм).",
    img: "/images/fulls/neutral/telezhka/1.jpg",
    price: 79080,
    code: "2591",
  },
  {
    link: "telezhka_close.html",
    title: "Тележка закрытая для транспортировки мясных полуфабрикатов",
    desc: "Тележки изготавливаются из нержавеющей стали , имеющий доступ к контакту с продуктами. Каркас сварной. В основании 4 колеса диаметром 100 мм. (2 колеса с тормозом).",
    img: "/images/fulls/neutral/telezhka/6.jpg",
    price: 129785,
    code: "2592",
  },
  // _____________________________________Вентиляционные зонты____________________________________________

  {
    link: "zont_nastennyi.html",
    title: "Зонт вентиляционный настенный",
    desc: "Зонт вентиляционный настенный предназначен для очистки воздуха на кухне от масла, жира, дыма и водяных паров. Зонт должен подключаться к вытяжной вентиляционной системе предприятия, где он установлен.",
    img: "/images/fulls/neutral/zont/1.jpg",
    price: 58195,
    code: "2691",
  },
  {
    link: "zont_ostrovnoi.html",
    title: "Зонт вентиляционный островной тип 1й",
    desc: "Зонт вентиляционный островной тип 1 предназначен для очистки воздуха на кухне от масла, жира, дыма и водяных паров. Зонт должен подключаться к вытяжной вентиляционной системе предприятия, где он установлен. Изделие подвешивается к потолку над тепловыводящим оборудованием.",
    img: "/images/fulls/neutral/zont/2.jpg",
    price: 81670,
    code: "2692",
  },

  {
    link: "zont_ostrovnoi_2.html",
    title: "Зонт вентиляционный островной тип 2",
    desc: "Зонт вентиляционный островной тип 2 предназначен для очистки воздуха на кухне от масла, жира, дыма и водяных паров. Зонт должен подключаться к вытяжной вентиляционной системе предприятия, где он установлен. Изделие подвешивается к потолку над тепловыводящим оборудованием.",
    img: "/images/fulls/neutral/zont/3.jpg",
    price: 78390,
    code: "2693",
  },
  // _____________________________________Подвесы для туш____________________________________________
  {
    link: "podves_dlya_tush.html",
    title: "Подвес для туш, 2 перекладины, 2 вертикальных опоры",
    desc: "Подвес для туш предназначен для подвешивания на крюках туш и полутуш в предприятиях общественного питания и торговли, мясоперерабатывающих и заготовочных предприятиях.",
    img: "/images/fulls/neutral/podvec/1.jpg",
    price: 174995,
    code: "2791",
  },

  {
    link: "podves_dlya_mytya.html",
    title: "Подвес для мытья туш стационарный",
    desc: "Подвес для мытья туш стационарный предназначен для подвешивания на крюках туш и полутуш в предприятиях общественного питания и торговли, мясоперерабатывающих и заготовочных предприятиях.",
    img: "/images/fulls/neutral/podvec/2.jpg",
    price: 999,
    code: "000",
  },

  {
    link: "kryuk_dlya_podvesa.html",
    title: "Крюк для подвеса туш",
    desc: "Крюк для подвеса туш предназначен для подвешивания, а также транспортировки по трубчатым подвесным путям, туш и полутуш в предприятиях общественного питания и торговли, мясоперерабатывающих и заготовочных предприятиях.",
    img: "/images/fulls/neutral/podvec/3.jpg",
    price: 3452,
    code: "2793",
  },
  // _____________________________________Неохлаждаемые Прилавки____________________________________________
  {
    link: "prilavok_polus.html",
    title: "Прилавок кассовый Полюс",
    desc: "Кассовый прилавок Полюс идеально сочетаются с витринами Полюс Эко, Полюс, Carboma. Модель оснащена полкой для инвентаря со стороны продавца и регулируемыми ножками высотой от 20 до 35 мм. Корпус выполнен из оцинкованной стали серого цвета, столешница - из шлифованной нержавеющей стали.",
    img: "/images/fulls/holod_prilavka/1.jpg",
    price: 45139,
    code: "2501",
  },

  {
    link: "prilavok_polus1.html",
    title: "Прилавок Полюс внешний",
    desc: "Угловой прилавок Полюс внешний предназначен для упрощения обслуживания покупателей в магазинах, на предприятиях общественного питания и торговли. Корпус выполнен из оцинкованной стали, столешница - из шлифованной нержавеющей стали. ",
    img: "/images/fulls/holod_prilavka/2.jpg",
    price: 68584,
    code: "2502",
  },

  {
    link: "prilavok_polus2.html",
    title: "Прилавок Полюс внутренний",
    desc: "Угловой прилавок Полюс внутренний предназначен для упрощения обслуживания покупателей в магазинах, на предприятиях общественного питания и торговли. Корпус выполнен из оцинкованной стали, столешница - из шлифованной нержавеющей стали.",
    img: "/images/fulls/holod_prilavka/3.jpg",
    price: 57212,
    code: "2503",
  },
  // _____________________________________Металлические шкафы для одежды____________________________________________
  {
    link: "shrm11.html",
    title: "Металлический шкаф для одежды ШРМ – 11",
    desc: "Шкаф металлический, разборной, односекционный, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/11.png",
    price: 14183,
    code: "7004",
  },

  {
    link: "shrm22.html",
    title: "Металлический шкаф для одежды ШРМ - 22",
    desc: "Шкаф металлический, разборной, двухсекционный, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/7.JPG",
    price: 29190,
    code: "7008",
  },

  {
    link: "shrm22m.html",
    title: "Металлический шкаф для одежды ШРМ - 22 М",
    desc: "Шкаф металлический, разборной, двухсекционный, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/20.JPG",
    price: 20644,
    code: "7016",
  },

  {
    link: "shrm33.html",
    title: "Металлический шкаф для одежды ШРМ – 33",
    desc: "Шкаф металлический, разборной, трехсекционный, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/3.JPG",
    price: 32946,
    code: "7018",
  },

  {
    link: "shrmm.html",
    title: "Металлический шкаф для одежды ШРМ - М",
    desc: "Шкаф металлический, модульный, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/30.JPG",
    price: 10339,
    code: "7019",
  },

  {
    link: "shrm21.html",
    title: "Металлический шкаф для одежды ШРМ – 21",
    desc: "Шкаф металлический, односекционный, предназначен для хранения сменной одежды. Внутри поделен перегородкой на два отделения для чистой и грязной одежды. В каждом отделении находятся полка для перекладина и вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/21.png",
    price: 18028,
    code: "7007",
  },

  {
    link: "shrm12.html",
    title: "Металлический шкаф для одежды ШРМ – 12",
    desc: "Шкаф металлический, разборной, односекционный, с 2-мя отделениями, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/5.JPG",
    price: 11620,
    code: "7012",
  },

  {
    link: "shrm24.html",
    title: "Металлический шкаф для одежды ШРМ - 24",
    desc: "Шкаф металлический разборной двухсекционный, с 4-мя отделениями. Предназначен для хранения сменной одежды в раздевальных комнатах спортивных залов, бассейнов, школ и т.д. Каждое отделение шкафа оснащено индивидуальным врезным замком и перекладиной для вешалки. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/24.png",
    price: 25053,
    code: "7013",
  },

  {
    link: "shrmak.html",
    title: "Металлический шкаф для одежды ШРМ – АК",
    desc: "Шкаф металлический, разборной, двухсекционный, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/ak.png",
    price: 24087,
    code: "7011",
  },

  {
    link: "shrm22u.html",
    title: "Металлический шкаф для одежды ШРМ - 22 У",
    desc: "Шкаф металлический, разборной, двухсекционный, предназначен для хранения сменной одежды и секция из 3 полок для хозяйственного инвентаря. В каждом отделении находятся полка для головных уборов. Каждая секция закрывается дверью с замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/u.png",
    price: 23035,
    code: "7009",
  },

  {
    link: "shrm16.html",
    title: "Металлический шкаф для одежды ШРМ – АК - У",
    desc: "Шкаф металлический, разборной, односекционный, предназначен для хранения сменной одежды и инвентаря. В стандартную комплектацию каждого шкафа входят три полки, перекладина для вешалки и крючки для одежды. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).			",
    img: "/images/fulls/shkaf_odejda/sh16.jpg",
    price: 26879,
    code: "7003",
  },

  {
    link: "shrm15.html",
    title: "Металлический шкаф для одежды ШРМ – 11Р",
    desc: "Шкаф металлический, разборной, двухсекционный, предназначен для хранения сменной одежды. В каждом отделении находятся полка для головных уборов и перекладина для вешалки. Отделение шкафа оснащено индивидуальным врезным замком. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_odejda/sh15.jpg",
    price: 26879,
    code: "7010",
  },

  {
    link: "polkadlyashkafy.html",
    title: "ПОЛКА ДЛЯ ШКАФА ШРМ",
    desc: "К МЕТАЛЛИЧЕСКИМ ШКАФАМ СЕРИИ ШРМ ШИРИНОЙ 500 ММ: <br> Размеры дополнительной полки: 20х195х450 мм, вес - 0,7 кг. К МЕТАЛЛИЧЕСКИМ ШКАФАМ СЕРИИ ШРМ ШИРИНОЙ 600 ММ: <br> Размеры дополнительной полки: 20х295x450 мм, вес - 0,7 кг.",
    img: "/images/fulls/shkaf_odejda/10.JPG",
    price: 463,
    code: "7020",
  },

  {
    link: "shkaf odejda.html",
    title: "Металлический шкаф TSN 710-15440",
    desc: "Цельнометаллическая отдельно стоящая конструкция. Высококачественная сталь толщиной 1 мм. У каждой секций держатель для личной карточки. У каждой секций 1 шт. перекладина с 5-ю пластиковыми крючками для одежды.  У каждой секций врезной замок повышенной секретности. Полимерно-порошковое влагостойкое покрытие, устойчивое к царапинам. Возможность окраски в любые цвета по требованию клиента.",
    img: "/images/fulls/shkaf_odejda/40.jpg",
    price: 67613,
    code: "7001",
  },

  {
    link: "shkaf odejda2.html",
    title: "Металлический шкаф TSN 710-15310",
    desc: "Шкаф металлический 1-секционный. В стандартную комплектацию каждой секции входят 1 съемная полка, 1 перекладина для вешалок и 5 пластиковых крючков для одежды. Шкаф оснащен врезным замком. Высококачественное порошковое покрытие.",
    img: "/images/fulls/shkaf_odejda/50.jpg",
    price: 55783,
    code: "7002",
  },

  {
    link: "teksan_15110.html",
    title: "Шкаф для одежды для школьников",
    desc: "Шкаф металлический 1-секционный. В стандартную комплектацию каждой секции входят 1 съемная полка, 1 перекладина для вешалок и 5 пластиковых крючков для одежды. Шкаф оснащен встроенным замком и ригельным запиранием. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_odejda/25.jpg",
    price: 16790,
    code: "7005",
  },

  {
    link: "teksan_15441.html",
    title: "Металлический шкаф для одежды TSN 710-15441",
    desc: "Цельнометаллическая отдельно стоящая конструкция. Высококачественная сталь толщиной 1 мм. У каждой секций держатель  для личной карточки. У каждой секций 1 шт. перекладина с 5-ю пластиковыми крючками для одежды. У каждой секций врезной замок повышенной  секретности на 10000 комбинаций. Полимерно- порошковое влагостойкое покрытие, устойчивое к царапинам. Возможность  окраски в любые цвета по требованию клиента. ",
    img: "/images/fulls/shkaf_odejda/29.jpg",
    price: 83818,
    code: "7014",
  },

  {
    link: "teksan_15215.html",
    title: "Металлический шкаф для одежды TSN 710-15215",
    desc: "Шкаф металлический 2-секционный. В стандартную комплектацию каждой секции входят 4 съемных полок, 2 перекладины для вешалок и 10 пластиковых крючков для одежды. Шкаф оснащен встроенным замком и ригельным запиранием. Высококачественное порошковое покрытие.  ",
    img: "/images/fulls/shkaf_odejda/26.jpg",
    price: 122759,
    code: "7006",
  },

  {
    link: "teksan_15320.html",
    title: "Металлический шкаф для одежды TSN 710-15320",
    desc: "Шкаф металлический 2-секционный. В стандартную комплектацию каждой секции входят 2 съемные полки, 2 перекладины для вешалок и 10 пластиковых крючков для одежды. Шкаф оснащен встроенным замком. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_odejda/27.jpg",
    price: 95914,
    code: "7015",
  },

  {
    link: "teksan_15340.html",
    title: "Металлический шкаф для одежды TSN 710-15340",
    desc: "Шкаф металлический 4-секционный. В стандартную комплектацию каждой секции входят 4 перекладины для вешалок и 20 пластиковых крючков для одежды. Шкаф оснащен встроенным замком. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_odejda/28.jpg",
    price: 111475,
    code: "7017",
  },
  // _____________________________________Металлические шкафы для документов____________________________________________
  {
    link: "sham12.html",
    title: "Металлический шкаф для документов ШАМ - 12",
    desc: "Шкаф разборный металлический, односекционный. Предназначен для хранения архивов, офисной бухгалтерской документации, а также регулируемые по высоте полки. Отделение шкафа оснащено индивидуальным врезным замком. Замок повышенной секретности. Ригельная система. Покрытие -  полимерное порошковое серого цвета (RAL 7035). ",
    img: "/images/fulls/shkaf_doc/12.png",
    price: 64392,
    code: "9001",
  },

  {
    link: "sham11.html",
    title: "Металлический шкаф для документов ШАМ - 11",
    desc: "Шкаф металлический архивный. Предназначен для хранения архивов, офисной и бухгалтерской документации. А также имеют регулируемые по высоте полки и возможна установка дополнительных полок. Двери архивного шкафа оснащены замком повышенной секретности (ригельная система). Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_doc/sham11.png",
    price: 30157,
    code: "9002",
  },

  {
    link: "sham0.5.html",
    title: "Металлический шкаф для документов ШАМ - 0,5",
    desc: "Шкаф разборный металлический, односекционный. Предназначен для хранения архивов, офисной бухгалтерской документации, одна регулируемая по высоте полка. Отделение шкафа оснащено индивидуальным врезным замком. Замок повышенной секретности. Ригельная система. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_doc/05.png",
    price: 56288,
    code: "9003",
  },

  {
    link: "sham11k.html",
    title: "Металлический шкаф для документов ШАМ - 11.К",
    desc: "Металлический архивный шкаф-купе. Предназначен для хранения архивов, офисной и бухгалтерской документации. А также имеют регулируемые по высоте полки и возможна установка дополнительных полок. Отделение шкафа оснащено индивидуальным врезным замком. Замок повышенной секретности. Ригельная система. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_doc/11k.png",
    price: 29326,
    code: "9004",
  },

  {
    link: "sham24.html",
    title: "Металлический шкаф для документов ШАМ - 24.О",
    desc: "Шкаф металлический, разборной двухсекционный, с 4-мя отделениями Предназначен для хранения архивов, офисной и бухгалтерской документации. В каждом отделении одна полка. Отделение каждого шкафа оснащено индивидуальным врезным замком. Замок повышенной секретности. Ригельная система. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_doc/240.png",
    price: 67795,
    code: "9005",
  },

  {
    link: "shkaf_15500.html",
    title: "Металлический шкаф TSN 710-15500",
    desc: "В стандартную комплектацию металлического шкафа входят 2 регулируемые по высоте полки. Дверь шкафа оборудована замком повышенной  секретности и ригельной системой запирания. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_doc/14.jpg",
    price: 62153,
    code: "9006",
  },

  {
    link: "shkaf_15225.html",
    title: "Металлический шкаф TSN 710-15225",
    desc: "Шкаф металлический с двумя металлическими дверцами. Каждая секция имеет отдельную дверь замком повышенной  секретности и ригельной системой запирания, пять съемных полок. Общее количество полок в шкафу 10шт. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_doc/15.jpg",
    price: 172809,
    code: "9007",
  },

  {
    link: "shkaf_15540.html",
    title: "Металлический шкаф TSN 710-15540",
    desc: "Металлический шкаф с двумя металлическими дверцами и раздвижным стеклом. В стандартную комплектацию входят 3 регулируемые по высоте полки. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_doc/16.jpg",
    price: 92138,
    code: "9008",
  },

  {
    link: "shkafpolka.html",
    title: "Металлический шкаф TSN 710-15000",
    desc: "Шкаф металлический с двумя металлическими дверцами. Предназначен для хранения архивов, офисной и бухгалтерской документации. В комплектацию входят четыре накладные полки, один центральный замок. Окрашен высококачественной порошковой краской.",
    img: "/images/fulls/shkaf_doc/8.jpg",
    price: 117936,
    code: "9009",
  },

  {
    link: "shkaf_15530.html",
    title: "Металлический шкаф TSN 710-15530",
    desc: "Первая секция имеет отдельную дверь замком повышенной  секретности и ригельную систему запирания, верхнюю полку для головного убора и нижнюю полку для обуви, перекладину с 5-ю пластиковыми крючками. Вторая секция имеет отдельную дверь замком повышенной  секретности и ригельную систему запирания, пять съемных полок. Общее количество полок в шкафу 7шт. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_doc/12.jpg",
    price: 128219,
    code: "9010",
  },

  {
    link: "shkaf polka odejda.html",
    title: "Металлический шкаф TSN 710-15100",
    desc: "Шкаф металлический с двумя металлическими дверцами, центральная часть прозрачная. Закрыта стеклом. Предназначен для хранения архивов, офисной и бухгалтерской документации. В стандартную комплектацию входят четыре накладные полки, один центральный замок.",
    img: "/images/fulls/shkaf_doc/7.jpg",
    price: 142861,
    code: "9011",
  },

  {
    link: "shkaf_15115.html",
    title: "Металлический шкаф TSN 710-15115",
    desc: "Шкаф металлический с двумя дверцами и выдвижными ящиками. В стандартную комплектацию входят две регулируемые по высоте полки и четыре выдвижных ящика внизу. Дверь шкафа оборудована замком повышенной  секретности и ригельной системой запирания. Высококачественное порошковое покрытие. ",
    img: "/images/fulls/shkaf_doc/13.jpg",
    price: 151288,
    code: "9012",
  },

  {
    link: "polkadlyashkafysham.html",
    title: "ПОЛКА ДЛЯ ШКАФА ШАМ",
    desc: "ДЛЯ МЕТАЛЛИЧЕСКОГО ШКАФА ШАМ - 11/400 <br> Размеры дополнительной полки: 835х20х360 мм. В шкафу предусмотрены пошаговые отверстия для крепления полок - 9 см.  Вес: 2,9 кг. <br> ДЛЯ МЕТАЛЛИЧЕСКОГО ШКАФА ШАМ - 11/920 <br> Размеры дополнительной полки: 920х20х360 мм. В шкафу предусмотрены пошаговые отверстия для крепления полок - 9 см. Вес: 3,1 кг.",
    img: "/images/fulls/shkaf_odejda/10.JPG",
    price: 941,
    code: "9013",
  },

  // _____________________________________Металлические бухгалтерские шкафы____________________________________________

  {
    link: "kb 02.html",
    title: "Металлический бухгалтерский шкаф КБС - 02 / 02Т",
    desc: "Металлический бухгалтерский шкаф КБС - 02 предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д. Корпус шкафа изготовлен из стали толщиной 1,5 мм. Толщина двери 1,8+1,2 мм. Внутри бухгалтерского шкафа находится приваренная полка. Дверь коробчатая усиленная, оборудована сертифицированным ключевым замком II класса.  ",
    img: "/images/fulls/shkaf_buh/1.jpg",
    price: 32129,
    code: "8005",
  },

  {
    link: "kb 09.html",
    title: "Металлический бухгалтерский шкаф КБС - 09",
    desc: "Металлический бухгалтерский шкаф КБС-09 предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д. Корпус шкафа изготовлен из стали толщиной 1,5 мм. Толщина двери - 1,8+1,2 мм. Внутри бухгалтерского шкафа находится приваренная полка. Дверь коробчатая усиленная, оборудована сертифицированным ключевым замком II класса.   ",
    img: "/images/fulls/shkaf_buh/2.jpg",
    price: 81275,
    code: "8015",
  },

  {
    link: "kb 011t.html",
    title: "Металлический бухгалтерский шкаф КБС - 011Т / 012Т",
    desc: "Металлический бухгалтерский шкаф КБС-011-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д. Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ.",
    img: "/images/fulls/shkaf_buh/3.jpg",
    price: 49753,
    code: "8001",
  },

  {
    link: "kb 041t.html",
    title: "Металлический бухгалтерский шкаф КБС - 041Т",
    desc: "Металлический бухгалтерский шкаф КБС-041-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ.",
    img: "/images/fulls/shkaf_buh/4.jpg",
    price: 57418,
    code: "8011",
  },

  {
    link: "kb 042t.html",
    title: "Металлический бухгалтерский шкаф КБС - 042Т",
    desc: "Металлический бухгалтерский шкаф КБС-042-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ.",
    img: "/images/fulls/shkaf_buh/5.jpg",
    price: 72267,
    code: "8012",
  },

  {
    link: "kb 21t.html",
    title: "Металлический бухгалтерский шкаф КБС - 021 / 021Т",
    desc: "Металлический бухгалтерский шкаф КБС-021-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ.",
    img: "/images/fulls/shkaf_buh/6.jpg",
    price: 64634,
    code: "8016",
  },

  {
    link: "kb 23t.html",
    title: "Металлический бухгалтерский шкаф КБС - 023Т",
    desc: "Металлический бухгалтерский шкаф КБС-023-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ.",
    img: "/images/fulls/shkaf_buh/7.jpg",
    price: 30167,
    code: "8017",
  },

  {
    link: "kb 031t.html",
    title: "Металлический бухгалтерский шкаф КБС - 031Т",
    desc: "Металлический бухгалтерский шкаф КБС-031-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ. ",
    img: "/images/fulls/shkaf_buh/8.jpg",
    price: 33354,
    code: "8007",
  },

  {
    link: "kb 032t.html",
    title: "Металлический бухгалтерский шкаф КБС - 032Т",
    desc: "Металлический бухгалтерский шкаф КБС-032-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ. Корпус шкафа изготовлен из стали толщиной 1,5 мм. Толщина двери 1,8+1,2 мм. Внутри бухгалтерского шкафа находится приваренная полка. ",
    img: "/images/fulls/shkaf_buh/9.jpg",
    price: 97140,
    code: "8008",
  },

  {
    link: "kb 033t.html",
    title: "Металлический бухгалтерский шкаф КБС - 033 / 033Т",
    desc: "Металлический бухгалтерский шкаф КБС-033-Т предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Модели с индексом «т» оснащены дополнительным отсеком ограниченного доступа (трейзер), который расположен в верхней части шкафа, запираемый на ключ. Корпус шкафа изготовлен из стали толщиной 1,5 мм. Толщина двери 1,8+1,2 мм. Шкаф имеет 3 отделения. Внутри бухгалтерского шкафа находится приваренная полка. ",
    img: "/images/fulls/shkaf_buh/10.jpg",
    price: 104613,
    code: "8010",
  },

  {
    link: "kb 05.html",
    title: "Металлический бухгалтерский шкаф КБС - 05",
    desc: "Металлический бухгалтерский шкаф КБС-05 предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Корпус шкафа изготовлен из стали толщиной 1,5 мм. Толщина двери - 1,8+1,2 мм. Внутри бухгалтерского шкафа находятся четыре приваренных полки. Дверь коробчатая усиленная, оборудована сертифицированным ключевым замком II класса.   ",
    img: "/images/fulls/shkaf_buh/11.jpg",
    price: 97579,
    code: "8013",
  },

  {
    link: "kb 06.html",
    title: "Металлический бухгалтерский шкаф КБС - 06",
    desc: "Металлический бухгалтерский шкаф КБС-06 предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Корпус шкафа изготовлен из стали толщиной 1,5 мм. Толщина двери - 1,8+1,2 мм. Металлический бухгалтерский шкаф имеет 4 отделения. Дверь коробчатая усиленная, оборудована сертифицированным ключевым замком II класса.",
    img: "/images/fulls/shkaf_buh/12.jpg",
    price: 119208,
    code: "8014",
  },

  {
    link: "kb 10.html",
    title: "Металлический бухгалтерский шкаф КБС - 10",
    desc: "Металлический бухгалтерский шкаф КБС-10 предназначен для хранения офисной и бухгалтерской документации, учредительных документов, электронных носителей информации и т.д.  Корпус шкафа изготовлен из стали толщиной 1,5 мм. Толщина двери - 1,8+1,2 мм. Внутри бухгалтерского шкафа находится приваренная полка. Дверь коробчатая усиленная, оборудована сертифицированным ключевым замком II класса.",
    img: "/images/fulls/shkaf_buh/13.jpg",
    price: 184449,
    code: "8004",
  },
  // _____________________________________Металлические картотечные шкафы (картотека, файл-кабинет)____________________________________________

  {
    link: "kr 2.html",
    title: "Металлический картотечный шкаф (картотека) КР-2",
    desc: "Металлическая сборно-разборная картотека КР-2, двухсекционная, с центральным замком. Используется для хранения документации в форматах Foolscap и А4. Имеет антиопрокидывающее устройство и телескопические направляющие. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_kart/kr2.png",
    price: 81270,
    code: "1301",
  },

  {
    link: "kr 3.html",
    title: "Металлический картотечный шкаф (картотека) КР-3",
    desc: "Металлическая сборно-разборная картотека КР-3, трехсекционная, с центральным замком. Используется для хранения документации в форматах Foolscap и А4. Имеет антиопрокидывающее устройство и телескопические направляющие. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_kart/kr3.png",
    price: 40079,
    code: "1302",
  },

  {
    link: "kr 4.html",
    title: "Металлический картотечный шкаф (картотека) КР-4",
    desc: "Металлическая сборно-разборная картотека КР-4, четырехсекционная, с центральным замком. Используется для хранения документации в форматах Foolscap и А4. Имеет антиопрокидывающее устройство и телескопические направляющие. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_kart/kr4.png",
    price: 137060,
    code: "1303",
  },

  {
    link: "kr 5.html",
    title: "Металлический картотечный шкаф (картотека) КР-5",
    desc: "Металлическая сборно-разборная картотека КР-5, пятисекционная, с центральным замком. Используется для хранения документации в форматах Foolscap и А4. Имеет антиопрокидывающее устройство и телескопические направляющие. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_kart/kr5.png",
    price: 171111,
    code: "1304",
  },

  {
    link: "kr 7.html",
    title: "Металлический картотечный шкаф (картотека) КР-7",
    desc: "Металлический картотечный шкаф (картотека) КР-7. Предназначен для хранения документов в формате А5. Имеет семь выдвижных ящиков, разделенных перегородкой. Благодаря телескопическим направляющим каждый ящик может быть выдвинут полностью на всю глубину. Металлическая картотека имеет центральный врезной замок. Покрытие - полимерное порошковое светло-серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_kart/kr7.png",
    price: 169236,
    code: "1305",
  },

  {
    link: "foolscap.html",
    title: "Папка FOOLSCAP и A4",
    desc: "Скользящий прозрачный мягкий табулятор. Подвесные папки FoolScap изготовлены из картона высокой плотности, что гарантирует продолжительность их службы. Неоспоримое преимущество папок FoolScap по сравнению с классическими – вместимость большого объёма документации при компактных размерах. <br> Папка FoolScape гораздо компактнее громоздких папок-регистраторов, ее удобнее брать с собой на деловые встречи и совещания. ",
    img: "/images/fulls/shkaf_kart/6.jpg",
    price: 401,
    code: "1306",
  },

  {
    link: "med_shkaf_m_1.html",
    title: "Металлический медицинский шкаф M1 М ",
    desc: "Шкафы медицинские предназначены для хранения медикаментов, медицинского оборудования, документации в больницах, поликлиниках, аптеках и других медицинских учреждениях. Имеет большую долговечность, влагостойкость, устойчива к температурным перепадам, удобна в повседневном обслуживании.  Четыре металлические полки.",
    img: "/images/thumbs/shkaf_med/1.png",
    price: 64232,
    code: "1401",
  },

  {
    link: "med_shkaf_m_1_c.html",
    title: "Металлический медицинский шкаф M1 С",
    desc: "Шкафы медицинские предназначены для хранения медикаментов, медицинского оборудования, документации в больницах, поликлиниках, аптеках и других медицинских учреждениях. Стеклянные двери шкафов (толщина стекла двери 4мм) комплектуются хромированными магнитными защелками фиксирующими дверь в закрытом состоянии.",
    img: "/images/thumbs/shkaf_med/2.png",
    price: 64232,
    code: "1402",
  },

  {
    link: "med_shkaf_m_2_m.html",
    title: "Металлический медицинский шкаф M2 М ",
    desc: "Представленная в каталоге медицинская мебель имеет все необходимые сертификаты, позволяющие устанавливать ее в государственных и частных учреждениях. Металлическая медицинская мебель является экологически чистой, т.к. не содержит смол и других органических соединений, используемых при производстве ДСП. ",
    img: "/images/thumbs/shkaf_med/3.png",
    price: 31504,
    code: "1403",
  },

  {
    link: "med_shkaf_m_2_c.html",
    title: "Металлический медицинский шкаф M2 С",
    desc: "Шкафы покрыты прочной полимерно-порошковой краской, устойчивой к регулярной обработке всеми видами медицинских дезинфицирующих и моющих растворов. Поставляются в разобранном виде, в комплект поставки входят четыре регулируемые опоры позволяющие правильно установить шкаф даже на неровной поверхности и проводить под ним влажную уборку. 	",
    img: "/images/thumbs/shkaf_med/4.png",
    price: 31858,
    code: "1404",
  },
  // _____________________________________Металлические шкафы для сумок (сумочницы)    ____________________________________________
  {
    link: "shkafsection.html",
    title: "Металлический шкаф TSN 710-15325 ",
    desc: "Шкаф включает в себя две секции по 5 отделения с 10 ячейками. Каждая секция с самостоятельным ключом. Замок врезной. Высококачественное порошковое покрытие ",
    img: "/images/fulls/shkaf_sum/6.jpg",
    price: 122668,
    code: "1106",
  },

  {
    link: "shkafsection2.html",
    title: "Металлический шкаф TSN 710-15120",
    desc: "Шкаф включает в себя три секции по 3 отделения с 9 ячейками. Каждая секция с самостоятельным ключом. Замок врезной. Высококачественное порошковое покрытие",
    img: "/images/fulls/shkaf_sum/12.jpg",
    price: 108199,
    code: "1111",
  },

  {
    link: "shkafsection5.html",
    title: "Металлический шкаф TSN 710-15118",
    desc: "Шкаф включает в себя две секции по 3 отделения с 6 ячейками. Каждая секция с самостоятельным ключом. Замок врезной. Высококачественное порошковое покрытие ",
    img: "/images/fulls/shkaf_sum/15.jpg",
    price: 89999,
    code: "1111",
  },

  {
    link: "shkafsection3.html",
    title: "Металлический шкаф TSN 710-15180 ",
    desc: "Шкаф металлический 6-ю ячейками. Каждая секция с самостоятельным ключом и полкой. Замок врезной. Высококачественное порошковое покрытие.",
    img: "/images/fulls/shkaf_sum/13.jpg",
    price: 113978,
    code: "1112",
  },

  {
    link: "shkafsection4.html",
    title: "Металлический шкаф TSN 710-15335",
    desc: "Шкаф включает в себя 3 отделения. Каждая секция с самостоятельным ключом и полкой. Замок врезной. Высококачественное порошковое покрытие. Есть возможность покраски в любые цвета по желанию клиента.",
    img: "/images/fulls/shkaf_sum/14.jpg",
    price: 62335,
    code: "1111",
  },

  {
    link: "shrm14.html",
    title: "Металлический шкаф для сумок ШРМ–14",
    desc: "Металлический шкаф для сумок разборный односекционный с четырьмя отделениями. Каждое отделение сумочницы снабжено дверью с индивидуальным врезным замком. Металлический шкаф ШРМ - 14 предназначен для хранения сумок, пакетов в супермаркетах, а также личных вещей в раздевальных комнатах спортивных клубов, бассейнов и фитнес-центров. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_sum/14.png",
    price: 19536,
    code: "1101",
  },

  {
    link: "shrm28.html",
    title: "Металлический шкаф для сумок ШРМ–28",
    desc: "Шкаф состоит из двух боковых секций модульного ряда. Шкаф имеет восемь отделений. Каждое отделение снабжено индивидуальным врезным замком. Шкаф предназначен для хранения сумок, пакетов в супермаркетах, а также личных вещей в спортклубах и фитнес-центрах. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_sum/28.png",
    price: 35662,
    code: "1102",
  },

  {
    link: "shrm312.html",
    title: "Металлический шкаф для сумок (сумочница) ШРМ - 312",
    desc: "Металлический шкаф для сумок разборный с 12 отделениями. Каждое отделение сумочницы снабжено дверью с индивидуальным врезным замком. Металлический шкаф ШРМ - 312 предназначен для хранения сумок, пакетов в супермаркетах, а также личных вещей в раздевальных комнатах спортивных клубов, бассейнов и фитнес-центров. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_sum/312.png",
    price: 52115,
    code: "1103",
  },

  {
    link: "shrm14m.html",
    title: "Металлический шкаф для сумок ШРМ–14 М",
    desc: "Металлический шкаф для сумок разборный односекционный с четырьмя отделениями. Каждое отделение сумочницы снабжено дверью с индивидуальным врезным замком. Металлический шкаф ШРМ – 14 М предназначен для хранения сумок, пакетов в супермаркетах, а также личных вещей в раздевальных комнатах спортивных клубов, бассейнов и фитнес-центров. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_sum/4.jpg",
    price: 16717,
    code: "1104",
  },

  {
    link: "shrm28m.html",
    title: "Металлический шкаф для сумок ШРМ–28 М",
    desc: "Шкаф состоит из двух боковых секций модульного ряда. Каждое отделение снабжено индивидуальным врезным замком. Шкаф предназначен для хранения сумок, пакетов в супермаркетах, а также личных вещей в спортклубах и фитнес-центрах. Покрытие -  полимерное порошковое серого цвета (RAL 7035).",
    img: "/images/fulls/shkaf_sum/5.jpg",
    price: 19536,
    code: "1105",
  },

  {
    link: "electron4.html",
    title: "Металлический шкаф для мобильных телефонов 40 ячеек",
    desc: "Шкаф включает в себя 4 секции по 10 отделения с 40 ячейками. Каждая секция с самостоятельным электронным замком. Высококачественное порошковое покрытие ",
    img: "/images/fulls/shkaf_sum/10.jpg",
    price: 222984,
    code: "1110",
  },

  {
    link: "electron1.html",
    title: "Металлический шкаф с электронным замком 18 ячеек",
    desc: "Шкаф включает в себя 3 секции по 6 отделения с 18 ячейками. Каждая секция с самостоятельным электронным замком. Высококачественное порошковое покрытие ",
    img: "/images/fulls/shkaf_sum/88888.jpg",
    price: 142586,
    code: "1107",
  },

  {
    link: "electron2.html",
    title: "Металлический шкаф с электронным замком 24 ячеек",
    desc: "Шкаф включает в себя 4 секции по 6 отделения с 24 ячейками. Каждая секция с самостоятельным электронным замком. Высококачественное порошковое покрытие ",
    img: "/images/fulls/shkaf_sum/99.jpg",
    price: 160384,
    code: "1108",
  },

  {
    link: "electron3.html",
    title: "Металлический шкаф с электронным замком 36 ячеек",
    desc: "Шкаф включает в себя 6 секции по 6 отделения с 36 ячейками. Каждая секция с самостоятельным электронным замком. Высококачественное порошковое покрытие ",
    img: "/images/fulls/shkaf_sum/7.jpg",
    price: 211368,
    code: "1109",
  },

  // _____________________________________Почтовые ящики, ключницы____________________________________________

  {
    link: "pochta_4.html",
    title: "Металлический почтовый ящик 4-секционный",
    desc: "Металлический четырех-секционный почтовый ящик ПМ 4 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 4 замка). Каждая дверь имеет окно выштамповки под номер (25х55 мм).",
    img: "/images/fulls/pochta/1.jpg",
    price: 6655,
    code: "3801",
  },

  {
    link: "pochta_5.html",
    title: "Металлический почтовый ящик 5-секционный",
    desc: "Металлический пяти-секционный почтовый ящик ПМ 5 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 5 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм).",
    img: "/images/fulls/pochta/2.jpg",
    price: 7919,
    code: "3802",
  },

  {
    link: "pochta_6.html",
    title: "Металлический почтовый ящик 6-секционный",
    desc: "Металлический шести-секционный почтовый ящик ПМ 6 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 6 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм). ",
    img: "/images/fulls/pochta/3.jpg",
    price: 9140,
    code: "3803",
  },

  {
    link: "pochta_7.html",
    title: "Металлический почтовый ящик 7-секционный",
    desc: "Металлический семи-секционный почтовый ящик ПМ 7 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 7 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм).	",
    img: "/images/fulls/pochta/4.jpg",
    price: 10285,
    code: "3804",
  },

  {
    link: "pochta_8.html",
    title: "Металлический почтовый ящик 8-секционный",
    desc: "Металлический восьми-секционный почтовый ящик ПМ 8 с отдельной дверью на каждую секцию (75х338 мм). Двери имеют ключевые замки (высота 30 мм) с флажковым ригелем (в комплекте к ящику идет 8 замков). Каждая дверь имеет окно выштамповки под номер (25х55 мм).",
    img: "/images/fulls/pochta/5.jpg",
    price: 11417,
    code: "3805",
  },

  {
    link: "pochta_6.html",
    title: "Металлический шкаф для ключей КС - 20",
    desc: "Металлический шкаф для ключей (ключница) КС-20, изготовлены из стали толщиной 1 мм, с полимерным (порошковым) покрытием. В комплекте поставляются разноцветные пластиковые брелки с номерами (20 шт.) и крепежная арматура.",
    img: "/images/fulls/pochta/6.jpg",
    price: 4395,
    code: "3806",
  },

  {
    link: "kc_48.html",
    title: "Металлический шкаф для ключей КС - 48",
    desc: "Металлический шкаф для ключей (ключница) КС-48, изготовлены из стали толщиной 1 мм, с полимерным (порошковым) покрытием. В комплекте поставляются разноцветные пластиковые брелки с номерами (48 шт.) и крепежная арматура. ",
    img: "/images/fulls/pochta/7.jpg",
    price: 7488,
    code: "3807",
  },

  {
    link: "kc_96.html",
    title: "Металлический шкаф для ключей КС - 96",
    desc: "Металлический шкаф для ключей (ключница) КС-96, изготовлены из стали толщиной 1 мм, с полимерным (порошковым) покрытием. В комплекте поставляются разноцветные пластиковые брелки (96 шт.) и крепежная арматура.",
    img: "/images/fulls/pochta/8.jpg",
    price: 9614,
    code: "3808",
  },
  // _____________________________________Металлические верстаки____________________________________________
  {
    link: "verstake.html",
    title: "Металлический верстак с подвесной тумбой ВП-Э",
    desc: "Верстак металлический с подвесной тумбой имеют современный стильный внешний вид, надежность и высокое качество, а также очень удобны в эксплуатации и обслуживании.",
    img: "/images/fulls/met_verstak/1.jpg",
    price: 41084,
    code: "1201",
  },

  {
    link: "verstak1.html",
    title: "Металлический верстак с подвесной тумбой ВП-1",
    desc: "Верстак металлический имеют современный стильный внешний вид, надежность и высокое качество, а также очень удобны в эксплуатации и обслуживании.",
    img: "/images/fulls/met_verstak/2.jpg",
    price: 35560,
    code: "1202",
  },

  {
    link: "verstak2.html",
    title: "Металлический верстак с подвесной тумбой ВП-2",
    desc: "Верстак металлический однотумбовый имеют современный стильный внешний вид, надежность и высокое качество, а также очень удобны в эксплуатации и обслуживании.",
    img: "/images/fulls/met_verstak/3.JPG",
    price: 41901,
    code: "1203",
  },

  {
    link: "verstak3.html",
    title: "Металлический верстак с подвесной тумбой ВП-3",
    desc: "Верстак металлический однотумбовый с драйвером (на пять выдвижных ящиков) имеют современный стильный внешний вид, надежность и высокое качество, а также очень удобны в эксплуатации и обслуживании.",
    img: "/images/fulls/met_verstak/4.jpg",
    price: 70730,
    code: "1204",
  },

  {
    link: "verstak4.html",
    title: "Металлический верстак с подвесной тумбой ВП-4",
    desc: "Верстак металлический двухтумбовый с тумбой и драйвером (на пять выдвижных ящиков) имеют современный стильный внешний вид, надежность и высокое качество, а также очень удобны в эксплуатации и обслуживании.",
    img: "/images/fulls/met_verstak/5.jpg",
    price: 96268,
    code: "1205",
  },

  {
    link: "verstak5.html",
    title: "Металлический верстак с подвесной тумбой ВП-5",
    desc: "Верстак металлический двухтумбовый (с двумя отделениями) имеют современный стильный внешний вид, надежность и высокое качество, а также очень удобны в эксплуатации и обслуживании.",
    img: "/images/fulls/met_verstak/6.jpg",
    price: 76782,
    code: "1206",
  },

  {
    link: "verstak6.html",
    title: "Металлический верстак с подвесной тумбой ВП-6",
    desc: "Верстак металлический двухтумбовый с двумя драйверами (на пять выдвижных ящиков) имеют современный стильный внешний вид, надежность и высокое качество, а также очень удобны в эксплуатации и обслуживании.",
    img: "/images/fulls/met_verstak/7.jpg",
    price: 115765,
    code: "1207",
  },
  // _____________________________________Плиты электрические____________________________________________
  {
    link: "plita_812oh_01.html",
    title: "Плита электрическая 812ОН-01",
    desc: "Плита электрическая 812ОН-01 <b>с 2-мя конфорками и открытым стендом с полкой </b>  предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания и торговли. Модель оснащена полкой, на которой можно хранить посуду и кухонные принадлежности. ",
    img: "/images/thumbs/horest/plita/1.jpg",
    price: 38303,
    code: "8201",
  },
  {
    link: "plita_812oh.html",
    title: "Плита электрическая 812ОН ",
    desc: "Плита электрическая   812ОН <b>с 2-мя конфорками и открытым инвентарным шкафом </b> предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания и торговли. Модель оснащена открытым шкафом, в котором можно хранить посуду и кухонные принадлежности.  ",
    img: "/images/thumbs/horest/plita/2.jpg ",
    price: 46327,
    code: "8202",
  },
  {
    link: "plita_722.html",
    title: "Плита электрическая 722ДН",
    desc: "Плита электрическая  722ДН <b>с 2-мя конфорками и нейтральным шкафом</b> предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания, пищевой промышленности и торговли. Плита оснащена нейтральным шкафом с дверцей, в котором можно хранить посуду и кухонные принадлежности.",
    img: "/images/thumbs/horest/plita/12.jpg",
    price: 46864,
    code: "8203",
  },
  {
    link: "plita_8040.html",
    title: "Плита электрическая 8040 ",
    desc: "Плита электрическая  8040 <b>с 4-мя конфорками и и открытым стендом с полкой </b>предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания, пищевой промышленности и торговли. Столешница и лицевая панель выполнены из нержавеющей стали AISI 304, боковые и задние стенки покрыты порошковой краской.",
    img: "/images/thumbs/horest/plita/4.jpg",
    price: 62425,
    code: "8204",
  },
  {
    link: "plita_812sh.html",
    title: "Плита электрическая 812Ш",
    desc: "Плита электрическая  812Ш <b>с 2-мя конфорками и духовым шкафом</b> предназначена для приготовления различных блюд в наплитной посуде, выпечки пирогов, пиццы и кексов на предприятиях общественного питания и торговли. Модель оснащена функцией автоматического поддержания в духовой камере заданного температурного режима.",
    img: "/images/thumbs/horest/plita/3.jpg",
    price: 67792,
    code: "8205",
  },
  {
    link: "plita_814oh.html",
    title: "Плита электрическая 814OH",
    desc: "Плита электрическая 814ОН <b>с 4-мя конфорками и открытым инвентарным шкафом</b> предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания и торговли. Модель оснащена открытым шкафом, в котором можно хранить посуду и кухонные принадлежности. ",
    img: "/images/thumbs/horest/plita/5.jpg",
    price: 77092,
    code: "8206",
  },

  {
    link: "plita_724sh.html",
    title: "Плита электрическая 724Ш",
    desc: "Плита электрическая 724Ш <b>с 4-мя конфорками и духовым шкафом</b> предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания, пищевой промышленности и торговли.",
    img: "/images/thumbs/horest/plita/9.jpg",
    price: 90330,
    code: "8207",
  },

  {
    link: "plita_814sh.html",
    title: "Плита электрическая 814Ш",
    desc: "Плита электрическая 814Ш <b>с 4-мя конфорками и духовым шкафом</b> предназначена для приготовления различных блюд в наплитной посуде, выпечки пирогов, пиццы и кексов на предприятиях общественного питания и торговли. Модель оснащена функцией автоматического поддержания в духовой камере заданного температурного режима.",
    img: "/images/thumbs/horest/plita/6.jpg",
    price: 90150,
    code: "8208",
  },

  {
    link: "plita_7260.html",
    title: "Плита электрическая 7260",
    desc: "Плита электрическая  7260  <b>с 6-ю конфорками и открытым стендом с полкой </b>предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания, пищевой промышленности и торговли.",
    img: "/images/thumbs/horest/plita/10.jpg",
    price: 105710,
    code: "8209",
  },
  {
    link: "plita_8060.html",
    title: "Плита электрическая 8060",
    desc: "Плита электрическая 8060 <b>с 6-ю конфорками и открытым стендом с полкой </b>предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания и торговли. Модель оснащена полкой, на которой можно хранить посуду и кухонные принадлежности. ",
    img: "/images/thumbs/horest/plita/8.jpg",
    price: 108395,
    code: "8210",
  },
  {
    link: "plita_726shk.html",
    title: "Плита электрическая 726ШК",
    desc: "Плита электрическая 726ШК <b>с 6-ю конфорками, духовым шкафом и вместительным нейтральным шкафом </b>предназначена для приготовления различных блюд в наплитной посуде на предприятиях общественного питания, пищевой промышленности и торговли. ",
    img: "/images/thumbs/horest/plita/11.jpg",
    price: 129859,
    code: "8211",
  },
  {
    link: "plita_806sh.html",
    title: "Плита электрическая 806Ш",
    desc: "Плита электрическая 806Ш <b>с 6-ю конфорками, духовым шкафом и вместительным нейтральным шкафом </b>предназначена для приготовления первых, вторых, третьих блюд в наплитной посуде, а также для жарки полуфабрикатов из мяса, рыбы, овощей и выпечки мелкоштучных кулинарных изделий.",
    img: "/images/thumbs/horest/plita/7.jpg",
    price: 143630,
    code: "8212",
  },
  // _____________________________________Жарочные поверхности____________________________________________

  {
    link: "zhar_sg_470.html",
    title: "Жарочная поверхность СГ-4/7О ",
    desc: "Облицовка жарочной поверхности Rada ПЖЭС-СГ-4/7О выполнена из нержавеющей стали AISI 304, каркас и полка покрыты порошковой краской. Дно прибора изготовлено из толстолистового материала, что обеспечивает равномерность распределения температуры. ",
    img: "/images/thumbs/horest/zhar/1.jpg",
    price: 56520,
    code: "8213",
  },

  {
    link: "zhar_sg_47_h.html",
    title: "Жарочная поверхность СГ-4/7Н",
    desc: "Корпус жарочной поверхности Rada ПЖЭС-СГ-4/7Н выполнен из нержавеющей стали AISI 304. Черная конструкционная углеродистая сталь, из которой сделана рабочая поверхность, обладает повышенными теплопроводными свойствами и устойчивостью к деформациям. ",
    img: "/images/thumbs/horest/zhar/2.jpg",
    price: 62600,
    code: "8214",
  },

  {
    link: "zhar_870.html",
    title: "Жарочная поверхность СГ-8/7О",
    desc: "Облицовка жарочной поверхности СК-8/7О выполнена из нержавеющей стали AISI 304, каркас и полка покрыты порошковой краской. Комбинированная поверхность – гладкая + рифленая. Дно прибора изготовлено из толстолистового материала, что обеспечивает равномерность распределения температуры.",
    img: "/images/thumbs/horest/zhar/3.jpg",
    price: 85859,
    code: "8215",
  },

  {
    link: "zhar_87_h.html",
    title: "Жарочная поверхность СГ-8/7H",
    desc: "Корпус жарочной поверхности СК-8/7Н выполнен из нержавеющей стали AISI 304. Комбинированная поверхность – гладкая + рифленая. Дно прибора изготовлено из толстолистового материала, что обеспечивает равномерность распределения температуры. ",
    img: "/images/thumbs/horest/zhar/4.jpg",
    price: 98200,
    code: "8216",
  },

  {
    link: "zhar_taverna.html",
    title: "Жарочная поверхность Таверна",
    desc: "Настольная жарочная поверхность «Таверна»-2005 предназначена для жарки мясных и рыбных стейков, колбасок, сосисок, сарделек, шпикачек, котлет для бургеров, овощей и пр.",
    img: "/images/thumbs/horest/zhar/5.jpg",
    price: 65690,
    code: "8217",
  },

  {
    link: "zhar_818.html",
    title: "Жарочная поверхность HEG-818",
    desc: "Поверхность жарочная HEG-818 настольный предназначен для приготовления мяса, рыбы, яиц, сыра, овощей и др., а также для подогревания бутербродов и горячих сэндвичей разного размера и толщины. Изделие используется на предприятиях общественного питания.  ",
    img: "/images/thumbs/horest/zhar/6.jpg",
    price: 37180,
    code: "8218",
  },

  {
    link: "zhar_821.html",
    title: "Жарочная поверхность рифленая HEG-821",
    desc: " Жарочная поверхность EKSI HEG-821 предназначена для жарки мясных, рыбных и овощных блюд на предприятиях общественного питания. Равномерный нагрев поверхности обеспечивает качественную обработку продуктов. Модель оснащена термостатом и бортиками по периметру для предотвращения разбрызгивания жира.",
    img: "/images/thumbs/horest/zhar/7.jpg",
    price: 47190,
    code: "8219",
  },

  {
    link: "zhar_822.html",
    title: "Жарочная поверхность комбинированная HEG-822",
    desc: "Поверхность жарочная HEG-822 настольный предназначен для приготовления мяса, рыбы, яиц, сыра, овощей и др., а также для подогревания бутербродов и горячих сэндвичей разного размера и толщины. Изделие используется на предприятиях общественного питания. ",
    img: "/images/thumbs/horest/zhar/8.jpg",
    price: 61490,
    code: "8220",
  },

  // _____________________________________Жарочные шкафы____________________________________________

  {
    link: "shkaf_921.html",
    title: "Шкаф жарочный 921",
    desc: "Жарочный шкаф предназначен для жарки и запекания широкого спектра блюд на предприятиях общественного питания и в крупных супермаркетах. Каркас шкафа изготовлен из квадратной трубы 20х20х2 мм, фронтальная часть и крыша прибора - из нержавеющей стали AISI 304, боковины - из окрашенной порошковой краской стали, подставка - из квадратной трубы 40х40 мм, оснащена полкой из окрашенной порошковой краской стали.  ",
    img: "/images/thumbs/horest/shkaf/1.jpg",
    price: 50540,
    code: "8221",
  },

  {
    link: "shkaf_922.html",
    title: "Шкаф жарочный 922",
    desc: "Шкаф жарочный 922 предназначен для жарки и запекания широкого спектра блюд на предприятиях общественного питания и в крупных супермаркетах. Каркас шкафа изготовлен из квадратной трубы 20х20х2 мм, фронтальная часть и крыша прибора - из нержавеющей стали AISI 304, боковины - из окрашенной порошковой краской стали, подставка - из квадратной трубы 40х40 мм, оснащена полкой из окрашенной порошковой краской стали.  ",
    img: "/images/thumbs/horest/shkaf/2.jpg",
    price: 86390,
    code: "8222",
  },
  {
    link: "shkaf_923.html",
    title: "Шкаф жарочный 923",
    desc: "Жарочный трёхсекционный шкаф 923 предназначен для жарки и запекания мясных, рыбных и овощных блюд на предприятиях общественного питания. Предусмотрено использование стандартных гастроемкостей 1хGN 2/1 или 2хGN1/1 (для каждой секции).",
    img: "/images/thumbs/horest/shkaf/3.jpg",
    price: 118770,
    code: "8223",
  },
  // _____________________________________Сковороды электрические____________________________________________
  {
    link: "skovoroda_87.html",
    title: "Сковорода электрическая 28/7",
    desc: "Электрическая сковорода 8/7 предназначена для жарения, тушения, припускания различных блюд и пассирования овощей в кафе, ресторанах, столовых предприятий и школ, а также в крупных супермаркетах. Верхняя, передняя панель и панель управления выполнены из нержавеющей стали, задняя и боковые панели - из крашеного металла, чаша - из черной конструкционной углеродистой стали с повышенными теплопроводными свойствами и устойчивостью к деформации и нержавеющей стали.",
    img: "/images/thumbs/horest/skovoroda/2.jpg",
    price: 126640,
    code: "8224",
  },

  {
    link: "skovoroda_12.html",
    title: "Сковорода электрическая 12/7Н ",
    desc: "Электрическая сковорода 12/7Н предназначена для жарки и тушения мясных, рыбных и овощных блюд. Модель отлично подойдет для приготовления пищи на предприятиях общественного питания, таких как кафе, рестораны и столовые. Удобная система очистки, дополненная душирующим устройством, проста в эксплуатации и не требует дополнительных затрат.",
    img: "/images/thumbs/horest/skovoroda/111.jpg",
    price: 160890,
    code: "8225",
  },
  // _____________________________________Фритюрницы____________________________________________

  {
    link: "fryer_47.html",
    title: "Фритюрница электрическая 4/7О",
    desc: "Фритюрница 4/7О тепловой предназначена для приготовления блюд в большом объёме масла на предприятиях общественного питания и торговли. Фритюрница электрическая ФЭС-8/7О относится к разряду профессионального кухонного оборудования. Предназначена для жарки во фритюре картофеля, рыбы и других кулинарных и кондитерских изделий.",
    img: "/images/thumbs/horest/fryer/1.jpg",
    price: 79240,
    code: "8226",
  },
  {
    link: "fryer_47_h.html",
    title: "Фритюрница электрическая 4/7Н",
    desc: "Фритюрница 4/7Н тепловой предназначена для приготовления блюд в большом объёме масла на предприятиях общественного питания и торговли. Фритюрница электрическая ФЭС-8/7О относится к разряду профессионального кухонного оборудования. Предназначена для жарки во фритюре картофеля, рыбы и других кулинарных и кондитерских изделий. ",
    img: "/images/thumbs/horest/fryer/2.jpg",
    price: 94620,
    code: "8227",
  },
  {
    link: "fryer_87.html",
    title: "Фритюрница электрическая 8/7О",
    desc: "Фритюрница 8/7О тепловой предназначена для приготовления блюд в большом объёме масла на предприятиях общественного питания и торговли. Фритюрница электрическая ФЭС-8/7О относится к разряду профессионального кухонного оборудования. Предназначена для жарки во фритюре картофеля, рыбы и других кулинарных и кондитерских изделий.",
    img: "/images/thumbs/horest/fryer/3.jpg",
    price: 105890,
    code: "8228",
  },
  {
    link: "fryer_87_h.html",
    title: "Фритюрница электрическая 8/7H",
    desc: "Фритюрница 8/7H тепловой предназначена для приготовления блюд в большом объёме масла на предприятиях общественного питания и торговли. Фритюрница электрическая ФЭС-8/7H относится к разряду профессионального кухонного оборудования. Предназначена для жарки во фритюре картофеля, рыбы и других кулинарных и кондитерских изделий.",
    img: "/images/thumbs/horest/fryer/4.jpg",
    price: 94620,
    code: "8229",
  },
  {
    link: "fryer_hef_88.html",
    title: "Фритюрница настольная одинарная HEF-88",
    desc: "Фритюрницы предназначены для жарки продуктов в большом объеме масла (во фритюре). Фритюрницы могут быть настольными, напольными и используются на кухнях предприятий общественного питания. Модельный ряд фритюрниц включает единицы с одной или двумя емкостями. Электрическая фритюрница является одним из важнейших элементов современной кухни.",
    img: "/images/thumbs/horest/fryer/5.jpeg",
    price: 25740,
    code: "8230",
  },
  {
    link: "fryer_hef_82.html",
    title: " Фритюрница настольная двойная HEF-82",
    desc: "Фритюрница с 2 котлами емкостью 6 л каждый с крышками предназначен для приготовления блюд в глубоком слое масла (во фритюре) на профессиональной кухне. Фритюрница предназначена для приготовления различных продуктов в большом количестве масла на предприятиях общественного питания и торговли. Корпус выполнен из нержавеющей стали.",
    img: "/images/thumbs/horest/fryer/6.jpg",
    price: 31460,
    code: "8231",
  },
  {
    link: "fryer_hef_8_l.html",
    title: " Фритюрница настольная одинарная HEF-8L",
    desc: "Ппредназначена для жарки во фритюре с использованием специальной сетчатой корзины: картофеля, чипсов, хвороста, рыбы, мяса, беляшей, пирожков, пончиков, овощей, котлет по-киевски и других продуктов в большом количестве масла на предприятиях общественного питания, заведениях фаст-фуда.",
    img: "/images/thumbs/horest/fryer/7.jpeg",
    price: 32890,
    code: "8232",
  },

  {
    link: "fryer_8_l_2.html",
    title: "Фритюрница настольная двойная HEF-8L-2",
    desc: "Фритюрница двойная HEF-8L-2 предназначена для обжаривания продуктов в большом количестве масла при высокой температуре на предприятиях общественного питани и торговли. Модель оснащена 2 независимыми панелями управления для каждой ванны. Корпус выполнен из нержавеющей стали.",
    img: "/images/thumbs/horest/fryer/8.jpg",
    price: 64350,
    code: "8233",
  },
  {
    link: "fryer_panda_1.html",
    title: "Фритюрница Панда-ЕВРО-1х1/1-Э",
    desc: "Фритюрница настольная электрическая предназначена для приготовления в масле (фритюре) различных продуктов питания: мяса, рыбы, овощей и мучных изделий. Фритюрница выполнена из пищевой нержавеющей стали. Она состоит из фритюрной ванны и блока управления ТЭНом.",
    img: "/images/thumbs/horest/fryer/9.jpg",
    price: 84580,
    code: "8234",
  },
  {
    link: "fryer_panda_3.html",
    title: "Фритюрница  Панда-ЕВРО-1х1/3",
    desc: "Фритюрница настольная электрическая предназначена для приготовления в масле (фритюре) различных продуктов питания: мяса, рыбы, овощей и мучных изделий. Фритюрница выполнена из пищевой нержавеющей стали. Она состоит из фритюрной ванны и блока управления ТЭНом.",
    img: "/images/thumbs/horest/fryer/10.jpg",
    price: 39460,
    code: "8235",
  },
  // _____________________________________Печи для пиццы____________________________________________
  {
    link: "pizza_hep_1.html",
    title: "Печь для пиццы настольная одинарная HEP-1ST",
    desc: "Печь для пиццы HEP-1ST используется на предприятиях общественного питания и торговли для выпечки пиццы и хлеба. Модель оснащена механической панелью управления, 2-мя электрическими ТЭНами, расположенными вверху и внизу камеры, регулятором температуры, индикатором нагрева, смотровым стеклянным окном и каменным подом.",
    img: "/images/thumbs/horest/pizza/1.jpg",
    price: 82940,
    code: "8236",
  },
  {
    link: "pizza_hep_2.html",
    title: "Печь для пиццы настольная двойная HEP-2ST",
    desc: "Печь для пиццы HEP-2ST используется на предприятиях общественного питания и торговли для выпечки пиццы и хлеба. Модель оснащена механической панелью управления, 3-мя электрическими ТЭНами, регулятором температуры, индикатором нагрева, смотровым стеклянным окном и каменным подом. Внутренняя поверхность и направляющие выполнены из алюминия, внешняя - из нержавеющей стали S/S 201.",
    img: "/images/thumbs/horest/pizza/2.jpg",
    price: 121550,
    code: "8237",
  },
  // _____________________________________Мармиты____________________________________________
  {
    link: "marmit_4_7_o.html",
    title: "Мармит вторых блюд 4/7O",
    desc: "Мармит электрический 2-х блюд 4/7О используется для кратковременного сохранения в горячем состоянии вторых блюд, гарниров, соусов. Набор гастроемкостей с крышками и ручками – 3 шт Мармиты выполняются в стационарном (напольном) варианте и могут использоваться на предприятиях общественного питания как самостоятельное изделие, а также в составе тепловой линии. Мармит работает в двух режимах: в режиме парового и водяного подогрева. ",
    img: "/images/thumbs/horest/marmit/1.jpg",
    price: 51155,
    code: "8239",
  },

  {
    link: "marmit_4_7_h.html",
    title: "Мармит вторых блюд 4/7H",
    desc: "Мармит электрический 2-х блюд 4/7Н используется для кратковременного сохранения в горячем состоянии вторых блюд, гарниров, соусов. Набор гастроемкостей с крышками и ручками – 3 шт Мармиты выполняются в стационарном (напольном) варианте и могут использоваться на предприятиях общественного питания как самостоятельное изделие, а также в составе тепловой линии. Мармит работает в двух режимах: в режиме парового и водяного подогрева. ",
    img: "/images/thumbs/horest/marmit/2.jpg",
    price: 56345,
    code: "8240",
  },
  {
    link: "marmit_8_7_o.html",
    title: "Мармит вторых блюд 8/7O",
    desc: "Мармит электрический 2-х блюд 8/7О используется для кратковременного сохранения в горячем состоянии вторых блюд, гарниров, соусов.  Мармиты выполняются в стационарном (напольном) варианте и могут использоваться на предприятиях общественного питания как самостоятельное изделие, а также в составе тепловой линии. Мармит работает в двух режимах: в режиме парового и водяного подогрева. ",
    img: "/images/thumbs/horest/marmit/3.jpg",
    price: 79240,
    code: "8241",
  },
  {
    link: "marmit_8_7_h.html",
    title: "Мармит вторых блюд 8/7H",
    desc: "Мармит электрический 2-х блюд 8/7H используется для кратковременного сохранения в горячем состоянии вторых блюд, гарниров, соусов. Мармиты выполняются в стационарном (напольном) варианте и могут использоваться на предприятиях общественного питания как самостоятельное изделие, а также в составе тепловой линии. Мармит работает в двух режимах: в режиме парового и водяного подогрева. ",
    img: "/images/thumbs/horest/marmit/4.jpg",
    price: 88000,
    code: "8242",
  },
  // _____________________________________Салат бары____________________________________________
  {
    link: "salatbar_neutral.html",
    title: "Салат бар нейтральный",
    desc: "Передвижные салат-бары предназначены для хранения, демонстрации и раздачи блюд. Оснащены складывающимися направляющими для подносов с двух сторон. Верхняя полка в каждой модели защищена декоративным ограждением и имеет в комплекте подсветку.",
    img: "/images/thumbs/horest/salatbar/2.jpg",
    price: 81290,
    code: "8251",
  },

  {
    link: "salatbar_teplovoi.html",
    title: "Салат бар тепловой",
    desc: "Передвижные салат-бары предназначены для хранения, демонстрации и раздачи блюд. Оснащены складывающимися направляющими для подносов с двух сторон. Верхняя полка в каждой модели защищена декоративным ограждением и имеет в комплекте подсветку.",
    img: "/images/thumbs/horest/salatbar/1.jpg",
    price: 125660,
    code: "8252",
  },
  {
    link: "salatbar_holod.html",
    title: "Салат бар охлаждаемый",
    desc: "Передвижные салат-бары предназначены для хранения, демонстрации и раздачи блюд. Оснащены складывающимися направляющими для подносов с двух сторон. Верхняя полка в каждой модели защищена декоративным ограждением и имеет в комплекте подсветку.",
    img: "/images/thumbs/horest/salatbar/3.jpg",
    price: 154770,
    code: "8253",
  },

  // _____________________________________Линии раздачи Вега____________________________________________
  {
    link: "vega_prilavok_vnutrenniy.html",
    title: "Прилавок угловой внутренний",
    desc: "Прилавки угловые изготавливаются в двух видах и типоразмер: внешние угловые прилавки (45 и 90 градусов) и внутренние угловые прилавки (45 и 90 градусов). Эти элементы позволяют проектировать и исполнять гибкие формы для расстановки линии в зависимости от заявленных к использованию площадей клиента. Сочетает в себе гибкость конфигурации, высокое качество комплектующих и уникальные конструкторские решения. ",
    img: "/images/thumbs/horest/linii/products/7.jpg",
    price: 52588,
    code: "8261",
  },
  {
    link: "vega_prilavok_vneshniy.html",
    title: "Прилавок угловой внешний",
    desc: "Прилавки угловые изготавливаются в двух видах и типоразмер: внешние угловые прилавки (45 и 90 градусов) и внутренние угловые прилавки (45 и 90 градусов). Эти элементы позволяют проектировать и исполнять гибкие формы для расстановки линии в зависимости от заявленных к использованию площадей клиента. ",
    img: "/images/thumbs/horest/linii/products/8.jpg",
    price: 53840,
    code: "8262",
  },

  {
    link: "vega_prilavok_neutral.html",
    title: "Прилавок нейтральный",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также для установки дополнительного оборудования. В нейтральном столе выделены две розетки для подключения дополнительного оборудования. ",
    img: "/images/thumbs/horest/linii/products/9.jpg",
    price: 68550,
    code: "8263",
  },

  {
    link: "vega_kassovaya_kabina.html",
    title: "Кассовая кабина",
    desc: "Кассовая кабина предназначен для временного поддержания в горячем виде супов, бульонов и каш. Расположенная на высоте тележек полка с конфорками позволяет легко перемещать тяжелую наплитную посуду для хранения на мармит. Над мармитом расположена двухъярусная полка, на которой размещаются порционные блюда. Зона конфорок отделена от посетителей перегородкой из стекла, предохраняя пищу от внешних воздействий. ",
    img: "/images/thumbs/horest/linii/products/5.jpg",
    price: 76128,
    code: "8264",
  },

  {
    link: "vega_prilavok_dlya_podnosov.html",
    title: "Прилавок для подносов",
    desc: "Прилавок предназначен для раздачи столовых приборов и подносов. В комплектацию входит 6 перфорированных стаканов для столовых приборов.  ",
    img: "/images/thumbs/horest/linii/products/6.jpg",
    price: 107430,
    code: "8265",
  },

  {
    link: "vega_dispenser_podogrevatel.html",
    title: "Диспенсер-подогреватель",
    desc: "Диспенсер-подогреватель для тарелок предназначен для нагрева и длительного сохранения в тёплом состоянии тарелок, используемых для раздачи горячей пищи на предприятиях общественного питания самостоятельно или в составе технологической линии раздачи. Две шахты, единовременная загрузка 40-50 тарелок в каждую. Диспенсер-подогреватель комплектуется двумя крышками, которые служат более быстрому нагреву и поддержанию температуры тарелок. ",
    img: "/images/thumbs/horest/linii/products/1.jpg",
    price: 118951,
    code: "8266",
  },

  {
    link: "vega_marmit_pervyh_blyud.html",
    title: "Мармит первых блюд",
    desc: "Мармит первых блюд предназначен для временного поддержания в горячем виде супов, бульонов и каш. Расположенная на высоте тележек полка с конфорками позволяет легко перемещать тяжелую наплитную посуду для хранения на мармит. Над мармитом расположена двухъярусная полка, на которой размещаются порционные блюда. Зона конфорок отделена от посетителей перегородкой из стекла, предохраняя пищу от внешних воздействий. ",
    img: "/images/thumbs/horest/linii/products/4.jpg",
    price: 148501,
    code: "8267",
  },

  {
    link: "vega_marmit_vtoryh_blyud.html",
    title: "Мармит вторых блюд",
    desc: "Мармит вторых блюд предназначен для демонстрации, кратковременного хранения и раздачи посетителям вторых блюд и соусов в горячем состоянии. Над мармитом расположена двухъярусная полка, на которой размещаются порционные блюда. Зона с гастроёмкостями отделена от посетителей перегородкой из стекла (противокашлевым экраном), предохраняя пищу от внешних воздействий. Мармит комплектуется гастроёмкостями. ",
    img: "/images/thumbs/horest/linii/products/3.jpg",
    price: 207600,
    code: "8268",
  },

  {
    link: "vega_prilavok_vitrina_ohlajdaemyi.html",
    title: "Прилавок-витрины охлаждаемый",
    desc: "Прилавок охлажденный открытый предназначен для кратковременного хранения, демонстрации и раздачи холодных закусок и напитков. Рабочая температура прилавка устанавливается с помощью электронного терморегулятора. Над прилавком располагается двухъярусная стеклянная полка, усиленная нержавеющим швеллером, на которой размещаются порционные блюда.  Сочетает в себе гибкость конфигурации, высокое качество комплектующих и уникальные конструкторские решения. ",
    img: "/images/thumbs/horest/linii/products/10.jpg",
    price: 220618,
    code: "8269",
  },

  {
    link: "vega_marmit_universal.html",
    title: "Мармит универсальный",
    desc: "Мармит универсальный для первых и вторых блюд предназначен для демонстрации, кратковременного хранения и раздачи посетителям супов, бульонов, каш, а также вторых блюд и соусов в горячем состоянии. Над мармитом расположена двухъярусная полка, на которой размещаются порционные блюда. Зона с конфоркой и гастроёмкостями отделена от посетителей перегородкой из стекла (проивокашлевым экраном). Мармит комплектуется гастроёмостями. ",
    img: "/images/thumbs/horest/linii/products/2.jpg",
    price: 230718,
    code: "8270",
  },

  {
    link: "vega_prilavok_ohlajdaemyi.html",
    title: "Прилавок-витрина охлаждаемый",
    desc: "Прилавок охлаждаемый предназначен для кратковременного хранения, демонстрации и раздачи предварительно охлажденных закусок, салатов, фруктов и напитков. Витрина оснащена подсветкой, электронным терморегулятором температуры и автоматических режимом оттаивания. Витрина открывается с внутренней и внешней стороны (покупателя и персонала). В качестве боковых стенок применяются стеклопакеты, которые эффективнее поддерживают температурный режим в витрине.  ",
    img: "/images/thumbs/horest/linii/products/11.jpg",
    price: 341071,
    code: "8271",
  },

  // _____________________________________Линии раздачи Мастер____________________________________________
  {
    link: "master_prilavok_dlya_podnosov_1.html",
    title: "Прилавок для подносов ПП-1/6",
    desc: "Прилавок предназначен для раздачи столовых приборов и подносов. В комплектацию входит 6 перфорированных стаканов для столовых приборов.  ",
    img: "/images/thumbs/horest/linii/products/19.jpg",
    price: 56844,
    code: "8272",
  },

  {
    link: "master_kassovaya_kabina.html",
    title: "Кассовая кабина",
    desc: "Кассовая кабина предназначен для временного поддержания в горячем виде супов, бульонов и каш. Расположенная на высоте тележек полка с конфорками позволяет легко перемещать тяжелую наплитную посуду для хранения на мармит. Над мармитом расположена двухъярусная полка, на которой размещаются порционные блюда. Зона конфорок отделена от посетителей перегородкой из стекла, предохраняя пищу от внешних воздействий. ",
    img: "/images/thumbs/horest/linii/products/17.jpg",
    price: 77127,
    code: "8273",
  },

  {
    link: "master_prilavok_dlya_podnosov_2.html",
    title: "Прилавок для подносов ПП-2/6",
    desc: "Прилавок предназначен для раздачи столовых приборов и подносов. В комплектацию входит 6 перфорированных стаканов для столовых приборов.  ",
    img: "/images/thumbs/horest/linii/products/18.jpg",
    price: 81677,
    code: "8274",
  },

  {
    link: "master_prilavok_neutral.html",
    title: "Прилавок нейтральный",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также для установки дополнительного оборудования. В нейтральном столе выделены две розетки для подключения дополнительного оборудования.",
    img: "/images/thumbs/horest/linii/products/12.jpg",
    price: 84392,
    code: "8275",
  },

  {
    link: "master_marmit_pervyh_blyud.html",
    title: "Мармит первых блюд",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также для установки дополнительного оборудования. В нейтральном столе выделены две розетки для подключения дополнительного оборудования.",
    img: "/images/thumbs/horest/linii/products/16.jpg",
    price: 107181,
    code: "8276",
  },

  {
    link: "master_prilavok_neutral_s_polkoi.html",
    title: "Прилавок нейтральный с полкой",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также для установки дополнительного оборудования. В нейтральном столе выделены две розетки для подключения дополнительного оборудования.",
    img: "/images/thumbs/horest/linii/products/20.jpg",
    price: 108433,
    code: "8277",
  },

  {
    link: "master_dispenser.html",
    title: "Диспенсер-подогреватель",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также для установки дополнительного оборудования. В нейтральном столе выделены две розетки для подключения дополнительного оборудования.",
    img: "/images/thumbs/horest/linii/products/13.jpg",
    price: 112488,
    code: "8278",
  },

  {
    link: "master_marmit_vtoryh_blyud.html",
    title: "Мармит вторых блюд",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также для установки дополнительного оборудования. В нейтральном столе выделены две розетки для подключения дополнительного оборудования.",
    img: "/images/thumbs/horest/linii/products/15.jpg",
    price: 172287,
    code: "8279",
  },

  {
    link: "master_prilavok_ohlajdaemyi.html",
    title: "Прилавок охлаждаемый открытый",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также для установки дополнительного оборудования. В нейтральном столе выделены две розетки для подключения дополнительного оборудования.",
    img: "/images/thumbs/horest/linii/products/21.jpg",
    price: 172536,
    code: "8280",
  },

  {
    link: "master_marmit_universal.html",
    title: "Мармит универсальный",
    desc: "Мармит универсальный для первых и вторых блюд предназначен для демонстрации, кратковременного хранения и раздачи посетителям супов, бульонов, каш, а также вторых блюд и соусов в горячем состоянии. Над мармитом расположена двухъярусная полка, на которой размещаются порционные блюда. Зона с конфоркой и гастроёмкостями отделена от посетителей перегородкой из стекла (проивокашлевым экраном). Мармит комплектуется гастроёмостями.  ",
    img: "/images/thumbs/horest/linii/products/14.jpg",
    price: 209101,
    code: "8281",
  },

  {
    link: "master_prilavok_ohlajdaemyi_close.html",
    title: "Прилавок-витрина охлаждаемый закрытый",
    desc: "Прилавок охлаждаемый предназначен для кратковременного хранения, демонстрации и раздачи предварительно охлажденных закусок, салатов, фруктов и напитков. Витрина оснащена подсветкой, электронным терморегулятором температуры и автоматических режимом оттаивания. Витрина открывается с внутренней и внешней стороны (покупателя и персонала). В качестве боковых стенок применяются стеклопакеты, которые эффективнее поддерживают температурный режим в витрине. Рабочая температура прилавка устанавливается с помощью электронного терморегулятора.  ",
    img: "/images/thumbs/horest/linii/products/23.jpg",
    price: 285226,
    code: "8282",
  },

  // _____________________________________Линии раздачи Школьник____________________________________________
  {
    link: "shkolnik_prilavok_dlya_podnosov_1.html",
    title: "Прилавок для подносов ПП-1/6",
    desc: "Прилавок предназначен для раздачи хлеба, столовых приборов и подносов. В комплектацию прилавка входят стаканы с перфорацией для столовых приборов. Внизу расположен инвентарный шкаф. ",
    img: "/images/thumbs/horest/linii/products/29.jpg",
    price: 53904,
    code: "8291",
  },

  {
    link: "shkolnik_kassovaya_kabina.html",
    title: "Кассовая кабина",
    desc: "Кассовый прилавок предназначен для установки кассового аппарата и работы кассира. Предусмотрено угловое размещение кассира, которое создаёт дополнительные удобства в работе: кассир находится вполоборота к клиенту, у кассира появляется место для размещения не только кассового аппарата, но и компьютера и комфортной работы с ним (пространство для рук). В столешнице находятся отверстия с заглушками для вывода проводов кассового оборудования.",
    img: "/images/thumbs/horest/linii/products/27.jpg",
    price: 60805,
    code: "8292",
  },

  {
    link: "shkolnik_prilavok_dlya_podnosov_2.html",
    title: "Прилавок для подносов ПП-2/6",
    desc: "Прилавок предназначен для раздачи хлеба, столовых приборов и подносов. В комплектацию прилавка входят стаканы с перфорацией для столовых приборов. Внизу расположен инвентарный шкаф. ",
    img: "/images/thumbs/horest/linii/products/28.jpg",
    price: 62777,
    code: "8293",
  },

  {
    link: "shkolnik_prilavok_neutral.html",
    title: "Прилавок нейтральный",
    desc: "Прилавок нейтральный предназначен для раздачи готовых блюд, горячих и холодных напитков, десертов, а также установки дополнительного оборудования. В нейтральном столе выведены две розетки для подключения дополнительного оборудования. ",
    img: "/images/thumbs/horest/linii/products/30.jpg",
    price: 83483,
    code: "8294",
  },

  {
    link: "shkolnik_marmit_pervyh_blyud.html",
    title: "Мармит первых блюд",
    desc: "Мармит первых блюд предназначен для временного поддержания в горячем виде супов, бульонов и каш. Расположенная на высоте тележек полка с конфорками позволяет легко перемещать тяжёлую наплитную посуду для хранения на мармит. Над мармитом расположена полка, на которой размещаются порционные блюда.",
    img: "/images/thumbs/horest/linii/products/26.jpg",
    price: 99425,
    code: "8295",
  },
  {
    link: "shkolnik_marmit_vtoryh_blyud.html",
    title: "Мармит вторых блюд",
    desc: "Мармит вторых блюд предназначен для демонстрации, кратковременного хранения и раздачи посетителям вторых блюд и соусов в горячем состоянии. Над мармитом расположена двухуровневая полка, на которой размещаются порционные блюда. Мармит комплектуется гастроёмкостями.",
    img: "/images/thumbs/horest/linii/products/25.jpg",
    price: 153162,
    code: "8296",
  },
  {
    link: "shkolnik_prilavok_ohlajdaemyi.html",
    title: "Прилавок-витрина охлаждаемый открытый",
    desc: "Прилавок охлаждаемый открытый предназначен для кратковременного хранения, демонстрации и раздачи холодных закусок и напитков. Рабочая температура прилавка устанавливается с помощью механического регулятора. ",
    img: "/images/thumbs/horest/linii/products/31.jpeg",
    price: 172536,
    code: "8297",
  },

  {
    link: "shkolnik_marmit_universal.html",
    title: "Мармит универсальный",
    desc: "Мармит универсальный первых и вторых блюд предназначен для демонстрации, кратковременного хранения и раздачи посетителям супов, бульонов, каш, а также вторых блюд и соусов в горячем состоянии. Над мармитом расположена двухуровневая полка, на которой размещаются порционные блюда. Мармит комплектуется гастроёмкостями.",
    img: "/images/thumbs/horest/linii/products/24.jpeg",
    price: 187018,
    code: "8298",
  },

  {
    link: "shkolnik_prilavok_ohlajdaemyi_close.html",
    title: "Прилавок-витрина охлаждаемый закрытый",
    desc: "Прилавок охлаждаемый предназначен для кратковременного хранения, демонстрации и раздачи предварительно охлаждённых закусок, салатов, фруктов и напитков. Витрина оснащена подсветкой, электронным терморегулятором и автоматическим режимом оттаивания. Витрина открывается с внутренней и внешней стороны (покупателя и персонала). В качестве боковых стенок применяются стеклопакеты, которые эффективно поддерживают температурный режим в витрине. Рабочая температура прилавка устанавливается с помощью электронного терморегулятора. ",
    img: "/images/thumbs/horest/linii/products/32.jpg",
    price: 282234,
    code: "8299",
  },
  // _____________________________________Линии раздачи Ривьера____________________________________________
  {
    link: "rivera_stoika_dlya_priborov.html",
    title: "Стойка для приборов",
    desc: "Стойка для приборов предназначена для хранения столовых приборов, хлеба, подносов и салфеток. Конструкция сборная, бескаркасная. Столешница выполнена из нержавеющей стали AISI430 и усилена листом ламинированной ДСП толщиной 16 мм. Ножки модуля выполнены из нержавеющей стали, имеют пластиковую опорную часть и регулируют высоту модуля в пределах ±20 мм.",
    img: "/images/thumbs/horest/linii/products/39.jpg",
    price: 140031,
    code: "8321",
  },
  {
    link: "rivera_kassovyi_stol.html",
    title: "Кассовый стол",
    desc: "Кассовый стол предназначен для оборудования рабочего места продавца-кассира. Модуль также может использоваться в качестве нейтрального стола для выкладки товаров или для установки дополнительного оборудования. Конструкция сборная, бескаркасная, выполнена из нержавеющей стали AISI430. Столешница выполнена из нержавеющей стали и усилена листом ламинированной ДСП толщиной 16 мм. ",
    img: "/images/thumbs/horest/linii/products/34.jpg",
    price: 159444,
    code: "8322",
  },

  {
    link: "rivera_prilavok_dlya_goryachoh_napitkov.html",
    title: "Прилавок для горячих напитков",
    desc: "Прилавок для горячих напитков используется на предприятиях общественного питания и торговли для выкладки продуктов и напитков, не требующих подогрева или охлаждения, а также для установки дополнительного оборудования и приспособлений. Модель оснащена 2 розетками для подключения электрокипятильника и другого оборудования, расположенными со стороны обслуживающего персонала. ",
    img: "/images/thumbs/horest/linii/products/37.jpg",
    price: 186663,
    code: "8323",
  },
  {
    link: "rivera_marmit_vtoryh_blyud.html",
    title: "Мармит вторых блюд",
    desc: "Мармит используется на предприятиях общественного питания и торговли для поддержания в горячем состоянии гастроемкостей со вторыми блюдами, гарнирами и соусами. Модель оснащена герметичной ванной для размещения гастроемкостей и терморегулятором, позволяющим осуществлять настройку температуры нагрева гастроемкостей. Столешница выполнена из нержавеющей стали AISI 430 и усилена листом ламинированной ДСП толщиной 16 мм, ванна - из нержавеющей стали, ножки - из нержавеющей стали и пластиковой опорной части.",
    img: "/images/thumbs/horest/linii/products/35.jpg",
    price: 281353,
    code: "8324",
  },
  {
    link: "rivera_ohlajdaemyi_stol.html",
    title: "Охлаждаемый стол ",
    desc: "Охлаждаемый стол используется на предприятиях общественного питания и торговли для кратковременного хранения и раздачи холодных напитков, салатов, кисломолочных продуктов и других блюд, требующих хранения в охлажденном состоянии. Модель оснащена герметичной ванной для размещения гастроемкостей или напитков и продуктов в фабричной упаковке, а также тарелок с уже сервированными блюдами непосредственно на дне ванны.",
    img: "/images/thumbs/horest/linii/products/36.jpg",
    price: 336605,
    code: "8325",
  },
  {
    link: "rivera_holodilnaya_vitrina.html",
    title: "Холодильная витрина",
    desc: "Холодильная витрина используется на предприятиях общественного питания и торговли для кратковременного хранения, демонстрации и раздачи холодных напитков, салатов, кисломолочных продуктов и других блюд, требующих хранения в охлажденном состоянии. Модель оснащена 3 вместительными съемными перфорированными полками. Столешница выполнена из нержавеющей стали AISI 430 и усилена листом ламинированной ДСП толщиной 16 мм.",
    img: "/images/thumbs/horest/linii/products/38.jpg",
    price: 689026,
    code: "8326",
  },
  // _____________________________________Гастроемкости из нержавейки____________________________________________
  {
    link: "container_1_1.html",
    title: "Гастроемкость GN 1/1",
    desc: "Гастроемкость 1/1 из нержавеющей стали используется для приготовления различных блюд на профессиональной кухне. Гастроемкости из нержавеющей стали используются в качестве емкости для теста в расстоечных шкафах, демонстрации и кратковременного хранения блюд на линиях раздачи, глубокой заморозки, охлаждения и последующего хранения продуктов, полуфабрикатов и мороженого в различном холодильном оборудовании, а также для транспортировки и хранения продуктов.",
    img: "/images/thumbs/horest/container/1.png",
    price: 1935,
    code: "8341",
  },
  {
    link: "container_1_2.html",
    title: "Гастроемкость GN 1/2",
    desc: "Гастроемкость 1/2 из нержавеющей стали используется для приготовления различных блюд на профессиональной кухне. Гастроемкости из нержавеющей стали используются в качестве емкости для теста в расстоечных шкафах, демонстрации и кратковременного хранения блюд на линиях раздачи, глубокой заморозки, охлаждения и последующего хранения продуктов, полуфабрикатов и мороженого в различном холодильном оборудовании, а также для транспортировки и хранения продуктов.",
    img: "/images/thumbs/horest/container/2.png",
    price: 1290,
    code: "8342",
  },
  {
    link: "container_1_3.html",
    title: "Гастроемкость GN 1/3",
    desc: "Гастроемкость 1/3 из нержавеющей стали используется для приготовления различных блюд на профессиональной кухне. Гастроемкости из нержавеющей стали используются в качестве емкости для теста в расстоечных шкафах, демонстрации и кратковременного хранения блюд на линиях раздачи, глубокой заморозки, охлаждения и последующего хранения продуктов, полуфабрикатов и мороженого в различном холодильном оборудовании, а также для транспортировки и хранения продуктов.",
    img: "/images/thumbs/horest/container/3.png",
    price: 1161,
    code: "8343",
  },
  {
    link: "container_1_4.html",
    title: "Гастроемкость GN 1/4",
    desc: "Гастроемкость 1/4 из нержавеющей стали используется для приготовления различных блюд на профессиональной кухне. Гастроемкости из нержавеющей стали используются в качестве емкости для теста в расстоечных шкафах, демонстрации и кратковременного хранения блюд на линиях раздачи, глубокой заморозки, охлаждения и последующего хранения продуктов, полуфабрикатов и мороженого в различном холодильном оборудовании, а также для транспортировки и хранения продуктов.",
    img: "/images/thumbs/horest/container/4.png",
    price: 1122,
    code: "8344",
  },
  {
    link: "container_1_6.html",
    title: "Гастроемкость GN 1/6",
    desc: "Гастроемкость 1/6 из нержавеющей стали используется для приготовления различных блюд на профессиональной кухне. Гастроемкости из нержавеющей стали используются в качестве емкости для теста в расстоечных шкафах, демонстрации и кратковременного хранения блюд на линиях раздачи, глубокой заморозки, охлаждения и последующего хранения продуктов, полуфабрикатов и мороженого в различном холодильном оборудовании, а также для транспортировки и хранения продуктов.",
    img: "/images/thumbs/horest/container/5.png",
    price: 1032,
    code: "8345",
  },
  {
    link: "container_cap.html",
    title: "Крышка от гастроёмкости GN",
    desc: "Крышки из нержавеющей стали  предназначены для совместного использования с гастроемкостями разных размеров. Модель выполнена с вырезами под ручки гастроемкости. Крышка имеет собственную ручку для удобства использования.",
    img: "/images/thumbs/horest/container/9.jpg",
    price: 361,
    code: "8346",
  },
  // _____________________________________Гастроемкости перфорированные____________________________________________
  {
    link: "container_1_1_perforated.html",
    title: "Гастроемкость перфорированная GN 1/1",
    desc: "Гастроемкость перфорированная 1/1 из нержавеющей стали — это специальные пищевые лотки с многочисленными отверстиями на дне, предназначены для термической обработки продуктов на пару, бланширования, процеживания и сушки. Гастроемкость перфорированная подойдет для варки блюд на пару и в пароконвектомате. Пар равномерно распределяется по всему объему рабочей камеры и продукты готовятся быстрее. Также используется при выпечке хлебобулочных и кондитерских изделий.",
    img: "/images/thumbs/horest/container/6.png",
    price: 3225,
    code: "8351",
  },
  {
    link: "container_1_2_perforated.html",
    title: "Гастроемкость перфорированная GN 1/2",
    desc: "Гастроемкость 1/2 из нержавеющей стали — это специальные пищевые лотки с многочисленными отверстиями на дне, предназначены для термической обработки продуктов на пару, бланширования, процеживания и сушки. Гастроемкость перфорированная подойдет для варки блюд на пару и в пароконвектомате. Пар равномерно распределяется по всему объему рабочей камеры и продукты готовятся быстрее. Также используется при выпечке хлебобулочных и кондитерских изделий.",
    img: "/images/thumbs/horest/container/7.png",
    price: 2838,
    code: "8352",
  },
  {
    link: "container_1_3_perforated.html",
    title: "Гастроемкость перфорированная GN 1/3",
    desc: "Гастроемкость 1/2 из нержавеющей стали — это специальные пищевые лотки с многочисленными отверстиями на дне, предназначены для термической обработки продуктов на пару, бланширования, процеживания и сушки. Гастроемкость перфорированная подойдет для варки блюд на пару и в пароконвектомате. Пар равномерно распределяется по всему объему рабочей камеры и продукты готовятся быстрее. Также используется при выпечке хлебобулочных и кондитерских изделий.",
    img: "/images/thumbs/horest/container/8.png",
    price: 2709,
    code: "8353",
  },
  // _____________________________________Формы из нержавейки____________________________________________
  {
    link: "container_5.html",
    title: "Форма нержавейка 5 деления",
    desc: "Форма разделенная 5 деления изготовлена из высококачеиственной нержавеющей стали. Многоразовые и перерабатываемые, уменьшают отходы и экологически чистые. Отлично подходит для школы, детского сада, компании, ресторана, кемпинга, пикников, внутреннего или наружного использования.",
    img: "/images/thumbs/horest/container/11.png",
    price: 1187,
    code: "8361",
  },
  {
    link: "container_4.html",
    title: "Форма нержавейка 4 деления",
    desc: "Форма разделенная 4 деления изготовлена из высококачеиственной нержавеющей стали. Многоразовые и перерабатываемые, уменьшают отходы и экологически чистые. Отлично подходит для школы, детского сада, компании, ресторана, кемпинга, пикников, внутреннего или наружного использования.",
    img: "/images/thumbs/horest/container/10.png",
    price: 1187,
    code: "8362",
  },
  {
    link: "container_2.html",
    title: "Форма нержавейка 2 деления",
    desc: "Форма разделенная 2 деления изготовлена из высококачеиственной нержавеющей стали. Многоразовые и перерабатываемые, уменьшают отходы и экологически чистые. Отлично подходит для школы, детского сада, компании, ресторана, кемпинга, пикников, внутреннего или наружного использования.",
    img: "/images/thumbs/horest/container/9.png",
    price: 1122,
    code: "8363",
  },
  {
    link: "container_cap_shape.html",
    title: "Крышка для формы из нержавейки",
    desc: " Крышки для формы  предназначены для совместного использования с формами из нержавейки разных размеров. Крышки для формы предотвращают попадание грязи внутрь и выветривание продуктов.",
    img: "/images/thumbs/horest/container/12.png",
    price: 323,
    code: "8364",
  },
  // _____________________________________Пароконвектоматы____________________________________________
  {
    link: "steamer_6.html",
    title: "Пароконвектомат Рубикон под 6 гастроемкостей GN-1/1",
    desc: "Пароконвектомат «Рубикон» – это универсальная высокопроизводительная печь для приготовления в паровоздушной среде различных блюд на профессиональной кухне. Все параметры процесса приготовления задаются с помощью набора поворотных ручек и энкодера. Камера рассчитана на 6 гастроемкостей GN-1/1.",
    img: "/images/thumbs/horest/steamer/1.png",
    price: 875485,
    code: "8371",
  },
  {
    link: "steamer_10.html",
    title: "Пароконвектомат Рубикон под 10 гастроемкостей GN-1/1",
    desc: "Пароконвектомат «Рубикон» – это универсальная высокопроизводительная печь для приготовления в паровоздушной среде различных блюд на профессиональной кухне. Все параметры процесса приготовления задаются с помощью набора поворотных ручек и энкодера. Камера рассчитана на 10 гастроемкостей GN-1/1.",
    img: "/images/thumbs/horest/steamer/2.jpg",
    price: 995086,
    code: "8372",
  },
  {
    link: "podstavka_parokonvektomat.html",
    title: "Подставка под пароконвектомат Atesy",
    desc: "Подставка под пароконвектомат предназначена для установки на ней пароконвектоматов. На стойках расположены направляющие для установки гастроемкостей. Специальные ограничители предотвращают падение пароконвектомата. ",
    img: "/images/thumbs/horest/steamer/3.jpg",
    price: 108468,
    code: "8373",
  },
  // _____________________________________Миксеры, блендеры____________________________________________

  {
    link: "mixer_7.html",
    title: "Миксер планетарный B7 л",
    desc: "Миксер планетарный B7 предназначен для замешивания теста различных сортов. Представленное оборудование FIMAR также позволяет готовить пюре и соусы, взбивать кремы и муссы. Каждый миксер обладает длительным сроком службы, благодаря прочной конструкции, окрашенной особой, стойкой к механическим воздействиям краской. Детали, непосредственно соприкасающиеся с продуктами, выполнены из гигиеничного материала - нержавеющей стали.",
    img: "/images/thumbs/horest/mixer/1.jpg",
    price: 70830,
    code: "8382",
  },
  {
    link: "mixer_15.html",
    title: "Миксер планетарный B15 л",
    desc: "Миксер планетарный B15 предназначен для замешивания теста различных сортов. Представленное оборудование FIMAR также позволяет готовить пюре и соусы, взбивать кремы и муссы. Каждый миксер обладает длительным сроком службы, благодаря прочной конструкции, окрашенной особой, стойкой к механическим воздействиям краской. Детали, непосредственно соприкасающиеся с продуктами, выполнены из гигиеничного материала - нержавеющей стали.",
    img: "/images/thumbs/horest/mixer/2.jpg",
    price: 116660,
    code: "8382",
  },
  {
    link: "dough_mixer.html",
    title: "Тестомес HS20 л",
    desc: "Тестомес HS20 предназначен для замеса дрожжевого и крутого теста на предприятиях общественного питания, в кондитерских и пекарнях. За счет спиральной формы месильного органа процесс замеса происходит быстрее и качественнее. Крышка дежи, выполненная в виде решетки, обеспечивает визуальный контроль за процессом, а также позволяет добавлять ингредиенты, не останавливая процесс замешивания теста.",
    img: "/images/thumbs/horest/mixer/3.jpg",
    price: 166670,
    code: "8383",
  },
  {
    link: "slicer.html",
    title: "Слайсер 250ES-10",
    desc: "Слайсер  250ES-10 — полуавтоматическое профессиональное устройство для нарезки тонкими аккуратными ломтиками мяса, колбасных изделий, сыра, фруктов, овощей и других продуктов питания. ",
    img: "/images/thumbs/horest/mixer/4.jpg",
    price: 79165,
    code: "8384",
  },
  {
    link: "blender.html",
    title: "Блендер CB-767",
    desc: "Профессиональный блендер CB-767 позволяет Вам без проблем приготовить коктейли любой сложности. Устройство идеально подходит как для домашнего использования, так и для коммерческих учреждений таких как кафе, бары, рестораны и ночные клубы. Аппарат достаточно прост в использовании и чрезвычайно легко чистится. Кувшин объёмом в 2 литра с узким основанием отлично подходит для любых коктейлей. ",
    img: "/images/thumbs/horest/mixer/5.jpg",
    price: 16590,
    code: "8385",
  },
  // _____________________________________Кипятильники____________________________________________
  {
    link: "boiler_wb.html",
    title: "Кипятильник WB",
    desc: "Кипятильник WB используется на предприятиях общественного питания и торговли, в офисах, отелях и т.д. для нагрева большого количества воды. Модель оснащена автоматическим контролем уровня и температуры воды, аварийным термостатом, индикатором нагрева и закрытым ТЭНом. ",
    img: "/images/thumbs/horest/boiler/1.png",
    price: 15490,
    code: "8391",
  },

  {
    link: "boiler_samson.html",
    title: "Кипятильник Самсон",
    desc: "Кипятильник 'Самсон' предназначен для приготовления, поддержания и раздачи кипятка потребителю.  Кипятильник состоит из двух основный модулей: генератора кипятка и накопителя. Автоматическое поддержание установленной температуры в накопителе кипятка",
    img: "/images/thumbs/horest/boiler/2.jpg",
    price: 415750,
    code: "8392",
  },

  {
    link: "boiler_fontan.html",
    title: "Кипятильник Фонтан",
    desc: "Кипятильник электрический «ФОНТАН» предназначен для непрерывного приготовления кипятка на предприятиях общественного питания. Горячая вода (кипяток), произведенная в кипятильнике, применяется при варке гарниров, овощей, сосисок, пельменей, при изготовлении горячих напитков и т. д. Кипяток может использоваться для стерилизации кухонной и столовой посуды, столовых приборов.",
    img: "/images/thumbs/horest/boiler/3.jpg",
    price: 135484,
    code: "8393",
  },
  // _____________________________________Установки для "Шаурма", Грили для кур____________________________________________
  {
    link: "shaurma.html",
    title: "Установка Шаурма газовая",
    desc: "Установка «Шаурма» (газовая) предназначена для приготовления мясной начинки популярного блюда шаурма (шаверма). Принцип действия установки заключается в том, что мясная нарезка, сформированная в цилиндр, насаживается на специальный нож, который вращается вокруг своей оси около двух газовых горелок. ",
    img: "/images/thumbs/horest/gril/1.jpg",
    price: 126388,
    code: "8431",
  },
  {
    link: "gril_4.html",
    title: "Гриль для кур Командор-4Э (карусельный)",
    desc: "Карусельный гриль «Командор»-4Э-Т предназначен для жарки тушек кур, цыплят, куриных окорочков, грудок и других продуктов. Куры размещаются внутри гриля на четырех легкосъемных садках (люльках), изготовленных из нержавеющего прутка. Садки вращаются вокруг центральной оси внутри рабочей камеры. ",
    img: "/images/thumbs/horest/gril/2.jpg",
    price: 159105,
    code: "8432",
  },
  {
    link: "gril_2.html",
    title: "Гриль для кур Командор-2/1 М",
    desc: "Гриль для кур «Командор»-2/1 М предназначен для обжаривания целых тушек кур на вертеле (шампуре). Приготовление тушек осуществляется благодаря инфракрасному излучению ТЭНов. ТЭНы расположены на задней стенке гриля в непосредственной близости от вращающегося шампура с курами. Они имеют специальный отражатель, который повышает эффективность и равномерность нагрева продукта.",
    img: "/images/thumbs/horest/gril/3.jpg",
    price: 169083,
    code: "8433",
  },
  {
    link: "vitrina_dlya_kur.html",
    title: "Витрина для кур Командор ВК-4-01",
    desc: "Тепловая витрина для кур «Командор» ВК-4-Э предназначена для непродолжительного хранения и демонстрации в горячем состоянии приготовленных тушек или частей кур, вторых блюд и горячих закусок. Тепловая витрина представляет собой тепловой шкаф со стеклянными стенками, внутри которого размещаются готовые блюда. На одну полку помещается 3 тушки (весом до 1200 граммов каждая).",
    img: "/images/thumbs/horest/gril/4.jpg",
    price: 189175,
    code: "8434",
  },
  // _____________________________________Комплектующие____________________________________________

  {
    link: "mikrokiosk.html",
    title: "Микрокиоск Zebra MK500",
    desc: "Это компактное, лёгкое в установке и недорогое устройство позволяет центрам розничной торговли внедрить систему самообслуживания в каждый отдел. Таким образом, неважно, в какой части магазина находятся покупатели, помощь всегда будет рядом. ",
    img: "/images/fulls/monitor/23.jpg",
    price: 197750,
    code: 1914,
  },
  {
    link: "display_black.html",
    title: "Дисплей покупателя, черный",
    desc: "Дисплей для покупателя черного цвета применяется для отображения текстовой информации: наименование продукта, цена, стоимость покупки, рекламная информация в виде бегущей строки. Дисплей легко поворачивать по-горизонтали, наклонять вертикально и регулировать его высоту.",
    img: "/images/fulls/monitor/25.jpg",
    price: 26400,
    code: 1915,
  },
  {
    link: "display_white.html",
    title: "Дисплей покупателя, белый",
    desc: "Дисплей для покупателя белого цвета применяется для отображения текстовой информации: наименование продукта, цена, стоимость покупки, рекламная информация в виде бегущей строки. Дисплей легко поворачивать по-горизонтали, наклонять вертикально и регулировать его высоту.",
    img: "/images/fulls/monitor/26.jpg",
    price: 26400,
    code: 1916,
  },
  {
    link: "schityvatel_magnit.html",
    title: "Считыватель магнитных карт",
    desc: "Считыватель магнитных карт — это техника для считывания данных с карты. Устройство подключается к компьютеру через порт USB и передаёт на него полученную информацию. Простота в эксплуатации и настройке, а также компактный, эргономичный дизайн позволяет устанавливать считыватель мангитных карт в состав любых торговых и учетных системах.",
    img: "/images/fulls/monitor/27.png",
    price: 19800,
    code: 1917,
  },

  // _____________________________________Настольные сканеры штрих-кодов____________________________________________

  {
    link: "scanner_2306.html",
    title: "Стационарный сканер штрих кода 2306",
    desc: " Имиджевый сканер штрих кодов максимально удобен и эффективен в работе. Сканер предназначен для предприятий розничной торговли, желающих иметь недорогое и эстетичное сканирующее устройство.",
    img: "/images/thumbs/scanner/30.jpg",
    price: 36960,
    code: 4907,
  },
  {
    link: "stoika_scanner_t5.html",
    title: "Стационарный сканер штрих кода 70-2D",
    desc: "Имиджевый сканер штрих кодов максимально удобен и эффективен в работе. Сканер предназначен для предприятий розничной торговли, желающих иметь недорогое и эстетичное сканирующее устройство. Также данный модель настольного сканера легко справляется с большим потоком клиентов и может сканировать 3600 строк скана в минуту.",
    img: "/images/thumbs/scanner/702d.jpg",
    price: 46200,
    code: 4908,
  },
  {
    link: "scanner_2310.html",
    title: "Стационарный сканер штрих кода 2310",
    desc: "Имиджевый сканер штрих кодов максимально удобен и эффективен в работе. Сканер предназначен для предприятий розничной торговли, желающих иметь недорогое и эстетичное сканирующее устройство. Также данный модель настольного сканера легко справляется с большим потоком клиентов и может сканировать 3600 строк скана в минуту.",
    img: "/images/thumbs/scanner/23101.jpg",
    price: 72600,
    code: 4909,
  },

  // _____________________________________Ручные сканеры штрих-кодов____________________________________________

  {
    link: "stoika_scanner.html",
    title: "Стойка для сканера 6900",
    desc: "Стандартная стойка для сканера штрих-кода 6900 предназначена для непрерывного сканирования, то есть в режиме “Hands-Free”. Она надежно закрепляется у основания сканера.",
    img: "/images/thumbs/scanner/69001.jpg",
    price: 1320,
    code: 2009,
  },
  {
    link: "stoika_scanner_t5.html",
    title: "Стойка для сканера Т5",
    desc: "Стандартная стойка для сканера штрих-кода Т5 предназначена для непрерывного сканирования. Она надежно закрепляется у основания сканера.",
    img: "/images/thumbs/scanner/20.jpg",
    price: 1980,
    code: 3941,
  },
  {
    link: "stoika_scanner_universal.html",
    title: "Стойка для сканера Универсальная",
    desc: "Стандартная стойка для сканера штрих-кода Универсальная предназначена для непрерывного сканирования. Она надежно закрепляется у основания сканера.",
    img: "/images/thumbs/scanner/69001.jpg",
    price: 2355,
    code: 2009,
  },

  // _____________________________________Весы без печати этикеток____________________________________________

  {
    link: "scale_tm_30.html",
    title: "Весы электронные TM30A",
    desc: "Электронные торговые весы со стойкой TM30A предназначены для взвешивания и расчёта стоимости товара по измеренному весу и указанной цене за килограмм. Весы отлично применяются в различных сферах обслуживания, розничной и оптовой торговле.",
    price: "100800",
    img: "/images/fulls/scale/1.jpg",
    position: ["trade"],
    weight: 30,
    interface: ["usb", "serial", "lan"],
    integration: [],
    series: "tm",
    code: 5001,
  },
  {
    link: "scale_mk_rp_10.html",
    title: "Весы торговые с печатью этикеток МК_RP10",
    desc: "Память на 20 000 товаров. Весы печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов, регистрируют товароучетные операции (продажа, прием, отпуск, списание, инвентаризация). Легко интегрируются  в системы учета, в том числе в режиме весового терминала сбора данных.  Обеспечена возможность подключения к весам сканера штрихкодов и выносного промышленного индикатора. Обмен информацией с внешними устройствами реализован  по интерфейсам Ethernet и RS-232, а также с помощью USB-flash накопителя.",
    price: "156166",
    img: "/images/fulls/scale/10.jpg",
    position: ["trade", "table"],
    weight: 32,
    interface: ["serial"],
    integration: [],
    series: "mk",
    code: 5009,
  },
  {
    link: "scale_mk_r2p_10.html",
    title: "Весы электронные с печатью этикеток МК_R2P10-1",
    desc: "Весы с устройством подмотки конца ленты предназначены для маркировки и учета весовых, штучных и счетных товаров за прилавком. Весы печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов.",
    price: "178258",
    img: "/images/fulls/scale/20.jpg",
    position: ["table"],
    weight: 32,
    interface: ["usb", "serial"],
    integration: [],
    series: "mk",
    code: 444,
  },
  {
    link: "scale_mk_rl_10.html",
    title: "Весы торговые с печатью этикеток МК_RL10-1",
    desc: "Весы предназначены для маркировки и учета весовых, штучных и счетных товаров. Память на 20000 товаров. Весы печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов, регистрируют товароучетные операции (прием, отпуск, списание, инвентаризация).",
    price: "210011",
    img: "/images/fulls/scale/30.jpg",
    position: ["table", "trade"],
    weight: 32,
    interface: ["usb", "serial"],
    integration: [],
    series: "mk",
    code: 5010,
  },
  {
    link: "scale_tbs_rl.html",
    title: "Весы торговые с печатью этикеток TB-S_RL1",
    desc: "Весы состоят из модуля взвешивающего и терминала, которые соединены между собой кабелем. Грузоприемная платформа может быть размещена на полу или на столе. В комплект поставки входят два кронштейна, с помощью которых терминал можно прикрепить либо непосредственно к модулю ТВ-S, либо закрепить его на стене.",
    price: "210915",
    img: "/images/fulls/scale/50.jpg",
    position: ["floor", "trade"],
    weight: 200,
    interface: ["usb", "serial"],
    integration: [],
    series: "tb",
    code: 5013,
  },
  {
    link: "scale_mk_r2l.html",
    title: "Весы торговые с печатью этикеток МК_R2L10-1",
    desc: "Весы предназначены для маркировки и учета весовых, штучных и счетных товаров за прилавком. Память на 20000 товаров. Печатают как простые этикетки с автоматически настраиваемым форматом, так и этикетки любой сложности. Весы поддерживают печать 8 форматов штрихкодов, регистрируют товароучетные операции (прием, отпуск, списание, инвентаризация).",
    price: "217243",
    img: "/images/fulls/scale/40.jpg",
    position: ["table", "trade"],
    weight: 32,
    interface: ["usb", "serial", "lan"],
    integration: [],
    series: "mk",
    code: 5012,
  },
  {
    link: "scale_tb_m.html",
    title: "Весы ТВ-M_RP с принтером этикеток",
    desc: "Напольные товарные весы с вертикальной стойкой. Жидкокристаллический индикатор с подсветкой. Встроенный аккумулятор обеспечивает автономную работу весов до 15 часов. Счетный режим.",
    price: "218655",
    img: "/images/fulls/scale/92.jpg",
    position: ["floor"],
    weight: 500,
    interface: ["usb", "serial", "lan"],
    integration: [],
    series: "tb",
    code: 5018,
  },
  // {
  //     link: "scale_tbs_ra.html",
  //     title: "Весы товарные ТВ-S_RA с регистрацией товароучетных операций",
  //     desc: "Напольные товарные весы с вертикальной стойкой. Возможна работа в счетном режиме. Обеспечена возможность подключения к весам сканера штрихкодов и дозатора. Весы регистрируют товароучетные операции (прием, отпуск, списание, инвентаризация). Легко интегрируются в системы учета, в том числе в режиме весового терминала сбора данных. ",
  //     price: "96285",
  //     img: "/images/scale/91.jpg",
  //     position: ["floor"],
  //     weight: 200,
  //     interface: ["serial", "usb"],
  //     integration: [],
  //     series: "tb",
  // },
  {
    link: "scale_rls_1100.html",
    title: "Весы Rongta RLS1100 с принтером этикеток",
    desc: "Весы Rongta RLS1100 успешно могут использоваться в магазинах, в супермаркетах и на фасовке, они не только могут взвешивать товар, но и производить полную калькуляцию покупки. Вакуумно-флуоресцентный дисплей покупателя установлен на высокой и устойчивой стойке, и хорошо виден над витринами.",
    price: "165625",
    img: "/images/thumbs/scale/rls1.png",
    position: ["trade"],
    weight: 32,
    interface: ["serial", "lan"],
    integration: [],
    series: "4d",
    code: 4488,
  },
  {
    link: "scale_rls_1100c.html",
    title: "Весы Rongta RLS1100 C с принтером этикеток",
    desc: "Весы Rongta RLS1100 C успешно могут использоваться в магазинах, в супермаркетах и на фасовке, они не только могут взвешивать товар, но и производить полную калькуляцию покупки.",
    price: "165625",
    img: "/images/thumbs/scale/rls11.png",
    position: ["trade"],
    weight: 32,
    interface: ["serial", "lan"],
    integration: [],
    series: "4d",
    code: 5089,
  },

  // _____________________________________Радиочастотные антикражные системы____________________________________________

  {
    link: "antitheft_radio.html",
    title: "Радиочастотные антикражные ворота",
    desc: "Радиочастотные (РЧ) системы, характеризующиеся минимальной ценой. Коэффициент срабатывания таких систем при условии использования в них технологии ( — радиочастотная идентификация) равен 90%. Антикражные этикетки и бирки клеятся на товар, и радиочастотная система реагирует на антикражные этикетки с колебательным LC-контуром. Антенна на рамке имеет ту же самую частоту, что и этикетка. Поэтому, когда товар с этикеткой попадает в поле действия датчика, то сигнализация срабатывает мгновенно.",
    img: "/images/fulls/eas/4.jpg",
    price: 91000,
    code: "4202",
  },

  {
    link: "mini_square.html",
    title: "Радиочастотная бирка Mini Square",
    desc: "Радиочастотная бирка Mini Square имеет размер 48 x 42 мм - что является сравнительно небольшим и подходит практически для всех категорий товаров. Он крепится с помощью иглы или троса игла-петля. Это самая легкая противоправная бирка из всей линейки.",
    img: "/images/fulls/eas/7.jpg",
    price: 34,
    code: "4207",
  },
  {
    link: "golf_tag.html",
    title: "Радиочастотная бирка Golf",
    desc: "Радиочастотная бирка Golf - cамая популярная бирка. Используется в магазинах одежды и имеет высокую надежность. Благодаря особой форме его практически невозможно снять без специальных средств, не испортив защищенный товар. Бирка состоит из 2-х половинок и легко крепится на одежду, при этом не мешая покупателям в примерочной.",
    img: "/images/fulls/eas/8.png",
    price: 92,
    code: "4213",
  },
  {
    link: "rf_bootle.html",
    title: "Радиочастотная бирка для стеклянных бутылок",
    desc: "Защитный радиочастотный бутылочный датчик разработан специально для защиты от краж бутылок. Конструкция бутылочного датчика предусматривает специальную защиту поверхности защищаемого товара от механического воздействия тросиком: металлический тросик спрятан в специальной мягкой оболочке, что исключает случаи порчи товара защитными датчиками.",
    img: "/images/fulls/eas/14.jpg",
    price: 203,
    code: "4202",
  },

  {
    link: "",
    title: "Петля Универсальная упаковка 100шт WTRF-26",
    desc: "Антикражный тросик типа 'петля-игла' предназначен для крепления противокражных датчиков к товарам, к которым невозможно прикрепить датчики с помощью стандартной клипсы. Тросики имеют специальное полимерное покрытие, которое не наносит повреждений защищаемому товару.",
    img: "/images/fulls/eas/9.jpg",
    price: 6300,
    code: "4202",
  },

  {
    link: "universal_puller.html",
    title: "Съемник Универсальный WTRF-30",
    desc: "Съемник универсальный, усиленный, сила 12000 Гс. Предназначен для снятия любых датчиков антикражных систем с магнитным замком. Сила магнита 12000 Гс позволяет открывать все типы противокражных бирок",
    img: "/images/fulls/eas/6.jpg",
    price: 11480,
    code: "4206",
  },

  {
    link: "label_radio.html",
    title: "Радиочастотная этикетка",
    desc: "Самоклеющиеся радиочастотные защитные этикетки с ложным штрихкодом 40х40 мм служат для защиты любого типа товара: от продуктов в супермаркете, книг и аудио-видео кассет до текстильных изделий и электроники.",
    img: "/images/fulls/eas/10.jpg",
    price: 7000,
    code: "4210",
  },

  {
    link: "rf_deactivator.html",
    title: "Радииочастотный деактиватор WTRF-32",
    desc: "Радиочастотные деактиваторы предназначены для снятия защитных свойств (размагничивания) радиочастотных этикеток. Используются в кассовой зоне сотрудниками магазина для деактивации радиочастотных этикеток на проданном товаре.",
    img: "/images/fulls/eas/12.png",
    price: 42000,
    code: "4211",
  },
  // _____________________________________Шкафы инструментальные____________________________________________
  {
    link: "pochta_ip1.html",
    title: "Шкаф ИП-1-0,5",
    desc: "Односекционный шкаф с возможностью индивидуального моделирования наполнения при выборе необходимых комплектующих и их расположении в шкафах.",
    img: "/images/fulls/pochta/ip1.jpg",
    price: 69510,
    code: "0",
  },

  {
    link: "pochta_ip2.html",
    title: "Шкаф ИП-1",
    desc: "Односекционный шкаф с возможностью индивидуального моделирования наполнения при выборе необходимых комплектующих и их расположении в шкафах.",
    img: "/images/fulls/pochta/ip2.jpg",
    price: 106926,
    code: "0",
  },

  {
    link: "pochta_ip3.html",
    title: "Шкаф ИП-2-0,5",
    desc: "Двухсекционный шкаф с возможностью индивидуального моделирования наполнения при выборе необходимых комплектующих и их расположении в шкафах.",
    img: "/images/fulls/pochta/ip3.jpg",
    price: 88743,
    code: "0",
  },

  {
    link: "pochta_ip4.html",
    title: "Шкаф ИП-2",
    desc: "Двухсекционный шкаф с возможностью индивидуального моделирования наполнения при выборе необходимых комплектующих и их расположении в шкафах.",
    img: "/images/fulls/pochta/ip4.jpg",
    price: 124828,
    code: "0",
  },

  {
    link: "pochta_ip5.html",
    title: "К-т ИП-1/1",
    desc: "Инструментальный шкаф  К-т ИП-1/1 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip4-33.jpg",
    price: 184999,
    code: "0",
  },

  {
    link: "pochta_ip6.html",
    title: "К-т ИП-1/2",
    desc: "Инструментальный шкаф  К-т ИП-1/2 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip6.jpg",
    price: 176562,
    code: "0",
  },
  {
    link: "pochta_ip7.html",
    title: "К-т ИП-1/3 (ИП-1: шкаф-1, полка-4, ящик-2)",
    desc: "Инструментальный шкаф  К-т ИП-1/3 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip7.png",
    price: 166317,
    code: "0",
  },
  {
    link: "pochta_ip8.html",
    title: "К-т ИП-1/4 (ИП-1: шкаф-1, полка-2, экран-2)",
    desc: "Инструментальный шкаф  К-т ИП-1/4 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip8.jpg",
    price: 155435,
    code: "0",
  },
  {
    link: "pochta_ip9.html",
    title: "К-т ИП-1/5 (ИП-1: шкаф-1, полка-1, экран-2, ящик-4;)",
    desc: "Инструментальный шкаф  К-т ИП-1/5 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip9.jpg",
    price: 206697,
    code: "0",
  },

  {
    link: "pochta_ip10.html",
    title:
      "К-т ИП-1/6 (ИП-1: шкаф-1, полка-3, экран-1,  полка УК-1, держ/ключей-1, крючки 8см - 1уп)",
    desc: "Инструментальный шкаф  К-т ИП-1/6 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip10.jpg",
    price: 147324,
    code: "0",
  },
  {
    link: "pochta_ip11.html",
    title: "К-т ИП-1/7 (ИП-1: шкаф-1, полка-1, экран-2, ящик-4;)",
    desc: "Инструментальный шкаф  К-т ИП-1/7 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip9.jpg",
    price: 205282,
    code: "0",
  },
  {
    link: "pochta_ip12.html",
    title: "К-т ИП-1/8 (ИП-1: шкаф-1, полка-3, ящик-4)",
    desc: "Инструментальный шкаф  К-т ИП-1/8 предназначен для хранения инструмента и оснастки на производственных предприятиях, в ремонтных мастерских, гаражах и т.д. Представляет собой сборно-разборную конструкцию и состоит из комплекта сборочных деталей: корпус шкафа, полки, выдвижные ящики и экраны. Шкаф можно смоделировать индивидуально, выбрав необходимые комплектующие и их расположение.",
    img: "/images/fulls/pochta/ip12.jpg",
    price: 188016,
    code: "0",
  },

  {
    link: "pochta_ip13.html",
    title: "К-т ИП-2-0,5/1 (шкаф ИП-2-0,5 - 1; ИП-2: полка-2, ящик-5)",
    desc: "Металлический инструментальный шкаф ПАКС ИП 2-0,5/1. Предназначен для оборудования гаража, мастерской или автосервиса. Может быть использован в качестве тумбы.",
    img: "/images/fulls/pochta/ip3-2.jpg",
    price: 144672,
    code: "0",
  },

  {
    link: "pochta_ip14.html",
    title: "К-т ИП-2-0,5/2 (шкаф ИП-2-0,5; ИП-2: полка-5, ящик-2)",
    desc: "Металлический инструментальный шкаф ПАКС ИП 2-0,5/2. Предназначен для оборудования гаража, мастерской или автосервиса. Может быть использован в качестве тумбы.",
    img: "/images/fulls/pochta/ip14.jpg",
    price: 144672,
    code: "0",
  },

  {
    link: "pochta_ip15.html",
    title: "К-т ИП-2/1 (ИП-2: шкаф-1, полка-4, экран-2, ящик-2;)",
    desc: "Металлический инструментальный шкаф К-т ИП-2/1. Предназначен для оборудования гаража илимастерской.",
    img: "/images/fulls/pochta/ip15.jpg",
    price: 177201,
    code: "0",
  },

  {
    link: "pochta_ip16.html",
    title: "К-т ИП-2-0,5/1 (шкаф ИП-2-0,5 - 1; ИП-2: полка-2, ящик-5)",
    desc: "Металлический инструментальный шкаф К-т ИП-2/2. Предназначен для оборудования гаража илимастерской.",
    img: "/images/fulls/pochta/ip16.jpg",
    price: 204510,
    code: "0",
  },

  {
    link: "pochta_ip17.html",
    title: "К-т ИП-1-0,5/1 (шкаф ИП-1-0,5 - 1, полка ИП-1 - 2)",
    desc: "Металлический инструментальный шкаф К-т ИП 1-0,5/1. Предназначен для оборудования гаража, мастерской или автосервиса. Может быть использован в качестве тумбы.",
    img: "/images/fulls/pochta/ip17.jpg",
    price: 84588,
    code: "0",
  },

  {
    link: "pochta_ip18.html",
    title:
      "К-т ИП-1-0,5/2 (шкаф ИП-1-0,5 - 1; ИП-1: полка-1, экран-1, ящик-1;)",
    desc: "Металлический инструментальный шкаф К-т ИП-1-0,5/2. Предназначен для оборудования гаража, мастерской или автосервиса. Может быть использован в качестве тумбы.",
    img: "/images/fulls/pochta/ip18.jpg",
    price: 110409,
    code: "0",
  },

  {
    link: "pochta_ip19.html",
    title: "К-т ИП-1-0,5/3 (шкаф ИП-1-0,5; ИП-1: полка-1, ящик-1)",
    desc: "Металлический инструментальный шкаф К-т ИП-1-0,5/3. Предназначен для оборудования гаража, мастерской или автосервиса. Может быть использован в качестве тумбы.",
    img: "/images/fulls/pochta/ip19.jpg",
    price: 91667,
    code: "0",
  },

  {
    link: "pochta_ip20.html",
    title: "К-т ИП-1-0,5/4 (шкаф ИП-1-0,5; ИП-1: полка-1, экран-1, ящик-1)",
    desc: "Металлический инструментальный шкаф К-т ИП-1-0,5/4. Предназначен для оборудования гаража, мастерской или автосервиса. Может быть использован в качестве тумбы.",
    img: "/images/fulls/pochta/ip20.jpg",
    price: 110535,
    code: "0",
  },

  {
    link: "pochta_ip21.html",
    title: "К-т ИП-1-0,5/5 (шкаф ИП-1-0,5 - 1;ИП-1: полка-1, ящик-3)",
    desc: "Металлический инструментальный шкаф К-т ИП-1-0,5/5. Предназначен для оборудования гаража, мастерской или автосервиса. Может быть использован в качестве тумбы.",
    img: "/images/fulls/pochta/ip21.jpg",
    price: 120905,
    code: "0",
  },
  /////////////////////////////////////////////////////// New [PRODUCT]/////////////////////////////////////////////////////////////////////////////////////
  {
    link: "adagio_classic_900.html",
    title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Classic К 900Д",
    desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Classic легко компонуется в линию с витриной ADAGIO Quadro и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
    img: "/images/adaigo900.jpg",
    price: 220429,
    code: "1809",
  },
  {
    link: "adagio_classic_1200.html",
    title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Classic К 1200Д",
    desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Classic легко компонуется в линию с витриной ADAGIO Quadro и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
    img: "/images/adaigo1200.jpg",
    price: 243426,
    code: "",
  },

  {
    link: "adagio_cube_900.html",
    title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Cube К 900Д",
    desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Cube легко компонуется в линию с витриной ADAGIO Classic и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
    img: "/images/adaigoCube900.jpg",
    price: 238766,
    code: "",
  },
  {
    link: "adagio_cube_1200.html",
    title: "КОНДИТЕРСКАЯ ВИТРИНА ADAGIO Cube К 1200Д",
    desc: "Cтильная, компактная кондитерская витрина со ферическим стеклом. Закаленные стекла с шелкографией придают эстетическую привлекательность витрине. Благодаря фронтальному и боковому остеклению обеспечивается наилучшая обзорность выкладки. Благодаря продуманному конструктиву, витрина ADAGIO Cube легко компонуется в линию с витриной ADAGIO Classic и кондитерским неохлаждаемым прилавком ADAGIO КНП, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
    img: "/images/adaigoCube1200.jpg",
    price: 252058,
    code: "",
  },
  {
    link: "adagio_knp_600.html",
    title: "Кассовый неохлаждаемый прилавок ADAGIO КНП 600",
    desc: "КНП – функциональное решение для организации прикассовой зоны и проведения расчётов, передачи заказа клиенту. Прилавок обеспечивает комфортную работу персонала кондитерского отдела. Для размещения инвентаря и вспомогательных материалов, сзади прилавка расположен выдвижной ящик глубиной 180 мм и открытые полки. Регулируемые по высоте опоры позволяют выставить прилавок ровно по уровню, не зависимо от погрешностей поверхности пола торгового зала.",
    img: "/images/adagio_knp_600_2.jpg",
    price: 57882,
    code: "",
  },
  {
    link: "adagio_knp_900.html",
    title: "Кассовый неохлаждаемый прилавок ADAGIO КНП 900",
    desc: "Кассовый неохлаждаемый прилавок ADAGIO КНП функциональное решение для организации прикассовой зоны и проведения расчётов, передачи заказа клиенту. Благодаря продуманному конструктиву, кондитерская неохлаждаемая прилавка ADAGIO КНП легко компонуется в линию с витриной ADAGIO Classic и с витриной ADAGIO Сube, образуя единую стилистическую композицию заданной функциональности. Три ряда полок различной глубины обеспечивают экспозицию различного ассортимента, а тёплая LED-подсветка каждой полки создает дополнительный акцент на десертах.",
    img: "/images/adagio_knp_900.jpg",
    price: 70383,
    code: "",
  },
  {
    link: "carboma_lux.html",
    title: "Кондитерские шкафы Carboma Lux",
    desc: "Кондитерская витрина Carboma LUX - идеальный вариант для демонстрации кондитерских изделий, аппетитных сэндвичей и бутербродов, выпечки, пиццы и деликатесов в кафе, барах и ресторанах.",
    img: "/images/thumbs/holod/polus/shkaf/lux1111.jpg",
    price: 290251,
    code: "2016",
  },
  {
    link: "boneta_lvn_1850.html",
    title: "Бонета Italfrost ЛВН 1850",
    desc: "Лари-бонеты Italfrost (со встроенным статическим холодоснабжением) предназначены для хранения и демонстрации замороженных овощей и ягод, мороженого, а также мясных и рыбных полуфабрикатов. Разнообразие дополнительных опций позволяет гибко подходить к оснащению торговых площадей: возможна установка в остров с суперструктурой,с использованием торцевых модулей, а также стандартное пристенное расположение.",
    img: "/images/thumbs/holod/itl1.jpg",
    price: 337871,
    code: "",
  },
  {
    link: "boneta_lvn_1850_torec.html",
    title: "Бонета Italfrost ЛВН 1850 (торцевая)",
    desc: "Морозильная бонета ЛВН 1850 (торцевая) предназначена для хранения и демонстрации свежезамороженных продуктов. Конструкция с панорамными стеклянными раздвижными крышками и внутренним освещением идеальна для оснащения супер- и гипермаркетов.",
    img: "/images/thumbs/holod/torec1.jpg",
    price: 352401,
    code: "",
  },
  {
    link: "boneta_lvn_2100.html",
    title: "Бонета Italfrost ЛВН 2100",
    desc: "Лари-бонеты Italfrost (со встроенным статическим холодоснабжением) предназначены для хранения и демонстрации замороженных овощей и ягод, мороженого, а также мясных и рыбных полуфабрикатов. Разнообразие дополнительных опций позволяет гибко подходить к оснащению торговых площадей: возможна установка в остров с суперструктурой,с использованием торцевых модулей, а также стандартное пристенное расположение.",
    img: "/images/thumbs/holod/ital2100.jpg",
    price: 352400,
    code: "",
  },
  {
    link: "boneta_lvn_2500.html",
    title: "Бонета Italfrost ЛВН 2500",
    desc: "Лари-бонеты Italfrost (со встроенным статическим холодоснабжением) предназначены для хранения и демонстрации замороженных овощей и ягод, мороженого, а также мясных и рыбных полуфабрикатов. Разнообразие дополнительных опций позволяет гибко подходить к оснащению торговых площадей: возможна установка в остров с суперструктурой,с использованием торцевых модулей, а также стандартное пристенное расположение.",
    img: "/images/thumbs/holod/ital2500.jpg",
    price: 352400,
    code: "",
  },
];

// const holod1 = document.createElement('script');
// const holod2 = document.createElement('script');
// const holod3 = document.createElement('script');
// const holod4 = document.createElement('script');
// const holod5 = document.createElement('script');

// data4.forEach(function(z) {
//     var url_name1 = window.location.href.split('/').pop().split('#')[0].split('?')[0];

//     if (holod2 != null) {
//         if (holod2 != null) {
//             if (url_name1 == z.link) {
//                 holod2.src = "js/holod2.js"
//                 document.querySelector("body").appendChild(holod2);
//             }
//         }
//     }

//     if (holod3 != null) {
//         if (holod3 != null) {
//             if (url_name1 == z.link) {
//                 holod3.src = "js/holod3.js"
//                 document.querySelector("body").appendChild(holod3);
//             }
//         }
//     }

//     if (holod5 != null) {
//         if (holod5 != null) {
//             if (url_name1 == z.link) {
//                 holod5.src = "js/holod5.js"
//                 document.querySelector("body").appendChild(holod5);
//             }
//         }
//     }

//     if (holod4 != null) {
//         if (holod4 != null) {
//             if (url_name1 == z.link) {
//                 holod4.src = "js/holod4.js"
//                 document.querySelector("body").appendChild(holod4);
//             }
//         }
//     }
//     if (holod1 != null) {
//         if (holod1 != null) {
//             if (url_name1 == z.link) {
//                 holod1.src = "js/holodShkafSteklo.js"
//                 document.querySelector("body").appendChild(holod1);
//             }
//         }
//     }
// });

let list = [];
data444.forEach(function (a) {
  let list2 = a.title.split(" ");
  list2.forEach(function (b) {
    list.push(b);
  });
});

document.querySelector(".search-btn").addEventListener("click", function (e) {
  let reversed = false;

  let info = document.querySelector("#txtSearch").value;

  var patterns = info.split(" ");
  console.log(patterns);

  var fields = { title: true, code: true };
  let searchedWord = document.querySelector("#txtSearch").value;
  if (localStorage.getItem("searched-word") === null) {
    localStorage.setItem("searched-word", JSON.stringify(searchedWord));
  } else {
    localStorage.removeItem("searched-word");
    localStorage.setItem("searched-word", JSON.stringify(searchedWord));
  }

  startSearch();

  function startSearch() {
    var results = smartSearch(data444, patterns, fields);
    // console.log(patterns);
    // console.log(results);
    // results.forEach(function(result) {
    //     console.log(result.entry);

    let sorted = [];
    results.filter(function (a) {
      if (a.score < 2) {
        sorted.push(a.entry);
        return a.entry;
      }
    });

    document.querySelector("#txtSearch").value = ``;
    if (localStorage.getItem("searched-cards") === null) {
      localStorage.setItem("searched-cards", JSON.stringify(sorted));
    } else {
      localStorage.removeItem("searched-cards");
      localStorage.setItem("searched-cards", JSON.stringify(sorted));
    }

    var filename = window.location.href
      .split("/")
      .pop()
      .split("#")[0]
      .split("?")[0];
    if (sorted.length > 0) {
      window.location.href = "search";
    } else {
      if (reversed == false) {
        patterns.reverse();
        reversed = true;
        if (didYouMean(patterns[patterns.length - 1], list) != null) {
          patterns = didYouMean(patterns[patterns.length - 1], list);
          // startSearch()

          startSearch();
        } else {
          let patternsLastEl = patterns.length - 1;
          let newLastElement = patterns[patternsLastEl].slice(
            0,
            patterns[patternsLastEl].length - 1
          );
          patterns.pop();
          if (newLastElement.length != 0) {
            patterns.push(newLastElement);
          }

          // console.log(newLastElement);
          // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

          // errorMsg()
          // if (patterns[patternsLastEl].length != 0) {
          startSearch();
          // } else {
          // errorMsg()
          // }
        }
      } else {
        patterns.reverse();
        reversed = false;
        if (didYouMean(patterns[patterns.length - 1], list) != null) {
          patterns = didYouMean(patterns[patterns.length - 1], list);
          // startSearch()

          startSearch();
        } else {
          let patternsLastEl = patterns.length - 1;
          let newLastElement = patterns[patternsLastEl].slice(
            0,
            patterns[patternsLastEl].length - 1
          );
          patterns.pop();
          if (newLastElement.length != 0) {
            patterns.push(newLastElement);
          }

          // console.log(newLastElement);
          // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

          // errorMsg()
          // if (patterns[patternsLastEl].length != 0) {
          startSearch();
          // } else {
          // errorMsg()
          // }
        }
      }
    }
  }
});
document.querySelector("#txtSearch").addEventListener("keypress", function (e) {
  let reversed = false;
  if (e.key === "Enter") {
    let info = document.querySelector("#txtSearch").value;

    var patterns = info.split(" ");
    console.log(patterns);

    var fields = { title: true, code: true };
    let searchedWord = document.querySelector("#txtSearch").value;
    if (localStorage.getItem("searched-word") === null) {
      localStorage.setItem("searched-word", JSON.stringify(searchedWord));
    } else {
      localStorage.removeItem("searched-word");
      localStorage.setItem("searched-word", JSON.stringify(searchedWord));
    }

    startSearch();

    function startSearch() {
      var results = smartSearch(data444, patterns, fields);
      // console.log(patterns);
      // console.log(results);
      // results.forEach(function(result) {
      //     console.log(result.entry);

      let sorted = [];
      results.filter(function (a) {
        if (a.score < 2) {
          sorted.push(a.entry);
          return a.entry;
        }
      });

      // console.log(searchArray);

      document.querySelector("#txtSearch").value = ``;

      if (localStorage.getItem("searched-cards") === null) {
        localStorage.setItem("searched-cards", JSON.stringify(sorted));
      } else {
        localStorage.removeItem("searched-cards");
        localStorage.setItem("searched-cards", JSON.stringify(sorted));
      }

      var filename = window.location.href
        .split("/")
        .pop()
        .split("#")[0]
        .split("?")[0];
      if (sorted.length > 0) {
        window.location.href = "search";
      } else {
        if (reversed == false) {
          patterns.reverse();
          reversed = true;
          if (didYouMean(patterns[patterns.length - 1], list) != null) {
            patterns = didYouMean(patterns[patterns.length - 1], list);
            // startSearch()

            startSearch();
          } else {
            let patternsLastEl = patterns.length - 1;
            let newLastElement = patterns[patternsLastEl].slice(
              0,
              patterns[patternsLastEl].length - 1
            );
            patterns.pop();
            if (newLastElement.length != 0) {
              patterns.push(newLastElement);
            }

            // console.log(newLastElement);
            // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

            // errorMsg()
            // if (patterns[patternsLastEl].length != 0) {
            startSearch();
            // } else {
            // errorMsg()
            // }
          }
        } else {
          patterns.reverse();
          reversed = false;
          if (didYouMean(patterns[patterns.length - 1], list) != null) {
            patterns = didYouMean(patterns[patterns.length - 1], list);
            // startSearch()

            startSearch();
          } else {
            let patternsLastEl = patterns.length - 1;
            let newLastElement = patterns[patternsLastEl].slice(
              0,
              patterns[patternsLastEl].length - 1
            );
            patterns.pop();
            if (newLastElement.length != 0) {
              patterns.push(newLastElement);
            }

            // console.log(newLastElement);
            // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

            // errorMsg()
            // if (patterns[patternsLastEl].length != 0) {
            startSearch();
            // } else {
            // errorMsg()
            // }
          }
        }
      }
    }
  }
});
document.querySelector(".search-btn2").addEventListener("click", function (e) {
  let reversed = false;

  let info = document.querySelector("#txtSearch2").value;

  var patterns = info.split(" ");
  console.log(patterns);

  var fields = { title: true, code: true };
  let searchedWord = document.querySelector("#txtSearch2").value;
  if (localStorage.getItem("searched-word") === null) {
    localStorage.setItem("searched-word", JSON.stringify(searchedWord));
  } else {
    localStorage.removeItem("searched-word");
    localStorage.setItem("searched-word", JSON.stringify(searchedWord));
  }

  startSearch();

  function startSearch() {
    var results = smartSearch(data444, patterns, fields);
    // console.log(patterns);
    // console.log(results);
    // results.forEach(function(result) {
    //     console.log(result.entry);

    let sorted = [];
    results.filter(function (a) {
      if (a.score < 2) {
        sorted.push(a.entry);
        return a.entry;
      }
    });

    document.querySelector("#txtSearch2").value = ``;
    if (localStorage.getItem("searched-cards") === null) {
      localStorage.setItem("searched-cards", JSON.stringify(sorted));
    } else {
      localStorage.removeItem("searched-cards");
      localStorage.setItem("searched-cards", JSON.stringify(sorted));
    }

    var filename = window.location.href
      .split("/")
      .pop()
      .split("#")[0]
      .split("?")[0];
    if (sorted.length > 0) {
      window.location.href = "search";
    } else {
      if (reversed == false) {
        patterns.reverse();
        reversed = true;
        if (didYouMean(patterns[patterns.length - 1], list) != null) {
          patterns = didYouMean(patterns[patterns.length - 1], list);
          // startSearch()

          startSearch();
        } else {
          let patternsLastEl = patterns.length - 1;
          let newLastElement = patterns[patternsLastEl].slice(
            0,
            patterns[patternsLastEl].length - 1
          );
          patterns.pop();
          if (newLastElement.length != 0) {
            patterns.push(newLastElement);
          }

          // console.log(newLastElement);
          // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

          // errorMsg()
          // if (patterns[patternsLastEl].length != 0) {
          startSearch();
          // } else {
          // errorMsg()
          // }
        }
      } else {
        patterns.reverse();
        reversed = false;
        if (didYouMean(patterns[patterns.length - 1], list) != null) {
          patterns = didYouMean(patterns[patterns.length - 1], list);
          // startSearch()

          startSearch();
        } else {
          let patternsLastEl = patterns.length - 1;
          let newLastElement = patterns[patternsLastEl].slice(
            0,
            patterns[patternsLastEl].length - 1
          );
          patterns.pop();
          if (newLastElement.length != 0) {
            patterns.push(newLastElement);
          }

          // console.log(newLastElement);
          // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

          // errorMsg()
          // if (patterns[patternsLastEl].length != 0) {
          startSearch();
          // } else {
          // errorMsg()
          // }
        }
      }
    }
  }
});
document
  .querySelector("#txtSearch2")
  .addEventListener("keypress", function (e) {
    let reversed = false;
    if (e.key === "Enter") {
      let info = document.querySelector("#txtSearch2").value;
      var patterns = info.split(" ");
      console.log(patterns);
      var fields = { title: true, code: true };
      let searchedWord = document.querySelector("#txtSearch2").value;
      if (localStorage.getItem("searched-word") === null) {
        localStorage.setItem("searched-word", JSON.stringify(searchedWord));
      } else {
        localStorage.removeItem("searched-word");
        localStorage.setItem("searched-word", JSON.stringify(searchedWord));
      }

      startSearch();

      function startSearch() {
        var results = smartSearch(data444, patterns, fields);
        // console.log(patterns);
        // console.log(results);
        // results.forEach(function(result) {
        //     console.log(result.entry);

        let sorted = [];
        results.filter(function (a) {
          if (a.score < 2) {
            sorted.push(a.entry);
            return a.entry;
          }
        });

        // console.log(searchArray);

        document.querySelector("#txtSearch").value = ``;

        if (localStorage.getItem("searched-cards") === null) {
          localStorage.setItem("searched-cards", JSON.stringify(sorted));
        } else {
          localStorage.removeItem("searched-cards");
          localStorage.setItem("searched-cards", JSON.stringify(sorted));
        }

        var filename = window.location.href
          .split("/")
          .pop()
          .split("#")[0]
          .split("?")[0];
        if (sorted.length > 0) {
          window.location.href = "search";
        } else {
          if (reversed == false) {
            patterns.reverse();
            reversed = true;
            if (didYouMean(patterns[patterns.length - 1], list) != null) {
              patterns = didYouMean(patterns[patterns.length - 1], list);
              // startSearch()

              startSearch();
            } else {
              let patternsLastEl = patterns.length - 1;
              let newLastElement = patterns[patternsLastEl].slice(
                0,
                patterns[patternsLastEl].length - 1
              );
              patterns.pop();
              if (newLastElement.length != 0) {
                patterns.push(newLastElement);
              }

              // console.log(newLastElement);
              // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

              // errorMsg()
              // if (patterns[patternsLastEl].length != 0) {
              startSearch();
              // } else {
              // errorMsg()
              // }
            }
          } else {
            patterns.reverse();
            reversed = false;
            if (didYouMean(patterns[patterns.length - 1], list) != null) {
              patterns = didYouMean(patterns[patterns.length - 1], list);
              // startSearch()

              startSearch();
            } else {
              let patternsLastEl = patterns.length - 1;
              let newLastElement = patterns[patternsLastEl].slice(
                0,
                patterns[patternsLastEl].length - 1
              );
              patterns.pop();
              if (newLastElement.length != 0) {
                patterns.push(newLastElement);
              }
              // console.log(newLastElement);
              // patterns[patterns.length-1.slice(0, patterns[patterns.length].length - 1)]

              // errorMsg()
              // if (patterns[patternsLastEl].length != 0) {
              startSearch();
              // } else {
              // errorMsg()
              // }
            }
          }
        }
      }
    }
  });

function errorMsg() {
  iziToast.warning({
    title: "",
    message: "По такому запросу продуктов не найдено",
  });
}
// $("priceSort").on("click", function() {
//     $(this).parent(".selectBox").toggleClass("open");
// });
// $(document).mouseup(function(e) {
//     var container = $(".selectBox");

//     if (container.has(e.target).length === 0) {
//         container.removeClass("open");
//     }
// });
// $("select").on("change", function() {
//     var selection = $(this).find("option:selected").text(),
//         labelFor = $(this).attr("id"),
//         label = $("[for='" + labelFor + "']");

//     label.find(".label-desc").html(selection);
// });

let sortedFirst = document.querySelector(".sortedFirst");
let sortedTwo = document.querySelector(".sortedSecond");
let priceSorder = document.querySelector("#priceSort");
// let priceOptionFirst = document.querySelector('.priceOptionFirst');
// let priceOptionSecond = document.querySelector('.priceOptionSecond');

if (priceSorder != null) {
  priceSorder.addEventListener("change", () => {
    sortedFirst.classList.toggle("sortedSelectNone");
    sortedTwo.classList.toggle("sortedSelectBlock");
    // sortedTwo.style.display = 'block';
  });
}
let feauturedMain = document.querySelector("#body .footer .featured ul");

if (feauturedMain != null) {
  if (feauturedMain.firstElementChild.classList.contains("main") != null) {
    feauturedMain.classList.add("gridColumn");
  }
}

let sortedSecond = document.querySelector(".sortedSecond");
let priceContainer = document.querySelector(".priceContainer");

let selectTT = document.querySelector(".select");

let selectBoxTT = document.querySelector(".select-box1");
let lableTT = document.querySelector(".label");
let priceOptionFirstBg = document.querySelector(".priceOptionFirst");
let priceOptionSecondBg = document.querySelector(".priceOptionSecond");

if (priceSorder != null) {
  priceSort.addEventListener("click", function () {
    selectBoxTT.classList.toggle("open");
    if (getComputedStyle(priceContainer).display == "block") {
      selectBoxTT.classList.add("open");
    }
  });
}

selectTT.addEventListener("click", function (e) {
  selectBoxTT.classList.add("selectBoxClassNames");
  // selectTT.classList.add('selectClassNames');
  priceContainer.style.cssText = "display: block; opacity: 1;";
  selectTT.style.cssText = "border-radius: 17px;";
  lableTT.classList.add("openLabel");
});

// priceContainer.addEventListener('click', function(){

// });

priceOptionFirstBg.addEventListener("click", function () {
  event.stopPropagation();
  priceOptionFirstBg.classList.add("priceOptionFirstBg");
  priceOptionSecondBg.classList.remove("priceOptionSecondBg");
  sortedFirst.style.display = "block";
  sortedSecond.style.display = "none";
  priceContainer.style.cssText = "display: none; opacity: 0;";
  selectTT.style.cssText = "border-radius: 25px;";
  selectBoxTT.classList.remove("open");
});

priceOptionSecondBg.addEventListener("click", function (event) {
  event.stopPropagation();
  priceOptionSecondBg.classList.add("priceOptionSecondBg");
  priceOptionFirstBg.classList.remove("priceOptionFirstBg");
  sortedFirst.style.display = "none";
  sortedSecond.style.display = "block";
  priceSort.classList.remove("selectClassNames");
  priceContainer.style.cssText = "display: none; opacity: 0;";
  selectTT.style.cssText = "border-radius: 25px;";
  selectBoxTT.classList.remove("open");
});

// let imgPicture = document.getAttribute('src')
// let designnn = document.querySelector('.designnn');
// let designnnImg = designnn.querySelectorAll('img');

// designnnImg.forEach(item => {
//     let desSrc = item.getAttribute('src');
//     console.log(desSrc);
//     // item.innerHTML= 'images/des.svg'
//     if (desSrc == 'images/des.png') {
//         // desSrc.src = 'images/des.svg'
//         item.remove();

//     } else if (desSrc == 'images/zam.png') {
//         item.remove();
//     }
//     console.log(desSrc);
// });
// console.log(designnnImg);

// let pictureDes = document.querySelector('.pictureDes');

// if (pictureDes != null) {
//     pictureDes.remove()
// }
// console.log(pictureDes);
