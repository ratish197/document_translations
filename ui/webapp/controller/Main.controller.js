sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function(
	BaseController,
	JSONModel
) {
	"use strict";

	return BaseController.extend("com.ui.document.ui.controller.Main", {
		onInit: function() {
			this.getRouter().getRoute("main").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
			var oViewModel = new JSONModel({
				"shortText": true
			});
			this.setModel(oViewModel, "main");
		},

		onConfirmAPI: function() {
			var isShortText = this.getModel("main").getProperty("/shortText");

			if (isShortText) {
				this.getRouter().navTo("synchronous");
			}else {
				this.getRouter().navTo("asynchronous");
			}
		}
	});
});