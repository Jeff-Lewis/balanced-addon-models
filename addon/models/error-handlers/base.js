import Ember from "ember";

var get = Ember.get;

var BaseErrorsHandler = Ember.Object.extend({
  addErrorToField: function(fieldName, errorMessage) {
    get(this.get("model.errors"), fieldName).pushObject(errorMessage);
  },

  addErrorsToField: function(fieldName, errorMessages) {
    get(this.get("model.errors"), fieldName).pushObjects(errorMessages);
  },

  addRootError: function(errorMessage) {
    this.addErrorToField("_root", errorMessage);
  },

  handleApiResponse: function(response) {
    var self = this;
    var hasValidationError = false;
    Ember.A(response.errors).forEach(function(error) {
      if (error.extras) {
        hasValidationError = true;
        for (var fieldName in error.extras) {
          self.addErrorToField(fieldName, error.extras[fieldName]);
        }
      }
      else if (!Ember.isBlank(error.description)) {
        self.addRootError(cleanDescription(error.description));
      }
      else {
        self.addRootError(error[0]);
      }
    });
    if (hasValidationError) {
      self.addRootError("There was a validation error when submitting your request.");
    }
  },

  handleUnknownError: function() {
    this.addRootError("There was an error processing your request.");
  },

  populateFromResponse: function(response) {
    // response.errors is the json-api v1.1 default
    if (!Ember.isBlank(response.errors)){
      this.handleApiResponse(response);
    }
    else {
      this.handleUnknownError();
    }
  }
});

function cleanDescription(description) {
  if (description.indexOf(" - ") > 0) {
    return description.split(" - ")[1];
  }
  else {
    return description;
  }
}

export default BaseErrorsHandler;
