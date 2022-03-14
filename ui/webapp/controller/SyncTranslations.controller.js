sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(
	BaseController,
	JSONModel,
	MessageBox,
	MessageToast
) {
	"use strict";

	return BaseController.extend("com.ui.document.ui.controller.SyncTranslations", {
		onInit: function() {
			this.getRouter().getRoute("synchronous").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
			var oApiInputModel = new JSONModel();
			oApiInputModel.setData(this.getApiInputInitialModel());
			this.setModel(oApiInputModel, "data");

			var oViewModel = new JSONModel({
				"isTranslationInput": true,
				"maxLength": 100,
				"isText": true,
				"responseBusy": false,
				"isAsync": false,
				"uploadPath": "/comuidocumentui/destination/api/v1/translation"
			});
			this.setModel(oViewModel, "view");
		},

		onTranslate: function(oEvent) {
			if (this.getModel("view").getProperty("/isText")) {
				this._translateText();
			}else {
				this._translateDocument();
			}
		},

		_translateText: function() {
			if (!this._isValidTranslationInput()) {
				return;
			}
			var oPayload= this.getModel("data").getProperty("/input");
			var oViewModel = this.getModel("view");
			oViewModel.setProperty("/responseBusy", true);
			this.fnQuery.post("/comuidocumentui/destination", "/api/v1/translation", null, oPayload, null).then(function(result) {
				oViewModel.setProperty("/responseBusy", false);
				this._setResultToForm(result);
			}.bind(this)).catch(function(error) {
				oViewModel.setProperty("/responseBusy", false);
				this._displayCatchedError(error);
			}.bind(this));
		},

		onFileChange: function(oEvent) {
			debugger;
		},

		onUploadComplete: function(oEvent) {
			debugger;
		},

		_translateDocument: function() {
			if (!this._isValidTranslationInput()) {
				return;
			}
			var oFileUploader = this.byId("idUploadFile");
			/*if (!oFileUploader.getValue()) {
				MessageToast.show("Choose a file first");
				return;
			}*/
			oFileUploader.checkFileReadable().then(function() {
				oFileUploader.upload();
			}, function(error) {
				MessageToast.show("The file cannot be read. It may have changed.");
			}).then(function() {
				MessageToast.show("File translated successfully");
				oFileUploader.clear();
			});
		},
	});
});