import debounce from 'lodash.debounce'

export default {
  data() {
    return {
      searchQuery: '',
    }
  },
  computed: {
    fieldFilter() {
      let regex = new RegExp(this.searchQuery, "i");
      let filter = d => Object.keys(d).some(key => regex.test(d[key]))

      return filter
    }
  },
  methods: {
    searchDebounced: debounce(function (e) {
      this.searchQuery = e.target.value;
    }, 500),
    searchImmediate(e) {
      this.searchQuery = e.target.value;
    },
  }
}