var digits = {
  score: 0,
  canThrowKeyUpWithoutMiss: false,
  getState: function () {
    var dig = { '1000': 0, '100': 0, '10': 0, '1': 0 }, s = digits.score + "", state = [];
    if (digits.score > 0) dig['1'] = s.replace(/^\d*(\d)$/, '$1');
    if (digits.score > 9) dig['10'] = s.replace(/^\d*(\d)\d$/, '$1');
    if (digits.score > 99) dig['100'] = s.replace(/^\d*(\d)\d\d$/, '$1');
    if (digits.score > 999) dig['1000'] = s.replace(/^\d*(\d)\d\d\d$/, '$1');
    for (var n in dig) {
      var value = dig[n] * 1;
      if (value > 0 || n == '1') {
        state.push('digit-' + n);
        $('#digit-' + n).removeClass().addClass('tile digit digit-' + value);
      }
    }
    return state.join(' ');
  },
  reset: function () {
    this.score = 0;
  },
  addScore: function (points) {
    this.score += points;
  }
};