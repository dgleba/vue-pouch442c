import Vue from "vue";
import VueStrap from "vueStrap";
var alert = require("vue-strap").alert;
var tab = require("vue-strap").tab;
var tabs = require("vue-strap").tabs;
var button = require("vue-strap").button;

window.Vue = Vue;

window.onload = function() {
  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  Vue.component("alert", VueStrap.alert);
  Vue.component("aside", VueStrap.aside);
  Vue.component("button", VueStrap.button);
  Vue.component("tabs", VueStrap.tabset);
  Vue.component("tab", VueStrap.tab);
  Vue.component("vSelect", VueStrap.select);
  Vue.component("vOption", VueStrap.option);

  var mainlistrow = [
    {
      rowType: "ticket",
      createdBy: "Engineer 1",
      callerName: "John Smith",
      activity: "Talked caller through clearing paper",
      title: "HP Laserjet paper jam4"
    }
  ];

  var setting = {
    db_local: "testdb0z",
    db_url: null,
    db_username: null,
    db_password: null
  };

  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  var hub = {
    state: {
      db1: null,
      dbs: null
    },
    setDb: function(db1, dbs) {
      this.db1 = db1;
      this.dbs = dbs;
    }
  };

  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  var vcDbSettings = Vue.extend({
    template: "#pouchdb-open",
    data: function() {
      return {
        setting: {
          db_local: "testdb02",
          db_url: null,
          db_username: null,
          db_password: null
        },
        secret: null
      };
    },
    props: ["db1", "dbs"],
    methods: {
      load: function() {
        for (var k in this.setting) {
          this.setting[k] = CryptoJS.AES.decrypt(
            localStorage.getItem(k),
            this.secret
          ).toString(CryptoJS.enc.Latin1);
        }
      },
      save: function() {
        for (var k in this.setting) {
          localStorage.setItem(k, CryptoJS.AES.encrypt(this[k], this.secret));
        }
      },
      openlocdbcore: function() {
        this.db1 = new PouchDB(this.setting.db_local);
      },
      openremdbcore: function() {
        var options = {};
        options.auth = {};
        options.auth.username = this.setting.db_username;
        options.auth.password = this.setting.db_password;
        this.dbs = new PouchDB(this.setting.db_url, options);
      },
      openlocdb: function() {
        this.openlocdbcore();
        this.$dispatch("ready");
      },
      openremdb: function() {
        this.openremdbcore();
        this.$dispatch("ready");
      },
      opendbs: function() {
        var self = this;
        this.openlocdbcore();
        this.openremdbcore();
        PouchDB.sync(this.db1, this.dbs, { live: true });
        this.db1
          .changes({
            since: "now",
            live: true
          })
          .on("change", self.$dispatch.bind(self, "change"));
        this.$dispatch("ready");
      }
    }
  });
  Vue.component("pouchdb-open", vcDbSettings);

  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  var vcDbGrid = Vue.extend({
    template: "#gen-grid",
    props: {
      data: Array,
      columns: Array,
      filterKey: String
    },
    data: function() {
      var sortOrders = {};
      this.columns.forEach(function(key) {
        sortOrders[key] = 1;
      });
      return {
        sortKey: "",
        sortOrders: sortOrders
      };
    },
    methods: {
      sortBy: function(key) {
        this.sortKey = key;
        this.sortOrders[key] = this.sortOrders[key] * -1;
      }
    }
  });
  Vue.component("gen-grid", vcDbGrid);

  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  var vcDbGenRow = Vue.extend({
    template: "#gen-row",
    props: ["doc"]
  });
  Vue.component("gen-row", vcDbGenRow);

  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  var App = Vue.extend({
    data: function() {
      return {
        hS: hub.state,
        values: [],
        showRight: false,
        showR: false,
        db1: null,
        dbs: null,
        rows: { t: "test" },
        gridData: [{ id: "mtid" }],
        filterKey: "",
        gridColumns: ["_id", "title", "_rev"]
      };
    },
    methods: {
      dbReady: function() {
        hub.setDb(this.db1, this.dbs);
        this.getRows();
      },
      writeRow: function() {
        mainlistrow[0]._id = new Date().toISOString();
        this.hS.db1.put(mainlistrow[0], function callback(err, result) {
          if (!err) {
            console.log("Successfully posted a data set!");
          } else {
            console.log("Error");
          }
        });
        this.getRows();
      },
      getRows: function() {
        var self = this;
        console.log("getting");
        this.hS.db1
          .allDocs({ include_docs: true, descending: true })
          .then(function(doc) {
            console.log(doc);
            self.rows = doc.rows;
            var gdtemp = [];
            for (var i = 0; i < self.rows.length; i++) {
              gdtemp[i] = doc.rows[i].doc;
            }
            self.gridData = gdtemp;
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    }
  });

  //  < !-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  var vm = new App({
    el: "#app",
    components: {
      alert: VueStrap.alert,
      button: VueStrap.button,
      tabs: VueStrap.tabset,
      tabGroup: VueStrap.tabGroup,
      tab: VueStrap.tab
    }
  });

  // new Vue({
  //   el: "#app",
  //   components: {
  //     alert: VueStrap.alert,
  //     button: VueStrap.button,
  //     tabs: VueStrap.tabset,
  //     tabGroup: VueStrap.tabGroup,
  //     tab: VueStrap.tab
  //   }
  // });
};
