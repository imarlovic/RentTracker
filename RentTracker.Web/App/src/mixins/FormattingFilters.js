import * as moment from "moment";

const pluralizations = {
  'child': "ren"
}

export default {
  filters: {
    money: function (value, currency) {

      let converted = value.toLocaleString("hr-HR", {
        style: "currency",
        currency: currency
      });

      return converted;
    },
    moneyShort: function (value, currency) {

      let mark = value >= 10 ** 6 ? 'M' : value >= 10 ** 3 ? 'K' : null

      if (mark == 'M') value /= 10 ** 6;
      if (mark == 'K') value /= 10 ** 3;

      let converted = value.toLocaleString("hr-HR", {
        style: "decimal",
        maximumFractionDigits: 1,
        minimumFractionDigits: 1
      });

      if (mark) converted = `${converted} ${mark} ${currency}`

      return converted;
    },
    date: function (date) {
      return moment(date).format('DD.MM.YYYY.')
    },
    timeSince: function (date) {
      if (date) {
        return moment(date).fromNow()
      }
      else {
        return 'N/A'
      }
    },
    pluralize: function (text, number) {

      let pluralization = pluralizations[text.toLowerCase()] || 's'

      return number > 1 ? text + pluralization : text
    }
  },
};
