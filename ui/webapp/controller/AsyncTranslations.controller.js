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

	return BaseController.extend("com.ui.document.ui.controller.AsyncTranslations", {
		onInit: function() {
			this.getRouter().getRoute("asynchronous").attachMatched(this._onRouteMatched, this);
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
				"isAsync": true,
				"uploadPath": "/comuidocumentui/destination/api/v1/translation/jobs",
				"isDownloadVisible": false
			});
			this.setModel(oViewModel, "view");
		},
		onJobReset: function(oEvent) {
			this.getModel("view").setProperty("/isDownloadVisible", false);
			this.resetModelData();
		},
		onTranslate: function(oEvent) {
			if (this.getModel("view").getProperty("/isText")) {
				this._translateText();
			}else {
				this._translateDocument();
			}
		},
		onCheckJobResult: function(oEvent) {
			this.getModel("view").setProperty("/isDownloadVisible", false);
			this._getJobResultsById();
		},

		onUploadComplete: function(t) {
			var oData = this.getModel("data");
			this.getModel("view").setProperty("/responseBusy", false);
			var oResponse = t.getParameter("responseRaw");
			if (oResponse) {
				MessageToast.show("Translation Job for uploaded document has been successfully created.");
				this._setResultToForm(JSON.parse(t.getParameter("responseRaw")));
			}
		},

		onDownload: function(oEvent) {
			var oData = this.getModel("data");
			var sJobID = oData.getProperty("/scheduleinput");
			if (!sJobID) {
				MessageBox.error("Missing Job ID");
				return;
			}
			sap.m.URLHelper.redirect("/comuidocumentui/destination/api/v1/translation/jobs/".concat(sJobID).concat("/result"));
		},
		
		_translateText: function() {
			if (!this._isValidTranslationInput()) {
				return;
			}
			var oPayload= this.getModel("data").getProperty("/input");
			var oViewModel = this.getModel("view");
			oViewModel.setProperty("/responseBusy", true);
			this.fnQuery.post("/comuidocumentui/destination", "/api/v1/translation/jobs", null, oPayload, null).then(function(result) {
				oViewModel.setProperty("/responseBusy", false);
				this._setResultToForm(result);
			}.bind(this)).catch(function(error) {
				oViewModel.setProperty("/responseBusy", false);
				this._displayCatchedError(error);
			}.bind(this));
		},
		_translateDocument: function() {
			if (!this._isValidTranslationInput()) {
				return;
			}
			var oFileUploader = this.byId("idUploadFile");
			var oViewModel = this.getModel("view");
			oViewModel.setProperty("/responseBusy", true);
			oFileUploader.checkFileReadable().then(function() {
				oFileUploader.upload();
			}, function(error) {
				oViewModel.setProperty("/responseBusy", false);
				MessageToast.show("The file cannot be read. It may have changed.");
			}).then(function() {
				oViewModel.setProperty("/responseBusy", false);
				oFileUploader.clear();
			});
		},
		_getJobResultsById: function() {
			var oData = this.getModel("data");
			var sJobID = oData.getProperty("/scheduleinput");
			var oViewModel = this.getModel("view");

			if (!sJobID) {
				MessageBox.error("Missing Mandatory Input for getting Job Result");
				return;
			}
			var sPath = "/api/v1/translation/jobs/".concat(sJobID).concat("/result");

			oViewModel.setProperty("/responseBusy", true);

			this.fnQuery.get("/comuidocumentui/destination", sPath, null, null).then(function(result) {
				if (result) {
					oViewModel.setProperty("/isDownloadVisible", true);
				}else {
					oViewModel.setProperty("/isDownloadVisible", false);
				}
				oViewModel.setProperty("/responseBusy", false);
				oData.setProperty("/scheduleresult", result);
			}.bind(this)).catch(function(error) {
				oViewModel.setProperty("/responseBusy", false);
				oViewModel.setProperty("/isDownloadVisible", false);
				this._displayCatchedError(error);
			}.bind(this));
		}
	});
});