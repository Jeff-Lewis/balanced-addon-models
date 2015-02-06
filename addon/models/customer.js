import Ember from "ember";
import Model from "./core/model";
import BK from "./core/method-generators";

var CUSTOMER_TYPES = {
  BUSINESS: 'Business',
  PERSON: 'Person'
};

var Customer = Model.extend({
  fetchBankAccounts: BK.fetchCollection("bank_account"),
  fetchCards: BK.fetchCollection("card"),

  createUri: "/customers",

  fetchFundingInstruments: BK.fetchCollection("funding-instrument", "search_uri", {
    type: ["card", "bank_account"]
  }),

  fetchDisputes: BK.fetchCollection("dispute"),
  fetchTransactions: BK.fetchCollection("transaction"),

  fetchLogs: BK.fetchCollectionForUri("log", "/logs"),

  search_uri: Ember.computed(function() {
    return this.get("href") + "/search";
  }).property("href"),

  bankAccounts: Ember.computed(function() {
    var self = this;
    this.fetchBankAccounts().then(function(collection) {
      self.set("bankAccounts", collection);
    });
    return undefined;
  }),

  cards: Ember.computed(function() {
    var self = this;
    this.fetchCards().then(function(collection) {
      self.set("cards", collection);
    });
    return undefined;
  }),

  has_bank_account: Ember.computed.and('bank_accounts.isLoaded', 'bank_accounts.length'),

  orders_list: function() {
    var customer_uri = this.get('href');
    var orders = this.get('orders') || Ember.A();

    if (customer_uri) {
      orders = orders.filter(function(order) {
        return order.get('merchant_uri') === customer_uri;
      });
    }
    return orders;
  }.property('orders', 'orders.@each.merchant_uri'),

  debitable_bank_accounts: function() {
    return this.get('bank_accounts').filterBy('can_debit');
  }.property('bank_accounts.@each.can_debit'),

  creditable_cards: function() {
    return this.get('cards').filterBy("can_credit");
  }.property('cards'),

  has_debitable_bank_account: function() {
    return this.get('bank_accounts').isAny('can_debit');
  }.property('bank_accounts.@each.can_debit'),

  type: function() {
    return (this.get('ein') || this.get('business_name')) ? CUSTOMER_TYPES.BUSINESS : CUSTOMER_TYPES.PERSON;
  }.property('ein', 'business_name'),

  is_business: Ember.computed.equal('type', CUSTOMER_TYPES.BUSINESS),
  is_person: Ember.computed.equal('type', CUSTOMER_TYPES.PERSON),

  display_me_with_email: function() {
    var name = this.get('display_me');
    var email = this.get('email');

    if (email) {
      return "%@ (%@)".fmt(name, email);
    } else {
      return name;
    }
  }.property('display_me', 'email'),

  page_title: Ember.computed.readOnly('displayName'),

  facebook_url: function() {
    if (this.get('facebook_id')) {
      return 'http://facebook.com/' + this.get('facebook_id');
    } else {
      return undefined;
    }
  }.property('facebook_id'),

  twitter_url: function() {
    if (this.get('twitter_id')) {
      return 'http://twitter.com/' + this.get('twitter_id');
    } else {
      return undefined;
    }
  }.property('twitter_id'),

  displayName: function() {
    var name;
    if (this.get('is_business')) {
      name = this.get('business_name');
    } else {
      name = this.get('name');
    }
    var email = this.get('email');
    if (name) {
      if (email) {
        name += ' (%@)'.fmt(email);
      }
    } else {
      name = email;
    }
    return name;
  }.property('is_business', 'business_name', 'name', 'email'),

  dob: function() {
    var month = this.get('dob_month');
    var year = this.get('dob_year');

    if (month && year) {
      return "%@-%@".fmt(year, month);
    } else {
      return year;
    }
  }.property('dob_month', 'dob_year'),

  is_identity_verified: Ember.computed.equal('merchant_status', 'underwritten'),

  status: function() {
    return this.get('is_identity_verified') ? 'verified' : 'unverified';
  }.property('is_identity_verified'),

  getApiProperties: function() {
    var properties = this.getProperties("address", "business_name", "dob_month", "dob_year", "ein", "email", "meta", "name", "phone", "source", "ssn_last4");
    var deleteIfBlank = function(object, fieldName) {
      if (Ember.isBlank(object[fieldName])) {
        object[fieldName] = null;
      }
    };

    deleteIfBlank(properties, "ein");
    deleteIfBlank(properties, "ssn_last4");
    deleteIfBlank(properties, "email");

    deleteIfBlank(properties.address, "country_code");

    return properties;
  },
});

export default Customer;
